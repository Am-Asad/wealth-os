export type SetupWizardStepId = "accounts" | "categories" | "subcategories" | "review";

export type SetupWizardStep = {
  id: SetupWizardStepId;
  title: string;
  description: string;
};

