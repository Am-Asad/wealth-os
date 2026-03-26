"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { WeeklyReviewProgressEntry } from "../domain/types";

const WEEKLY_REVIEW_PROGRESS: readonly WeeklyReviewProgressEntry[] = [
  { label: "Needs", value: 58 },
  { label: "Investments", value: 52 },
  { label: "Savings", value: 41 },
  { label: "Charity", value: 33 },
  { label: "Flex", value: 68 },
];

const WeekReviewTabContent = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Weekly review</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {WEEKLY_REVIEW_PROGRESS.map((entry) => (
          <div key={entry.label} className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span>{entry.label}</span>
              <span className="text-muted-foreground">{entry.value}%</span>
            </div>
            <Progress value={entry.value} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default WeekReviewTabContent;
