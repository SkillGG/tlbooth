import {
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import { z } from "zod";

import { parse } from "node-html-parser";

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

const syoHeaders = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0",
  Host: "yomou.syosetu.com",
};
export const scrapperRouter = createTRPCRouter({
  getList: publicProcedure
    .input(ScrapperFilter.optional())
    .query(
      async ({
        ctx: _,
      }): Promise<
        | ScrapperNovelInfo[]
        | { error: string; body: string }
      > => {
        console.log("fetch", syoHeaders);

        const result = await fetch(
          "https://yomou.syosetu.com/search.php",
          {
            headers: syoHeaders,
          },
        );

        if (!result.ok) {
          return {
            error: result.statusText,
            body: await result.text(),
          };
        }

        const siteHTML = await result.text();

        const parsed = parse(siteHTML);

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
        input: __,
      }): Promise<ScrapperNovel> => {
        console.log("getting the novel");

        // const urlI = new URL(decodeURIComponent(input));

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
