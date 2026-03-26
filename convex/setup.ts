import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

type BucketSeed = {
  name: "NEEDS" | "INVESTMENTS" | "SAVINGS" | "CHARITY" | "FLEX";
  displayName: string;
  color: string;
  icon: string;
  sortOrder: number;
  description: string;
};

const BUCKET_SEEDS: BucketSeed[] = [
  {
    name: "NEEDS",
    displayName: "Needs & Essentials",
    color: "#2563EB",
    icon: "house",
    sortOrder: 1,
    description: "Essential living costs and obligations.",
  },
  {
    name: "INVESTMENTS",
    displayName: "Investments",
    color: "#7C3AED",
    icon: "chart-line",
    sortOrder: 2,
    description: "Capital allocation for long-term growth.",
  },
  {
    name: "SAVINGS",
    displayName: "Savings",
    color: "#059669",
    icon: "piggy-bank",
    sortOrder: 3,
    description: "Cash reserves and near-term goals.",
  },
  {
    name: "CHARITY",
    displayName: "Charity",
    color: "#EA580C",
    icon: "heart",
    sortOrder: 4,
    description: "Giving and social impact allocations.",
  },
  {
    name: "FLEX",
    displayName: "Flex",
    color: "#DC2626",
    icon: "sparkles",
    sortOrder: 5,
    description: "Discretionary and lifestyle spending.",
  },
];

type CategorySeed = {
  name: string;
  bucketName: BucketSeed["name"];
  transactionType: "EXPENSE" | "INCOME" | "BOTH";
  sortOrder: number;
  color?: string;
  icon?: string;
};

const CATEGORY_SEEDS: CategorySeed[] = [
  { name: "Food", bucketName: "NEEDS", transactionType: "EXPENSE", sortOrder: 1, icon: "utensils" },
  { name: "Transport", bucketName: "NEEDS", transactionType: "EXPENSE", sortOrder: 2, icon: "car" },
  { name: "Housing", bucketName: "NEEDS", transactionType: "EXPENSE", sortOrder: 3, icon: "home" },
  {
    name: "Utilities",
    bucketName: "NEEDS",
    transactionType: "EXPENSE",
    sortOrder: 4,
    icon: "plug",
  },
  {
    name: "Healthcare",
    bucketName: "NEEDS",
    transactionType: "EXPENSE",
    sortOrder: 5,
    icon: "cross",
  },
  {
    name: "Mutual Fund",
    bucketName: "INVESTMENTS",
    transactionType: "BOTH",
    sortOrder: 1,
    icon: "trending-up",
  },
  {
    name: "Stocks",
    bucketName: "INVESTMENTS",
    transactionType: "BOTH",
    sortOrder: 2,
    icon: "candlestick-chart",
  },
  {
    name: "Emergency Fund",
    bucketName: "SAVINGS",
    transactionType: "BOTH",
    sortOrder: 1,
    icon: "shield",
  },
  {
    name: "Goal Savings",
    bucketName: "SAVINGS",
    transactionType: "BOTH",
    sortOrder: 2,
    icon: "target",
  },
  {
    name: "Zakat",
    bucketName: "CHARITY",
    transactionType: "EXPENSE",
    sortOrder: 1,
    icon: "hand-heart",
  },
  {
    name: "Donations",
    bucketName: "CHARITY",
    transactionType: "EXPENSE",
    sortOrder: 2,
    icon: "gift",
  },
  {
    name: "Entertainment",
    bucketName: "FLEX",
    transactionType: "EXPENSE",
    sortOrder: 1,
    icon: "tv",
  },
  {
    name: "Shopping",
    bucketName: "FLEX",
    transactionType: "EXPENSE",
    sortOrder: 2,
    icon: "shopping-bag",
  },
];

const SUBCATEGORY_SEEDS: Array<{
  bucketName: BucketSeed["name"];
  categoryName: string;
  subcategories: string[];
}> = [
  { bucketName: "NEEDS", categoryName: "Food", subcategories: ["Groceries", "Dining Out"] },
  {
    bucketName: "NEEDS",
    categoryName: "Transport",
    subcategories: ["Ride Hailing", "Fuel", "Public Transport"],
  },
  { bucketName: "NEEDS", categoryName: "Housing", subcategories: ["Rent", "Maintenance"] },
  {
    bucketName: "NEEDS",
    categoryName: "Utilities",
    subcategories: ["Electricity", "Internet", "Mobile"],
  },
  { bucketName: "NEEDS", categoryName: "Healthcare", subcategories: ["Medicines", "Checkups"] },
  { bucketName: "INVESTMENTS", categoryName: "Mutual Fund", subcategories: ["SIP", "Lump Sum"] },
  { bucketName: "INVESTMENTS", categoryName: "Stocks", subcategories: ["PSX", "US Equities"] },
  { bucketName: "SAVINGS", categoryName: "Emergency Fund", subcategories: ["Top-up"] },
  { bucketName: "SAVINGS", categoryName: "Goal Savings", subcategories: ["Travel", "Gadgets"] },
  { bucketName: "CHARITY", categoryName: "Zakat", subcategories: ["Monthly Zakat"] },
  {
    bucketName: "CHARITY",
    categoryName: "Donations",
    subcategories: ["Family Support", "Community Causes"],
  },
  { bucketName: "FLEX", categoryName: "Entertainment", subcategories: ["Streaming", "Movies"] },
  { bucketName: "FLEX", categoryName: "Shopping", subcategories: ["Clothing", "Electronics"] },
];

const nowIso = () => new Date().toISOString();

export const bootstrapSeed = mutation({
  args: {},
  handler: async (ctx) => {
    const now = nowIso();
    const bucketIdsByName = new Map<BucketSeed["name"], Id<"buckets">>();
    let bucketsInserted = 0;

    for (const seed of BUCKET_SEEDS) {
      const existing = await ctx.db
        .query("buckets")
        .withIndex("by_name", (q) => q.eq("name", seed.name))
        .unique();

      if (!existing) {
        const id = await ctx.db.insert("buckets", {
          name: seed.name,
          displayName: seed.displayName,
          color: seed.color,
          icon: seed.icon,
          sortOrder: seed.sortOrder,
          description: seed.description,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        });
        bucketIdsByName.set(seed.name, id);
        bucketsInserted += 1;
        continue;
      }

      bucketIdsByName.set(seed.name, existing._id);
    }

    let categoriesInserted = 0;
    for (const seed of CATEGORY_SEEDS) {
      const bucketId = bucketIdsByName.get(seed.bucketName);
      if (!bucketId) {
        throw new Error(`Missing bucket for seed category: ${seed.name}`);
      }

      const existing = await ctx.db
        .query("categories")
        .withIndex("by_bucket_id_and_name", (q) => q.eq("bucketId", bucketId).eq("name", seed.name))
        .unique();

      if (existing) continue;

      await ctx.db.insert("categories", {
        name: seed.name,
        bucketId,
        transactionType: seed.transactionType,
        color: seed.color,
        icon: seed.icon,
        isActive: true,
        sortOrder: seed.sortOrder,
        createdAt: now,
        updatedAt: now,
      });
      categoriesInserted += 1;
    }

    let subcategoriesInserted = 0;
    for (const group of SUBCATEGORY_SEEDS) {
      const bucketId = bucketIdsByName.get(group.bucketName);
      if (!bucketId) continue;

      const category = await ctx.db
        .query("categories")
        .withIndex("by_bucket_id_and_name", (q) =>
          q.eq("bucketId", bucketId).eq("name", group.categoryName),
        )
        .unique();
      if (!category) continue;

      for (const subName of group.subcategories) {
        const existing = await ctx.db
          .query("subcategories")
          .withIndex("by_category_id_and_name", (q) =>
            q.eq("categoryId", category._id).eq("name", subName),
          )
          .unique();
        if (existing) continue;

        await ctx.db.insert("subcategories", {
          categoryId: category._id,
          name: subName,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        });
        subcategoriesInserted += 1;
      }
    }

    return {
      ok: true,
      bucketsInserted,
      categoriesInserted,
      subcategoriesInserted,
      note: "Seed data remains editable. Existing rows are not overwritten.",
    };
  },
});

export const dbHealth = query({
  args: {},
  handler: async (ctx) => {
    const buckets = await ctx.db.query("buckets").collect();
    const categories = await ctx.db.query("categories").take(1);
    const subcategories = await ctx.db.query("subcategories").take(1);

    const bucketByName = new Map(buckets.map((bucket) => [bucket.name, bucket]));
    const missingBucketNames = BUCKET_SEEDS.map((seed) => seed.name).filter(
      (name) => !bucketByName.has(name),
    );
    const canonicalBucketCount = BUCKET_SEEDS.filter((seed) => bucketByName.has(seed.name)).length;

    const hasStarterCategory = categories.length > 0;
    const hasStarterSubcategory = subcategories.length > 0;

    const ok =
      missingBucketNames.length === 0 &&
      canonicalBucketCount === 5 &&
      hasStarterCategory &&
      hasStarterSubcategory;

    return {
      ok,
      checks: {
        canonicalBucketsPresent: missingBucketNames.length === 0 && canonicalBucketCount === 5,
        hasStarterCategory,
        hasStarterSubcategory,
      },
      stats: {
        bucketCount: buckets.length,
        canonicalBucketCount,
      },
      missingBucketNames,
      message: ok ? "Database baseline is healthy." : "Critical baseline entities missing.",
    };
  },
});
