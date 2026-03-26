import AppTopBar from "@/features/shared/ui/AppShell/AppTopBar";
import ReportsWorkspace from "@/features/reports/ui/ReportsWorkspace";

export default function ReportsPage() {
  return (
    <>
      <AppTopBar title="Reports" subtitle="Insights across week, month, quarter, year" />
      <main className="mx-auto w-full max-w-6xl p-4 lg:p-6">
        <ReportsWorkspace />
      </main>
    </>
  );
}
