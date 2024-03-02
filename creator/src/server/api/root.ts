import { scrapperRouter } from "@/server/api/routers/scrapper";
import { createTRPCRouter } from "@/server/api/trpc";
import { databaseRouter } from "./routers/db";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  scrapper: scrapperRouter,
  db: databaseRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
