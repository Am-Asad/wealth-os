import { create } from "zustand";
import { SetupStepId } from "../../domain/types";
import { SETUP_STEPS } from "../../domain/steps";

type SetupWizardState = {
  activeStep: SetupStepId;
  setActiveStep: (step: SetupStepId) => void;
  next: () => void;
  back: () => void;
};

const stepIds = SETUP_STEPS.map((step) => step.id);

export const useSetupWizardStore = create<SetupWizardState>((set, get) => ({
  activeStep: "accounts",
  setActiveStep: (step) => set({ activeStep: step }),
  next: () => {
    const index = stepIds.indexOf(get().activeStep);
    set({ activeStep: stepIds[Math.min(stepIds.length - 1, index + 1)] });
  },
  back: () => {
    const index = stepIds.indexOf(get().activeStep);
    set({ activeStep: stepIds[Math.max(0, index - 1)] });
  },
}));
