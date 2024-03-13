import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { type Novel } from "@prisma/client";
import { z } from "zod";

import { parse } from "node-html-parser"

export const ScrapperFilter = z.object({ search: z.string().optional() });


export const ScrapperNovelInfo = z.object({
  url: z.string().url(),
  name: z.string().min(1)
})


export const ScrapperChapterInfo = z.object({
  url: z.string().url(),
  name: z.string().min(1)
});

export const ScrapperChapter = z.object({
  info: ScrapperChapterInfo,
  lines: z.array(z.string())
})


export const ScrapperNovel = z.object({
  info: ScrapperNovelInfo,
  chapters: z.array(ScrapperChapterInfo)
});

export type ScrapperFilter = z.infer<typeof ScrapperFilter>
export type ScrapperNovelInfo = z.infer<typeof ScrapperNovelInfo>
export type ScrapperChapter = z.infer<typeof ScrapperChapter>
export type ScrapperNovel = z.infer<typeof ScrapperNovel>

const uri = (s: string) => encodeURIComponent(s);

export const scrapperRouter = createTRPCRouter({
  getList: publicProcedure.input(ScrapperFilter.optional()).query(async ({ ctx: _ }): Promise<ScrapperNovelInfo[]> => {
    //

    const siteHTML = await (await fetch("https://yomou.syosetu.com/search.php")).text();

    const parsed = parse(siteHTML);

    const main = parsed.querySelectorAll(".searchkekka_box");

    const novels = main.map<ScrapperNovelInfo | null>(p => {
      const header = p.querySelector(".novel_h");
      const anchor = header?.querySelector("a");
      const href = anchor?.getAttribute("href");
      if (header && href) {
        return { name: header.text, url: href } satisfies ScrapperNovelInfo
      } else {
        return null;
      }
    });

    const retVal: ScrapperNovelInfo[] = []

    novels.forEach(p => {
      if (p) {
        retVal.push(p);
      }
    });

    return retVal;
  }),
  getNovelInfo: publicProcedure.input(z.string().url().startsWith("https://ncode.syosetu.com")).query(async ({ ctx: _, input: url }): Promise<ScrapperNovel> => {
    const novel = await (await fetch(url)).text();
    return { info: { url, name: "" }, chapters: [{ name: "Ch1", url: uri("https://google.com/ch1"), }] }
  }),
  getChapter: publicProcedure.input(ScrapperChapterInfo).query(async ({ ctx: _, input }): Promise<ScrapperChapter> => {
    return { info: input, lines: [] };
  })
});
