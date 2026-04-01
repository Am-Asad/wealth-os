"use client";
import { create } from "zustand";

type MonthlyPlanUiState = {
  message: string | null;
  error: string | null;
  isSaving: boolean;
  isCopying: boolean;
  isClosed: boolean;
  hasMonthlyPlan: boolean;
};

type MonthlyPlanUiActions = {
  setMessage: (value: string | null) => void;
  setError: (value: string | null) => void;
  setIsSaving: (value: boolean) => void;
  setIsCopying: (value: boolean) => void;
  setPlanStatus: (payload: { hasMonthlyPlan: boolean; isClosed: boolean }) => void;
};

type MonthlyPlanUiStore = MonthlyPlanUiState & MonthlyPlanUiActions;

/**
 * RESPONSIBILITY: Manage command/status feedback and lock flags for monthly planning UI.
 * OWNER: Planning feature team.
 * BOUNDARY REASON: Async command feedback and lock status evolve independently from form inputs.
 * CHANGES WHEN: Message strategy, loading flags, or lock semantics change.
 */
export const useMonthlyPlanUiStore = create<MonthlyPlanUiStore>((set) => ({
  message: null,
  error: null,
  isSaving: false,
  isCopying: false,
  isClosed: false,
  hasMonthlyPlan: false,
  setMessage: (message) => set({ message }),
  setError: (error) => set({ error }),
  setIsSaving: (isSaving) => set({ isSaving }),
  setIsCopying: (isCopying) => set({ isCopying }),
  setPlanStatus: ({ hasMonthlyPlan, isClosed }) => set({ hasMonthlyPlan, isClosed }),
}));
