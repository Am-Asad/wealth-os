export type LoggingActionId = "expense" | "income" | "transfer" | "investment";

export type LoggingAction = {
  id: LoggingActionId;
  title: string;
  description: string;
};

export type LoggingHistoryEntry = {
  id: string;
  summary: string;
};
