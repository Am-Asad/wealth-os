"use client";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMonthlyPlanUiStore } from "../../application/state/useMonthlyPlanUiStore";

const StatusHeader = () => {
  const isClosed = useMonthlyPlanUiStore((s) => s.isClosed);

  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-base">
        Monthly plan
        <Badge variant={isClosed ? "destructive" : "secondary"}>
          {isClosed ? "Closed (Locked)" : "Open"}
        </Badge>
      </CardTitle>
    </CardHeader>
  );
};

export default StatusHeader;
