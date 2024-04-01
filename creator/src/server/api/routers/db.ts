import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import {
  type Novel,
  type Prisma,
  type Translation,
} from "@prisma/client";
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

const langEnum = z.enum(["PL", "EN", "JP"]);
const tlStageEnum = z.enum([
  "STAGED",
  "TL",
  "PR",
  "PUBLISH",
]);

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
          ogdesc: input.novelDescription,
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
          chapters: {
            every: {
              novelID: input,
              translations: { every: {} },
            },
          },
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

  /// Chapters
  addChapter: publicProcedure
    .input(
      z.object({
        name: z.string(),
        novelID: z.string(),
        ognum: z.number(),
        url: z.string(),
        date: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { name, novelID, url, ognum, date } = input;
      const result = await ctx.db.chapter.create({
        data: {
          ogname: name,
          url,
          novelID,
          num: `${ognum}`,
          ognum,
          publishdate: date,
        },
      });
      return result;
    }),
  changeChapterNumber: publicProcedure
    .input(
      z.object({ chapterID: z.string(), num: z.string() }),
    )
    .mutation(
      async ({ ctx, input: { chapterID, num } }) => {
        const result = await ctx.db.chapter.update({
          where: { id: chapterID },
          data: { num },
        });
        return result;
      },
    ),
  changeChapterName: publicProcedure
    .input(
      z.object({
        name: z.string(),
        og: z.boolean(),
        chapterID: z.string(),
      }),
    )
    .mutation(
      async ({ ctx, input: { chapterID, og, name } }) => {
        const result = await ctx.db.chapter.update({
          where: { id: chapterID },
          data: og ? { ogname: name } : { tlname: name },
        });
        return result;
      },
    ),

  /// Translations
  addTL: publicProcedure
    .input(
      z.object({
        oglang: langEnum,
        status: tlStageEnum,
        tllang: langEnum,
        chapterID: z.string(),
      }),
    )
    .mutation(
      async ({
        ctx,
        input: { oglang, status, chapterID, tllang },
      }): Promise<Translation> => {
        const result = await ctx.db.translation.create({
          data: {
            oglang: oglang,
            status: status,
            tllang: tllang,
            chapterID,
          },
        });
        return result;
      },
    ),
  removeTL: publicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.translation.delete({
        where: {
          id: input,
          lines: { every: { textID: input } },
        },
      });
      return result;
    }),
});
