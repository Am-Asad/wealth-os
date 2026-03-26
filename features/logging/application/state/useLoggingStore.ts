import { create } from "zustand";
import { LoggingActionId } from "../../domain/types";

type LoggingState = {
  openAction: LoggingActionId | null;
  open: (action: LoggingActionId) => void;
  close: () => void;
};

export const useLoggingStore = create<LoggingState>((set) => ({
  openAction: null,
  open: (action) => set({ openAction: action }),
  close: () => set({ openAction: null }),
}));
