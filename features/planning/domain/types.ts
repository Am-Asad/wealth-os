export type PlanningTabValue = "monthlyPlan" | "weekReview" | "monthClose";

export type PlanningBucket =
  | "Needs"
  | "Investments"
  | "Savings"
  | "Charity"
  | "Flex";

export type WeeklyReviewProgressEntry = {
  label: PlanningBucket;
  value: number;
};

export type MonthCloseChecklistItem = string;

export type MonthlyPlanFormState = {
  year: number;
  month: number;
  expectedIncomeMinor: string;
  needsAllocationMinor: string;
  investmentsAllocationMinor: string;
  savingsAllocationMinor: string;
  charityAllocationMinor: string;
  flexAllocationMinor: string;
  notes: string;
};
