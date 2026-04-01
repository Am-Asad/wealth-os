"use client";
import { create } from "zustand";

type MonthlyPlanPeriodState = {
  year: number;
  month: number;
  setYear: (year: number) => void;
  setMonth: (month: number) => void;
};

const today = new Date();

/**
 * RESPONSIBILITY: Manage selected planning period (year/month) only.
 * OWNER: Planning feature team.
 * BOUNDARY REASON: Period navigation evolves independently from form values and async UI flags.
 * CHANGES WHEN: Period initialization or period-selection behavior changes.
 */
export const useMonthlyPlanPeriodStore = create<MonthlyPlanPeriodState>((set) => ({
  year: today.getFullYear(),
  month: today.getMonth() + 1,
  setYear: (year) => set({ year }),
  setMonth: (month) => set({ month }),
}));
