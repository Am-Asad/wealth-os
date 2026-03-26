"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { PlanningBucket } from "../domain/types";

const MONTHLY_BUCKETS: readonly PlanningBucket[] = [
  "Needs",
  "Investments",
  "Savings",
  "Charity",
  "Flex",
];

const MonthlyPlanTabContent = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Create monthly plan</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 lg:grid-cols-2">
        <div className="space-y-1.5 lg:col-span-2">
          <Label>Expected income (minor units)</Label>
          <Input placeholder="e.g. 10000000" />
        </div>
        {MONTHLY_BUCKETS.map((bucket) => (
          <div key={bucket} className="space-y-1.5">
            <Label>{bucket} allocation</Label>
            <Input placeholder={`Amount for ${bucket}`} />
          </div>
        ))}
        <div className="flex gap-2 lg:col-span-2">
          <Button>Save plan</Button>
          <Button variant="outline">Copy last month</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyPlanTabContent;
