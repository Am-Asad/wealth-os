import { Authenticated } from "convex/react";

const ProtectedRoutesLayout = ({ children }: { children: React.ReactNode }) => {
  return <Authenticated>{children}</Authenticated>;
};

export default ProtectedRoutesLayout;
