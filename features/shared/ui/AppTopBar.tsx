"use client";
import { UserButton } from "@clerk/nextjs";
import ThemeToggle from "./ThemeToggle";

type AppTopBarProps = {
  title: string;
  subtitle?: string;
};

const AppTopBar = ({ title, subtitle }: AppTopBarProps) => {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/60 lg:px-6">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold tracking-tight lg:text-xl">{title}</h1>
          {subtitle ? <p className="text-xs text-muted-foreground lg:text-sm">{subtitle}</p> : null}
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserButton />
        </div>
      </div>
    </header>
  );
};

export default AppTopBar;
