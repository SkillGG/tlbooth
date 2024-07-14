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
const tlStatusEnum = z.enum([
  "STAGED",
  "TL",
  "PR",
  "PUBLISH",
]);
const lineStatusEnum = z.enum(["STAGED", "TL", "PR"]);

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
          author: "",
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
        date: z.date(),
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
          ogPub: date,
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
        status: tlStatusEnum,
        tllang: langEnum,
        chapterID: z.string(),
        author: z.string(),
        lastEditDate: z.date(),
        pubDate: z.date(),
      }),
    )
    .mutation(
      async ({
        ctx,
        input: {
          oglang,
          status,
          chapterID,
          tllang,
          author,
          lastEditDate,
          pubDate,
        },
      }): Promise<Translation> => {
        const result = await ctx.db.translation.create({
          data: {
            oglang: oglang,
            status: status,
            tllang: tllang,
            chapterID,
            author,
            publishDate: pubDate,
            lastEditDate: lastEditDate,
            editAuthors: [author],
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
  initLines: publicProcedure
    .input(
      z.object({
        lines: z.array(
          z.object({
            ogline: z.string(),
            pos: z.number(),
          }),
        ),
        tlID: z.string(),
      }),
    )
    .mutation(async ({ ctx, input: { lines, tlID } }) => {
      await ctx.db.textLine.deleteMany({
        where: { textID: tlID },
      });
      const result = await ctx.db.translation.update({
        where: { id: tlID },
        data: {
          lines: {
            create: lines.map((line) => ({
              ...line,
              tlline: "",
              status: "STAGED",
            })),
          },
        },
      });
      return result;
    }),
  changeLine: publicProcedure
    .input(
      z.object({
        lineID: z.string(),
        value: z
          .object({ text: z.string(), og: z.boolean() })
          .optional(),
        status: lineStatusEnum.optional(),
      }),
    )
    .mutation(
      async ({ ctx, input: { lineID, status, value } }) => {
        const result = await ctx.db.textLine.update({
          where: { id: lineID },
          data: {
            status,
            ...(value ?
              value.og ?
                { ogline: value.text }
              : { tlline: value.text }
            : undefined),
          },
        });
        return result;
      },
    ),
  changeTLStatus: publicProcedure
    .input(
      z.object({ tlID: z.string(), status: tlStatusEnum }),
    )
    .mutation(async ({ ctx, input: { tlID, status } }) => {
      const result = await ctx.db.translation.update({
        where: { id: tlID },
        data: { status },
      });
      return result;
    }),
  removeLine: publicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: lineID }) => {
      const result = await ctx.db.textLine.delete({
        where: { id: lineID },
      });
      return result;
    }),
});
