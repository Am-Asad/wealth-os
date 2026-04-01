"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMonthlyPlanFormStore } from "../../application/state/useMonthlyPlanFormStore";
import { useMonthlyPlanUiStore } from "../../application/state/useMonthlyPlanUiStore";

const ExpectedIncomeField = () => {
  const expectedIncomeMinor = useMonthlyPlanFormStore((s) => s.expectedIncomeMinor);
  const setExpectedIncomeMinor = useMonthlyPlanFormStore((s) => s.setExpectedIncomeMinor);
  const isClosed = useMonthlyPlanUiStore((s) => s.isClosed);

  return (
    <div className="space-y-1.5 lg:col-span-2">
      <Label>Expected income (minor units)</Label>
      <Input
        value={expectedIncomeMinor}
        onChange={(event) => setExpectedIncomeMinor(event.target.value)}
        placeholder="e.g. 10000000"
        disabled={isClosed}
      />
    </div>
  );
};

export default ExpectedIncomeField;
