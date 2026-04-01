"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMonthlyPlanPeriodStore } from "../../application/state/useMonthlyPlanPeriodStore";

const PeriodFields = () => {
  const { year, month, setYear, setMonth } = useMonthlyPlanPeriodStore();
  return (
    <>
      <div className="space-y-1.5">
        <Label>Year</Label>
        <Input
          type="number"
          value={year}
          onChange={(event) => setYear(Number(event.target.value || 0))}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Month</Label>
        <Input
          type="number"
          min={1}
          max={12}
          value={month}
          onChange={(event) => setMonth(Number(event.target.value || 0))}
        />
      </div>
    </>
  );
};

export default PeriodFields;
