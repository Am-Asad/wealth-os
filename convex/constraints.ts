import { v } from "convex/values";
import { mutation, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

const toMonth = (date: string) => {
  const match = /^(\d{4})-(\d{2})-\d{2}$/.exec(date);
  if (!match) {
    throw new Error("date must be in YYYY-MM-DD format.");
  }
  return `${match[1]}-${match[2]}`;
};

const assertPositiveMinor = (field: string, value: bigint) => {
  if (value <= BigInt(0)) {
    throw new Error(`${field} must be greater than zero.`);
  }
};

const requireUserId = async (ctx: MutationCtx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Authentication required.");
  }
  const user = await ctx.db
    .query("users")
    .withIndex("by_token", (q) => q.eq("tokenIdentifier", identity.tokenIdentifier))
    .unique();
  if (!user) {
    throw new Error("User profile not found.");
  }
  return user._id;
};

const assertAccountOwnership = async (
  ctx: MutationCtx,
  userId: Id<"users">,
  accountId: Id<"accounts">,
  fieldName: string,
) => {
  const account = await ctx.db.get(accountId);
  if (!account || account.userId !== userId) {
    throw new Error(`${fieldName} must belong to the authenticated user.`);
  }
  if (!account.isActive) {
    throw new Error(`${fieldName} must reference an active account.`);
  }
};

const assertCategoryOwnership = async (
  ctx: MutationCtx,
  userId: Id<"users">,
  categoryId: Id<"categories">,
) => {
  const category = await ctx.db.get(categoryId);
  if (!category || category.userId !== userId) {
    throw new Error("categoryId must belong to the authenticated user.");
  }
  if (!category.isActive) {
    throw new Error("categoryId must reference an active category.");
  }
};

const assertGoalOwnership = async (ctx: MutationCtx, userId: Id<"users">, goalId: Id<"goals">) => {
  const goal = await ctx.db.get(goalId);
  if (!goal || goal.userId !== userId) {
    throw new Error("linkedGoalId must belong to the authenticated user.");
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
    return await ctx.runMutation(api.monthlyPlan.createMonthlyPlan, args);
  },
});

export const createTransfer = mutation({
  args: {
    date: v.string(),
    amountMinor: v.int64(),
    fromAccountId: v.id("accounts"),
    toAccountId: v.id("accounts"),
    linkedGoalId: v.optional(v.id("goals")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    void args.linkedGoalId;
    assertPositiveMinor("amountMinor", args.amountMinor);
    if (args.fromAccountId === args.toAccountId) {
      throw new Error("fromAccountId and toAccountId must be different.");
    }

    const userId = await requireUserId(ctx);
    const month = toMonth(args.date);
    await assertAccountOwnership(ctx, userId, args.fromAccountId, "fromAccountId");
    await assertAccountOwnership(ctx, userId, args.toAccountId, "toAccountId");

    // 1) Create transfer shell record (transaction ids patched later).
    const transferId = await ctx.db.insert("transfers", {
      userId,
      fromAccountId: args.fromAccountId,
      toAccountId: args.toAccountId,
      amount: args.amountMinor,
      fromTransactionId: undefined,
      toTransactionId: undefined,
      note: args.notes,
      localDate: args.date,
      month,
    });

    // 2) Create paired transfer transactions linked via transferId.
    const outTxId = await ctx.db.insert("transactions", {
      userId,
      type: "TRANSFER_OUT",
      amount: args.amountMinor,
      accountId: args.fromAccountId,
      categoryId: null,
      subCategoryId: null,
      goalId: null,
      transferId,
      budgetMonth: null,
      incomeType: null,
      isRecurring: false,
      recurringTemplateId: undefined,
      isException: false,
      exceptionType: null,
      isReversal: false,
      correctionForId: undefined,
      note: args.notes,
      receiptUrl: undefined,
      localDate: args.date,
      month,
    });

    const inTxId = await ctx.db.insert("transactions", {
      userId,
      type: "TRANSFER_IN",
      amount: args.amountMinor,
      accountId: args.toAccountId,
      categoryId: null,
      subCategoryId: null,
      goalId: null,
      transferId,
      budgetMonth: null,
      incomeType: null,
      isRecurring: false,
      recurringTemplateId: undefined,
      isException: false,
      exceptionType: null,
      isReversal: false,
      correctionForId: undefined,
      note: args.notes,
      receiptUrl: undefined,
      localDate: args.date,
      month,
    });

    // 3) Backfill link fields on transfer.
    await ctx.db.patch(transferId, {
      fromTransactionId: outTxId,
      toTransactionId: inTxId,
    });

    return { ok: true, transferId, fromTransactionId: outTxId, toTransactionId: inTxId };
  },
});

export const createTransaction = mutation({
  args: {
    date: v.string(),
    amountMinor: v.int64(),
    type: v.union(v.literal("EXPENSE"), v.literal("INCOME")),
    accountId: v.id("accounts"),
    categoryId: v.optional(v.id("categories")),
    subcategoryId: v.optional(v.id("subCategories")),
    linkedGoalId: v.optional(v.id("goals")),
    receiptUrl: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertPositiveMinor("amountMinor", args.amountMinor);
    const userId = await requireUserId(ctx);
    const month = toMonth(args.date);
    await assertAccountOwnership(ctx, userId, args.accountId, "accountId");

    if (args.type === "EXPENSE" && !args.categoryId) {
      throw new Error("categoryId is required for EXPENSE.");
    }
    if (args.categoryId) {
      await assertCategoryOwnership(ctx, userId, args.categoryId);
    }
    if (args.linkedGoalId) {
      await assertGoalOwnership(ctx, userId, args.linkedGoalId);
    }

    if (args.type === "INCOME") {
      return await ctx.db.insert("transactions", {
        userId,
        type: "INCOME",
        amount: args.amountMinor,
        accountId: args.accountId,
        categoryId: undefined,
        subCategoryId: undefined,
        goalId: undefined,
        transferId: undefined,
        budgetMonth: month,
        incomeType: "BASE",
        isRecurring: false,
        recurringTemplateId: undefined,
        isException: false,
        exceptionType: undefined,
        isReversal: false,
        correctionForId: undefined,
        note: args.notes,
        receiptUrl: args.receiptUrl,
        localDate: args.date,
        month,
      });
    }

    return await ctx.db.insert("transactions", {
      userId,
      type: "EXPENSE",
      amount: args.amountMinor,
      accountId: args.accountId,
      categoryId: args.categoryId!,
      subCategoryId: args.subcategoryId,
      goalId: args.linkedGoalId,
      transferId: undefined,
      budgetMonth: undefined,
      incomeType: undefined,
      isRecurring: false,
      recurringTemplateId: undefined,
      isException: false,
      exceptionType: undefined,
      isReversal: false,
      correctionForId: undefined,
      note: args.notes,
      receiptUrl: args.receiptUrl,
      localDate: args.date,
      month,
    });
  },
});

export const createIncomeEntry = mutation({
  args: {
    date: v.string(),
    amountMinor: v.int64(),
    accountId: v.id("accounts"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertPositiveMinor("amountMinor", args.amountMinor);
    const userId = await requireUserId(ctx);
    const month = toMonth(args.date);
    await assertAccountOwnership(ctx, userId, args.accountId, "accountId");
    return await ctx.db.insert("transactions", {
      userId,
      type: "INCOME",
      amount: args.amountMinor,
      accountId: args.accountId,
      categoryId: null,
      subCategoryId: null,
      goalId: null,
      transferId: null,
      budgetMonth: month,
      incomeType: "BASE",
      isRecurring: false,
      recurringTemplateId: undefined,
      isException: false,
      exceptionType: null,
      isReversal: false,
      correctionForId: undefined,
      note: args.notes,
      receiptUrl: undefined,
      localDate: args.date,
      month,
    });
  },
});

export const createIncomeAllocation = mutation({
  args: {
    incomeEntryId: v.id("transactions"),
    bucketId: v.optional(v.string()),
    amountMinor: v.int64(),
    toAccountId: v.optional(v.id("accounts")),
    goalId: v.optional(v.id("goals")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    void args.bucketId;
    assertPositiveMinor("amountMinor", args.amountMinor);
    if (!args.goalId) {
      throw new Error("goalId is required for income allocation.");
    }
    if (!args.toAccountId) {
      throw new Error("toAccountId is required for income allocation.");
    }

    const userId = await requireUserId(ctx);
    const sourceIncome = await ctx.db.get(args.incomeEntryId);
    if (!sourceIncome || sourceIncome.userId !== userId || sourceIncome.type !== "INCOME") {
      throw new Error("incomeEntryId must reference an INCOME transaction owned by user.");
    }
    await assertAccountOwnership(ctx, userId, args.toAccountId, "toAccountId");
    await assertGoalOwnership(ctx, userId, args.goalId);

    const goal = await ctx.db.get(args.goalId);
    if (!goal) {
      throw new Error("goalId not found.");
    }
    const month = toMonth(sourceIncome.localDate);

    return await ctx.db.insert("transactions", {
      userId,
      type: "GOAL_ALLOCATION",
      amount: args.amountMinor,
      accountId: args.toAccountId,
      categoryId: goal.categoryId,
      subCategoryId: null,
      goalId: args.goalId,
      transferId: null,
      budgetMonth: null,
      incomeType: null,
      isRecurring: false,
      recurringTemplateId: undefined,
      isException: false,
      exceptionType: null,
      isReversal: false,
      correctionForId: undefined,
      note: args.notes,
      receiptUrl: undefined,
      localDate: sourceIncome.localDate,
      month,
    });
  },
});

export const createRecurringRule = mutation({
  args: {
    name: v.string(),
    amountMinor: v.int64(),
    type: v.union(v.literal("EXPENSE"), v.literal("INCOME")),
    frequency: v.union(v.literal("WEEKLY"), v.literal("MONTHLY"), v.literal("YEARLY")),
    accountId: v.id("accounts"),
    categoryId: v.optional(v.id("categories")),
    subcategoryId: v.optional(v.id("subCategories")),
    nextDueDate: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertPositiveMinor("amountMinor", args.amountMinor);
    const userId = await requireUserId(ctx);
    await assertAccountOwnership(ctx, userId, args.accountId, "accountId");
    if (args.type === "EXPENSE" && !args.categoryId) {
      throw new Error("categoryId is required for EXPENSE recurring template.");
    }
    if (args.categoryId) {
      await assertCategoryOwnership(ctx, userId, args.categoryId);
    }
    if (args.type === "EXPENSE") {
      return await ctx.db.insert("recurringTransactions", {
        userId,
        templateName: args.name,
        type: "EXPENSE",
        amount: args.amountMinor,
        accountId: args.accountId,
        categoryId: args.categoryId!,
        subCategoryId: args.subcategoryId,
        frequency: args.frequency,
        startDate: args.nextDueDate,
        validUntil: undefined,
        lastGeneratedDate: undefined,
        isActive: true,
        note: args.notes,
      });
    }

    return await ctx.db.insert("recurringTransactions", {
      userId,
      templateName: args.name,
      type: "INCOME",
      amount: args.amountMinor,
      accountId: args.accountId,
      categoryId: null,
      subCategoryId: null,
      frequency: args.frequency,
      startDate: args.nextDueDate,
      validUntil: undefined,
      lastGeneratedDate: undefined,
      isActive: true,
      note: args.notes,
    });
  },
});
