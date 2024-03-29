import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import { type Novel, type Prisma } from "@prisma/client";
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
    .mutation(async ({ ctx, input }): Promise<Novel> => {
      const result = await ctx.db.novel.create({
        data: {
          url: input.novelURL,
          ogname: input.novelName,
        },
      });
      return result;
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
      return result;
    }),
  changeNovelName: publicProcedure
    .input(
      z.object({
        name: z.string(),
        og: z.boolean(),
        novelID: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.novel.update({
        where: { id: input.novelID },
        data:
          input.og ?
            { ogname: input.name }
          : { tlname: input.name },
      });
      return result;
    }),
  changeNovelDescription: publicProcedure
    .input(
      z.object({
        desc: z.string(),
        og: z.boolean(),
        novelID: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.novel.update({
        where: { id: input.novelID },
        data:
          input.og ?
            { ogdesc: input.desc }
          : { tldesc: input.desc },
      });
      return result;
    }),
  addChapter: publicProcedure
    .input(
      z.object({
        name: z.string(),
        novelID: z.string(),
        ognum: z.number(),
        url: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { name, novelID, url, ognum } = input;
      const result = await ctx.db.chapter.create({
        data: {
          ogname: name,
          url,
          novelID,
          num: `${ognum}`,
          ognum,
        },
      });
      console.log("added chapter", result);
      return result;
    }),
});
