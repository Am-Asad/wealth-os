import { SetupStep } from "./types";

export const SETUP_STEPS: SetupStep[] = [
  { id: "accounts", title: "Accounts", description: "Create and tag money containers." },
  { id: "categories", title: "Categories", description: "Organize transactions under buckets." },
  { id: "subcategories", title: "Subcategories", description: "Add optional drill-down labels." },
  { id: "review", title: "Review", description: "Validate setup and finish onboarding." },
];
