"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LOGGING_ACTIONS } from "../domain/actions";
import { LoggingActionId } from "../domain/types";

type ActionsTabContentProps = {
  onOpenAction: (actionId: LoggingActionId) => void;
};

const ActionsTabContent = ({ onOpenAction }: ActionsTabContentProps) => {
  return (
    <Card className="hover:cursor-pointer">
      <CardHeader>
        <CardTitle className="text-base">Choose an action</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 sm:grid-cols-2">
        {LOGGING_ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={() => onOpenAction(action.id)}
            className="rounded-xl border bg-muted/30 p-3 text-left transition-colors hover:bg-muted"
          >
            <p className="font-medium">{action.title}</p>
            <p className="text-xs text-muted-foreground">{action.description}</p>
          </button>
        ))}
      </CardContent>
    </Card>
  );
};

export default ActionsTabContent;
