import { v } from "convex/values";
import { mutation, query, MutationCtx, QueryCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

const accountType = v.union(
  v.literal("BANK"),
  v.literal("WALLET"),
  v.literal("CASH"),
  v.literal("INVESTMENT"),
  v.literal("CREDIT_CARD"),
);

const accountPurpose = v.union(
  v.literal("GENERAL"),
  v.literal("EMERGENCY_FUND"),
  v.literal("GOAL_SAVINGS"),
  v.literal("INVESTMENT"),
);

const categoryTransactionType = v.union(
  v.literal("EXPENSE"),
  v.literal("INCOME"),
  v.literal("BOTH"),
);

type AccountPurpose = "GENERAL" | "EMERGENCY_FUND" | "GOAL_SAVINGS" | "INVESTMENT";
type BucketName = "NEEDS" | "INVESTMENTS" | "SAVINGS" | "CHARITY" | "FLEX";

const nowIso = () => new Date().toISOString();

const normalizeName = (name: string) => name.trim().toLocaleLowerCase();

const assertNonEmptyName = (name: string) => {
  if (!name.trim()) {
    throw new Error("Account name cannot be empty.");
  }
};

const assertDateString = (value: string, fieldName: string) => {
  if (!value.trim()) {
    throw new Error(`${fieldName} is required.`);
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${fieldName} must be a valid ISO date string.`);
  }
};

const assertCurrencyCode = (currency: string) => {
  if (!/^[A-Z]{3}$/.test(currency)) {
    throw new Error("currency must be a 3-letter uppercase ISO code (e.g. PKR).");
  }
};

const assertPurposeBucketCompatibility = (purpose: AccountPurpose, bucketName: string) => {
  if (purpose === "INVESTMENT" && bucketName !== "INVESTMENTS") {
    throw new Error("INVESTMENT purpose accounts must belong to the INVESTMENTS bucket.");
  }
  if ((purpose === "EMERGENCY_FUND" || purpose === "GOAL_SAVINGS") && bucketName !== "SAVINGS") {
    throw new Error(`${purpose} purpose accounts must belong to the SAVINGS bucket.`);
  }
};

const assertSortOrder = (sortOrder: number) => {
  if (!Number.isInteger(sortOrder) || sortOrder < 0) {
    throw new Error("sortOrder must be a non-negative integer.");
  }
};

const getBucketsByName = async (ctx: MutationCtx | QueryCtx) => {
  const buckets = await ctx.db.query("buckets").collect();
  const map = new Map<BucketName, Id<"buckets">>();
  for (const bucket of buckets) {
    if (
      bucket.name === "NEEDS" ||
      bucket.name === "INVESTMENTS" ||
      bucket.name === "SAVINGS" ||
      bucket.name === "CHARITY" ||
      bucket.name === "FLEX"
    ) {
      map.set(bucket.name, bucket._id);
    }
  }
  return map;
};

const buildRecommendedBlueprints = (bucketIdsByName: Map<BucketName, Id<"buckets">>) => {
  const requiredBuckets: BucketName[] = ["NEEDS", "SAVINGS", "INVESTMENTS", "FLEX", "CHARITY"];
  for (const bucketName of requiredBuckets) {
    if (!bucketIdsByName.get(bucketName)) {
      throw new Error(`Required bucket ${bucketName} is missing. Run bootstrap seed first.`);
    }
  }

  return [
    {
      name: "UBL",
      type: "BANK" as const,
      purpose: "GENERAL" as const,
      bucketId: bucketIdsByName.get("NEEDS")!,
      rationale: "Main account where salary lands and core NEEDS spending happens.",
    },
    {
      name: "Alfalah",
      type: "BANK" as const,
      purpose: "EMERGENCY_FUND" as const,
      bucketId: bucketIdsByName.get("SAVINGS")!,
      rationale:
        "Primary savings account for emergency fund now; can later add GOAL_SAVINGS account separately.",
    },
    {
      name: "Easypaisa",
      type: "WALLET" as const,
      purpose: "INVESTMENT" as const,
      bucketId: bucketIdsByName.get("INVESTMENTS")!,
      rationale: "Dedicated account for investment contributions and tracking.",
    },
    {
      name: "Nayapay",
      type: "WALLET" as const,
      purpose: "GENERAL" as const,
      bucketId: bucketIdsByName.get("FLEX")!,
      rationale: "Flex/buffer spending account.",
    },
    {
      name: "Sadapay",
      type: "WALLET" as const,
      purpose: "GENERAL" as const,
      bucketId: bucketIdsByName.get("CHARITY")!,
      rationale: "Charity spending account.",
    },
  ];
};

const assertNoActiveNameCollision = async (
  ctx: MutationCtx,
  accountName: string,
  exceptAccountId?: Id<"accounts">,
) => {
  const normalizedIncomingName = normalizeName(accountName);
  const sameNameActiveAccounts = await ctx.db
    .query("accounts")
    .withIndex("by_is_active_and_name_key", (q) =>
      q.eq("isActive", true).eq("nameKey", normalizedIncomingName),
    )
    .collect();
  const conflict = sameNameActiveAccounts.find((account) => {
    if (exceptAccountId && account._id === exceptAccountId) {
      return false;
    }
    return true;
  });

  if (conflict) {
    throw new Error("An active account with the same name already exists.");
  }
};

const assertBucketExistsAndActive = async (ctx: MutationCtx, bucketId: Id<"buckets">) => {
  const bucket = await ctx.db.get(bucketId);
  if (!bucket || !bucket.isActive) {
    throw new Error("bucketId must reference an active bucket.");
  }
  return bucket;
};

const assertCategoryExistsAndActive = async (ctx: MutationCtx, categoryId: Id<"categories">) => {
  const category = await ctx.db.get(categoryId);
  if (!category || !category.isActive) {
    throw new Error("categoryId must reference an active category.");
  }
  return category;
};

const assertNoActiveCategoryNameCollision = async (
  ctx: MutationCtx,
  bucketId: Id<"buckets">,
  categoryName: string,
  exceptCategoryId?: Id<"categories">,
) => {
  const bucketCategories = await ctx.db
    .query("categories")
    .withIndex("by_bucket_id", (q) => q.eq("bucketId", bucketId))
    .collect();
  const normalizedIncomingName = normalizeName(categoryName);
  const conflict = bucketCategories.find((category) => {
    if (!category.isActive) {
      return false;
    }
    if (exceptCategoryId && category._id === exceptCategoryId) {
      return false;
    }
    return normalizeName(category.name) === normalizedIncomingName;
  });
  if (conflict) {
    throw new Error("An active category with the same name already exists in this bucket.");
  }
};

const assertNoActiveSubcategoryNameCollision = async (
  ctx: MutationCtx,
  categoryId: Id<"categories">,
  subcategoryName: string,
  exceptSubcategoryId?: Id<"subcategories">,
) => {
  const rows = await ctx.db
    .query("subcategories")
    .withIndex("by_category_id", (q) => q.eq("categoryId", categoryId))
    .collect();
  const normalizedIncomingName = normalizeName(subcategoryName);
  const conflict = rows.find((subcategory) => {
    if (!subcategory.isActive) {
      return false;
    }
    if (exceptSubcategoryId && subcategory._id === exceptSubcategoryId) {
      return false;
    }
    return normalizeName(subcategory.name) === normalizedIncomingName;
  });
  if (conflict) {
    throw new Error("An active subcategory with the same name already exists in this category.");
  }
};

export const getSetupWizardState = query({
  args: {},
  handler: async (ctx) => {
    const activeAccounts = await ctx.db
      .query("accounts")
      .withIndex("by_is_active", (q) => q.eq("isActive", true))
      .collect();

    const activeCategories = await ctx.db
      .query("categories")
      .withIndex("by_is_active", (q) => q.eq("isActive", true))
      .take(1);

    const activeSubcategories = await ctx.db
      .query("subcategories")
      .withIndex("by_is_active", (q) => q.eq("isActive", true))
      .take(1);

    return {
      steps: {
        accountsComplete: activeAccounts.length > 0,
        categoriesComplete: activeCategories.length > 0,
        subcategoriesComplete: activeSubcategories.length > 0,
      },
      stats: {
        activeAccountCount: activeAccounts.length,
      },
    };
  },
});

export const getRecommendedAccountBlueprints = query({
  args: {},
  handler: async (ctx) => {
    const bucketIdsByName = await getBucketsByName(ctx);
    return buildRecommendedBlueprints(bucketIdsByName);
  },
});

export const createRecommendedAccounts = mutation({
  args: {
    openingDate: v.string(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    assertDateString(args.openingDate, "openingDate");
    assertCurrencyCode(args.currency);

    const bucketIdsByName = await getBucketsByName(ctx);
    const blueprints = buildRecommendedBlueprints(bucketIdsByName);
    const now = nowIso();
    let created = 0;
    let skippedExisting = 0;

    for (const blueprint of blueprints) {
      const normalizedName = normalizeName(blueprint.name);
      const existing = await ctx.db
        .query("accounts")
        .withIndex("by_is_active_and_name_key", (q) =>
          q.eq("isActive", true).eq("nameKey", normalizedName),
        )
        .unique();

      if (existing) {
        skippedExisting += 1;
        continue;
      }

      await ctx.db.insert("accounts", {
        name: blueprint.name,
        nameKey: normalizedName,
        type: blueprint.type,
        purpose: blueprint.purpose,
        bucketId: blueprint.bucketId,
        openingBalanceMinor: BigInt(0),
        openingDate: args.openingDate,
        currency: args.currency,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      created += 1;
    }

    return {
      ok: true,
      created,
      skippedExisting,
    };
  },
});

export const listAccountsForSetup = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db
      .query("accounts")
      .withIndex("by_is_active", (q) => q.eq("isActive", true))
      .collect();
    return rows.sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const listCategoriesForSetup = query({
  args: {
    bucketId: v.optional(v.id("buckets")),
  },
  handler: async (ctx, args) => {
    if (args.bucketId) {
      const rows = await ctx.db
        .query("categories")
        .withIndex("by_bucket_id", (q) => q.eq("bucketId", args.bucketId!))
        .collect();
      return rows
        .filter((row) => row.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
    }

    const rows = await ctx.db
      .query("categories")
      .withIndex("by_is_active", (q) => q.eq("isActive", true))
      .collect();
    return rows.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  },
});

export const createCategoryForSetup = mutation({
  args: {
    name: v.string(),
    bucketId: v.id("buckets"),
    transactionType: categoryTransactionType,
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    assertNonEmptyName(args.name);
    assertSortOrder(args.sortOrder);
    await assertBucketExistsAndActive(ctx, args.bucketId);
    await assertNoActiveCategoryNameCollision(ctx, args.bucketId, args.name);

    const now = nowIso();
    return await ctx.db.insert("categories", {
      name: args.name.trim(),
      bucketId: args.bucketId,
      transactionType: args.transactionType,
      color: args.color,
      icon: args.icon,
      isActive: true,
      sortOrder: args.sortOrder,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateCategoryForSetup = mutation({
  args: {
    categoryId: v.id("categories"),
    name: v.string(),
    bucketId: v.id("buckets"),
    transactionType: categoryTransactionType,
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await assertCategoryExistsAndActive(ctx, args.categoryId);
    assertNonEmptyName(args.name);
    assertSortOrder(args.sortOrder);
    await assertBucketExistsAndActive(ctx, args.bucketId);
    await assertNoActiveCategoryNameCollision(ctx, args.bucketId, args.name, existing._id);

    await ctx.db.patch(args.categoryId, {
      name: args.name.trim(),
      bucketId: args.bucketId,
      transactionType: args.transactionType,
      color: args.color,
      icon: args.icon,
      sortOrder: args.sortOrder,
      updatedAt: nowIso(),
    });
    return { ok: true };
  },
});

export const archiveCategoryForSetup = mutation({
  args: {
    categoryId: v.id("categories"),
  },
  handler: async (ctx, args) => {
    await assertCategoryExistsAndActive(ctx, args.categoryId);

    const now = nowIso();
    await ctx.db.patch(args.categoryId, {
      isActive: false,
      updatedAt: now,
    });

    // Archive all active child subcategories to avoid inconsistent setup state.
    const childSubcategories = await ctx.db
      .query("subcategories")
      .withIndex("by_category_id", (q) => q.eq("categoryId", args.categoryId))
      .collect();
    for (const subcategory of childSubcategories) {
      if (!subcategory.isActive) continue;
      await ctx.db.patch(subcategory._id, {
        isActive: false,
        updatedAt: now,
      });
    }

    return { ok: true };
  },
});

export const listSubcategoriesForSetup = query({
  args: {
    categoryId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    if (args.categoryId) {
      const rows = await ctx.db
        .query("subcategories")
        .withIndex("by_category_id", (q) => q.eq("categoryId", args.categoryId!))
        .collect();
      return rows.filter((row) => row.isActive).sort((a, b) => a.name.localeCompare(b.name));
    }

    const rows = await ctx.db
      .query("subcategories")
      .withIndex("by_is_active", (q) => q.eq("isActive", true))
      .collect();
    return rows.sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const createSubcategoryForSetup = mutation({
  args: {
    categoryId: v.id("categories"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    assertNonEmptyName(args.name);
    const category = await assertCategoryExistsAndActive(ctx, args.categoryId);
    await assertNoActiveSubcategoryNameCollision(ctx, category._id, args.name);

    const now = nowIso();
    return await ctx.db.insert("subcategories", {
      categoryId: category._id,
      name: args.name.trim(),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateSubcategoryForSetup = mutation({
  args: {
    subcategoryId: v.id("subcategories"),
    categoryId: v.id("categories"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.subcategoryId);
    if (!existing || !existing.isActive) {
      throw new Error("Cannot update a missing or archived subcategory.");
    }

    assertNonEmptyName(args.name);
    const category = await assertCategoryExistsAndActive(ctx, args.categoryId);
    await assertNoActiveSubcategoryNameCollision(ctx, category._id, args.name, args.subcategoryId);

    await ctx.db.patch(args.subcategoryId, {
      categoryId: category._id,
      name: args.name.trim(),
      updatedAt: nowIso(),
    });
    return { ok: true };
  },
});

export const archiveSubcategoryForSetup = mutation({
  args: {
    subcategoryId: v.id("subcategories"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.subcategoryId);
    if (!existing || !existing.isActive) {
      throw new Error("Subcategory is already archived or does not exist.");
    }

    await ctx.db.patch(args.subcategoryId, {
      isActive: false,
      updatedAt: nowIso(),
    });
    return { ok: true };
  },
});

export const createAccountForSetup = mutation({
  args: {
    name: v.string(),
    type: accountType,
    purpose: accountPurpose,
    bucketId: v.id("buckets"),
    openingBalanceMinor: v.int64(),
    openingDate: v.string(),
    currency: v.string(),
    color: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertNonEmptyName(args.name);
    assertDateString(args.openingDate, "openingDate");
    assertCurrencyCode(args.currency);
    await assertNoActiveNameCollision(ctx, args.name);

    const bucket = await ctx.db.get(args.bucketId);
    if (!bucket || !bucket.isActive) {
      throw new Error("bucketId must reference an active bucket.");
    }
    assertPurposeBucketCompatibility(args.purpose, bucket.name);

    const now = nowIso();
    return await ctx.db.insert("accounts", {
      ...args,
      name: args.name.trim(),
      nameKey: normalizeName(args.name),
      currency: args.currency.trim(),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateAccountForSetup = mutation({
  args: {
    accountId: v.id("accounts"),
    name: v.string(),
    type: accountType,
    purpose: accountPurpose,
    bucketId: v.id("buckets"),
    openingBalanceMinor: v.int64(),
    openingDate: v.string(),
    currency: v.string(),
    color: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.accountId);
    if (!existing || !existing.isActive) {
      throw new Error("Cannot update a missing or archived account.");
    }

    assertNonEmptyName(args.name);
    assertDateString(args.openingDate, "openingDate");
    assertCurrencyCode(args.currency);
    await assertNoActiveNameCollision(ctx, args.name, args.accountId);

    const bucket = await ctx.db.get(args.bucketId);
    if (!bucket || !bucket.isActive) {
      throw new Error("bucketId must reference an active bucket.");
    }
    assertPurposeBucketCompatibility(args.purpose, bucket.name);

    await ctx.db.patch(args.accountId, {
      name: args.name.trim(),
      nameKey: normalizeName(args.name),
      type: args.type,
      purpose: args.purpose,
      bucketId: args.bucketId,
      openingBalanceMinor: args.openingBalanceMinor,
      openingDate: args.openingDate,
      currency: args.currency.trim(),
      color: args.color,
      notes: args.notes,
      updatedAt: nowIso(),
    });

    return { ok: true };
  },
});

export const archiveAccountForSetup = mutation({
  args: {
    accountId: v.id("accounts"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.accountId);
    if (!existing || !existing.isActive) {
      throw new Error("Account is already archived or does not exist.");
    }

    await ctx.db.patch(args.accountId, {
      isActive: false,
      updatedAt: nowIso(),
    });
    return { ok: true };
  },
});
