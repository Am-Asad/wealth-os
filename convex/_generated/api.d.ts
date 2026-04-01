/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as constraints from "../constraints.js";
import type * as http from "../http.js";
import type * as monthlyPlan from "../monthlyPlan.js";
import type * as setup from "../setup.js";
import type * as setupHealth from "../setupHealth.js";
import type * as setupWizard from "../setupWizard.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  constraints: typeof constraints;
  http: typeof http;
  monthlyPlan: typeof monthlyPlan;
  setup: typeof setup;
  setupHealth: typeof setupHealth;
  setupWizard: typeof setupWizard;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
