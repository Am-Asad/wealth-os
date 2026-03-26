"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ReportBucket } from "../domain/types";

const REPORT_BUCKETS: readonly { value: ReportBucket; label: string }[] = [
  { value: "needs", label: "Needs" },
  { value: "investments", label: "Investments" },
  { value: "savings", label: "Savings" },
  { value: "charity", label: "Charity" },
  { value: "flex", label: "Flex" },
];

const ReportsFilters = () => {
  return (
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
            {REPORT_BUCKETS.map((bucket) => (
              <SelectItem key={bucket.value} value={bucket.value}>
                {bucket.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input placeholder="Category" />
        <Input placeholder="Account" />
      </CardContent>
    </Card>
  );
};

export default ReportsFilters;
