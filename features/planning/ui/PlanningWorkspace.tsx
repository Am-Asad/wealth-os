"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default function PlanningWorkspace() {
  return (
    <Tabs defaultValue="monthlyPlan" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3 lg:w-[520px]">
        <TabsTrigger value="monthlyPlan">Monthly plan</TabsTrigger>
        <TabsTrigger value="weekReview">Weekly review</TabsTrigger>
        <TabsTrigger value="monthClose">Month close</TabsTrigger>
      </TabsList>

      <TabsContent value="monthlyPlan">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Create monthly plan</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 lg:grid-cols-2">
            <div className="space-y-1.5 lg:col-span-2">
              <Label>Expected income (minor units)</Label>
              <Input placeholder="e.g. 10000000" />
            </div>
            {["Needs", "Investments", "Savings", "Charity", "Flex"].map((bucket) => (
              <div key={bucket} className="space-y-1.5">
                <Label>{bucket} allocation</Label>
                <Input placeholder={`Amount for ${bucket}`} />
              </div>
            ))}
            <div className="lg:col-span-2 flex gap-2">
              <Button>Save plan</Button>
              <Button variant="outline">Copy last month</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="weekReview">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weekly review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              ["Needs", 58],
              ["Investments", 52],
              ["Savings", 41],
              ["Charity", 33],
              ["Flex", 68],
            ].map(([label, value]) => (
              <div key={label as string} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span>{label as string}</span>
                  <span className="text-muted-foreground">{value as number}%</span>
                </div>
                <Progress value={value as number} />
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="monthClose">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Month close checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              "All expenses are logged",
              "All income entries are allocated",
              "Portfolio snapshots updated",
              "Recurring confirmations resolved",
            ].map((item) => (
              <div key={item} className="rounded-xl border bg-muted/30 p-3">
                {item}
              </div>
            ))}
            <Button>Run month close</Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
