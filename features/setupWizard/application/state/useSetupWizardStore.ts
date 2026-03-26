import { create } from "zustand";
import { SETUP_WIZARD_STEPS } from "../../domain/steps";
import { SetupWizardStepId } from "../../domain/types";

type SetupWizardState = {
  stepId: SetupWizardStepId;
  setStep: (stepId: SetupWizardStepId) => void;
  next: () => void;
  back: () => void;
};

const stepIds = SETUP_WIZARD_STEPS.map((s) => s.id);

export const useSetupWizardStore = create<SetupWizardState>((set, get) => ({
  stepId: "accounts",
  setStep: (stepId) => set({ stepId }),
  next: () => {
    const current = get().stepId;
    const idx = stepIds.indexOf(current);
    const nextId = stepIds[Math.min(stepIds.length - 1, idx + 1)];
    set({ stepId: nextId });
  },
  back: () => {
    const current = get().stepId;
    const idx = stepIds.indexOf(current);
    const prevId = stepIds[Math.max(0, idx - 1)];
    set({ stepId: prevId });
  },
}));

