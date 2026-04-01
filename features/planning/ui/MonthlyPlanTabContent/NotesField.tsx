"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMonthlyPlanFormStore } from "../../application/state/useMonthlyPlanFormStore";
import { useMonthlyPlanUiStore } from "../../application/state/useMonthlyPlanUiStore";

const NotesField = () => {
  const notes = useMonthlyPlanFormStore((s) => s.notes);
  const setNotes = useMonthlyPlanFormStore((s) => s.setNotes);
  const isClosed = useMonthlyPlanUiStore((s) => s.isClosed);

  return (
    <div className="space-y-1.5 lg:col-span-2">
      <Label>Notes</Label>
      <Input
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Optional context for this month"
        disabled={isClosed}
      />
    </div>
  );
};

export default NotesField;
