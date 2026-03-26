import AppTopBar from "@/features/shared/ui/AppTopBar";
import ReportsWorkspace from "@/features/reports/ui/ReportsWorkspace";

const ReportsPage = () => {
  return (
    <div>
      <AppTopBar title="Reports" subtitle="Insights across week, month, quarter, year" />
      <main className="mx-auto w-full max-w-6xl p-4 lg:p-6">
        <ReportsWorkspace />
      </main>
    </div>
  );
};

export default ReportsPage;
