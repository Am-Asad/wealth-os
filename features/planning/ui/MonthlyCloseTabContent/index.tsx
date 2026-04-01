"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import type { MonthCloseChecklistItem } from "../../domain/types";
import {
  useCloseMonthlyPlanMutation,
  useMonthlyPlanQuery,
} from "../../infrastructure/useMonthlyPlanApi";

const MONTH_CLOSE_CHECKLIST: readonly MonthCloseChecklistItem[] = [
  "All expenses are logged",
  "All income entries are allocated",
  "Portfolio snapshots updated",
  "Recurring confirmations resolved",
];

const MonthCloseTabContent = () => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);

  const monthlyPlan = useMonthlyPlanQuery(year, month);
  const closeMonthlyPlan = useCloseMonthlyPlanMutation();

  const handleRunMonthClose = async () => {
    setError(null);
    setMessage(null);
    try {
      setIsClosing(true);
      await closeMonthlyPlan({ year, month } as never);
      setMessage("Month closed. Plan is now locked from updates.");
    } catch (closeError) {
      setError(closeError instanceof Error ? closeError.message : "Unable to close month.");
    } finally {
      setIsClosing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Month close checklist</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        {message ? (
          <Alert>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Year</Label>
            <Input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value || 0))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Month</Label>
            <Input
              type="number"
              min={1}
              max={12}
              value={month}
              onChange={(e) => setMonth(Number(e.target.value || 0))}
            />
          </div>
        </div>
        <div className="rounded-xl border p-3">
          {monthlyPlan ? (
            <div className="flex items-center justify-between">
              <span>
                Current status for {year}/{month}
              </span>
              <Badge variant={monthlyPlan.isClosed ? "destructive" : "secondary"}>
                {monthlyPlan.isClosed ? "Closed (Locked)" : "Open"}
              </Badge>
            </div>
          ) : (
            <span>No plan exists for this period yet.</span>
          )}
        </div>
        {MONTH_CLOSE_CHECKLIST.map((item) => (
          <div key={item} className="rounded-xl border bg-muted/30 p-3">
            {item}
          </div>
        ))}
        <Button
          disabled={!monthlyPlan || monthlyPlan.isClosed || isClosing}
          onClick={handleRunMonthClose}
        >
          Run month close
        </Button>
      </CardContent>
    </Card>
  );
};

export default MonthCloseTabContent;
