import AppTopBar from "@/features/shared/ui/AppShell/AppTopBar";
import SettingsWorkspace from "@/features/settings/ui/SettingsWorkspace";

export default function SettingsPage() {
  return (
    <>
      <AppTopBar title="Settings" subtitle="Manage entities and thresholds" />
      <main className="mx-auto w-full max-w-6xl p-4 lg:p-6">
        <SettingsWorkspace />
      </main>
    </>
  );
}
