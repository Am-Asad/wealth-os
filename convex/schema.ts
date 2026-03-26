import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const accountType = v.union(
  v.literal("BANK"),
  v.literal("WALLET"),
  v.literal("CASH"),
  v.literal("INVESTMENT"),
  v.literal("CREDIT_CARD"),
);

const transactionType = v.union(
  v.literal("EXPENSE"),
  v.literal("INVESTMENT_CONTRIBUTION"),
);

const categoryTransactionType = v.union(
  v.literal("EXPENSE"),
  v.literal("INCOME"),
  v.literal("BOTH"),
);

const incomeSourceType = v.union(
  v.literal("SALARY"),
  v.literal("FREELANCE"),
  v.literal("WINDFALL"),
  v.literal("SIDE_INCOME"),
  v.literal("INVESTMENT_RETURN"),
  v.literal("OTHER"),
);

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

const goalType = v.union(
  v.literal("EMERGENCY_FUND"),
  v.literal("SHORT_TERM"),
  v.literal("LONG_TERM"),
  v.literal("INVESTMENT_TARGET"),
);

const goalStatus = v.union(
  v.literal("ACTIVE"),
  v.literal("PAUSED"),
  v.literal("COMPLETED"),
  v.literal("CANCELLED"),
);

const investmentType = v.union(
  v.literal("MUTUAL_FUND"),
  v.literal("SIP"),
  v.literal("STOCKS"),
  v.literal("BONDS"),
  v.literal("GOLD"),
  v.literal("CRYPTO"),
  v.literal("OTHER"),
);

const budgetSnapshotStatus = v.union(
  v.literal("OK"),
  v.literal("WARNING"),
  v.literal("OVER"),
);

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

export default defineSchema({
  buckets: defineTable({
    name: v.string(),
    displayName: v.string(),
    color: v.string(),
    icon: v.string(),
    sortOrder: v.number(),
    description: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_name", ["name"])
    .index("by_sort_order", ["sortOrder"]),

  accounts: defineTable({
    name: v.string(),
    type: accountType,
    bucketId: v.id("buckets"),
    openingBalanceMinor: v.int64(),
    openingDate: v.string(),
    currency: v.string(),
    color: v.optional(v.string()),
    isActive: v.boolean(),
    notes: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_bucket_id", ["bucketId"])
    .index("by_type", ["type"])
    .index("by_is_active", ["isActive"]),

  categories: defineTable({
    name: v.string(),
    bucketId: v.id("buckets"),
    transactionType: categoryTransactionType,
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    isActive: v.boolean(),
    sortOrder: v.number(),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_bucket_id", ["bucketId"])
    .index("by_name", ["name"])
    .index("by_bucket_id_and_name", ["bucketId", "name"])
    .index("by_is_active", ["isActive"]),

  subcategories: defineTable({
    categoryId: v.id("categories"),
    name: v.string(),
    isActive: v.boolean(),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_category_id", ["categoryId"])
    .index("by_category_id_and_name", ["categoryId", "name"])
    .index("by_is_active", ["isActive"]),

  monthly_plan: defineTable({
    year: v.number(),
    month: v.number(),
    expectedIncomeMinor: v.int64(),
    needsAllocationMinor: v.int64(),
    investmentsAllocationMinor: v.int64(),
    savingsAllocationMinor: v.int64(),
    charityAllocationMinor: v.int64(),
    flexAllocationMinor: v.int64(),
    notes: v.optional(v.string()),
    isClosed: v.boolean(),
    createdAt: v.string(),
    closedAt: v.optional(v.string()),
    updatedAt: v.string(),
  }).index("by_year_and_month", ["year", "month"]),

  income_entries: defineTable({
    date: v.string(),
    amountMinor: v.int64(),
    grossAmountMinor: v.optional(v.int64()),
    taxDeductedMinor: v.optional(v.int64()),
    source: v.string(),
    sourceType: incomeSourceType,
    accountId: v.id("accounts"),
    notes: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_date", ["date"])
    .index("by_account_id", ["accountId"]),

  income_allocations: defineTable({
    incomeEntryId: v.id("income_entries"),
    bucketId: v.id("buckets"),
    amountMinor: v.int64(),
    toAccountId: v.optional(v.id("accounts")),
    goalId: v.optional(v.id("financial_goals")),
    notes: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_income_entry_id", ["incomeEntryId"])
    .index("by_bucket_id", ["bucketId"])
    .index("by_to_account_id", ["toAccountId"])
    .index("by_goal_id", ["goalId"]),

  transactions: defineTable({
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
    isFlagged: v.boolean(),
    notes: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_date", ["date"])
    .index("by_date_and_category_id", ["date", "categoryId"])
    .index("by_account_id", ["accountId"])
    .index("by_type", ["type"])
    .index("by_category_id", ["categoryId"]),

  transfers: defineTable({
    date: v.string(),
    amountMinor: v.int64(),
    fromAccountId: v.id("accounts"),
    toAccountId: v.id("accounts"),
    linkedGoalId: v.optional(v.id("financial_goals")),
    notes: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_date", ["date"])
    .index("by_from_account_id", ["fromAccountId"])
    .index("by_to_account_id", ["toAccountId"]),

  recurring_rules: defineTable({
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
    lastGenerated: v.optional(v.string()),
    isActive: v.boolean(),
    notes: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_next_due_date", ["nextDueDate"])
    .index("by_is_active", ["isActive"])
    .index("by_account_id", ["accountId"]),

  financial_goals: defineTable({
    name: v.string(),
    goalType,
    targetAmountMinor: v.int64(),
    currentAmountMinor: v.int64(),
    deadline: v.optional(v.string()),
    priority: v.number(),
    monthlyTargetMinor: v.optional(v.int64()),
    linkedAccountId: v.optional(v.id("accounts")),
    status: goalStatus,
    notes: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_goal_type", ["goalType"])
    .index("by_status", ["status"])
    .index("by_linked_account_id", ["linkedAccountId"]),

  investments: defineTable({
    name: v.string(),
    type: investmentType,
    platform: v.optional(v.string()),
    totalContributedMinor: v.int64(),
    currentValueMinor: v.int64(),
    unitsHeldMicros: v.optional(v.int64()),
    accountId: v.id("accounts"),
    startDate: v.string(),
    isActive: v.boolean(),
    notes: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_account_id", ["accountId"])
    .index("by_type", ["type"])
    .index("by_is_active", ["isActive"]),

  investment_contributions: defineTable({
    investmentId: v.id("investments"),
    date: v.string(),
    amountMinor: v.int64(),
    unitsPurchasedMicros: v.optional(v.int64()),
    pricePerUnitMinor: v.optional(v.int64()),
    transactionId: v.optional(v.id("transactions")),
    notes: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_investment_id", ["investmentId"])
    .index("by_date", ["date"])
    .index("by_transaction_id", ["transactionId"]),

  portfolio_snapshots: defineTable({
    investmentId: v.id("investments"),
    snapshotDate: v.string(),
    marketValueMinor: v.int64(),
    unitsHeldMicros: v.optional(v.int64()),
    gainLossMinor: v.optional(v.int64()),
    gainLossBps: v.optional(v.int64()),
    notes: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_investment_id_and_snapshot_date", ["investmentId", "snapshotDate"]),

  budget_snapshots: defineTable({
    year: v.number(),
    month: v.number(),
    bucketId: v.id("buckets"),
    plannedAmountMinor: v.int64(),
    actualSpentMinor: v.int64(),
    varianceMinor: v.int64(),
    varianceBps: v.int64(),
    status: budgetSnapshotStatus,
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_year_and_month", ["year", "month"])
    .index("by_year_and_month_and_bucket_id", ["year", "month", "bucketId"]),

  net_worth_snapshots: defineTable({
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
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_snapshot_date", ["snapshotDate"]),

  alerts: defineTable({
    alertType,
    triggeredAt: v.string(),
    bucketId: v.optional(v.id("buckets")),
    categoryId: v.optional(v.id("categories")),
    goalId: v.optional(v.id("financial_goals")),
    accountId: v.optional(v.id("accounts")),
    message: v.string(),
    thresholdMinor: v.optional(v.int64()),
    actualMinor: v.optional(v.int64()),
    isDismissed: v.boolean(),
    dismissedAt: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index("by_is_dismissed_and_triggered_at", ["isDismissed", "triggeredAt"]),
});
