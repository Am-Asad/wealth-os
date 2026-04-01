import type { PlanningBucket } from "../../domain/types";

export const BUCKET_FIELDS = [
  { label: "Needs", key: "needsAllocationMinor" },
  { label: "Investments", key: "investmentsAllocationMinor" },
  { label: "Savings", key: "savingsAllocationMinor" },
  { label: "Charity", key: "charityAllocationMinor" },
  { label: "Flex", key: "flexAllocationMinor" },
] as const satisfies ReadonlyArray<{
  label: PlanningBucket;
  key:
    | "needsAllocationMinor"
    | "investmentsAllocationMinor"
    | "savingsAllocationMinor"
    | "charityAllocationMinor"
    | "flexAllocationMinor";
}>;
