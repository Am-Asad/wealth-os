import AppTopBar from "@/features/shared/ui/AppTopBar";
import LoggingWorkspace from "@/features/logging/ui/LoggingWorkspace";

const LogPage = () => {
  return (
    <div>
      <AppTopBar title="Log" subtitle="Capture money movements quickly" />
      <main className="mx-auto w-full max-w-6xl p-4 lg:p-6">
        <LoggingWorkspace />
      </main>
    </div>
  );
};

export default LogPage;
