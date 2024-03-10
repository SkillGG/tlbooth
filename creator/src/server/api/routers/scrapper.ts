import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { type Novel } from "@prisma/client";
import { z } from "zod";

import { parse } from "node-html-parser"

const ScrapperFilter = z.object({ search: z.string().optional() });

export type ScrapperFilter = z.infer<typeof ScrapperFilter>

const ScrapperNovelInfo = z.object({
  url: z.string().url(),
  name: z.string().min(1)
})

type ScrapperNovelInfo = z.infer<typeof ScrapperNovelInfo>

const ScrapperChapterInfo = z.object({
  url: z.string().url(),
  name: z.string().min(1)
});

const ScrapperChapter = z.object({
  info: ScrapperChapterInfo,
  lines: z.array(z.string())
})

type ScrapperChapter = z.infer<typeof ScrapperChapter>

const ScrapperNovel = z.object({
  info: ScrapperNovelInfo,
  chapters: z.array(ScrapperChapterInfo)
});

type ScrapperNovel = z.infer<typeof ScrapperNovel>

const uri = (s: string) => encodeURIComponent(s);

export const scrapperRouter = createTRPCRouter({
  getList: publicProcedure.input(ScrapperFilter.optional()).query(async ({ ctx: _ }): Promise<ScrapperNovelInfo[]> => {
    //

    const siteHTML = await (await fetch("https://yomou.syosetu.com/search.php")).text();

    const parsed = parse(siteHTML);

    const main = parsed.querySelectorAll(".searchkekka_box");

    const novels = main.map<ScrapperNovelInfo | null>(p => {
      const header = p.querySelector(".novel_h");
      console.log(header);
      const anchor = header?.querySelector("a");
      const href = anchor?.getAttribute("href");
      console.log(anchor, href);
      if (header && href) {
        return { name: header.text, url: href } satisfies ScrapperNovelInfo
      } else {
        return null;
      }
    });

    const retVal: ScrapperNovelInfo[] = []

    console.log(novels);

    novels.forEach(p => {
      if (p) {
        retVal.push(p);
      }
    });

    return retVal;
  }),
  getNovel: publicProcedure.input(z.string().url().startsWith("https://ncode.syosetu.com")).query(async ({ ctx: _, input: url }): Promise<ScrapperNovel> => {

    const novel = await (await fetch(url)).text();

    console.log(novel);

    return { info: { url, name: "" }, chapters: [{ name: "Ch1", url: uri("https://google.com/ch1"), }] }
  }),
  getChapter: publicProcedure.input(ScrapperChapterInfo).query(async ({ ctx: _, input }): Promise<ScrapperChapter> => {
    return { info: input, lines: [] };
  })
});
