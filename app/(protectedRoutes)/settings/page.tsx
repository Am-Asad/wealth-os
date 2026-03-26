import AppTopBar from "@/features/shared/ui/AppTopBar";
import SettingsWorkspace from "@/features/settings/ui/SettingsWorkspace";

const SettingsPage = () => {
  return (
    <>
      <AppTopBar title="Settings" subtitle="Manage entities and thresholds" />
      <main className="mx-auto w-full max-w-6xl p-4 lg:p-6">
        <SettingsWorkspace />
      </main>
    </>
  );
};

export default SettingsPage;
