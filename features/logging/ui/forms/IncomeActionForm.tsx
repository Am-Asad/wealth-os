"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const IncomeActionForm = () => {
  return (
    <>
      <div className="space-y-1.5">
        <Input placeholder="Total amount received" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input placeholder="Source (salary/freelance)" />
        <Input placeholder="Destination account" />
      </div>
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-sm">Allocation split</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          <Input placeholder="Needs" />
          <Input placeholder="Investments" />
          <Input placeholder="Savings" />
          <Input placeholder="Charity" />
          <Input placeholder="Flex" />
        </CardContent>
      </Card>
    </>
  );
};

export default IncomeActionForm;
