"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ReportsWorkspace() {
  return (
    <Tabs defaultValue="monthly" className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-4">
          <Input type="date" />
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Bucket" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="needs">Needs</SelectItem>
              <SelectItem value="investments">Investments</SelectItem>
              <SelectItem value="savings">Savings</SelectItem>
              <SelectItem value="charity">Charity</SelectItem>
              <SelectItem value="flex">Flex</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Category" />
          <Input placeholder="Account" />
        </CardContent>
      </Card>

      <TabsList className="grid w-full grid-cols-4 lg:w-[460px]">
        <TabsTrigger value="weekly">Weekly</TabsTrigger>
        <TabsTrigger value="monthly">Monthly</TabsTrigger>
        <TabsTrigger value="quarterly">Quarterly</TabsTrigger>
        <TabsTrigger value="yearly">Yearly</TabsTrigger>
      </TabsList>
      {["weekly", "monthly", "quarterly", "yearly"].map((period) => (
        <TabsContent key={period} value={period}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base capitalize">{period} report</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              KPI cards, trends, and drill-down tables will render here.
            </CardContent>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  );
}
