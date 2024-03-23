import {
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import { z } from "zod";

import { parse } from "node-html-parser";
import { Agent, request } from "https";
import fetch from "node-fetch";
import { DummyNovels } from "./dummyData/dummyNovels";

export const ScrapperFilter = z.object({
  search: z.string().optional(),
});

export const ScrapperNovelInfo = z.object({
  url: z.string().url(),
  description: z.string(),
  name: z.string().min(1),
});

export const ScrapperChapterInfo = z.object({
  url: z.string().url(),
  name: z.string().min(1),
  num: z.string(),
});

export const ScrapperChapter = z.object({
  info: ScrapperChapterInfo,
  lines: z.array(z.string()),
});

export const ScrapperNovel = z.object({
  info: ScrapperNovelInfo,
  chapters: z.array(ScrapperChapterInfo),
});

export type ScrapperFilter = z.infer<typeof ScrapperFilter>;
export type ScrapperNovelInfo = z.infer<
  typeof ScrapperNovelInfo
>;
export type ScrapperChapter = z.infer<
  typeof ScrapperChapter
>;
export type ScrapperChapterInfo = z.infer<
  typeof ScrapperChapterInfo
>;
export type ScrapperNovel = z.infer<typeof ScrapperNovel>;

const uri = (s: string) => encodeURIComponent(s);

const devTest = true;

export const scrapperRouter = createTRPCRouter({
  getListDummy: publicProcedure.query(
    async ({ ctx: _ }): Promise<ScrapperNovelInfo[]> => {
      return DummyNovels.map<ScrapperNovelInfo>(
        (n) => n.info,
      );
    },
  ),
  getList: publicProcedure
    .input(ScrapperFilter.optional())
    .query(
      async ({
        ctx: _,
      }): Promise<
        | ScrapperNovelInfo[]
        | { error: string; allowTestData: boolean }
      > => {
        const rS = await fetch(
          "https://yomou.syosetu.com/search.php",
        ).then((r) => {
          console.log(r);
          return r.text();
        });

        if (!rS || devTest)
          return {
            error:
              "That part is only available in admin mode!",
            allowTestData: true,
          };

        const parsed = parse(rS);

        const main = parsed.querySelectorAll(
          ".searchkekka_box",
        );

        const novels = main.map<ScrapperNovelInfo | null>(
          (p) => {
            const header = p.querySelector(".novel_h");
            const anchor = header?.querySelector("a");
            const href = anchor?.getAttribute("href");
            if (header && href) {
              return {
                name: header.text,
                url: uri(href),
                description: "",
              };
            } else {
              return null;
            }
          },
        );

        const retVal: ScrapperNovelInfo[] = [];

        novels.forEach((p) => {
          if (p) {
            retVal.push(p);
          }
        });

        return retVal;
      },
    ),
  getNovel: publicProcedure
    .input(z.string())
    .query(
      async ({
        ctx: _,
        input,
      }): Promise<ScrapperNovel | { error: string }> => {
        // const urlI = new URL(decodeURIComponent(input));
        if (input.startsWith("http://dummy.com")) {
          // getting dummy novel data
          const novel = DummyNovels.find(
            (d) => d.info.url === input,
          );
          if (novel)
            return {
              ...novel,
              chapters: novel.chapters.map((c) => c.info),
            };
          return {
            error: "Could not find the dummy novel!",
          };
        }

        return {
          info: {
            url: "https://testnovel.com/1",
            name: "",
            description: "",
          },
          chapters: [
            {
              name: "テスト章 1 Staged",
              num: "1",
              url: "https://testnovel.com/1/1",
            },
            {
              name: "テスト章 1.5 PR",
              num: "1.5",
              url: "https://testnovel.com/1/1.5",
            },
            {
              name: "テスト章 3 TLd",
              num: "2",
              url: "https://testnovel.com/1/3",
            },
            {
              name: "Test chapter 2.5",
              num: "2.5",
              url: "https://testnovel.com/1/2.5",
            },
            {
              name: "Test chapter 4",
              num: "4",
              url: "https://testnovel.com/1/4",
            },
            {
              name: "Test chapter 5",
              num: "5",
              url: "https://testnovel.com/1/5",
            },
          ],
        };
      },
    ),
  getChapter: publicProcedure
    .input(ScrapperChapterInfo)
    .query(
      async ({
        ctx: _,
        input,
      }): Promise<ScrapperChapter> => {
        return { info: input, lines: [] };
      },
    ),
});
