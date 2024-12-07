import { z } from "zod";

import {
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import {
  CHANGE_TYPE,
  type PrismaClient,
  type Novel,
  type Prisma,
  type Translation,
} from "@prisma/client";
import { ScrapperNovelInfo } from "./scrapper";

export type RegisterNovelChange = null;

export type ChangeData = RegisterNovelChange;

export type DBNovel = Prisma.NovelGetPayload<{
  include: {
    chapters: {
      include: {
        translations: { include: { lines: true } };
      };
    };
  };
}>;

const mutationDate = z.date().or(z.string());

const langEnum = z.enum(["PL", "EN", "JP"]);
const tlStatusEnum = z.enum([
  "STAGED",
  "TL",
  "PR",
  "PUBLISH",
]);
const lineStatusEnum = z.enum(["STAGED", "TL", "PR"]);

const saveChange = async <T>(
  ctx: { id: string; db: PrismaClient },
  data: {
    changeData?: T;
    changedID: string;
    changeType: CHANGE_TYPE;
    date?: Date | string;
  },
) => {
  await ctx.db.changes.create({
    data: {
      ...data,
      date: data.date ? new Date(data.date) : new Date(),
      user: ctx.id,
      changeData: JSON.stringify(data.changeData ?? null),
    },
  });
};

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

    const changes = await ctx.db.changes.findMany({
      select: {
        date: true,
        changedID: true,
        changeType: true,
        changeData: true,
      },
      where: {
        OR: [
          { changeType: "CREATE" },
          { changeType: "EDIT" },
        ],
      },
    });

    const creates = changes.filter(
      (f) => f.changeType === "CREATE",
    );
    const edits = changes
      .filter((f) => f.changeType === "EDIT")
      .reverse();

    return novels.map((n) => {
      const createdAt =
        creates.find((c) => c.changedID === n.id)?.date ??
        new Date();

      return {
        ...n,
        chapters: n.chapters.map((ch) => {
          const createdAt = creates
            .filter((c) => c.changeType === "CREATE")
            .find((c) => c.changedID === ch.id)?.date;

          console.log(
            `Changes of chapter: ${ch.ogname}(${ch.id} from ${ch.novelID})`,
            changes.filter((c) => c.changedID === ch.id),
          );

          return {
            ...ch,
            translations: ch.translations.map((tl) => {
              const createdAt = creates.find(
                (f) => f.changedID === tl.id,
              )?.date;
              return {
                ...tl,
                lines: tl.lines.map((line) => {
                  const createdAt = creates.find(
                    (f) => f.changedID === line.id,
                  )?.date;
                  return {
                    ...line,
                    createdAt,
                    lastUpdatedAt:
                      edits.find(
                        (c) => c.changedID === line.id,
                      )?.date ?? createdAt,
                  };
                }),
                createdAt,
                lastUpdatedAt:
                  edits.find((c) => c.changedID === tl.id)
                    ?.date ?? createdAt,
              };
            }),
            createdAt,
            lastUpdatedAt:
              edits.find((c) => c.changedID === ch.id)
                ?.date ?? createdAt,
          };
        }),
        createdAt,
        lastUpdatedAt:
          edits.find((c) => c.changedID === n.id)?.date ??
          createdAt,
      };
    });
  }),
  registerNovel: publicProcedure
    .input(
      ScrapperNovelInfo.and(
        z.object({ createdAt: z.date() }),
      ),
    )
    .mutation(async ({ ctx, input }): Promise<Novel> => {
      const result = await ctx.db.novel.create({
        data: {
          url: input.novelURL,
          ogname: input.novelName,
          ogdesc: input.novelDescription,
          author: "",
        },
      });

      await saveChange(ctx, {
        changedID: result.id,
        changeType: CHANGE_TYPE.CREATE,
        date: input.createdAt,
      });

      return result;
    }),
  removeNovel: publicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.novel.delete({
        where: {
          id: input,
        },
      });

      await saveChange(ctx, {
        changeData: { ...result },
        changedID: input,
        changeType: "REMOVE",
      });

      return result;
    }),
  changeNovelName: publicProcedure
    .input(
      z.object({
        name: z.string(),
        og: z.boolean(),
        novelID: z.string(),
        mutationDate,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const data =
        input.og ?
          { ogname: input.name }
        : { tlname: input.name };
      const result = await ctx.db.novel.update({
        where: { id: input.novelID },
        data,
      });

      await saveChange(ctx, {
        changeData: data,
        changedID: result.id,
        changeType: "EDIT",
        date: input.mutationDate,
      });

      return result;
    }),
  changeNovelDescription: publicProcedure
    .input(
      z.object({
        desc: z.string(),
        og: z.boolean(),
        novelID: z.string(),
        mutationDate,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const data =
        input.og ?
          { ogdesc: input.desc }
        : { tldesc: input.desc };
      const result = await ctx.db.novel.update({
        where: { id: input.novelID },
        data,
      });

      await saveChange(ctx, {
        changeData: data,
        changedID: result.id,
        changeType: "EDIT",
        date: input.mutationDate,
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
        mutationDate,
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

      await saveChange(ctx, {
        changedID: result.id,
        changeType: "CREATE",
        changeData: { novelID },
        date: input.mutationDate,
      });

      return result;
    }),
  changeChapterNumber: publicProcedure
    .input(
      z.object({
        chapterID: z.string(),
        num: z.string(),
        mutationDate,
      }),
    )
    .mutation(
      async ({
        ctx,
        input: { chapterID, num, mutationDate },
      }) => {
        const result = await ctx.db.chapter.update({
          where: { id: chapterID },
          data: { num },
        });

        await saveChange(ctx, {
          changedID: result.id,
          changeData: { num, novelID: result.novelID },
          changeType: "CREATE",
          date: mutationDate,
        });

        return result;
      },
    ),
  changeChapterName: publicProcedure
    .input(
      z.object({
        name: z.string(),
        og: z.boolean(),
        mutationDate,
        chapterID: z.string(),
      }),
    )
    .mutation(
      async ({
        ctx,
        input: { chapterID, og, name, mutationDate },
      }) => {
        const data =
          og ? { ogname: name } : { tlname: name };
        const result = await ctx.db.chapter.update({
          where: { id: chapterID },
          data,
        });

        await saveChange(ctx, {
          changedID: result.id,
          changeType: "EDIT",
          changeData: { ...data, novelID: result.novelID },
          date: mutationDate,
        });

        return result;
      },
    ),
  removeChapter: publicProcedure
    .input(
      z.object({
        novelID: z.string(),
        chapterID: z.string(),
      }),
    )
    .mutation(
      async ({ ctx, input: { novelID, chapterID } }) => {
        const result = await ctx.db.chapter.delete({
          where: { novelID, id: chapterID },
        });

        await saveChange(ctx, {
          changedID: result.id,
          changeType: "REMOVE",
          changeData: { ...result },
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
        mutationDate,
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
          mutationDate,
        },
      }): Promise<Translation> => {
        const result = await ctx.db.translation.create({
          data: {
            oglang: oglang,
            status: status,
            tllang: tllang,
            chapterID,
          },
        });

        await saveChange(ctx, {
          changedID: result.id,
          changeType: "CREATE",
          date: mutationDate,
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
        },
      });

      await saveChange(ctx, {
        changedID: input,
        changeType: "REMOVE",
        changeData: { ...result },
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
        mutationDate,
      }),
    )
    .mutation(
      async ({
        ctx,
        input: { lines, tlID, mutationDate },
      }) => {
        await ctx.db.textLine.deleteMany({
          where: { textID: tlID },
        });
        const result = await ctx.db.translation.update({
          where: { id: tlID },
          include: { lines: true },
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

        const resultLines = result.lines;

        await ctx.db.changes.createMany({
          data: resultLines.map((line) => {
            return {
              changedID: line.id,
              changeData: { ...line },
              changeType: "CREATE",
              date: mutationDate,
              user: ctx.id,
            };
          }),
        });

        return result;
      },
    ),
  changeLine: publicProcedure
    .input(
      z.object({
        lineID: z.string(),
        value: z
          .object({ text: z.string(), og: z.boolean() })
          .optional(),
        status: lineStatusEnum.optional(),
        mutationDate,
      }),
    )
    .mutation(
      async ({
        ctx,
        input: { lineID, status, value, mutationDate },
      }) => {
        const data =
          value ?
            value.og ?
              { ogline: value.text }
            : { tlline: value.text }
          : undefined;
        const result = await ctx.db.textLine.update({
          where: { id: lineID },
          data: {
            status,
            ...data,
          },
        });

        await saveChange(ctx, {
          changedID: result.id,
          changeData: { ...data },
          changeType: "EDIT",
          date: mutationDate,
        });

        return result;
      },
    ),
  changeTLStatus: publicProcedure
    .input(
      z.object({
        tlID: z.string(),
        status: tlStatusEnum,
        mutationDate,
      }),
    )
    .mutation(
      async ({
        ctx,
        input: { tlID, status, mutationDate },
      }) => {
        const result = await ctx.db.translation.update({
          where: { id: tlID },
          data: { status },
        });

        await saveChange(ctx, {
          changedID: result.id,
          changeData: { status },
          date: mutationDate,
          changeType: "EDIT",
        });

        return result;
      },
    ),
  removeLine: publicProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: lineID }) => {
      const result = await ctx.db.textLine.delete({
        where: { id: lineID },
      });
      await saveChange(ctx, {
        changedID: result.id,
        changeType: "REMOVE",
        changeData: new Date(),
      });
      return result;
    }),
});
