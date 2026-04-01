import AppTopBar from "@/features/shared/ui/AppTopBar";
import SetupWizardWorkspace from "@/features/setupWizard/ui/components/SetupWizardWorkspace";

export default function SetupPage() {
  return (
    <>
      <AppTopBar title="Setup wizard" subtitle="Complete onboarding in around 10 minutes" />
      <SetupWizardWorkspace />
    </>
  );
}
