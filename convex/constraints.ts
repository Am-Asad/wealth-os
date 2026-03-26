import { v } from "convex/values";
import { mutation } from "./_generated/server";

const nowIso = () => new Date().toISOString();

const transactionType = v.union(v.literal("EXPENSE"), v.literal("INVESTMENT_CONTRIBUTION"));

const recurringType = v.union(
  v.literal("EXPENSE"),
  v.literal("INVESTMENT_CONTRIBUTION"),
  v.literal("INCOME"),
);

const recurringFrequency = v.union(
  v.literal("DAILY"),
  v.literal("WEEKLY"),
  v.literal("MONTHLY"),
  v.literal("QUARTERLY"),
  v.literal("YEARLY"),
);

const budgetSnapshotStatus = v.union(v.literal("OK"), v.literal("WARNING"), v.literal("OVER"));

const alertType = v.union(
  v.literal("BUDGET_WARNING"),
  v.literal("BUDGET_EXCEEDED"),
  v.literal("GOAL_BEHIND_SCHEDULE"),
  v.literal("EMERGENCY_FUND_LOW"),
  v.literal("LOW_ACCOUNT_BALANCE"),
  v.literal("LARGE_EXPENSE"),
  v.literal("NO_INVESTMENT_THIS_MONTH"),
  v.literal("OVERDUE_RECURRING"),
);

const assertPositiveMinor = (field: string, value: bigint) => {
  if (value <= BigInt(0)) {
    throw new Error(`${field} must be greater than zero.`);
  }
};

const assertMonth = (month: number) => {
  if (month < 1 || month > 12) {
    throw new Error("month must be in range 1..12.");
  }
};

export const createMonthlyPlan = mutation({
  args: {
    year: v.number(),
    month: v.number(),
    expectedIncomeMinor: v.int64(),
    needsAllocationMinor: v.int64(),
    investmentsAllocationMinor: v.int64(),
    savingsAllocationMinor: v.int64(),
    charityAllocationMinor: v.int64(),
    flexAllocationMinor: v.int64(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertMonth(args.month);

    const existing = await ctx.db
      .query("monthly_plan")
      .withIndex("by_year_and_month", (q) => q.eq("year", args.year).eq("month", args.month))
      .unique();
    if (existing) {
      throw new Error("A monthly plan for this year and month already exists.");
    }

    const allocationSum =
      args.needsAllocationMinor +
      args.investmentsAllocationMinor +
      args.savingsAllocationMinor +
      args.charityAllocationMinor +
      args.flexAllocationMinor;

    if (allocationSum !== args.expectedIncomeMinor) {
      throw new Error("Bucket allocations must sum exactly to expected income.");
    }

    const now = nowIso();
    return await ctx.db.insert("monthly_plan", {
      ...args,
      isClosed: false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const createTransfer = mutation({
  args: {
    date: v.string(),
    amountMinor: v.int64(),
    fromAccountId: v.id("accounts"),
    toAccountId: v.id("accounts"),
    linkedGoalId: v.optional(v.id("financial_goals")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertPositiveMinor("amountMinor", args.amountMinor);
    if (args.fromAccountId === args.toAccountId) {
      throw new Error("fromAccountId and toAccountId must be different.");
    }

    const now = nowIso();
    return await ctx.db.insert("transfers", { ...args, createdAt: now, updatedAt: now });
  },
});

export const createTransaction = mutation({
  args: {
    date: v.string(),
    amountMinor: v.int64(),
    type: transactionType,
    accountId: v.id("accounts"),
    categoryId: v.id("categories"),
    subcategoryId: v.optional(v.id("subcategories")),
    investmentId: v.optional(v.id("investments")),
    recurringRuleId: v.optional(v.id("recurring_rules")),
    linkedGoalId: v.optional(v.id("financial_goals")),
    payee: v.optional(v.string()),
    description: v.optional(v.string()),
    tags: v.optional(v.string()),
    receiptUrl: v.optional(v.string()),
    isFlagged: v.optional(v.boolean()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertPositiveMinor("amountMinor", args.amountMinor);

    if (args.type === "INVESTMENT_CONTRIBUTION" && !args.investmentId) {
      throw new Error("investmentId is required for INVESTMENT_CONTRIBUTION transactions.");
    }

    const now = nowIso();
    return await ctx.db.insert("transactions", {
      ...args,
      isFlagged: args.isFlagged ?? false,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const createIncomeEntry = mutation({
  args: {
    date: v.string(),
    amountMinor: v.int64(),
    grossAmountMinor: v.optional(v.int64()),
    taxDeductedMinor: v.optional(v.int64()),
    source: v.string(),
    sourceType: v.union(
      v.literal("SALARY"),
      v.literal("FREELANCE"),
      v.literal("WINDFALL"),
      v.literal("SIDE_INCOME"),
      v.literal("INVESTMENT_RETURN"),
      v.literal("OTHER"),
    ),
    accountId: v.id("accounts"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertPositiveMinor("amountMinor", args.amountMinor);
    if (args.grossAmountMinor !== undefined && args.grossAmountMinor <= BigInt(0)) {
      throw new Error("grossAmountMinor must be greater than zero when provided.");
    }
    if (args.taxDeductedMinor !== undefined && args.taxDeductedMinor < BigInt(0)) {
      throw new Error("taxDeductedMinor cannot be negative.");
    }

    const now = nowIso();
    return await ctx.db.insert("income_entries", { ...args, createdAt: now, updatedAt: now });
  },
});

export const createIncomeAllocation = mutation({
  args: {
    incomeEntryId: v.id("income_entries"),
    bucketId: v.id("buckets"),
    amountMinor: v.int64(),
    toAccountId: v.optional(v.id("accounts")),
    goalId: v.optional(v.id("financial_goals")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertPositiveMinor("amountMinor", args.amountMinor);

    const incomeEntry = await ctx.db.get(args.incomeEntryId);
    if (!incomeEntry) {
      throw new Error("incomeEntryId does not exist.");
    }

    const existingAllocations = await ctx.db
      .query("income_allocations")
      .withIndex("by_income_entry_id", (q) => q.eq("incomeEntryId", args.incomeEntryId))
      .collect();
    const allocatedSoFar = existingAllocations.reduce(
      (sum, row) => sum + row.amountMinor,
      BigInt(0),
    );
    const newTotal = allocatedSoFar + args.amountMinor;
    if (newTotal > incomeEntry.amountMinor) {
      throw new Error("Total allocations cannot exceed the parent income entry amount.");
    }

    const now = nowIso();
    return await ctx.db.insert("income_allocations", { ...args, createdAt: now, updatedAt: now });
  },
});

export const createRecurringRule = mutation({
  args: {
    name: v.string(),
    amountMinor: v.int64(),
    type: recurringType,
    frequency: recurringFrequency,
    dayOfMonth: v.optional(v.number()),
    dayOfWeek: v.optional(v.number()),
    accountId: v.id("accounts"),
    categoryId: v.id("categories"),
    subcategoryId: v.optional(v.id("subcategories")),
    linkedGoalId: v.optional(v.id("financial_goals")),
    nextDueDate: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertPositiveMinor("amountMinor", args.amountMinor);

    if (args.dayOfMonth !== undefined && (args.dayOfMonth < 1 || args.dayOfMonth > 31)) {
      throw new Error("dayOfMonth must be in range 1..31.");
    }
    if (args.dayOfWeek !== undefined && (args.dayOfWeek < 0 || args.dayOfWeek > 6)) {
      throw new Error("dayOfWeek must be in range 0..6.");
    }

    const now = nowIso();
    return await ctx.db.insert("recurring_rules", {
      ...args,
      isActive: true,
      lastGenerated: undefined,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const createPortfolioSnapshot = mutation({
  args: {
    investmentId: v.id("investments"),
    snapshotDate: v.string(),
    marketValueMinor: v.int64(),
    unitsHeldMicros: v.optional(v.int64()),
    gainLossMinor: v.optional(v.int64()),
    gainLossBps: v.optional(v.int64()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertPositiveMinor("marketValueMinor", args.marketValueMinor);

    const existing = await ctx.db
      .query("portfolio_snapshots")
      .withIndex("by_investment_id_and_snapshot_date", (q) =>
        q.eq("investmentId", args.investmentId).eq("snapshotDate", args.snapshotDate),
      )
      .unique();
    if (existing) {
      throw new Error("A portfolio snapshot already exists for this investment/date.");
    }

    const now = nowIso();
    return await ctx.db.insert("portfolio_snapshots", { ...args, createdAt: now, updatedAt: now });
  },
});

export const createBudgetSnapshot = mutation({
  args: {
    year: v.number(),
    month: v.number(),
    bucketId: v.id("buckets"),
    plannedAmountMinor: v.int64(),
    actualSpentMinor: v.int64(),
    varianceMinor: v.int64(),
    varianceBps: v.int64(),
    status: budgetSnapshotStatus,
  },
  handler: async (ctx, args) => {
    assertMonth(args.month);

    const existing = await ctx.db
      .query("budget_snapshots")
      .withIndex("by_year_and_month_and_bucket_id", (q) =>
        q.eq("year", args.year).eq("month", args.month).eq("bucketId", args.bucketId),
      )
      .unique();
    if (existing) {
      throw new Error("A budget snapshot already exists for this year/month/bucket.");
    }

    const now = nowIso();
    return await ctx.db.insert("budget_snapshots", { ...args, createdAt: now, updatedAt: now });
  },
});

export const createNetWorthSnapshot = mutation({
  args: {
    snapshotDate: v.string(),
    liquidCashMinor: v.int64(),
    emergencyFundMinor: v.int64(),
    goalSavingsMinor: v.int64(),
    investmentsValueMinor: v.int64(),
    totalAssetsMinor: v.int64(),
    totalLiabilitiesMinor: v.int64(),
    netWorthMinor: v.int64(),
    totalIncomeMonthMinor: v.int64(),
    totalExpenseMonthMinor: v.int64(),
    savingsRateBps: v.optional(v.int64()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("net_worth_snapshots")
      .withIndex("by_snapshot_date", (q) => q.eq("snapshotDate", args.snapshotDate))
      .unique();
    if (existing) {
      throw new Error("A net worth snapshot already exists for this snapshotDate.");
    }

    const now = nowIso();
    return await ctx.db.insert("net_worth_snapshots", { ...args, createdAt: now, updatedAt: now });
  },
});

export const createAlert = mutation({
  args: {
    alertType,
    triggeredAt: v.string(),
    bucketId: v.optional(v.id("buckets")),
    categoryId: v.optional(v.id("categories")),
    goalId: v.optional(v.id("financial_goals")),
    accountId: v.optional(v.id("accounts")),
    message: v.string(),
    thresholdMinor: v.optional(v.int64()),
    actualMinor: v.optional(v.int64()),
  },
  handler: async (ctx, args) => {
    const now = nowIso();
    return await ctx.db.insert("alerts", {
      ...args,
      isDismissed: false,
      dismissedAt: undefined,
      createdAt: now,
      updatedAt: now,
    });
  },
});
