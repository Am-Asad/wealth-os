"use client";
import { LoggingActionId } from "../../domain/types";
import ExpenseActionForm from "./ExpenseActionForm";
import IncomeActionForm from "./IncomeActionForm";
import TransferActionForm from "./TransferActionForm";
import InvestmentActionForm from "./InvestmentActionForm";

export const renderActionForm = (actionId: LoggingActionId) => {
  switch (actionId) {
    case "expense":
      return <ExpenseActionForm />;
    case "income":
      return <IncomeActionForm />;
    case "transfer":
      return <TransferActionForm />;
    case "investment":
      return <InvestmentActionForm />;
    default:
      return null;
  }
};
