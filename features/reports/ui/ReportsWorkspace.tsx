"use client";
import GenericTabs, { type GenericTabItem } from "@/features/shared/ui/GenericTabs";
import type { ReportPeriod } from "../domain/types";
import ReportsFilters from "./ReportsFilters";
import ReportPeriodTabContent from "./ReportPeriodTabContent";

const ReportsWorkspace = () => {
  const tabItems: readonly GenericTabItem<ReportPeriod>[] = [
    { value: "weekly", label: "Weekly", content: <ReportPeriodTabContent period="weekly" /> },
    { value: "monthly", label: "Monthly", content: <ReportPeriodTabContent period="monthly" /> },
    {
      value: "quarterly",
      label: "Quarterly",
      content: <ReportPeriodTabContent period="quarterly" />,
    },
    { value: "yearly", label: "Yearly", content: <ReportPeriodTabContent period="yearly" /> },
  ];

  return (
    <div className="space-y-4">
      <ReportsFilters />
      <GenericTabs
        defaultValue="weekly"
        listClassName="grid w-full grid-cols-4 lg:w-[460px]"
        items={tabItems}
      />
    </div>
  );
};

export default ReportsWorkspace;
