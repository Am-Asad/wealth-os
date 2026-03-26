"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReportPeriod } from "../domain/types";

type ReportPeriodTabContentProps = {
  period: ReportPeriod;
};

const ReportPeriodTabContent = ({ period }: ReportPeriodTabContentProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base capitalize">{period} report</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        KPI cards, trends, and drill-down tables will render here.
      </CardContent>
    </Card>
  );
};

export default ReportPeriodTabContent;
