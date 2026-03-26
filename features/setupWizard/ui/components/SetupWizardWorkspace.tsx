"use client";

import { useState } from "react";
import { CheckCircle2, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { SETUP_STEPS } from "../../domain/steps";
import { AccountPurpose, AccountType } from "../../domain/types";
import { useSetupWizardStore } from "../../application/state/useSetupWizardStore";
import {
  useAccountsQuery,
  useArchiveAccountMutation,
  useArchiveCategoryMutation,
  useArchiveSubcategoryMutation,
  useCategoriesQuery,
  useCreateAccountMutation,
  useCreateCategoryMutation,
  useCreateRecommendedAccountsMutation,
  useCreateSubcategoryMutation,
  useRecommendedBlueprintsQuery,
  useSetupWizardStateQuery,
  useSubcategoriesQuery,
  useUpdateAccountMutation,
  useUpdateCategoryMutation,
  useUpdateSubcategoryMutation,
} from "../../infrastructure/useSetupWizardApi";
import { cn } from "@/lib/utils";

const ACCOUNT_TYPES: AccountType[] = ["BANK", "WALLET", "CASH", "INVESTMENT", "CREDIT_CARD"];
const ACCOUNT_PURPOSES: AccountPurpose[] = [
  "GENERAL",
  "EMERGENCY_FUND",
  "GOAL_SAVINGS",
  "INVESTMENT",
];
const CATEGORY_TRANSACTION_TYPES = ["EXPENSE", "INCOME", "BOTH"] as const;

type SetupBlueprint = {
  name: string;
  type: AccountType;
  purpose: AccountPurpose;
  bucketId: string;
  rationale: string;
};

type SetupAccount = {
  _id: string;
  name: string;
  type: AccountType;
  purpose: AccountPurpose;
  bucketId: string;
  openingBalanceMinor: bigint;
  openingDate: string;
  currency: string;
  notes?: string;
};

type SetupCategory = {
  _id: string;
  name: string;
  bucketId: string;
  transactionType: (typeof CATEGORY_TRANSACTION_TYPES)[number];
  color?: string;
  icon?: string;
  sortOrder: number;
};

type SetupSubcategory = {
  _id: string;
  name: string;
  categoryId: string;
};

function StepNavigation() {
  const activeStep = useSetupWizardStore((s) => s.activeStep);
  const setActiveStep = useSetupWizardStore((s) => s.setActiveStep);
  const index = SETUP_STEPS.findIndex((step) => step.id === activeStep);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {SETUP_STEPS.map((step, idx) => (
          <button
            key={step.id}
            type="button"
            onClick={() => setActiveStep(step.id)}
            className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors",
              idx === index
                ? "bg-primary text-primary-foreground"
                : "bg-background text-muted-foreground hover:bg-muted",
            )}
          >
            <span className="text-xs">{idx + 1}</span>
            <span className="whitespace-nowrap">{step.title}</span>
          </button>
        ))}
      </div>
      <Progress value={((index + 1) / SETUP_STEPS.length) * 100} />
    </div>
  );
}

function AccountsStep() {
  const blueprints = (useRecommendedBlueprintsQuery() ?? []) as SetupBlueprint[];
  const accounts = (useAccountsQuery() ?? []) as SetupAccount[];
  const createRecommended = useCreateRecommendedAccountsMutation();
  const createAccount = useCreateAccountMutation();
  const updateAccount = useUpdateAccountMutation();
  const archiveAccount = useArchiveAccountMutation();

  const bucketOptions = blueprints.map((blueprint) => ({
    id: blueprint.bucketId as string,
    label: `${blueprint.name} default bucket`,
  }));

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    type: "BANK" as AccountType,
    purpose: "GENERAL" as AccountPurpose,
    bucketId: "",
    openingBalanceMinor: "0",
    openingDate: new Date().toISOString().slice(0, 10),
    currency: "PKR",
    notes: "",
  });

  const resetForm = () =>
    setForm({
      name: "",
      type: "BANK",
      purpose: "GENERAL",
      bucketId: bucketOptions[0]?.id ?? "",
      openingBalanceMinor: "0",
      openingDate: new Date().toISOString().slice(0, 10),
      currency: "PKR",
      notes: "",
    });

  const loadForEdit = (row: SetupAccount) => {
    setEditingId(row._id);
    setForm({
      name: row.name,
      type: row.type,
      purpose: row.purpose,
      bucketId: row.bucketId,
      openingBalanceMinor: row.openingBalanceMinor.toString(),
      openingDate: row.openingDate,
      currency: row.currency,
      notes: row.notes ?? "",
    });
  };

  const submit = async () => {
    const payload = {
      name: form.name,
      type: form.type,
      purpose: form.purpose,
      bucketId: form.bucketId as string,
      openingBalanceMinor: BigInt(form.openingBalanceMinor || "0"),
      openingDate: form.openingDate,
      currency: form.currency,
      notes: form.notes || undefined,
    };

    if (editingId) {
      await updateAccount({ accountId: editingId, ...payload } as never);
    } else {
      await createAccount(payload as never);
    }
    setEditingId(null);
    resetForm();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recommended quick-start</CardTitle>
          <CardDescription>One tap to create your default account structure.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {blueprints.map((item) => (
              <Badge key={item.name} variant="muted">
                {item.name} - {item.purpose}
              </Badge>
            ))}
          </div>
          <Button
            onClick={() =>
              createRecommended({
                openingDate: new Date().toISOString().slice(0, 10),
                currency: "PKR",
              })
            }
          >
            Create recommended accounts
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{editingId ? "Edit account" : "Add account"}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select
              value={form.type}
              onValueChange={(value) => setForm((s) => ({ ...s, type: value as AccountType }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Purpose</Label>
            <Select
              value={form.purpose}
              onValueChange={(value) =>
                setForm((s) => ({ ...s, purpose: value as AccountPurpose }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACCOUNT_PURPOSES.map((purpose) => (
                  <SelectItem key={purpose} value={purpose}>
                    {purpose}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Bucket</Label>
            <Select
              value={form.bucketId}
              onValueChange={(value) => setForm((s) => ({ ...s, bucketId: value }))}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select bucket" />
              </SelectTrigger>
              <SelectContent>
                {bucketOptions.map((bucket) => (
                  <SelectItem key={bucket.id} value={bucket.id}>
                    {bucket.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Opening balance (minor units)</Label>
            <Input
              value={form.openingBalanceMinor}
              onChange={(e) => setForm((s) => ({ ...s, openingBalanceMinor: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Opening date</Label>
            <Input
              type="date"
              value={form.openingDate}
              onChange={(e) => setForm((s) => ({ ...s, openingDate: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Currency</Label>
            <Input
              value={form.currency}
              onChange={(e) => setForm((s) => ({ ...s, currency: e.target.value }))}
            />
          </div>
          <div className="flex items-end gap-2 md:col-span-2">
            <Button onClick={submit}>{editingId ? "Update account" : "Add account"}</Button>
            {editingId ? (
              <Button
                variant="outline"
                onClick={() => {
                  setEditingId(null);
                  resetForm();
                }}
              >
                Cancel edit
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Active accounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {accounts.map((row) => (
            <div key={row._id} className="flex items-center justify-between rounded-xl border p-3">
              <div>
                <p className="font-medium">{row.name}</p>
                <p className="text-xs text-muted-foreground">
                  {row.type} - {row.purpose}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => loadForEdit(row)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => archiveAccount({ accountId: row._id } as never)}
                >
                  Archive
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function CategoriesStep() {
  const blueprints = (useRecommendedBlueprintsQuery() ?? []) as SetupBlueprint[];
  const firstBucketId = (blueprints?.[0]?.bucketId as string | undefined) ?? "";
  const [bucketId, setBucketId] = useState(firstBucketId);
  const categories = (useCategoriesQuery(bucketId || undefined) ?? []) as SetupCategory[];
  const createCategory = useCreateCategoryMutation();
  const updateCategory = useUpdateCategoryMutation();
  const archiveCategory = useArchiveCategoryMutation();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    transactionType: "EXPENSE" as (typeof CATEGORY_TRANSACTION_TYPES)[number],
    color: "",
    icon: "",
    sortOrder: "0",
  });

  const submit = async () => {
    const payload = {
      name: form.name,
      bucketId: bucketId as string,
      transactionType: form.transactionType,
      color: form.color || undefined,
      icon: form.icon || undefined,
      sortOrder: Number(form.sortOrder || "0"),
    };
    if (editingId) {
      await updateCategory({ categoryId: editingId, ...payload } as never);
    } else {
      await createCategory(payload as never);
    }
    setEditingId(null);
    setForm({ name: "", transactionType: "EXPENSE", color: "", icon: "", sortOrder: "0" });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Category setup</CardTitle>
          <CardDescription>
            Categories belong to one bucket and drive reporting insights.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5 md:col-span-2">
            <Label>Bucket</Label>
            <Select value={bucketId} onValueChange={setBucketId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select bucket" />
              </SelectTrigger>
              <SelectContent>
                {blueprints.map((item) => (
                  <SelectItem key={item.bucketId} value={item.bucketId}>
                    {item.rationale}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Transaction type</Label>
            <Select
              value={form.transactionType}
              onValueChange={(value) =>
                setForm((s) => ({
                  ...s,
                  transactionType: value as (typeof CATEGORY_TRANSACTION_TYPES)[number],
                }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_TRANSACTION_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Sort order</Label>
            <Input
              value={form.sortOrder}
              onChange={(e) => setForm((s) => ({ ...s, sortOrder: e.target.value }))}
            />
          </div>
          <div className="flex items-end">
            <Button onClick={submit}>{editingId ? "Update category" : "Add category"}</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Categories in selected bucket</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {categories.map((row) => (
            <div key={row._id} className="flex items-center justify-between rounded-xl border p-3">
              <div>
                <p className="font-medium">{row.name}</p>
                <p className="text-xs text-muted-foreground">{row.transactionType}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingId(row._id);
                    setForm({
                      name: row.name,
                      transactionType: row.transactionType,
                      color: row.color ?? "",
                      icon: row.icon ?? "",
                      sortOrder: String(row.sortOrder ?? 0),
                    });
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => archiveCategory({ categoryId: row._id } as never)}
                >
                  Archive
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function SubcategoriesStep() {
  const allCategories = (useCategoriesQuery() ?? []) as SetupCategory[];
  const [categoryId, setCategoryId] = useState("");
  const subcategories = (useSubcategoriesQuery(categoryId || undefined) ??
    []) as SetupSubcategory[];
  const createSubcategory = useCreateSubcategoryMutation();
  const updateSubcategory = useUpdateSubcategoryMutation();
  const archiveSubcategory = useArchiveSubcategoryMutation();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");

  const submit = async () => {
    if (!categoryId) return;
    if (editingId) {
      await updateSubcategory({ subcategoryId: editingId, categoryId, name } as never);
    } else {
      await createSubcategory({ categoryId, name } as never);
    }
    setName("");
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Subcategory setup</CardTitle>
          <CardDescription>Subcategories are optional labels for deeper reporting.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div className="space-y-1.5 md:col-span-2">
            <Label>Parent category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {allCategories.map((row) => (
                  <SelectItem key={row._id} value={row._id}>
                    {row.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button onClick={submit}>{editingId ? "Update subcategory" : "Add subcategory"}</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Subcategories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {subcategories.map((row) => (
            <div key={row._id} className="flex items-center justify-between rounded-xl border p-3">
              <p className="font-medium">{row.name}</p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditingId(row._id);
                    setName(row.name);
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => archiveSubcategory({ subcategoryId: row._id } as never)}
                >
                  Archive
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function ReviewStep() {
  const wizardState = useSetupWizardStateQuery();

  const checks = [
    { label: "Accounts configured", ok: Boolean(wizardState?.steps.accountsComplete) },
    { label: "Categories configured", ok: Boolean(wizardState?.steps.categoriesComplete) },
    { label: "Subcategories configured", ok: Boolean(wizardState?.steps.subcategoriesComplete) },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Review and finish</CardTitle>
        <CardDescription>Confirm onboarding state before moving to dashboard.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {checks.map((check) => (
          <div
            key={check.label}
            className="flex items-center justify-between rounded-xl border p-3"
          >
            <p>{check.label}</p>
            <Badge variant={check.ok ? "default" : "outline"}>
              {check.ok ? "Done" : "Pending"}
            </Badge>
          </div>
        ))}
        {checks.every((check) => check.ok) ? (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm">
            <CheckCircle2 className="size-4 text-emerald-500" />
            Setup is complete. You can start daily logging.
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ActiveStepPanel() {
  const activeStep = useSetupWizardStore((s) => s.activeStep);
  if (activeStep === "accounts") return <AccountsStep />;
  if (activeStep === "categories") return <CategoriesStep />;
  if (activeStep === "subcategories") return <SubcategoriesStep />;
  return <ReviewStep />;
}

export default function SetupWizardWorkspace() {
  const activeStep = useSetupWizardStore((s) => s.activeStep);
  const next = useSetupWizardStore((s) => s.next);
  const back = useSetupWizardStore((s) => s.back);
  const index = SETUP_STEPS.findIndex((step) => step.id === activeStep);
  const step = SETUP_STEPS[index];

  return (
    <div className="mx-auto w-full max-w-6xl p-4 lg:p-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader className="space-y-3">
            <StepNavigation />
            <Separator />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                <CardTitle className="text-base">{step.title}</CardTitle>
              </div>
              <CardDescription>{step.description}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ActiveStepPanel />
            <div className="flex items-center justify-between">
              <Button variant="outline" disabled={index === 0} onClick={back}>
                Back
              </Button>
              <Button disabled={index === SETUP_STEPS.length - 1} onClick={next}>
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit lg:sticky lg:top-24">
          <CardHeader>
            <CardTitle className="text-base">Setup guide</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>- Accounts define where money lives.</p>
            <p>- Categories map to bucket analytics.</p>
            <p>- Subcategories improve report granularity.</p>
            <p>- You can archive items later in Settings.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
