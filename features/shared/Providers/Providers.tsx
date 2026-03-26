"use client";
import ClerkClientProvider from "./ClerkClientProvider";
import ConvexClientProvider from "./ConvexClientProvider";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkClientProvider>
      <ConvexClientProvider>{children}</ConvexClientProvider>
    </ClerkClientProvider>
  );
};

export default Providers;
