"use client";
import { Authenticated } from "convex/react";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return <Authenticated>{children}</Authenticated>;
};

export default DashboardLayout;
