import { SetupWizardStep } from "./types";

export const SETUP_WIZARD_STEPS: SetupWizardStep[] = [
  {
    id: "accounts",
    title: "Accounts",
    description: "Add your real-world wallets and banks.",
  },
  {
    id: "categories",
    title: "Categories",
    description: "Organize spending and income by bucket.",
  },
  {
    id: "subcategories",
    title: "Subcategories",
    description: "Optional drill-down labels for clarity.",
  },
  {
    id: "review",
    title: "Review",
    description: "Confirm and finish setup.",
  },
];

