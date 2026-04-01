"use client";
import { useMemo } from "react";
import { useMonthlyPlanFormStore } from "./state/useMonthlyPlanFormStore";

const safeMinor = (value: string) => {
  const parsed = value.trim() === "" ? BigInt(0) : BigInt(value.trim());
  if (parsed < BigInt(0)) {
    throw new Error("Amounts cannot be negative.");
  }
  return parsed;
};

/**
 * RESPONSIBILITY: Compute derived monthly-plan values from store fields.
 * OWNER: Planning feature team.
 * BOUNDARY REASON: Derived calculations evolve independently from rendering and mutations.
 * CHANGES WHEN: Balance formula, parse policy, or validation semantics change.
 */
export const useMonthlyPlanDerivedState = () => {
  const form = useMonthlyPlanFormStore((s) => s);

  const allocationTotalMinor = useMemo(() => {
    try {
      return (
        safeMinor(form.needsAllocationMinor) +
        safeMinor(form.investmentsAllocationMinor) +
        safeMinor(form.savingsAllocationMinor) +
        safeMinor(form.charityAllocationMinor) +
        safeMinor(form.flexAllocationMinor)
      );
    } catch {
      return BigInt(0);
    }
  }, [
    form.needsAllocationMinor,
    form.investmentsAllocationMinor,
    form.savingsAllocationMinor,
    form.charityAllocationMinor,
    form.flexAllocationMinor,
  ]);

  const expectedIncomeMinor = useMemo(() => {
    try {
      return safeMinor(form.expectedIncomeMinor);
    } catch {
      return BigInt(0);
    }
  }, [form.expectedIncomeMinor]);

  return {
    allocationTotalMinor,
    expectedIncomeMinor,
    isBalanced: allocationTotalMinor === expectedIncomeMinor,
  };
};

export const parseMinorOrThrow = safeMinor;
