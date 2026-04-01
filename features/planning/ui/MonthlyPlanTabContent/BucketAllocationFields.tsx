"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BUCKET_FIELDS } from "./model";
import { useMonthlyPlanFormStore } from "../../application/state/useMonthlyPlanFormStore";
import { useMonthlyPlanUiStore } from "../../application/state/useMonthlyPlanUiStore";

const BucketAllocationFields = () => {
  const form = useMonthlyPlanFormStore((s) => s);
  const isClosed = useMonthlyPlanUiStore((s) => s.isClosed);
  return (
    <>
      {BUCKET_FIELDS.map((bucketField) => (
        <div key={bucketField.label} className="space-y-1.5">
          <Label>{bucketField.label} allocation</Label>
          <Input
            value={form[bucketField.key]}
            onChange={(event) => form.setBucketAllocation(bucketField.key, event.target.value)}
            placeholder={`Amount for ${bucketField.label}`}
            disabled={isClosed}
          />
        </div>
      ))}
    </>
  );
};

export default BucketAllocationFields;
