export type ReportPeriod = "weekly" | "monthly" | "quarterly" | "yearly";
export type ReportBucket = "needs" | "investments" | "savings" | "charity" | "flex";

export type ReportPeriodTabConfig = {
  value: ReportPeriod;
  label: string;
};
