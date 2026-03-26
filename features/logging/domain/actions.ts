import { LoggingAction } from "./types";

export const LOGGING_ACTIONS: readonly LoggingAction[] = [
  { id: "expense", title: "Expense", description: "Money leaves to pay for something." },
  {
    id: "income",
    title: "Income + Allocation",
    description: "Money arrives and gets split by bucket.",
  },
  { id: "transfer", title: "Transfer", description: "Move money between your own accounts." },
  {
    id: "investment",
    title: "Investment Contribution",
    description: "Add money into an investment vehicle.",
  },
];
