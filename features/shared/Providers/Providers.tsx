"use client";
import ClerkClientProvider from "./ClerkClientProvider";
import ConvexClientProvider from "./ConvexClientProvider";
import ThemeProvider from "./ThemeProvider";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkClientProvider>
      <ConvexClientProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </ConvexClientProvider>
    </ClerkClientProvider>
  );
};

export default Providers;
