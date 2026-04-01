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
