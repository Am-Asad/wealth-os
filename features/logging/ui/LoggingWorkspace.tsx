"use client";
import { useLoggingStore } from "../application/state/useLoggingStore";
import GenericTabs, { type GenericTabItem } from "@/features/shared/ui/GenericTabs";
import ActionSheet from "./ActionSheet";
import ActionsTabContent from "./ActionsTabContent";
import HistoryTabContent from "./HistoryTabContent";
import type { LoggingTabs } from "../domain/types";

const LoggingWorkspace = () => {
  const open = useLoggingStore((s) => s.open);
  const tabItems: readonly GenericTabItem<LoggingTabs>[] = [
    {
      value: "actions",
      label: "Actions",
      content: <ActionsTabContent onOpenAction={open} />,
    },
    {
      value: "history",
      label: "History",
      content: <HistoryTabContent />,
    },
  ];

  return (
    <div>
      <GenericTabs
        defaultValue="actions"
        className="space-y-4"
        listClassName="grid w-full grid-cols-2 lg:w-80"
        items={tabItems}
      />
      <ActionSheet />
    </div>
  );
};

export default LoggingWorkspace;
