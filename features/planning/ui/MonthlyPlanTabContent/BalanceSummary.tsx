"use client";
import { useMonthlyPlanDerivedState } from "../../application/useMonthlyPlanDerivedState";

const BalanceSummary = () => {
  const { allocationTotalMinor, expectedIncomeMinor, isBalanced } = useMonthlyPlanDerivedState();

  return (
    <div className="rounded-xl border p-3 text-sm lg:col-span-2">
      <p>Allocation total: {allocationTotalMinor.toString()}</p>
      <p>Expected income: {expectedIncomeMinor.toString()}</p>
      <p className={isBalanced ? "text-emerald-600" : "text-destructive"}>
        {isBalanced
          ? "Balanced plan: ready to save."
          : "Not balanced: 5 bucket sum must equal expected income."}
      </p>
    </div>
  );
};

export default BalanceSummary;
