import type { Context } from "./context";
import * as trpc from "@trpc/server";

// Helper function to create a router with your app's context - /server/_app.ts
export function createRouter() {
  return trpc.router<Context>();
}

/**
 * @see https://trpc.io/docs/merging-routers
 */
