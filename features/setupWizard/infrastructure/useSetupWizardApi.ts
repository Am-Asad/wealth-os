"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const setupApi = (api as unknown as { setupWizard: Record<string, unknown> }).setupWizard;

export const useSetupWizardStateQuery = () => useQuery(setupApi.getSetupWizardState as never, {});

export const useRecommendedBlueprintsQuery = () =>
  useQuery(setupApi.getRecommendedAccountBlueprints as never, {});

export const useAccountsQuery = () => useQuery(setupApi.listAccountsForSetup as never, {});

export const useCreateAccountMutation = () => useMutation(setupApi.createAccountForSetup as never);

export const useUpdateAccountMutation = () => useMutation(setupApi.updateAccountForSetup as never);

export const useArchiveAccountMutation = () =>
  useMutation(setupApi.archiveAccountForSetup as never);

export const useCategoriesQuery = (bucketId?: string) =>
  useQuery(
    setupApi.listCategoriesForSetup as never,
    bucketId ? ({ bucketId } as never) : ({} as never),
  );

export const useCreateCategoryMutation = () =>
  useMutation(setupApi.createCategoryForSetup as never);

export const useUpdateCategoryMutation = () =>
  useMutation(setupApi.updateCategoryForSetup as never);

export const useArchiveCategoryMutation = () =>
  useMutation(setupApi.archiveCategoryForSetup as never);

export const useSubcategoriesQuery = (categoryId?: string) =>
  useQuery(
    setupApi.listSubcategoriesForSetup as never,
    categoryId ? ({ categoryId } as never) : ({} as never),
  );

export const useCreateSubcategoryMutation = () =>
  useMutation(setupApi.createSubcategoryForSetup as never);

export const useUpdateSubcategoryMutation = () =>
  useMutation(setupApi.updateSubcategoryForSetup as never);

export const useArchiveSubcategoryMutation = () =>
  useMutation(setupApi.archiveSubcategoryForSetup as never);

export const useCreateRecommendedAccountsMutation = () =>
  useMutation(setupApi.createRecommendedAccounts as never);
