# Monthly Plan Tab Content Module Reference

This document maps the complete Monthly Plan module across frontend and backend for:

- `features/planning/application`
- `features/planning/domain`
- `features/planning/infrastructure`
- `features/planning/ui/MonthlyPlanTabContent`
- `features/planning/ui/PlanningWorkspace.tsx`
- `convex/monthlyPlan.ts`
- Relevant table/index/enum details from `convex/schema.ts`

## 1) Entry Point and UI Composition

- `features/planning/ui/PlanningWorkspace.tsx`
  - Registers the `monthlyPlan` tab.
  - Renders `MonthlyPlanTabContent` as tab content.

- `features/planning/ui/MonthlyPlanTabContent/index.tsx`
  - Main composition root for the tab.
  - Calls `useMonthlyPlanHydration()` to sync backend data into local stores.
  - Renders:
    - `StatusHeader`
    - `FeedbackAlerts`
    - `PeriodFields`
    - `ExpectedIncomeField`
    - `BucketAllocationFields`
    - `NotesField`
    - `BalanceSummary`
    - `ActionButtons`

## 2) UI Files in This Module

- `features/planning/ui/MonthlyPlanTabContent/StatusHeader.tsx`
  - Reads `isClosed` from UI store and shows lock state badge.

- `features/planning/ui/MonthlyPlanTabContent/FeedbackAlerts.tsx`
  - Reads `error` and `message` from UI store and shows alerts.

- `features/planning/ui/MonthlyPlanTabContent/PeriodFields.tsx`
  - Reads/writes `year` and `month` using period store.

- `features/planning/ui/MonthlyPlanTabContent/ExpectedIncomeField.tsx`
  - Reads/writes `expectedIncomeMinor` in form store.
  - Disabled when month is closed.

- `features/planning/ui/MonthlyPlanTabContent/BucketAllocationFields.tsx`
  - Iterates `BUCKET_FIELDS` and reads/writes allocation values in form store.
  - Disabled when month is closed.

- `features/planning/ui/MonthlyPlanTabContent/NotesField.tsx`
  - Reads/writes `notes` in form store.
  - Disabled when month is closed.

- `features/planning/ui/MonthlyPlanTabContent/BalanceSummary.tsx`
  - Uses derived state to show totals and balanced status.

- `features/planning/ui/MonthlyPlanTabContent/ActionButtons.tsx`
  - Calls `savePlan` and `copyFromLastMonth` from action hook.
  - Disables actions based on closed/saving/copying/balance state.

- `features/planning/ui/MonthlyPlanTabContent/model.ts`
  - Defines `BUCKET_FIELDS` mapping labels to store keys:
    - Needs -> `needsAllocationMinor`
    - Investments -> `investmentsAllocationMinor`
    - Savings -> `savingsAllocationMinor`
    - Charity -> `charityAllocationMinor`
    - Flex -> `flexAllocationMinor`

## 3) Application Layer Files

- `features/planning/application/useMonthlyPlanHydration.ts`
  - Inputs: selected `year`, `month`.
  - Fetches monthly plan using `useMonthlyPlanQuery`.
  - Hydrates stores:
    - No plan -> `hasMonthlyPlan=false`, `isClosed=false`, reset form values.
    - Existing plan -> sets `hasMonthlyPlan`, `isClosed`, and form values.
  - Uses `lastHydratedPlanIdRef` to avoid repeated hydration loops.

- `features/planning/application/useMonthlyPlanDerivedState.ts`
  - Parses form minor-unit strings to `bigint`.
  - Computes:
    - `allocationTotalMinor`
    - `expectedIncomeMinor`
    - `isBalanced` (exact equality check)
  - Exposes `parseMinorOrThrow` for mutation payload construction.

- `features/planning/application/useMonthlyPlanActions.ts`
  - `savePlan`:
    - Builds payload from form + period stores.
    - Enforces local balance check before mutation.
    - Chooses `createMonthlyPlan` vs `updateMonthlyPlan` by `hasMonthlyPlan`.
    - Sets message/error/loading state and Sonner toasts.
  - `copyFromLastMonth`:
    - Calls backend `copyLastMonthPlan`.
    - Handles non-error backend outcome:
      - `{ ok: false, reason: "NO_PREVIOUS_MONTH_PLAN" }`
    - Sets message/error/loading state and toasts.

- `features/planning/application/state/useMonthlyPlanFormStore.ts`
  - Form state:
    - `expectedIncomeMinor`
    - `needsAllocationMinor`
    - `investmentsAllocationMinor`
    - `savingsAllocationMinor`
    - `charityAllocationMinor`
    - `flexAllocationMinor`
    - `notes`
  - Actions:
    - `setExpectedIncomeMinor`
    - `setNotes`
    - `setBucketAllocation`
    - `hydrateFromPlan`
    - `resetPlanValues`

- `features/planning/application/state/useMonthlyPlanPeriodStore.ts`
  - Period state:
    - `year`, `month`
  - Actions:
    - `setYear`, `setMonth`

- `features/planning/application/state/useMonthlyPlanUiStore.ts`
  - UI state:
    - `message`, `error`
    - `isSaving`, `isCopying`
    - `isClosed`, `hasMonthlyPlan`
  - Actions:
    - `setMessage`, `setError`
    - `setIsSaving`, `setIsCopying`
    - `setPlanStatus`

## 4) Domain Layer Files

- `features/planning/domain/types.ts`
  - Shared type definitions:
    - `PlanningTabValue`
    - `PlanningBucket`
    - `WeeklyReviewProgressEntry`
    - `MonthCloseChecklistItem`
    - `MonthlyPlanFormState`
  - Monthly plan tab specifically depends on:
    - `PlanningTabValue` (`monthlyPlan` tab wiring)
    - `PlanningBucket` (via `model.ts` bucket labels)

## 5) Infrastructure Layer Files

- `features/planning/infrastructure/useMonthlyPlanApi.ts`
  - Convex hook wrappers:
    - `useMonthlyPlanQuery` -> `api.monthlyPlan.getMonthlyPlan`
    - `useCreateMonthlyPlanMutation` -> `api.monthlyPlan.createMonthlyPlan`
    - `useUpdateMonthlyPlanMutation` -> `api.monthlyPlan.updateMonthlyPlan`
    - `useCopyLastMonthPlanMutation` -> `api.monthlyPlan.copyLastMonthPlan`
    - `useCloseMonthlyPlanMutation` -> `api.monthlyPlan.closeMonthlyPlan`

## 6) Backend Convex Module

- `convex/monthlyPlan.ts`
  - Helper validation and rules:
    - `assertMonth`, `assertYear`
    - `assertPositiveAmount`
    - `assertBalancedPlan`
    - `getPreviousMonth`
  - Public functions:
    - `getMonthlyPlan` (query)
    - `createMonthlyPlan` (mutation)
    - `updateMonthlyPlan` (mutation)
    - `copyLastMonthPlan` (mutation)
      - Returns `{ ok: false, reason: "NO_PREVIOUS_MONTH_PLAN" }` when source month missing.
      - Creates target month if missing; otherwise patches target month.
      - Rejects copy into closed target.
    - `closeMonthlyPlan` (mutation)

## 7) Relevant Schema: Tables, Indexes, Enums

From `convex/schema.ts`, the Monthly Plan tab directly uses:

- Table: `monthly_plan`
  - Fields:
    - `year: number`
    - `month: number`
    - `expectedIncomeMinor: int64`
    - `needsAllocationMinor: int64`
    - `investmentsAllocationMinor: int64`
    - `savingsAllocationMinor: int64`
    - `charityAllocationMinor: int64`
    - `flexAllocationMinor: int64`
    - `notes?: string`
    - `isClosed: boolean`
    - `createdAt: string`
    - `closedAt?: string`
    - `updatedAt: string`
  - Indexes:
    - `by_year_and_month` on `["year", "month"]`

Relevant enum/union notes for this module:

- No dedicated schema enum/union is used by `monthly_plan` fields.
- Month/bucket semantics are enforced in code:
  - Frontend/domain: `PlanningBucket` in `features/planning/domain/types.ts`
  - Backend guards: validation helpers in `convex/monthlyPlan.ts`

## 8) End-to-End Flow (Frontend -> Backend -> Frontend)

1. User opens `monthlyPlan` tab in `PlanningWorkspace`.
2. `MonthlyPlanTabContent` mounts and runs `useMonthlyPlanHydration`.
3. Hydration queries `getMonthlyPlan(year, month)`.
4. Stores are hydrated/reset depending on query result.
5. User edits period/form fields bound to Zustand stores.
6. `useMonthlyPlanDerivedState` continuously computes balance validity.
7. User clicks:
   - Save -> `createMonthlyPlan` or `updateMonthlyPlan`
   - Copy last month -> `copyLastMonthPlan`
8. Success/error status is reflected through:
   - UI store (`message`, `error`, loading flags)
   - Alerts in `FeedbackAlerts`
   - Toast notifications in `useMonthlyPlanActions`

## 9) Full Source Files (Senior Review Appendix)

### `features/planning/ui/PlanningWorkspace.tsx`

```tsx
"use client";
import type { GenericTabItem } from "@/features/shared/ui/GenericTabs";
import GenericTabs from "@/features/shared/ui/GenericTabs";
import type { PlanningTabValue } from "../domain/types";
import MonthlyPlanTabContent from "./MonthlyPlanTabContent";
import WeekReviewTabContent from "./WeeklyReviewTabContent";
import MonthCloseTabContent from "./MonthlyCloseTabContent";

const PlanningWorkspace = () => {
  const tabItems: readonly GenericTabItem<PlanningTabValue>[] = [
    {
      value: "monthlyPlan",
      label: "Monthly plan",
      content: <MonthlyPlanTabContent />,
    },
    {
      value: "weekReview",
      label: "Weekly review",
      content: <WeekReviewTabContent />,
    },
    {
      value: "monthClose",
      label: "Month close",
      content: <MonthCloseTabContent />,
    },
  ];

  return (
    <GenericTabs
      defaultValue="monthlyPlan"
      className="space-y-4"
      listClassName="grid w-full grid-cols-3 lg:w-[520px]"
      items={tabItems}
    />
  );
};

export default PlanningWorkspace;
```

### `features/planning/domain/types.ts`

```ts
export type PlanningTabValue = "monthlyPlan" | "weekReview" | "monthClose";

export type PlanningBucket =
  | "Needs"
  | "Investments"
  | "Savings"
  | "Charity"
  | "Flex";

export type WeeklyReviewProgressEntry = {
  label: PlanningBucket;
  value: number;
};

export type MonthCloseChecklistItem = string;

export type MonthlyPlanFormState = {
  year: number;
  month: number;
  expectedIncomeMinor: string;
  needsAllocationMinor: string;
  investmentsAllocationMinor: string;
  savingsAllocationMinor: string;
  charityAllocationMinor: string;
  flexAllocationMinor: string;
  notes: string;
};
```

### `features/planning/infrastructure/useMonthlyPlanApi.ts`

```ts
"use client";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

/**
 * RESPONSIBILITY: Expose Planning feature API hooks without leaking Convex module details to UI tabs.
 * OWNER: Planning feature team.
 * BOUNDARY REASON: UI rendering changes independently from API function naming and transport concerns.
 * CHANGES WHEN: Monthly plan backend endpoints or payload contracts evolve.
 */
const monthlyPlanApi = api.monthlyPlan;

export const useMonthlyPlanQuery = (year: number, month: number) =>
  useQuery(monthlyPlanApi.getMonthlyPlan, { year, month });

export const useCreateMonthlyPlanMutation = () =>
  useMutation(monthlyPlanApi.createMonthlyPlan);

export const useUpdateMonthlyPlanMutation = () =>
  useMutation(monthlyPlanApi.updateMonthlyPlan);

export const useCopyLastMonthPlanMutation = () =>
  useMutation(monthlyPlanApi.copyLastMonthPlan);

export const useCloseMonthlyPlanMutation = () =>
  useMutation(monthlyPlanApi.closeMonthlyPlan);
```

### `features/planning/application/useMonthlyPlanActions.ts`

```ts
"use client";
import { useCallback } from "react";
import {
  useCopyLastMonthPlanMutation,
  useCreateMonthlyPlanMutation,
  useUpdateMonthlyPlanMutation,
} from "../infrastructure/useMonthlyPlanApi";
import { parseMinorOrThrow, useMonthlyPlanDerivedState } from "./useMonthlyPlanDerivedState";
import { useMonthlyPlanFormStore } from "./state/useMonthlyPlanFormStore";
import { useMonthlyPlanPeriodStore } from "./state/useMonthlyPlanPeriodStore";
import { useMonthlyPlanUiStore } from "./state/useMonthlyPlanUiStore";
import { toast } from "sonner";

/**
 * RESPONSIBILITY: Execute monthly-plan commands (save/copy) and manage async UI flags/messages.
 * OWNER: Planning feature team.
 * BOUNDARY REASON: Command workflows can change independently from state storage and UI composition.
 * CHANGES WHEN: Save/copy command contracts, error handling, or optimistic behavior changes.
 */
export const useMonthlyPlanActions = () => {
  const year = useMonthlyPlanPeriodStore((s) => s.year);
  const month = useMonthlyPlanPeriodStore((s) => s.month);
  const form = useMonthlyPlanFormStore((s) => s);
  const setMessage = useMonthlyPlanUiStore((s) => s.setMessage);
  const setError = useMonthlyPlanUiStore((s) => s.setError);
  const setIsSaving = useMonthlyPlanUiStore((s) => s.setIsSaving);
  const setIsCopying = useMonthlyPlanUiStore((s) => s.setIsCopying);
  const hasMonthlyPlan = useMonthlyPlanUiStore((s) => s.hasMonthlyPlan);
  const { isBalanced } = useMonthlyPlanDerivedState();

  const createMonthlyPlan = useCreateMonthlyPlanMutation();
  const updateMonthlyPlan = useUpdateMonthlyPlanMutation();
  const copyLastMonthPlan = useCopyLastMonthPlanMutation();

  const savePlan = useCallback(async () => {
    setMessage(null);
    setError(null);

    try {
      const payload = {
        year,
        month,
        expectedIncomeMinor: parseMinorOrThrow(form.expectedIncomeMinor),
        needsAllocationMinor: parseMinorOrThrow(form.needsAllocationMinor),
        investmentsAllocationMinor: parseMinorOrThrow(form.investmentsAllocationMinor),
        savingsAllocationMinor: parseMinorOrThrow(form.savingsAllocationMinor),
        charityAllocationMinor: parseMinorOrThrow(form.charityAllocationMinor),
        flexAllocationMinor: parseMinorOrThrow(form.flexAllocationMinor),
        notes: form.notes.trim() ? form.notes.trim() : undefined,
      };

      if (!isBalanced) {
        throw new Error(
          "Invalid plan: 5 bucket allocations must sum exactly to expected income before saving.",
        );
      }

      setIsSaving(true);
      if (hasMonthlyPlan) {
        await updateMonthlyPlan(payload);
        setMessage("Monthly plan updated.");
        toast.success("Monthly plan updated.");
      } else {
        await createMonthlyPlan(payload);
        setMessage("Monthly plan created.");
        toast.success("Monthly plan created.");
      }
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : "Unable to save monthly plan.");
      setError(saveError instanceof Error ? saveError.message : "Unable to save monthly plan.");
    } finally {
      setIsSaving(false);
    }
  }, [
    year,
    month,
    form.expectedIncomeMinor,
    form.needsAllocationMinor,
    form.investmentsAllocationMinor,
    form.savingsAllocationMinor,
    form.charityAllocationMinor,
    form.flexAllocationMinor,
    form.notes,
    hasMonthlyPlan,
    setMessage,
    setError,
    setIsSaving,
    isBalanced,
    createMonthlyPlan,
    updateMonthlyPlan,
  ]);

  const copyFromLastMonth = useCallback(async () => {
    setMessage(null);
    setError(null);

    try {
      setIsCopying(true);
      const result = await copyLastMonthPlan({ year, month });
      if (!result.ok && result.reason === "NO_PREVIOUS_MONTH_PLAN") {
        setError("No monthly plan exists for the previous month to copy from.");
        toast.error("No monthly plan exists for the previous month to copy from.");
        return;
      }
      setMessage("Copied allocations from previous month.");
      toast.success("Copied allocations from previous month.");
    } catch (copyError) {
      setError(copyError instanceof Error ? copyError.message : "Unable to copy last month plan.");
      toast.error(
        copyError instanceof Error ? copyError.message : "Unable to copy last month plan.",
      );
    } finally {
      setIsCopying(false);
    }
  }, [year, month, setMessage, setError, setIsCopying, copyLastMonthPlan]);

  return { savePlan, copyFromLastMonth };
};
```

### `features/planning/application/useMonthlyPlanDerivedState.ts`

```ts
"use client";
import { useMemo } from "react";
import { useMonthlyPlanFormStore } from "./state/useMonthlyPlanFormStore";

const safeMinor = (value: string) => {
  const parsed = value.trim() === "" ? BigInt(0) : BigInt(value.trim());
  if (parsed < BigInt(0)) {
    throw new Error("Amounts cannot be negative.");
  }
  return parsed;
};

/**
 * RESPONSIBILITY: Compute derived monthly-plan values from store fields.
 * OWNER: Planning feature team.
 * BOUNDARY REASON: Derived calculations evolve independently from rendering and mutations.
 * CHANGES WHEN: Balance formula, parse policy, or validation semantics change.
 */
export const useMonthlyPlanDerivedState = () => {
  const form = useMonthlyPlanFormStore((s) => s);

  const allocationTotalMinor = useMemo(() => {
    try {
      return (
        safeMinor(form.needsAllocationMinor) +
        safeMinor(form.investmentsAllocationMinor) +
        safeMinor(form.savingsAllocationMinor) +
        safeMinor(form.charityAllocationMinor) +
        safeMinor(form.flexAllocationMinor)
      );
    } catch {
      return BigInt(0);
    }
  }, [
    form.needsAllocationMinor,
    form.investmentsAllocationMinor,
    form.savingsAllocationMinor,
    form.charityAllocationMinor,
    form.flexAllocationMinor,
  ]);

  const expectedIncomeMinor = useMemo(() => {
    try {
      return safeMinor(form.expectedIncomeMinor);
    } catch {
      return BigInt(0);
    }
  }, [form.expectedIncomeMinor]);

  return {
    allocationTotalMinor,
    expectedIncomeMinor,
    isBalanced: allocationTotalMinor === expectedIncomeMinor,
  };
};

export const parseMinorOrThrow = safeMinor;
```

### `features/planning/application/useMonthlyPlanHydration.ts`

```ts
"use client";
import { useEffect, useRef } from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { useMonthlyPlanQuery } from "../infrastructure/useMonthlyPlanApi";
import { useMonthlyPlanUiStore } from "./state/useMonthlyPlanUiStore";
import { useMonthlyPlanFormStore } from "./state/useMonthlyPlanFormStore";
import { useMonthlyPlanPeriodStore } from "./state/useMonthlyPlanPeriodStore";

/**
 * RESPONSIBILITY: Synchronize backend monthly plan document into local store slices.
 * OWNER: Planning feature team.
 * BOUNDARY REASON: Hydration policy changes separately from view rendering and action commands.
 * CHANGES WHEN: Query source, hydration reset behavior, or lock-status mapping changes.
 */
export const useMonthlyPlanHydration = () => {
  const year = useMonthlyPlanPeriodStore((s) => s.year);
  const month = useMonthlyPlanPeriodStore((s) => s.month);
  const setPlanStatus = useMonthlyPlanUiStore((s) => s.setPlanStatus);
  const hydrateFromPlan = useMonthlyPlanFormStore((s) => s.hydrateFromPlan);
  const resetPlanValues = useMonthlyPlanFormStore((s) => s.resetPlanValues);

  const monthlyPlan = useMonthlyPlanQuery(year, month);
  const lastHydratedPlanIdRef = useRef<Id<"monthly_plan"> | null>(null);

  useEffect(() => {
    const currentPlanId = monthlyPlan?._id ?? null;
    if (lastHydratedPlanIdRef.current === currentPlanId) {
      return;
    }
    lastHydratedPlanIdRef.current = currentPlanId;

    if (!monthlyPlan) {
      setPlanStatus({ hasMonthlyPlan: false, isClosed: false });
      resetPlanValues();
      return;
    }

    setPlanStatus({ hasMonthlyPlan: true, isClosed: monthlyPlan.isClosed });
    hydrateFromPlan({
      expectedIncomeMinor: monthlyPlan.expectedIncomeMinor.toString(),
      needsAllocationMinor: monthlyPlan.needsAllocationMinor.toString(),
      investmentsAllocationMinor: monthlyPlan.investmentsAllocationMinor.toString(),
      savingsAllocationMinor: monthlyPlan.savingsAllocationMinor.toString(),
      charityAllocationMinor: monthlyPlan.charityAllocationMinor.toString(),
      flexAllocationMinor: monthlyPlan.flexAllocationMinor.toString(),
      notes: monthlyPlan.notes ?? "",
    });
  }, [monthlyPlan, setPlanStatus, hydrateFromPlan, resetPlanValues]);
};
```

### `features/planning/application/state/useMonthlyPlanFormStore.ts`

```ts
"use client";
import { create } from "zustand";

type BucketAllocationKey =
  | "needsAllocationMinor"
  | "investmentsAllocationMinor"
  | "savingsAllocationMinor"
  | "charityAllocationMinor"
  | "flexAllocationMinor";

type MonthlyPlanFormState = {
  expectedIncomeMinor: string;
  needsAllocationMinor: string;
  investmentsAllocationMinor: string;
  savingsAllocationMinor: string;
  charityAllocationMinor: string;
  flexAllocationMinor: string;
  notes: string;
};

type MonthlyPlanFormActions = {
  setExpectedIncomeMinor: (value: string) => void;
  setNotes: (value: string) => void;
  setBucketAllocation: (key: BucketAllocationKey, value: string) => void;
  hydrateFromPlan: (payload: MonthlyPlanFormState) => void;
  resetPlanValues: () => void;
};

type MonthlyPlanFormStore = MonthlyPlanFormState & MonthlyPlanFormActions;

const initialValues: MonthlyPlanFormState = {
  expectedIncomeMinor: "0",
  needsAllocationMinor: "0",
  investmentsAllocationMinor: "0",
  savingsAllocationMinor: "0",
  charityAllocationMinor: "0",
  flexAllocationMinor: "0",
  notes: "",
};

/**
 * RESPONSIBILITY: Manage editable monthly plan form fields only.
 * OWNER: Planning feature team.
 * BOUNDARY REASON: Form structure/validation inputs change independently from period and UI status state.
 * CHANGES WHEN: Allocation fields, notes behavior, or hydration/reset strategy changes.
 */
export const useMonthlyPlanFormStore = create<MonthlyPlanFormStore>((set) => ({
  ...initialValues,
  setExpectedIncomeMinor: (expectedIncomeMinor) => set({ expectedIncomeMinor }),
  setNotes: (notes) => set({ notes }),
  setBucketAllocation: (key, value) => set({ [key]: value }),
  hydrateFromPlan: (payload) => set({ ...payload }),
  resetPlanValues: () => set({ ...initialValues }),
}));
```

### `features/planning/application/state/useMonthlyPlanPeriodStore.ts`

```ts
"use client";
import { create } from "zustand";

type MonthlyPlanPeriodState = {
  year: number;
  month: number;
  setYear: (year: number) => void;
  setMonth: (month: number) => void;
};

const today = new Date();

/**
 * RESPONSIBILITY: Manage selected planning period (year/month) only.
 * OWNER: Planning feature team.
 * BOUNDARY REASON: Period navigation evolves independently from form values and async UI flags.
 * CHANGES WHEN: Period initialization or period-selection behavior changes.
 */
export const useMonthlyPlanPeriodStore = create<MonthlyPlanPeriodState>((set) => ({
  year: today.getFullYear(),
  month: today.getMonth() + 1,
  setYear: (year) => set({ year }),
  setMonth: (month) => set({ month }),
}));
```

### `features/planning/application/state/useMonthlyPlanUiStore.ts`

```ts
"use client";
import { create } from "zustand";

type MonthlyPlanUiState = {
  message: string | null;
  error: string | null;
  isSaving: boolean;
  isCopying: boolean;
  isClosed: boolean;
  hasMonthlyPlan: boolean;
};

type MonthlyPlanUiActions = {
  setMessage: (value: string | null) => void;
  setError: (value: string | null) => void;
  setIsSaving: (value: boolean) => void;
  setIsCopying: (value: boolean) => void;
  setPlanStatus: (payload: { hasMonthlyPlan: boolean; isClosed: boolean }) => void;
};

type MonthlyPlanUiStore = MonthlyPlanUiState & MonthlyPlanUiActions;

/**
 * RESPONSIBILITY: Manage command/status feedback and lock flags for monthly planning UI.
 * OWNER: Planning feature team.
 * BOUNDARY REASON: Async command feedback and lock status evolve independently from form inputs.
 * CHANGES WHEN: Message strategy, loading flags, or lock semantics change.
 */
export const useMonthlyPlanUiStore = create<MonthlyPlanUiStore>((set) => ({
  message: null,
  error: null,
  isSaving: false,
  isCopying: false,
  isClosed: false,
  hasMonthlyPlan: false,
  setMessage: (message) => set({ message }),
  setError: (error) => set({ error }),
  setIsSaving: (isSaving) => set({ isSaving }),
  setIsCopying: (isCopying) => set({ isCopying }),
  setPlanStatus: ({ hasMonthlyPlan, isClosed }) => set({ hasMonthlyPlan, isClosed }),
}));
```

### `features/planning/ui/MonthlyPlanTabContent/index.tsx`

```tsx
"use client";
import { Card, CardContent } from "@/components/ui/card";
import { useMonthlyPlanHydration } from "../../application/useMonthlyPlanHydration";
import ActionButtons from "./ActionButtons";
import BalanceSummary from "./BalanceSummary";
import BucketAllocationFields from "./BucketAllocationFields";
import ExpectedIncomeField from "./ExpectedIncomeField";
import FeedbackAlerts from "./FeedbackAlerts";
import NotesField from "./NotesField";
import PeriodFields from "./PeriodFields";
import StatusHeader from "./StatusHeader";

const MonthlyPlanTabContent = () => {
  useMonthlyPlanHydration();

  return (
    <Card>
      <StatusHeader />
      <CardContent className="grid gap-3 lg:grid-cols-2">
        <FeedbackAlerts />
        <PeriodFields />
        <ExpectedIncomeField />
        <BucketAllocationFields />
        <NotesField />
        <BalanceSummary />
        <ActionButtons />
      </CardContent>
    </Card>
  );
};

export default MonthlyPlanTabContent;
```

### `features/planning/ui/MonthlyPlanTabContent/model.ts`

```ts
import type { PlanningBucket } from "../../domain/types";

export const BUCKET_FIELDS = [
  { label: "Needs", key: "needsAllocationMinor" },
  { label: "Investments", key: "investmentsAllocationMinor" },
  { label: "Savings", key: "savingsAllocationMinor" },
  { label: "Charity", key: "charityAllocationMinor" },
  { label: "Flex", key: "flexAllocationMinor" },
] as const satisfies ReadonlyArray<{
  label: PlanningBucket;
  key:
    | "needsAllocationMinor"
    | "investmentsAllocationMinor"
    | "savingsAllocationMinor"
    | "charityAllocationMinor"
    | "flexAllocationMinor";
}>;
```

### `features/planning/ui/MonthlyPlanTabContent/StatusHeader.tsx`

```tsx
"use client";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMonthlyPlanUiStore } from "../../application/state/useMonthlyPlanUiStore";

const StatusHeader = () => {
  const isClosed = useMonthlyPlanUiStore((s) => s.isClosed);

  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-base">
        Monthly plan
        <Badge variant={isClosed ? "destructive" : "secondary"}>
          {isClosed ? "Closed (Locked)" : "Open"}
        </Badge>
      </CardTitle>
    </CardHeader>
  );
};

export default StatusHeader;
```

### `features/planning/ui/MonthlyPlanTabContent/FeedbackAlerts.tsx`

```tsx
"use client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMonthlyPlanUiStore } from "../../application/state/useMonthlyPlanUiStore";

const FeedbackAlerts = () => {
  const error = useMonthlyPlanUiStore((s) => s.error);
  const message = useMonthlyPlanUiStore((s) => s.message);

  return (
    <>
      {error ? (
        <Alert variant="destructive" className="lg:col-span-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {message ? (
        <Alert className="lg:col-span-2">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}
    </>
  );
};

export default FeedbackAlerts;
```

### `features/planning/ui/MonthlyPlanTabContent/PeriodFields.tsx`

```tsx
"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMonthlyPlanPeriodStore } from "../../application/state/useMonthlyPlanPeriodStore";

const PeriodFields = () => {
  const { year, month, setYear, setMonth } = useMonthlyPlanPeriodStore();
  return (
    <>
      <div className="space-y-1.5">
        <Label>Year</Label>
        <Input
          type="number"
          value={year}
          onChange={(event) => setYear(Number(event.target.value || 0))}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Month</Label>
        <Input
          type="number"
          min={1}
          max={12}
          value={month}
          onChange={(event) => setMonth(Number(event.target.value || 0))}
        />
      </div>
    </>
  );
};

export default PeriodFields;
```

### `features/planning/ui/MonthlyPlanTabContent/ExpectedIncomeField.tsx`

```tsx
"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMonthlyPlanFormStore } from "../../application/state/useMonthlyPlanFormStore";
import { useMonthlyPlanUiStore } from "../../application/state/useMonthlyPlanUiStore";

const ExpectedIncomeField = () => {
  const expectedIncomeMinor = useMonthlyPlanFormStore((s) => s.expectedIncomeMinor);
  const setExpectedIncomeMinor = useMonthlyPlanFormStore((s) => s.setExpectedIncomeMinor);
  const isClosed = useMonthlyPlanUiStore((s) => s.isClosed);

  return (
    <div className="space-y-1.5 lg:col-span-2">
      <Label>Expected income (minor units)</Label>
      <Input
        value={expectedIncomeMinor}
        onChange={(event) => setExpectedIncomeMinor(event.target.value)}
        placeholder="e.g. 10000000"
        disabled={isClosed}
      />
    </div>
  );
};

export default ExpectedIncomeField;
```

### `features/planning/ui/MonthlyPlanTabContent/BucketAllocationFields.tsx`

```tsx
"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BUCKET_FIELDS } from "./model";
import { useMonthlyPlanFormStore } from "../../application/state/useMonthlyPlanFormStore";
import { useMonthlyPlanUiStore } from "../../application/state/useMonthlyPlanUiStore";

const BucketAllocationFields = () => {
  const form = useMonthlyPlanFormStore((s) => s);
  const isClosed = useMonthlyPlanUiStore((s) => s.isClosed);
  return (
    <>
      {BUCKET_FIELDS.map((bucketField) => (
        <div key={bucketField.label} className="space-y-1.5">
          <Label>{bucketField.label} allocation</Label>
          <Input
            value={form[bucketField.key]}
            onChange={(event) => form.setBucketAllocation(bucketField.key, event.target.value)}
            placeholder={`Amount for ${bucketField.label}`}
            disabled={isClosed}
          />
        </div>
      ))}
    </>
  );
};

export default BucketAllocationFields;
```

### `features/planning/ui/MonthlyPlanTabContent/NotesField.tsx`

```tsx
"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMonthlyPlanFormStore } from "../../application/state/useMonthlyPlanFormStore";
import { useMonthlyPlanUiStore } from "../../application/state/useMonthlyPlanUiStore";

const NotesField = () => {
  const notes = useMonthlyPlanFormStore((s) => s.notes);
  const setNotes = useMonthlyPlanFormStore((s) => s.setNotes);
  const isClosed = useMonthlyPlanUiStore((s) => s.isClosed);

  return (
    <div className="space-y-1.5 lg:col-span-2">
      <Label>Notes</Label>
      <Input
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Optional context for this month"
        disabled={isClosed}
      />
    </div>
  );
};

export default NotesField;
```

### `features/planning/ui/MonthlyPlanTabContent/BalanceSummary.tsx`

```tsx
"use client";
import { useMonthlyPlanDerivedState } from "../../application/useMonthlyPlanDerivedState";

const BalanceSummary = () => {
  const { allocationTotalMinor, expectedIncomeMinor, isBalanced } = useMonthlyPlanDerivedState();

  return (
    <div className="rounded-xl border p-3 text-sm lg:col-span-2">
      <p>Allocation total: {allocationTotalMinor.toString()}</p>
      <p>Expected income: {expectedIncomeMinor.toString()}</p>
      <p className={isBalanced ? "text-emerald-600" : "text-destructive"}>
        {isBalanced
          ? "Balanced plan: ready to save."
          : "Not balanced: 5 bucket sum must equal expected income."}
      </p>
    </div>
  );
};

export default BalanceSummary;
```

### `features/planning/ui/MonthlyPlanTabContent/ActionButtons.tsx`

```tsx
"use client";
import { Button } from "@/components/ui/button";
import { useMonthlyPlanActions } from "../../application/useMonthlyPlanActions";
import { useMonthlyPlanDerivedState } from "../../application/useMonthlyPlanDerivedState";
import { useMonthlyPlanUiStore } from "../../application/state/useMonthlyPlanUiStore";

const ActionButtons = () => {
  const { savePlan, copyFromLastMonth } = useMonthlyPlanActions();
  const { isBalanced } = useMonthlyPlanDerivedState();
  const hasMonthlyPlan = useMonthlyPlanUiStore((s) => s.hasMonthlyPlan);
  const isClosed = useMonthlyPlanUiStore((s) => s.isClosed);
  const isSaving = useMonthlyPlanUiStore((s) => s.isSaving);
  const isCopying = useMonthlyPlanUiStore((s) => s.isCopying);

  return (
    <div className="flex gap-2 lg:col-span-2">
      <Button disabled={isClosed || isSaving || !isBalanced} onClick={savePlan}>
        {hasMonthlyPlan ? "Update plan" : "Save plan"}
      </Button>
      <Button variant="outline" disabled={isClosed || isCopying} onClick={copyFromLastMonth}>
        Copy last month
      </Button>
    </div>
  );
};

export default ActionButtons;
```

### `convex/monthlyPlan.ts`

```ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * RESPONSIBILITY: Own monthly plan lifecycle (create/update/get/copy/close) with financial guardrails.
 * OWNER: Planning feature team.
 * BOUNDARY REASON: Monthly planning rules change on finance-product timelines, isolated from other modules.
 * CHANGES WHEN: Allocation validation, lock policy, or copy behavior requirements are updated.
 */
const nowIso = () => new Date().toISOString();

const assertMonth = (month: number) => {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error("Month must be an integer in range 1..12.");
  }
};

const assertYear = (year: number) => {
  if (!Number.isInteger(year) || year < 2000 || year > 3000) {
    throw new Error("Year must be a valid integer in range 2000..3000.");
  }
};

const assertPositiveAmount = (label: string, amountMinor: bigint) => {
  if (amountMinor < BigInt(0)) {
    throw new Error(`${label} cannot be negative.`);
  }
};

const assertBalancedPlan = (
  expectedIncomeMinor: bigint,
  needsAllocationMinor: bigint,
  investmentsAllocationMinor: bigint,
  savingsAllocationMinor: bigint,
  charityAllocationMinor: bigint,
  flexAllocationMinor: bigint,
) => {
  const total =
    needsAllocationMinor +
    investmentsAllocationMinor +
    savingsAllocationMinor +
    charityAllocationMinor +
    flexAllocationMinor;

  if (total !== expectedIncomeMinor) {
    throw new Error(
      "Invalid monthly plan: NEEDS + INVESTMENTS + SAVINGS + CHARITY + FLEX must equal expected income.",
    );
  }
};

const getPreviousMonth = (year: number, month: number) => {
  if (month === 1) {
    return { year: year - 1, month: 12 };
  }
  return { year, month: month - 1 };
};

export const getMonthlyPlan = query({
  args: {
    year: v.number(),
    month: v.number(),
  },
  handler: async (ctx, args) => {
    assertYear(args.year);
    assertMonth(args.month);

    return await ctx.db
      .query("monthly_plan")
      .withIndex("by_year_and_month", (q) => q.eq("year", args.year).eq("month", args.month))
      .unique();
  },
});

export const createMonthlyPlan = mutation({
  args: {
    year: v.number(),
    month: v.number(),
    expectedIncomeMinor: v.int64(),
    needsAllocationMinor: v.int64(),
    investmentsAllocationMinor: v.int64(),
    savingsAllocationMinor: v.int64(),
    charityAllocationMinor: v.int64(),
    flexAllocationMinor: v.int64(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertYear(args.year);
    assertMonth(args.month);
    assertPositiveAmount("expectedIncomeMinor", args.expectedIncomeMinor);
    assertPositiveAmount("needsAllocationMinor", args.needsAllocationMinor);
    assertPositiveAmount("investmentsAllocationMinor", args.investmentsAllocationMinor);
    assertPositiveAmount("savingsAllocationMinor", args.savingsAllocationMinor);
    assertPositiveAmount("charityAllocationMinor", args.charityAllocationMinor);
    assertPositiveAmount("flexAllocationMinor", args.flexAllocationMinor);
    assertBalancedPlan(
      args.expectedIncomeMinor,
      args.needsAllocationMinor,
      args.investmentsAllocationMinor,
      args.savingsAllocationMinor,
      args.charityAllocationMinor,
      args.flexAllocationMinor,
    );

    const existing = await ctx.db
      .query("monthly_plan")
      .withIndex("by_year_and_month", (q) => q.eq("year", args.year).eq("month", args.month))
      .unique();
    if (existing) {
      throw new Error("A monthly plan already exists for this period.");
    }

    const now = nowIso();
    return await ctx.db.insert("monthly_plan", {
      ...args,
      isClosed: false,
      createdAt: now,
      updatedAt: now,
      closedAt: undefined,
    });
  },
});

export const updateMonthlyPlan = mutation({
  args: {
    year: v.number(),
    month: v.number(),
    expectedIncomeMinor: v.int64(),
    needsAllocationMinor: v.int64(),
    investmentsAllocationMinor: v.int64(),
    savingsAllocationMinor: v.int64(),
    charityAllocationMinor: v.int64(),
    flexAllocationMinor: v.int64(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertYear(args.year);
    assertMonth(args.month);
    assertPositiveAmount("expectedIncomeMinor", args.expectedIncomeMinor);
    assertPositiveAmount("needsAllocationMinor", args.needsAllocationMinor);
    assertPositiveAmount("investmentsAllocationMinor", args.investmentsAllocationMinor);
    assertPositiveAmount("savingsAllocationMinor", args.savingsAllocationMinor);
    assertPositiveAmount("charityAllocationMinor", args.charityAllocationMinor);
    assertPositiveAmount("flexAllocationMinor", args.flexAllocationMinor);
    assertBalancedPlan(
      args.expectedIncomeMinor,
      args.needsAllocationMinor,
      args.investmentsAllocationMinor,
      args.savingsAllocationMinor,
      args.charityAllocationMinor,
      args.flexAllocationMinor,
    );

    const existing = await ctx.db
      .query("monthly_plan")
      .withIndex("by_year_and_month", (q) => q.eq("year", args.year).eq("month", args.month))
      .unique();
    if (!existing) {
      throw new Error("Cannot update monthly plan: no plan exists for this period.");
    }
    if (existing.isClosed) {
      throw new Error("Cannot update monthly plan: this month is closed and locked.");
    }

    await ctx.db.patch(existing._id, {
      expectedIncomeMinor: args.expectedIncomeMinor,
      needsAllocationMinor: args.needsAllocationMinor,
      investmentsAllocationMinor: args.investmentsAllocationMinor,
      savingsAllocationMinor: args.savingsAllocationMinor,
      charityAllocationMinor: args.charityAllocationMinor,
      flexAllocationMinor: args.flexAllocationMinor,
      notes: args.notes,
      updatedAt: nowIso(),
    });

    return { ok: true };
  },
});

export const copyLastMonthPlan = mutation({
  args: {
    year: v.number(),
    month: v.number(),
  },
  handler: async (ctx, args) => {
    assertYear(args.year);
    assertMonth(args.month);

    const previousMonth = getPreviousMonth(args.year, args.month);
    const source = await ctx.db
      .query("monthly_plan")
      .withIndex("by_year_and_month", (q) =>
        q.eq("year", previousMonth.year).eq("month", previousMonth.month),
      )
      .unique();
    if (!source) {
      return {
        ok: false as const,
        reason: "NO_PREVIOUS_MONTH_PLAN" as const,
      };
    }

    const target = await ctx.db
      .query("monthly_plan")
      .withIndex("by_year_and_month", (q) => q.eq("year", args.year).eq("month", args.month))
      .unique();

    if (target?.isClosed) {
      throw new Error("Cannot copy into a closed month. Re-open is required before edits.");
    }

    if (!target) {
      const now = nowIso();
      const createdId = await ctx.db.insert("monthly_plan", {
        year: args.year,
        month: args.month,
        expectedIncomeMinor: source.expectedIncomeMinor,
        needsAllocationMinor: source.needsAllocationMinor,
        investmentsAllocationMinor: source.investmentsAllocationMinor,
        savingsAllocationMinor: source.savingsAllocationMinor,
        charityAllocationMinor: source.charityAllocationMinor,
        flexAllocationMinor: source.flexAllocationMinor,
        notes: source.notes,
        isClosed: false,
        createdAt: now,
        updatedAt: now,
        closedAt: undefined,
      });
      return { ok: true as const, created: true as const, monthlyPlanId: createdId };
    }

    await ctx.db.patch(target._id, {
      expectedIncomeMinor: source.expectedIncomeMinor,
      needsAllocationMinor: source.needsAllocationMinor,
      investmentsAllocationMinor: source.investmentsAllocationMinor,
      savingsAllocationMinor: source.savingsAllocationMinor,
      charityAllocationMinor: source.charityAllocationMinor,
      flexAllocationMinor: source.flexAllocationMinor,
      notes: source.notes,
      updatedAt: nowIso(),
    });

    return { ok: true as const, created: false as const, monthlyPlanId: target._id };
  },
});

export const closeMonthlyPlan = mutation({
  args: {
    year: v.number(),
    month: v.number(),
  },
  handler: async (ctx, args) => {
    assertYear(args.year);
    assertMonth(args.month);

    const existing = await ctx.db
      .query("monthly_plan")
      .withIndex("by_year_and_month", (q) => q.eq("year", args.year).eq("month", args.month))
      .unique();
    if (!existing) {
      throw new Error("Cannot close monthly plan: no plan exists for this period.");
    }
    if (existing.isClosed) {
      throw new Error("Monthly plan is already closed.");
    }

    const now = nowIso();
    await ctx.db.patch(existing._id, {
      isClosed: true,
      closedAt: now,
      updatedAt: now,
    });
    return { ok: true };
  },
});
```

### `convex/schema.ts` (relevant excerpt: monthly plan table and related enum notes)

```ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Monthly plan table used directly by the Monthly Plan module.
export default defineSchema({
  monthly_plan: defineTable({
    year: v.number(),
    month: v.number(),
    expectedIncomeMinor: v.int64(),
    needsAllocationMinor: v.int64(),
    investmentsAllocationMinor: v.int64(),
    savingsAllocationMinor: v.int64(),
    charityAllocationMinor: v.int64(),
    flexAllocationMinor: v.int64(),
    notes: v.optional(v.string()),
    isClosed: v.boolean(),
    createdAt: v.string(),
    closedAt: v.optional(v.string()),
    updatedAt: v.string(),
  }).index("by_year_and_month", ["year", "month"]),
});
```

Schema enum/union relevance for this module:

- `monthly_plan` does not use schema-level unions/enums.
- Bucket semantics are represented in frontend domain type:
  - `PlanningBucket` in `features/planning/domain/types.ts`
- Business constraints are enforced in backend function logic:
  - `assertMonth`, `assertYear`, `assertBalancedPlan` in `convex/monthlyPlan.ts`
