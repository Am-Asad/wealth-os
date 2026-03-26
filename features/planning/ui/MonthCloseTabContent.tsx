"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { MonthCloseChecklistItem } from "../domain/types";

const MONTH_CLOSE_CHECKLIST: readonly MonthCloseChecklistItem[] = [
  "All expenses are logged",
  "All income entries are allocated",
  "Portfolio snapshots updated",
  "Recurring confirmations resolved",
];

const MonthCloseTabContent = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Month close checklist</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {MONTH_CLOSE_CHECKLIST.map((item) => (
          <div key={item} className="rounded-xl border bg-muted/30 p-3">
            {item}
          </div>
        ))}
        <Button>Run month close</Button>
      </CardContent>
    </Card>
  );
};

export default MonthCloseTabContent;
