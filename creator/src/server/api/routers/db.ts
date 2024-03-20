import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import { type Prisma } from "@prisma/client";
import { ScrapperNovelInfo } from "./scrapper";

export type DBNovel = Prisma.NovelGetPayload<{
  include: {
    chapters: {
      include: {
        translations: { include: { lines: true } };
      };
    };
  };
}>;

export const databaseRouter = createTRPCRouter({
  checkPass: publicProcedure
    .input(z.string())
    .mutation(({ input }) => {
      return input == process.env.EDIT_PASS;
    }),
  getFromDB: publicProcedure.query(async ({ ctx }) => {
    const novels = await ctx.db.novel.findMany({
      include: {
        chapters: {
          include: {
            translations: { include: { lines: true } },
          },
        },
      },
    });
    return novels;
  }),
  registerNovel: publicProcedure
    .input(ScrapperNovelInfo)
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.novel.create({
        data: { url: input.url, ogname: input.name },
      });
      console.log(result);
      return;
    }),
  removeNovel: publicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.novel.delete({
        where: {
          id: input,
          chapters: { every: { novelID: input } },
        },
      });
      console.log("=================");
      console.log(result);
      console.log("=================");
      return "abd";
    }),
});
