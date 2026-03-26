"use client";

import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import ThemeToggle from "@/features/shared/ui/ThemeToggle/ThemeToggle";
import { SETUP_WIZARD_STEPS } from "../../domain/steps";
import { useSetupWizardStore } from "../../application/state/useSetupWizardStore";
import { cn } from "@/lib/utils";

function Stepper() {
  const stepId = useSetupWizardStore((s) => s.stepId);
  const setStep = useSetupWizardStore((s) => s.setStep);
  const activeIndex = SETUP_WIZARD_STEPS.findIndex((s) => s.id === stepId);

  return (
    <nav aria-label="Setup steps" className="flex items-center gap-2 overflow-x-auto">
      {SETUP_WIZARD_STEPS.map((step, idx) => {
        const isActive = idx === activeIndex;
        const isDone = idx < activeIndex;
        return (
          <button
            key={step.id}
            type="button"
            onClick={() => setStep(step.id)}
            className={cn(
              "group flex items-center gap-2 rounded-full border px-3 py-1.5 text-left text-sm transition-colors",
              "bg-background/60 backdrop-blur supports-backdrop-filter:bg-background/40",
              isActive && "border-foreground/20 bg-foreground/5",
              !isActive && "border-border hover:bg-muted",
            )}
          >
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded-full border text-xs",
                isDone && "border-transparent bg-primary text-primary-foreground",
                isActive && "border-foreground/20 bg-background",
                !isActive && !isDone && "border-border bg-background",
              )}
            >
              {idx + 1}
            </span>
            <span className="whitespace-nowrap">
              <span className="block leading-tight font-medium">{step.title}</span>
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function ActiveStepHeader() {
  const stepId = useSetupWizardStore((s) => s.stepId);
  const step = SETUP_WIZARD_STEPS.find((s) => s.id === stepId) ?? SETUP_WIZARD_STEPS[0];
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-primary" />
        <h2 className="text-base font-semibold tracking-tight">{step.title}</h2>
      </div>
      <p className="text-sm text-muted-foreground">{step.description}</p>
    </div>
  );
}

function ActiveStepBody() {
  const stepId = useSetupWizardStore((s) => s.stepId);

  // UI Step 1 (this chunk): placeholders only. We will replace each panel
  // with real forms + Convex wiring in the next review steps.
  if (stepId === "accounts") {
    return (
      <div className="space-y-3">
        <div className="rounded-xl border bg-muted/30 p-4">
          <p className="text-sm text-muted-foreground">
            Next step: we’ll build the Accounts screen here (recommended presets + add/edit/archive).
          </p>
        </div>
      </div>
    );
  }
  if (stepId === "categories") {
    return (
      <div className="rounded-xl border bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">
          Categories UI placeholder (create/update/archive by bucket).
        </p>
      </div>
    );
  }
  if (stepId === "subcategories") {
    return (
      <div className="rounded-xl border bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">
          Subcategories UI placeholder (create/update/archive under category).
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-xl border bg-muted/30 p-4">
      <p className="text-sm text-muted-foreground">
        Review UI placeholder (summary + finish).
      </p>
    </div>
  );
}

function FooterNav() {
  const stepId = useSetupWizardStore((s) => s.stepId);
  const next = useSetupWizardStore((s) => s.next);
  const back = useSetupWizardStore((s) => s.back);

  const activeIndex = SETUP_WIZARD_STEPS.findIndex((s) => s.id === stepId);
  const isFirst = activeIndex <= 0;
  const isLast = activeIndex >= SETUP_WIZARD_STEPS.length - 1;

  return (
    <div className="flex items-center justify-between gap-3">
      <Button variant="ghost" onClick={back} disabled={isFirst}>
        Back
      </Button>
      <Button onClick={next} disabled={isLast}>
        Continue
      </Button>
    </div>
  );
}

export default function SetupWizardShell() {
  const stepId = useSetupWizardStore((s) => s.stepId);
  const activeIndex = SETUP_WIZARD_STEPS.findIndex((s) => s.id === stepId);
  const progress = Math.round(((activeIndex + 1) / SETUP_WIZARD_STEPS.length) * 100);

  return (
    <div className="min-h-svh bg-background">
      <div className="pointer-events-none fixed inset-0 -z-10 opacity-70 dark:opacity-40">
        <div className="absolute -top-24 left-1/2 h-72 w-176 -translate-x-1/2 rounded-full bg-linear-to-b from-primary/20 to-transparent blur-3xl" />
        <div className="absolute -bottom-28 -right-48 h-72 w-176 rounded-full bg-linear-to-t from-foreground/10 to-transparent blur-3xl" />
      </div>

      <header className="sticky top-0 z-10 border-b bg-background/75 backdrop-blur supports-backdrop-filter:bg-background/55">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-medium tracking-tight">Wealth OS</div>
            <div className="text-xs text-muted-foreground">First-time setup (≈ 10 minutes)</div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
        <div className="mx-auto w-full max-w-5xl px-4 pb-3">
          <Progress value={progress} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_320px] lg:items-start">
          <Card className="overflow-hidden">
            <CardHeader className="space-y-3">
              <Stepper />
              <Separator />
              <ActiveStepHeader />
            </CardHeader>
            <CardContent className="space-y-6">
              <ActiveStepBody />
              <FooterNav />
            </CardContent>
          </Card>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">What we’ll set up</CardTitle>
                <CardDescription>Minimal, fast, and editable later.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Accounts: UBL, Alfalah, Easypaisa, Nayapay, Sadapay</li>
                  <li>• Categories aligned to buckets</li>
                  <li>• Subcategories for optional drill-down</li>
                </ul>
                <div className="rounded-xl border bg-muted/30 p-3 text-xs text-muted-foreground">
                  Your balances are always computed from transactions—never manually “kept in sync”.
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}

