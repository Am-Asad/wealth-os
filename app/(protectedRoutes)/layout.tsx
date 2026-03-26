"use client";
import { Authenticated } from "convex/react";
import MobileBottomNav from "@/features/shared/ui/MobileBottomNav";
import AppSidebar from "@/features/shared/ui/AppSidebar";

const ProtectedRoutesLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Authenticated>
      <div className="min-h-svh bg-background">
        <div className="pointer-events-none fixed inset-0 -z-10 opacity-70 dark:opacity-40">
          <div className="absolute -top-24 left-1/2 h-72 w-176 -translate-x-1/2 rounded-full bg-linear-to-b from-primary/20 to-transparent blur-3xl" />
        </div>
        <div className="mx-auto flex min-h-svh max-w-screen-2xl">
          <AppSidebar />
          <div className="flex min-h-svh flex-1 flex-col pb-20 lg:pb-0">{children}</div>
        </div>
        <MobileBottomNav />
      </div>
    </Authenticated>
  );
};
export default ProtectedRoutesLayout;
