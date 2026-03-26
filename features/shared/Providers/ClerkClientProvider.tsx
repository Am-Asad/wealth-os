import { ClerkProvider } from "@clerk/nextjs";

const ClerkClientProvider = ({ children }: { children: React.ReactNode }) => {
  return <ClerkProvider>{children}</ClerkProvider>;
};

export default ClerkClientProvider;
