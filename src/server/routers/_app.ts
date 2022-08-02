import superjson from "superjson";
import { createRouter } from "../createRouter";
import { userRouter } from "./user";

// This will be used in /pages/api/trpc/[trpc].ts
export const appRouter = createRouter()
  .transformer(superjson)
  .merge("user.", userRouter);

// This will be used in /utils/trpc.ts and /pages/_app.tsx
export type AppRouter = typeof appRouter;
