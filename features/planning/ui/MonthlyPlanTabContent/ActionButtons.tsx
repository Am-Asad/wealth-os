"use client";
import { Button } from "@/components/ui/button";
import { useMonthlyPlanActions } from "../../application/useMonthlyPlanActions";
import { useMonthlyPlanDerivedState } from "../../application/useMonthlyPlanDerivedState";
import { useMonthlyPlanUiStore } from "../../application/state/useMonthlyPlanUiStore";

const ActionButtons = () => {
  const { savePlan, copyFromLastMonth } = useMonthlyPlanActions();
  const { isBalanced } = useMonthlyPlanDerivedState();
  const hasMonthlyPlan = useMonthlyPlanUiStore((s) => s.hasMonthlyPlan);
  const isClosed = useMonthlyPlanUiStore((s) => s.isClosed);
  const isSaving = useMonthlyPlanUiStore((s) => s.isSaving);
  const isCopying = useMonthlyPlanUiStore((s) => s.isCopying);

  return (
    <div className="flex gap-2 lg:col-span-2">
      <Button disabled={isClosed || isSaving || !isBalanced} onClick={savePlan}>
        {hasMonthlyPlan ? "Update plan" : "Save plan"}
      </Button>
      <Button variant="outline" disabled={isClosed || isCopying} onClick={copyFromLastMonth}>
        Copy last month
      </Button>
    </div>
  );
};

export default ActionButtons;
