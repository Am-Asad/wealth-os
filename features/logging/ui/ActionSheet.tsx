"use client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useLoggingStore } from "../application/state/useLoggingStore";
import { LOGGING_ACTIONS } from "../domain/actions";
import { renderActionForm } from "./forms/registry";

const ActionSheet = () => {
  const openAction = useLoggingStore((s) => s.openAction);
  const close = useLoggingStore((s) => s.close);
  const action = LOGGING_ACTIONS.find((row) => row.id === openAction);
  const open = Boolean(openAction);
  const actionFormNode = openAction ? renderActionForm(openAction) : null;

  return (
    <Sheet open={open} onOpenChange={(value) => (!value ? close() : null)}>
      <SheetContent side="bottom" className="max-h-[85svh] overflow-y-auto lg:max-h-none">
        <SheetHeader>
          <SheetTitle>{action?.title}</SheetTitle>
          <SheetDescription>{action?.description}</SheetDescription>
        </SheetHeader>

        <div className="space-y-3 p-4">{actionFormNode}</div>
        <SheetFooter className="border-t bg-background">
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button>Save</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default ActionSheet;
