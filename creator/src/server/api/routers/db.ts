import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { type Prisma } from "@prisma/client";

export type DBNovel = Prisma.NovelGetPayload<{ include: { chapters: { include: { translations: { include: { lines: true } } } } } }>

export const databaseRouter = createTRPCRouter({
  checkPass: publicProcedure.input(z.string()).mutation(({ input }) => {
    return input == process.env.EDIT_PASS;
  }),
  getFromDB: publicProcedure.query(async ({ ctx }) => {
    const novels = await ctx.db.novel.findMany({ take: 50, include: { chapters: { include: { translations: { include: { lines: true } } } } } })
    return novels;
  }),
});
