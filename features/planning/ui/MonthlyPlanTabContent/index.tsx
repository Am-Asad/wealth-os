"use client";
import { Card, CardContent } from "@/components/ui/card";
import { useMonthlyPlanHydration } from "../../application/useMonthlyPlanHydration";
import ActionButtons from "./ActionButtons";
import BalanceSummary from "./BalanceSummary";
import BucketAllocationFields from "./BucketAllocationFields";
import ExpectedIncomeField from "./ExpectedIncomeField";
import FeedbackAlerts from "./FeedbackAlerts";
import NotesField from "./NotesField";
import PeriodFields from "./PeriodFields";
import StatusHeader from "./StatusHeader";

const MonthlyPlanTabContent = () => {
  useMonthlyPlanHydration();

  return (
    <Card>
      <StatusHeader />
      <CardContent className="grid gap-3 lg:grid-cols-2">
        <FeedbackAlerts />
        <PeriodFields />
        <ExpectedIncomeField />
        <BucketAllocationFields />
        <NotesField />
        <BalanceSummary />
        <ActionButtons />
      </CardContent>
    </Card>
  );
};

export default MonthlyPlanTabContent;
