"use client";
import { ConvexClientProvider } from "./ConvexClientProvider";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return <ConvexClientProvider>{children}</ConvexClientProvider>;
};

export default Providers;
