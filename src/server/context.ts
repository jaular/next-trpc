import * as trpc from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import prisma from "~/lib/prisma";

interface CreateContextOptions {
  // session: Session | null
}

export async function createContextInner(_opts: CreateContextOptions) {
  return { prisma };
}

// This will be used in /server/createRouter.ts
export type Context = trpc.inferAsyncReturnType<typeof createContextInner>;

// The app's context - is generated for each incoming request
// This will be used in /pages/api/trpc/[trpc].ts
export async function createContext(
  opts?: trpcNext.CreateNextContextOptions
): Promise<Context> {
  return await createContextInner({});
}
