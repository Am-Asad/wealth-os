"use client";
import { useCallback } from "react";
import {
  useCopyLastMonthPlanMutation,
  useCreateMonthlyPlanMutation,
  useUpdateMonthlyPlanMutation,
} from "../infrastructure/useMonthlyPlanApi";
import { parseMinorOrThrow, useMonthlyPlanDerivedState } from "./useMonthlyPlanDerivedState";
import { useMonthlyPlanFormStore } from "./state/useMonthlyPlanFormStore";
import { useMonthlyPlanPeriodStore } from "./state/useMonthlyPlanPeriodStore";
import { useMonthlyPlanUiStore } from "./state/useMonthlyPlanUiStore";
import { toast } from "sonner";

/**
 * RESPONSIBILITY: Execute monthly-plan commands (save/copy) and manage async UI flags/messages.
 * OWNER: Planning feature team.
 * BOUNDARY REASON: Command workflows can change independently from state storage and UI composition.
 * CHANGES WHEN: Save/copy command contracts, error handling, or optimistic behavior changes.
 */
export const useMonthlyPlanActions = () => {
  const year = useMonthlyPlanPeriodStore((s) => s.year);
  const month = useMonthlyPlanPeriodStore((s) => s.month);
  const form = useMonthlyPlanFormStore((s) => s);
  const setMessage = useMonthlyPlanUiStore((s) => s.setMessage);
  const setError = useMonthlyPlanUiStore((s) => s.setError);
  const setIsSaving = useMonthlyPlanUiStore((s) => s.setIsSaving);
  const setIsCopying = useMonthlyPlanUiStore((s) => s.setIsCopying);
  const hasMonthlyPlan = useMonthlyPlanUiStore((s) => s.hasMonthlyPlan);
  const { isBalanced } = useMonthlyPlanDerivedState();

  const createMonthlyPlan = useCreateMonthlyPlanMutation();
  const updateMonthlyPlan = useUpdateMonthlyPlanMutation();
  const copyLastMonthPlan = useCopyLastMonthPlanMutation();

  const savePlan = useCallback(async () => {
    setMessage(null);
    setError(null);

    try {
      const payload = {
        year,
        month,
        expectedIncomeMinor: parseMinorOrThrow(form.expectedIncomeMinor),
        needsAllocationMinor: parseMinorOrThrow(form.needsAllocationMinor),
        investmentsAllocationMinor: parseMinorOrThrow(form.investmentsAllocationMinor),
        savingsAllocationMinor: parseMinorOrThrow(form.savingsAllocationMinor),
        charityAllocationMinor: parseMinorOrThrow(form.charityAllocationMinor),
        flexAllocationMinor: parseMinorOrThrow(form.flexAllocationMinor),
        notes: form.notes.trim() ? form.notes.trim() : undefined,
      };

      if (!isBalanced) {
        throw new Error(
          "Invalid plan: 5 bucket allocations must sum exactly to expected income before saving.",
        );
      }

      setIsSaving(true);
      if (hasMonthlyPlan) {
        await updateMonthlyPlan(payload);
        setMessage("Monthly plan updated.");
        toast.success("Monthly plan updated.");
      } else {
        await createMonthlyPlan(payload);
        setMessage("Monthly plan created.");
        toast.success("Monthly plan created.");
      }
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : "Unable to save monthly plan.");
      setError(saveError instanceof Error ? saveError.message : "Unable to save monthly plan.");
    } finally {
      setIsSaving(false);
    }
  }, [
    year,
    month,
    form.expectedIncomeMinor,
    form.needsAllocationMinor,
    form.investmentsAllocationMinor,
    form.savingsAllocationMinor,
    form.charityAllocationMinor,
    form.flexAllocationMinor,
    form.notes,
    hasMonthlyPlan,
    setMessage,
    setError,
    setIsSaving,
    isBalanced,
    createMonthlyPlan,
    updateMonthlyPlan,
  ]);

  const copyFromLastMonth = useCallback(async () => {
    setMessage(null);
    setError(null);

    try {
      setIsCopying(true);
      const result = await copyLastMonthPlan({ year, month });
      if (!result.ok && result.reason === "NO_PREVIOUS_MONTH_PLAN") {
        setError("No monthly plan exists for the previous month to copy from.");
        toast.error("No monthly plan exists for the previous month to copy from.");
        return;
      }
      setMessage("Copied allocations from previous month.");
      toast.success("Copied allocations from previous month.");
    } catch (copyError) {
      setError(copyError instanceof Error ? copyError.message : "Unable to copy last month plan.");
      toast.error(
        copyError instanceof Error ? copyError.message : "Unable to copy last month plan.",
      );
    } finally {
      setIsCopying(false);
    }
  }, [year, month, setMessage, setError, setIsCopying, copyLastMonthPlan]);

  return { savePlan, copyFromLastMonth };
};
