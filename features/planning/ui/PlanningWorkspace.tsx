"use client";
import type { GenericTabItem } from "@/features/shared/ui/GenericTabs";
import GenericTabs from "@/features/shared/ui/GenericTabs";
import type { PlanningTabValue } from "../domain/types";
import MonthlyPlanTabContent from "./MonthlyPlanTabContent";
import WeekReviewTabContent from "./WeeklyReviewTabContent";
import MonthCloseTabContent from "./MonthlyCloseTabContent";

const PlanningWorkspace = () => {
  const tabItems: readonly GenericTabItem<PlanningTabValue>[] = [
    {
      value: "monthlyPlan",
      label: "Monthly plan",
      content: <MonthlyPlanTabContent />,
    },
    {
      value: "weekReview",
      label: "Weekly review",
      content: <WeekReviewTabContent />,
    },
    {
      value: "monthClose",
      label: "Month close",
      content: <MonthCloseTabContent />,
    },
  ];

  return (
    <GenericTabs
      defaultValue="monthlyPlan"
      className="space-y-4"
      listClassName="grid w-full grid-cols-3 lg:w-[520px]"
      items={tabItems}
    />
  );
};

export default PlanningWorkspace;
