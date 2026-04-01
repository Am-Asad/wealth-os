"use client";
import { useEffect, useRef } from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { useMonthlyPlanQuery } from "../infrastructure/useMonthlyPlanApi";
import { useMonthlyPlanUiStore } from "./state/useMonthlyPlanUiStore";
import { useMonthlyPlanFormStore } from "./state/useMonthlyPlanFormStore";
import { useMonthlyPlanPeriodStore } from "./state/useMonthlyPlanPeriodStore";

/**
 * RESPONSIBILITY: Synchronize backend monthly plan document into local store slices.
 * OWNER: Planning feature team.
 * BOUNDARY REASON: Hydration policy changes separately from view rendering and action commands.
 * CHANGES WHEN: Query source, hydration reset behavior, or lock-status mapping changes.
 */
export const useMonthlyPlanHydration = () => {
  const year = useMonthlyPlanPeriodStore((s) => s.year);
  const month = useMonthlyPlanPeriodStore((s) => s.month);
  const setPlanStatus = useMonthlyPlanUiStore((s) => s.setPlanStatus);
  const hydrateFromPlan = useMonthlyPlanFormStore((s) => s.hydrateFromPlan);
  const resetPlanValues = useMonthlyPlanFormStore((s) => s.resetPlanValues);

  const monthlyPlan = useMonthlyPlanQuery(year, month);
  const lastHydratedPlanIdRef = useRef<Id<"monthly_plan"> | null>(null);

  useEffect(() => {
    const currentPlanId = monthlyPlan?._id ?? null;
    if (lastHydratedPlanIdRef.current === currentPlanId) {
      return;
    }
    lastHydratedPlanIdRef.current = currentPlanId;

    if (!monthlyPlan) {
      setPlanStatus({ hasMonthlyPlan: false, isClosed: false });
      resetPlanValues();
      return;
    }

    setPlanStatus({ hasMonthlyPlan: true, isClosed: monthlyPlan.isClosed });
    hydrateFromPlan({
      expectedIncomeMinor: monthlyPlan.expectedIncomeMinor.toString(),
      needsAllocationMinor: monthlyPlan.needsAllocationMinor.toString(),
      investmentsAllocationMinor: monthlyPlan.investmentsAllocationMinor.toString(),
      savingsAllocationMinor: monthlyPlan.savingsAllocationMinor.toString(),
      charityAllocationMinor: monthlyPlan.charityAllocationMinor.toString(),
      flexAllocationMinor: monthlyPlan.flexAllocationMinor.toString(),
      notes: monthlyPlan.notes ?? "",
    });
  }, [monthlyPlan, setPlanStatus, hydrateFromPlan, resetPlanValues]);
};
