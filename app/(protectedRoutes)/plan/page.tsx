import AppTopBar from "@/features/shared/ui/AppShell/AppTopBar";
import PlanningWorkspace from "@/features/planning/ui/PlanningWorkspace";

export default function PlanPage() {
  return (
    <>
      <AppTopBar title="Plan" subtitle="Monthly planning and review cadence" />
      <main className="mx-auto w-full max-w-6xl p-4 lg:p-6">
        <PlanningWorkspace />
      </main>
    </>
  );
}
