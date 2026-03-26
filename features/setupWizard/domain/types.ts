export type SetupStepId = "accounts" | "categories" | "subcategories" | "review";

export type SetupStep = {
  id: SetupStepId;
  title: string;
  description: string;
};

export type AccountPurpose = "GENERAL" | "EMERGENCY_FUND" | "GOAL_SAVINGS" | "INVESTMENT";
export type AccountType = "BANK" | "WALLET" | "CASH" | "INVESTMENT" | "CREDIT_CARD";
