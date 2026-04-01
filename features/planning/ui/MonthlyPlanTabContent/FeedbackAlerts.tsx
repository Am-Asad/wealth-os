"use client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMonthlyPlanUiStore } from "../../application/state/useMonthlyPlanUiStore";
import { useShallow } from "zustand/react/shallow";

const FeedbackAlerts = () => {
  const { error, message } = useMonthlyPlanUiStore(
    useShallow((s) => ({ error: s.error, message: s.message })),
  );

  return (
    <>
      {error ? (
        <Alert variant="destructive" className="lg:col-span-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {message ? (
        <Alert className="lg:col-span-2">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}
    </>
  );
};

export default FeedbackAlerts;
