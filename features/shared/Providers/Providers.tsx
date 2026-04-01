"use client";
import ClerkClientProvider from "./ClerkClientProvider";
import ConvexClientProvider from "./ConvexClientProvider";
import ThemeProvider from "./ThemeProvider";
import { Toaster } from "sonner";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkClientProvider>
      <ConvexClientProvider>
        <ThemeProvider>
          {children}
          <Toaster position="top-right" />
        </ThemeProvider>
      </ConvexClientProvider>
    </ClerkClientProvider>
  );
};

export default Providers;
