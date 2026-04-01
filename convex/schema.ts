import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// ============================================================
// VALIDATORS — Reusable literals for enum-like fields
// ============================================================

const accountType = v.union(v.literal("BANK"), v.literal("MOBILE_WALLET"), v.literal("CASH"));

const incomeType = v.union(v.literal("BASE"), v.literal("BONUS"));

const exceptionType = v.union(
  v.literal("OVERSPEND"),
  v.literal("EMERGENCY_BREAK"),
  v.literal("CROSS_CATEGORY"),
  v.literal("UNPLANNED_TRANSFER"),
);

const budgetState = v.union(
  v.literal("DRAFT"), // Being planned. No transactions counted yet.
  v.literal("ACTIVE"), // Manually activated. Transactions count against it.
  v.literal("AMENDED"), // Changed after activation. Amendment history preserved.
  v.literal("CLOSED"), // Manually closed. Reports locked. Carryover calculated.
);

const goalStatus = v.union(v.literal("ACTIVE"), v.literal("COMPLETED"), v.literal("CANCELLED"));

const recurringFrequency = v.union(v.literal("WEEKLY"), v.literal("MONTHLY"), v.literal("YEARLY"));

const pendingRecurringStatus = v.union(
  v.literal("PENDING"),
  v.literal("CONFIRMED"),
  v.literal("SKIPPED"),
  v.literal("PAID_EXTERNALLY"),
  v.literal("EXPIRED"), // Month was closed before user confirmed.
  v.literal("NEEDS_ATTENTION"), // Template references deactivated entity.
);

// ============================================================
// MONEY + PERCENTAGE SCALING
// ============================================================
// All monetary values are stored as int64 in MINOR UNITS.
// Example for PKR/USD/EUR: 1 major unit = 100 minor units.
//
// Percentages are stored as basis points (BPS):
// 100% = 10_000 bps, 1% = 100 bps.
//
// Exchange rates are stored as scaled int64 using 1e6 precision:
// exchangeRate = (minor units of defaultCurrency per 1 original major unit) * 1_000_000
// This avoids floating-point drift in critical financial calculations.

const transactionCommonFields = {
  userId: v.id("users"),
  amount: v.int64(),
  originalAmount: v.optional(v.int64()),
  originalCurrency: v.optional(v.string()),
  exchangeRate: v.optional(v.int64()),
  accountId: v.id("accounts"),
  isRecurring: v.boolean(),
  recurringTemplateId: v.optional(v.id("recurringTransactions")),
  isReversal: v.boolean(),
  correctionForId: v.optional(v.id("transactions")),
  note: v.optional(v.string()),
  receiptUrl: v.optional(v.string()),
  localDate: v.string(),
  month: v.string(),
};

const transactionDocument = v.union(
  // OPENING_BALANCE
  v.object({
    ...transactionCommonFields,
    type: v.literal("OPENING_BALANCE"),
    categoryId: v.optional(v.null()),
    subCategoryId: v.optional(v.null()),
    goalId: v.optional(v.null()),
    transferId: v.optional(v.null()),
    budgetMonth: v.optional(v.null()),
    incomeType: v.optional(v.null()),
    isException: v.literal(false),
    exceptionType: v.optional(v.null()),
  }),
  // INCOME
  v.object({
    ...transactionCommonFields,
    type: v.literal("INCOME"),
    categoryId: v.optional(v.null()),
    subCategoryId: v.optional(v.null()),
    goalId: v.optional(v.null()),
    transferId: v.optional(v.null()),
    budgetMonth: v.string(),
    incomeType,
    isException: v.literal(false),
    exceptionType: v.optional(v.null()),
  }),
  // EXPENSE
  v.object({
    ...transactionCommonFields,
    type: v.literal("EXPENSE"),
    categoryId: v.id("categories"),
    subCategoryId: v.optional(v.id("subCategories")),
    goalId: v.optional(v.id("goals")),
    transferId: v.optional(v.null()),
    budgetMonth: v.optional(v.null()),
    incomeType: v.optional(v.null()),
    isException: v.boolean(),
    exceptionType: v.optional(exceptionType),
  }),
  // TRANSFER_IN
  v.object({
    ...transactionCommonFields,
    type: v.literal("TRANSFER_IN"),
    categoryId: v.optional(v.null()),
    subCategoryId: v.optional(v.null()),
    goalId: v.optional(v.null()),
    transferId: v.id("transfers"),
    budgetMonth: v.optional(v.null()),
    incomeType: v.optional(v.null()),
    isException: v.literal(false),
    exceptionType: v.optional(v.null()),
  }),
  // TRANSFER_OUT
  v.object({
    ...transactionCommonFields,
    type: v.literal("TRANSFER_OUT"),
    categoryId: v.optional(v.null()),
    subCategoryId: v.optional(v.null()),
    goalId: v.optional(v.null()),
    transferId: v.id("transfers"),
    budgetMonth: v.optional(v.null()),
    incomeType: v.optional(v.null()),
    isException: v.literal(false),
    exceptionType: v.optional(v.null()),
  }),
  // GOAL_ALLOCATION
  v.object({
    ...transactionCommonFields,
    type: v.literal("GOAL_ALLOCATION"),
    categoryId: v.id("categories"),
    subCategoryId: v.optional(v.null()),
    goalId: v.id("goals"),
    transferId: v.optional(v.null()),
    budgetMonth: v.optional(v.null()),
    incomeType: v.optional(v.null()),
    isException: v.literal(false),
    exceptionType: v.optional(v.null()),
  }),
);

const recurringTransactionCommonFields = {
  userId: v.id("users"),
  templateName: v.string(),
  amount: v.int64(),
  accountId: v.id("accounts"),
  frequency: recurringFrequency,
  startDate: v.string(),
  validUntil: v.optional(v.string()),
  lastGeneratedDate: v.optional(v.string()),
  isActive: v.boolean(),
  note: v.optional(v.string()),
};

const recurringTransactionDocument = v.union(
  v.object({
    ...recurringTransactionCommonFields,
    type: v.literal("EXPENSE"),
    categoryId: v.id("categories"),
    subCategoryId: v.optional(v.id("subCategories")),
  }),
  v.object({
    ...recurringTransactionCommonFields,
    type: v.literal("INCOME"),
    categoryId: v.optional(v.null()),
    subCategoryId: v.optional(v.null()),
  }),
);

// ============================================================
// SCHEMA
// ============================================================

export default defineSchema({
  // ----------------------------------------------------------
  // USERS
  // Single source of identity. Every entity belongs to a user.
  // ----------------------------------------------------------
  users: defineTable({
    // Convex auth identity subject (from auth provider)
    tokenIdentifier: v.string(),
    name: v.string(),
    email: v.string(),

    // Timezone for all localDate calculations.
    // Default: "Asia/Karachi" (PKT UTC+5)
    // All reports group by localDate derived in this timezone.
    // Never group by raw _creationTime (UTC).
    timezone: v.string(),

    // Base currency for all balance and report calculations.
    // All amounts stored in this currency after conversion.
    // Default: "PKR"
    defaultCurrency: v.string(),
  }).index("by_token", ["tokenIdentifier"]),

  // ----------------------------------------------------------
  // ACCOUNTS
  // Physical money containers. UBL, Alfalah, Easypaisa etc.
  // Balance is ALWAYS derived from transactions. Never stored.
  //
  // Balance formula (the ONLY correct formula):
  //   Balance =
  //     OPENING_BALANCE
  //     + SUM(INCOME)
  //     + SUM(TRANSFER_IN)
  //     - SUM(TRANSFER_OUT)
  //     - SUM(EXPENSE)
  //
  //   GOAL_ALLOCATION → NEVER included in balance.
  //   TRANSFERS       → NEVER included in budget calculations.
  //
  // Currency is set ONCE at creation.
  // Cannot be changed after opening balance is created.
  // ----------------------------------------------------------
  accounts: defineTable({
    userId: v.id("users"),
    name: v.string(),
    type: accountType,

    // ISO 4217 currency code. e.g. "PKR", "USD", "EUR"
    // Opening balance currency MUST match this exactly.
    // Validated at opening balance creation time.
    currency: v.string(),

    // Soft delete. Never hard delete.
    // Cannot deactivate if active transactions reference this account.
    isActive: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_user_active", ["userId", "isActive"]),

  // ----------------------------------------------------------
  // CATEGORIES
  // Virtual budget buckets. Completely decoupled from accounts.
  // Budgeting happens at category level via percentages.
  // Subcategories are for visibility only — no budget limits.
  //
  // isGoalBased = true means this category supports goals
  // e.g. Savings/Emergency, Investments
  //
  // sortOrder uses fractional indexing for conflict-free reordering.
  // Unique per userId. Validated before save.
  // ----------------------------------------------------------
  categories: defineTable({
    userId: v.id("users"),
    name: v.string(),
    icon: v.optional(v.string()),

    // true = Savings/Emergency, Investments type categories
    // false = Needs, Flex/Buffer, Charity type categories
    isGoalBased: v.boolean(),

    // Fractional indexing for conflict-free display ordering.
    // Unique per userId. Validated before every write.
    sortOrder: v.number(),

    // Soft delete. Cannot deactivate if active budget allocations
    // or recurring templates reference this category.
    isActive: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_user_active", ["userId", "isActive"])
    .index("by_user_sort", ["userId", "sortOrder"]),

  // ----------------------------------------------------------
  // SUBCATEGORIES
  // Global tags for spending visibility.
  // NOT owned by any category.
  // Transaction links both category AND subcategory together.
  // This allows "Transport" to appear under both Needs and Flex.
  //
  // Soft delete only.
  // Cannot deactivate if active transactions reference it.
  // ----------------------------------------------------------
  subCategories: defineTable({
    userId: v.id("users"),
    name: v.string(),
    icon: v.optional(v.string()),

    // Soft delete. Historical transactions preserve reference integrity.
    isActive: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_user_active", ["userId", "isActive"]),

  // ----------------------------------------------------------
  // TRANSACTIONS
  // THE SINGLE SOURCE OF TRUTH. Everything is derived from here.
  //
  // Type rules:
  //   OPENING_BALANCE → accountId required. Set once.
  //                     Editable within 24h if no other transactions exist.
  //                     After that immutable forever.
  //   INCOME          → budgetMonth required. incomeType required.
  //                     NO categoryId. Income belongs to no category.
  //                     budgetMonth can differ from physical date
  //                     (e.g. salary arrives Mar 29 but belongs to Apr budget)
  //   EXPENSE         → categoryId required. subCategoryId optional.
  //                     goalId optional (links expense to a goal).
  //                     isException + exceptionType if flagged.
  //                     note MANDATORY if isException = true.
  //   TRANSFER_IN     → transferId required. Links to paired TRANSFER_OUT.
  //                     Created atomically in same mutation. Never alone.
  //   TRANSFER_OUT    → transferId required. Links to paired TRANSFER_IN.
  //                     Created atomically in same mutation. Never alone.
  //   GOAL_ALLOCATION → categoryId required. goalId required. accountId required.
  //                     NEVER affects account balance. Virtual only.
  //                     Negative amount = cancellation reversal.
  //                     Validated: SUM(allocations) + amount <= account balance.
  //
  // Immutability rules:
  //   Transactions CANNOT be edited after creation.
  //   To fix a mistake:
  //     1. Create reversal (isReversal=true, correctionForId=original, negated amount)
  //     2. Create correct transaction
  //   Reversal fields auto-copied from original. User cannot override:
  //     accountId, categoryId, subCategoryId, goalId, type
  //   User provides: note (mandatory), localDate
  //
  // Multi-currency rules:
  //   amount          = always in user's defaultCurrency minor units
  //   originalAmount  = amount in foreign currency minor units (if applicable)
  //   originalCurrency = ISO 4217 code of foreign currency
  //   exchangeRate    = scaled int64 with 1e6 precision
  //                     representing minor units of defaultCurrency
  //                     per 1 major unit of originalCurrency
  //
  // Timezone rules:
  //   localDate = "YYYY-MM-DD" in user's timezone. Used for all reports.
  //   month     = "YYYY-MM" derived from localDate. Used for grouping.
  //   _creationTime = Convex auto UTC. Used for ordering only.
  //   Reports NEVER group by _creationTime. Always by localDate/month.
  // ----------------------------------------------------------
  transactions: defineTable(transactionDocument)
    .index("by_user", ["userId"])
    .index("by_user_month", ["userId", "month"])
    .index("by_user_account", ["userId", "accountId"])
    .index("by_user_category_month", ["userId", "categoryId", "month"])
    .index("by_user_goal", ["userId", "goalId"])
    .index("by_transfer", ["transferId"])
    .index("by_correction", ["correctionForId"])
    .index("by_recurring_template", ["recurringTemplateId"])
    .index("by_user_type_month", ["userId", "type", "month"]),

  // ----------------------------------------------------------
  // TRANSFERS
  // Links a TRANSFER_OUT and TRANSFER_IN transaction pair.
  // Created FIRST in mutation before both transactions.
  // Convex mutation atomicity guarantees both transactions
  // are created or neither is. Full rollback on failure.
  //
  // Validation before creation:
  //   fromAccountId != toAccountId
  //   (Cannot transfer to same account)
  // ----------------------------------------------------------
  transfers: defineTable({
    userId: v.id("users"),
    fromAccountId: v.id("accounts"),
    toAccountId: v.id("accounts"),
    // Minor units in user's default currency.
    amount: v.int64(),

    // Set after both transactions are created in same mutation.
    // Optional at insert time to avoid circular dependency.
    fromTransactionId: v.optional(v.id("transactions")),
    toTransactionId: v.optional(v.id("transactions")),

    note: v.optional(v.string()),

    // Timezone-aware.
    localDate: v.string(), // "YYYY-MM-DD"
    month: v.string(), // "YYYY-MM"
  })
    .index("by_user", ["userId"])
    .index("by_user_month", ["userId", "month"])
    .index("by_from_account", ["fromAccountId"])
    .index("by_to_account", ["toAccountId"]),

  // ----------------------------------------------------------
  // MONTHLY BUDGETS
  // One per user per month. UNIQUE constraint on userId + month.
  // Validated before creation — no duplicates allowed.
  //
  // State machine:
  //   DRAFT   → ACTIVE (manual activation by user)
  //   ACTIVE  → AMENDED (any BudgetAllocation change)
  //   ACTIVE  → CLOSED (manual close by user)
  //   AMENDED → CLOSED (manual close by user)
  //   CLOSED  → terminal state. Cannot reopen.
  //
  // expectedIncome = base salary estimate at budget creation time.
  // Used to calculate expectedPlannedAmount on allocations.
  //
  // actualIncome = DERIVED at report time.
  //   SUM of INCOME transactions WHERE budgetMonth = this month.
  //   NEVER stored. Calculated on the fly.
  // ----------------------------------------------------------
  monthlyBudgets: defineTable({
    userId: v.id("users"),

    // "YYYY-MM". Unique per userId. Validated before creation.
    month: v.string(),

    // User's estimate of base salary for this month.
    // Used to auto-calculate expectedPlannedAmount on allocations.
    // Minor units in user's default currency.
    expectedIncome: v.int64(),

    state: budgetState,

    // Timezone-aware timestamps.
    activatedAt: v.optional(v.string()),
    closedAt: v.optional(v.string()),
    carryoverCalculatedAt: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_month", ["userId", "month"])
    .index("by_user_state", ["userId", "state"]),

  // ----------------------------------------------------------
  // BUDGET ALLOCATIONS
  // One per category per MonthlyBudget.
  // Defines how much percentage and amount goes to each category.
  //
  // Amount calculation:
  //   expectedPlannedAmount = percentageBps * expectedIncome / 10_000
  //     → Locked at ACTIVATION. Never changes retroactively.
  //     → Auto-calculated by system. User provides percentage only.
  //
  //   actualPlannedAmount = percentageBps * actualIncome / 10_000
  //     → Recalculated every time a new INCOME transaction is logged.
  //     → Used for suggestedTransfer calculation.
  //     → actualIncome = SUM of INCOME transactions for this budgetMonth.
  //
  //   carriedOver = previous closed month's (totalAvailable - actualSpent)
  //     → Positive = underspent (bonus for this month)
  //     → Negative = overspent (deficit for this month)
  //     → Each category calculated independently.
  //     → No cross-category bleeding.
  //
  //   totalAvailable = actualPlannedAmount + carriedOver
  //
  //   suggestedTransfer (dynamic, recalculated on every income/transfer):
  //     If carriedOver >= actualPlannedAmount: 0 (no transfer needed)
  //     If carriedOver > 0: actualPlannedAmount - carriedOver
  //     If carriedOver < 0: actualPlannedAmount + ABS(carriedOver)
  //     Then subtract SUM of TRANSFER_IN to this category's accounts this month.
  //     Final = MAX(0, result) — never negative suggested transfer.
  //
  //   actualSpent = DERIVED. Never stored. Calculated as:
  //     SUM of EXPENSE transactions
  //     WHERE categoryId = this category
  //     AND month = this month
  //     Include reversals so corrected transactions net correctly.
  //     AND userId = this user
  //
  // Changes after activation → BudgetAmendment record created.
  // Full amendment history preserved. No data loss.
  // ----------------------------------------------------------
  budgetAllocations: defineTable({
    userId: v.id("users"),
    monthlyBudgetId: v.id("monthlyBudgets"),
    categoryId: v.id("categories"),

    // User provides only percentage in basis points (100% = 10_000 bps).
    percentage: v.int64(),

    // Locked at budget ACTIVATION. Auto-calculated.
    // = percentage(bps) * expectedIncome / 10_000
    // Never recalculated after activation.
    expectedPlannedAmount: v.int64(),

    // Recalculated every time actual income arrives.
    // = percentage(bps) * actualIncome / 10_000
    // Used for suggestedTransfer. Not locked.
    actualPlannedAmount: v.int64(),

    // From previous closed month.
    // Positive = underspent. Negative = overspent (deficit).
    // 0 for first ever month.
    carriedOver: v.int64(),

    // actualPlannedAmount + carriedOver.
    // Recalculated when actualPlannedAmount or carriedOver changes.
    totalAvailable: v.int64(),

    // Dynamic. Recalculated on every income/transfer event.
    // = MAX(0, actualPlannedAmount ± carriedOver - alreadyTransferred)
    // Shown to user during month-start distribution flow.
    suggestedTransfer: v.int64(),
  })
    .index("by_monthly_budget", ["monthlyBudgetId"])
    .index("by_user_month_category", ["userId", "monthlyBudgetId", "categoryId"])
    .index("by_user_category", ["userId", "categoryId"]),

  // ----------------------------------------------------------
  // BUDGET AMENDMENTS
  // Immutable history of every change to a BudgetAllocation
  // after the MonthlyBudget was ACTIVATED.
  //
  // One record per amendment. Unlimited amendments per allocation.
  // Previous data never overwritten. Always preserved here.
  //
  // reason is MANDATORY. Forces accountability.
  // ----------------------------------------------------------
  budgetAmendments: defineTable({
    userId: v.id("users"),
    budgetAllocationId: v.id("budgetAllocations"),

    previousPercentage: v.int64(),
    newPercentage: v.int64(),

    previousExpectedPlannedAmount: v.int64(),
    newExpectedPlannedAmount: v.int64(),

    previousActualPlannedAmount: v.int64(),
    newActualPlannedAmount: v.int64(),

    // Mandatory. User must explain why they changed the budget.
    reason: v.string(),

    // Timezone-aware.
    amendedAt: v.string(), // ISO string in user's timezone
  })
    .index("by_allocation", ["budgetAllocationId"])
    .index("by_user", ["userId"]),

  // ----------------------------------------------------------
  // GOALS
  // Savings targets or investment targets within a category.
  // Only valid on categories where isGoalBased = true.
  //
  // accountId is MANDATORY.
  // Goal's money physically sits in this account.
  // Unallocated balance validation uses this account.
  //
  // Unallocated balance formula:
  //   Account Balance
  //   - SUM of GOAL_ALLOCATION transactions
  //     WHERE goalId IN active goals for this account
  //     Include reversals so cancellations/adjustments net correctly.
  //
  // Validation before new GOAL_ALLOCATION:
  //   SUM(existing active allocations for account) + newAmount
  //   <= Account Balance
  //   If fails → block with clear error.
  //
  // currentAllocated is DERIVED. Never stored.
  //   = SUM of GOAL_ALLOCATION transactions
  //     WHERE goalId = this goal (including reversals)
  //
  // Goal lifecycle:
  //   ACTIVE → COMPLETED: expense reduces allocation to zero
  //                        OR user manually marks complete.
  //   ACTIVE → CANCELLED: system creates negative GOAL_ALLOCATION
  //                        to return allocated amount to unallocated pool.
  //                        cancellationNote is MANDATORY.
  //   COMPLETED or CANCELLED → terminal. Cannot reactivate.
  //   Create new goal instead.
  //
  // currentValue:
  //   For investment goals only. Manual update by user.
  //   Used for investment performance report ONLY.
  //   NEVER added to net worth calculation.
  //   Net Worth = SUM of account balances only.
  // ----------------------------------------------------------
  goals: defineTable({
    userId: v.id("users"),
    categoryId: v.id("categories"),

    // MANDATORY. Physical account where this goal's money sits.
    // Used for unallocated balance validation.
    accountId: v.id("accounts"),

    name: v.string(),

    // Optional. Some goals have no fixed target.
    // Minor units in user's default currency.
    targetAmount: v.optional(v.int64()),

    // Optional. Deadline for achieving the goal.
    deadline: v.optional(v.string()), // "YYYY-MM-DD"

    // For investment goals only. Manual update by user.
    // Tracks current market value vs cost basis.
    // NEVER included in net worth. Used in performance report only.
    // Minor units in user's default currency.
    currentValue: v.optional(v.int64()),

    status: goalStatus,

    completedAt: v.optional(v.string()),

    // Both mandatory when status = CANCELLED.
    cancelledAt: v.optional(v.string()),
    cancellationNote: v.optional(v.string()),

    // Soft delete.
    isActive: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_user_category", ["userId", "categoryId"])
    .index("by_user_account", ["userId", "accountId"])
    .index("by_user_status", ["userId", "status"]),

  // ----------------------------------------------------------
  // RECURRING TRANSACTIONS
  // Templates for auto-generating periodic transactions.
  //
  // Template versioning:
  //   When amount or any field changes:
  //     Set validUntil = today on old template (do not delete)
  //     Create new template from today forward
  //   Full version history preserved.
  //
  // Validation on every app load:
  //   For each active template where lastGeneratedDate < today:
  //     Check: accountId still active?
  //     Check: categoryId still active?
  //     Check: subCategoryId still active? (if set)
  //     If any fail → PendingRecurring with NEEDS_ATTENTION status.
  //     User must resolve before transaction can be confirmed.
  //
  // Nothing auto-creates silently. User always confirms.
  // ----------------------------------------------------------
  recurringTransactions: defineTable(recurringTransactionDocument)
    .index("by_user", ["userId"])
    .index("by_user_active", ["userId", "isActive"]),

  // ----------------------------------------------------------
  // PENDING RECURRING
  // Created when app loads and detects missed recurring occurrences.
  // User must explicitly resolve each one. Nothing auto-creates.
  //
  // Expiry rules:
  //   expiresAt = dueDate + 30 days (default)
  //   If month is already CLOSED when user tries to confirm:
  //     Block confirmation.
  //     Offer: "Log with today's date instead?" or "Dismiss"
  //   Expired items → status: EXPIRED (never deleted)
  //
  // NEEDS_ATTENTION:
  //   Set when template references deactivated account/category.
  //   User must fix template before confirming.
  //   attentionReason explains which entity was deactivated.
  // ----------------------------------------------------------
  pendingRecurring: defineTable({
    userId: v.id("users"),
    recurringTemplateId: v.id("recurringTransactions"),

    // "YYYY-MM-DD". The date this occurrence was supposed to happen.
    dueDate: v.string(),

    // Amount from template at time of pending creation.
    // User can override when confirming.
    // Minor units in user's default currency.
    suggestedAmount: v.int64(),

    status: pendingRecurringStatus,

    // "YYYY-MM-DD". Default = dueDate + 30 days.
    // After this date → auto-set to EXPIRED on next app load.
    expiresAt: v.string(),

    // Set when status = CONFIRMED.
    resolvedAt: v.optional(v.string()),
    resolvedAmount: v.optional(v.int64()),
    createdTransactionId: v.optional(v.id("transactions")),

    // Set when status = NEEDS_ATTENTION.
    // e.g. "Category 'Flex/Buffer' was deactivated"
    attentionReason: v.optional(v.string()),
  })
    .index("by_user", ["userId"])
    .index("by_user_status", ["userId", "status"])
    .index("by_template", ["recurringTemplateId"])
    .index("by_user_due_date", ["userId", "dueDate"]),
});

// ============================================================
// DERIVED VALUES — Never stored. Always calculated from transactions.
// These are the formulas your query functions must implement.
// ============================================================

/*
  ACCOUNT BALANCE
  ───────────────
  SELECT SUM(
    CASE
      WHEN type = 'OPENING_BALANCE' THEN amount
      WHEN type = 'INCOME'          THEN amount
      WHEN type = 'TRANSFER_IN'     THEN amount
      WHEN type = 'TRANSFER_OUT'    THEN -amount
      WHEN type = 'EXPENSE'         THEN -amount
      WHEN type = 'GOAL_ALLOCATION' THEN 0  -- never affects balance
    END
  )
  FROM transactions
  WHERE accountId = :accountId
  AND userId = :userId
  -- Include reversals so correction transactions actually offset originals.


  UNALLOCATED BALANCE (per account, for goal-based categories)
  ─────────────────────────────────────────────────────────────
  accountBalance
  - SUM(amount) of GOAL_ALLOCATION transactions
    WHERE accountId = :accountId
    -- Include reversals so cancellations/adjustments net correctly.
    AND goalId IN (active goals for this account)


  ACTUAL SPENT (per category per month)
  ──────────────────────────────────────
  SUM(amount) of EXPENSE transactions
  WHERE categoryId = :categoryId
  AND month = :month
  AND userId = :userId
  -- Include reversals so corrected expenses net correctly.


  ACTUAL INCOME (per budget month)
  ─────────────────────────────────
  SUM(amount) of INCOME transactions
  WHERE budgetMonth = :month
  AND userId = :userId
  -- Include reversals so corrected income nets correctly.


  GOAL CURRENT ALLOCATED
  ──────────────────────
  SUM(amount) of GOAL_ALLOCATION transactions
  WHERE goalId = :goalId
  -- Include reversals so cancellations reduce allocated amount naturally.
  (negative allocations from cancellations reduce this naturally)


  SUGGESTED TRANSFER (per budget allocation, dynamic)
  ────────────────────────────────────────────────────
  Step 1: actualIncome = ACTUAL INCOME for this budgetMonth
  Step 2: actualPlannedAmount = percentageBps * actualIncome / 10_000
  Step 3: alreadyTransferred = SUM of TRANSFER_IN transactions
            to accounts linked to this category
            WHERE month = this month
  Step 4:
    if carriedOver >= actualPlannedAmount:
      suggestedTransfer = 0
    elif carriedOver > 0:
      suggestedTransfer = actualPlannedAmount - carriedOver - alreadyTransferred
    elif carriedOver < 0:
      suggestedTransfer = actualPlannedAmount + ABS(carriedOver) - alreadyTransferred
  Step 5: suggestedTransfer = MAX(0, suggestedTransfer)


  NET WORTH
  ─────────
  SUM of ACCOUNT BALANCE across all active accounts
  for this userId.
  Investment goal currentValue is NEVER included.
  Prevents double counting.


  INVESTMENT PERFORMANCE (per investment goal)
  ─────────────────────────────────────────────
  costBasis    = GOAL CURRENT ALLOCATED for this goal
  currentValue = goal.currentValue (manual)
  gainLoss     = currentValue - costBasis
  returnPct    = (gainLoss / costBasis) * 100


  CARRYOVER CALCULATION (on month close)
  ────────────────────────────────────────
  For each BudgetAllocation in closing month:
    carryover = totalAvailable - ACTUAL SPENT
    (positive = underspent, negative = overspent deficit)

  Next month's BudgetAllocation.carriedOver = this carryover
  Each category calculated independently.
  No cross-category carryover bleeding.
*/
