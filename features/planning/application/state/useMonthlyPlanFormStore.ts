"use client";
import { create } from "zustand";

type BucketAllocationKey =
  | "needsAllocationMinor"
  | "investmentsAllocationMinor"
  | "savingsAllocationMinor"
  | "charityAllocationMinor"
  | "flexAllocationMinor";

type MonthlyPlanFormState = {
  expectedIncomeMinor: string;
  needsAllocationMinor: string;
  investmentsAllocationMinor: string;
  savingsAllocationMinor: string;
  charityAllocationMinor: string;
  flexAllocationMinor: string;
  notes: string;
};

type MonthlyPlanFormActions = {
  setExpectedIncomeMinor: (value: string) => void;
  setNotes: (value: string) => void;
  setBucketAllocation: (key: BucketAllocationKey, value: string) => void;
  hydrateFromPlan: (payload: MonthlyPlanFormState) => void;
  resetPlanValues: () => void;
};

type MonthlyPlanFormStore = MonthlyPlanFormState & MonthlyPlanFormActions;

const initialValues: MonthlyPlanFormState = {
  expectedIncomeMinor: "0",
  needsAllocationMinor: "0",
  investmentsAllocationMinor: "0",
  savingsAllocationMinor: "0",
  charityAllocationMinor: "0",
  flexAllocationMinor: "0",
  notes: "",
};

/**
 * RESPONSIBILITY: Manage editable monthly plan form fields only.
 * OWNER: Planning feature team.
 * BOUNDARY REASON: Form structure/validation inputs change independently from period and UI status state.
 * CHANGES WHEN: Allocation fields, notes behavior, or hydration/reset strategy changes.
 */
export const useMonthlyPlanFormStore = create<MonthlyPlanFormStore>((set) => ({
  ...initialValues,
  setExpectedIncomeMinor: (expectedIncomeMinor) => set({ expectedIncomeMinor }),
  setNotes: (notes) => set({ notes }),
  setBucketAllocation: (key, value) => set({ [key]: value }),
  hydrateFromPlan: (payload) => set({ ...payload }),
  resetPlanValues: () => set({ ...initialValues }),
}));
