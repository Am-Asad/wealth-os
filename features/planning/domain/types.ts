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
