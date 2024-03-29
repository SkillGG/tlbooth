import {
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import { z } from "zod";

import { parse } from "node-html-parser";
import { DummyNovels } from "./dummyData/dummyNovels";
import { env } from "@/env";
import { Clerk } from "@clerk/nextjs/server";

export const ScrapperFilter = z.object({
  search: z.string().optional(),
});

export const ScrapperNovelInfo = z.object({
  novelURL: z.string().url(),
  novelDescription: z.string(),
  novelName: z.string().min(1),
});

export const ScrapperChapterInfo = z.object({
  url: z.string().url(),
  name: z.string().min(1),
  ognum: z.number(),
});

export const ScrapperTextLine = z.object({
  pos: z.number(),
  text: z.string(),
});

export const ScrapperChapter = z.object({
  info: ScrapperChapterInfo,
  lines: z.array(ScrapperTextLine),
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

export type ScrapperTextLine = z.infer<
  typeof ScrapperTextLine
>;

const fetchDirectly = async ({
  syo,
  pages,
}: {
  syo: string;
  pages: string[];
}) => {
  const url = `https://${syo ? syo + "." : ""}syosetu.com${pages.reduce((p, n) => p + "/" + n, "")}`;
  console.log("Fetching directly", url);
  const res = await fetch(url);
  if (!res.ok) {
    throw "Fetching data unsuccessful";
  }
  const text = await res.text();
  return text;
};
const fetchFromProxy = async (data: {
  syo: string;
  pages: string[];
}) => {
  console.log("Fetching via proxy");
  const res = await fetch(env.FN_GET_NOVEL_URL, {
    method: "post",
    headers: { Authorization: `bearer ${env.GCLOUD_KEY}` },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw "Fetching data unsuccessful";
  }

  const text = await res.text();
  return text;
};

const fetchSyo = async (syo: string, pages: string[]) => {
  const isRemote = env.IS_REMOTE === "true";
  const data = {
    syo,
    pages,
  };

  console.log("fetching from ", isRemote ? "proxy" : "syo");

  const rS =
    isRemote ?
      await fetchFromProxy(data)
    : await fetchDirectly(data);
  return rS;
};

const syoifyURL = (
  url: string,
): { syo: string; pages: string[] } | { error: string } => {
  const urlData = /\/\/(.*)\.syosetu.com\/(.*)/.exec(url);

  if (!urlData) return { error: "Unknown novel link!" };
  const [, syo, pages] = urlData;
  if (!syo || !pages)
    return { error: "Unknown novel link!" };
  return { syo, pages: [pages] };
};

const getParsedSyo = async (
  syo: string,
  pages: string[],
) => {
  const rS = await fetchSyo(syo, pages);
  const parsed = parse(rS);
  return parsed;
};

const uri = (s: string) => encodeURIComponent(s);
const unuri = (s: string) => decodeURIComponent(s);

const isAdmin = async (auth?: string) => {
  console.log("auth", auth);
  if (!auth) return false;
  const clerk = Clerk({ secretKey: env.CLERK_SECRET_KEY });
  if (clerk) {
    const user = await clerk.users.getUser(auth);
    if (!user) return false;
    return user.privateMetadata.type === "admin";
  }
  return false;
};

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
        ctx,
        input,
      }): Promise<
        | ScrapperNovelInfo[]
        | { error: string; allowTestData: boolean }
      > => {
        try {
          const admin = await isAdmin(ctx.id);

          if (!admin) throw "User is not an admin";

          let filterString = "";

          if (input) {
            const url = new URL("https://example.com");
            if (input.search)
              url.searchParams.set("word", input.search);
            filterString = url.search;
          }
          console.log("input", input, filterString);

          const parsed = await getParsedSyo("yomou", [
            `search.php${filterString}`,
          ]);

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
                  novelName: header.text,
                  novelURL: href,
                  novelDescription: "",
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
        } catch (e) {
          console.error(e);
          return {
            error:
              "That part is only available in admin mode!",
            allowTestData: true,
          };
        }
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
            (d) => d.info.novelURL === input,
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

        const url = unuri(input);

        const syoified = syoifyURL(url);

        if ("error" in syoified) throw syoified;

        const parsed = await getParsedSyo(
          syoified.syo,
          syoified.pages,
        );

        let chapPageParsed = parsed;
        const chaptersDLs: ReturnType<
          (typeof chapPageParsed)["querySelectorAll"]
        > = [];
        let nextPageAnchor: ReturnType<
          (typeof chapPageParsed)["querySelector"]
        >;
        do {
          chaptersDLs.push(
            ...chapPageParsed.querySelectorAll(
              ".index_box > dl",
            ),
          );
          nextPageAnchor = chapPageParsed.querySelector(
            "a.novelview_pager-next",
          );
          if (nextPageAnchor) {
            console.log("found next page!");
            const href =
              nextPageAnchor.getAttribute("href");
            if (!href) break;
            const syoed = syoifyURL(
              new URL(href, url).href,
            );
            if ("error" in syoed) throw syoed;
            chapPageParsed = await getParsedSyo(
              syoed.syo,
              syoed.pages,
            );
          }
        } while (nextPageAnchor);
        const chapters: ScrapperChapterInfo[] = [];
        const name =
          parsed.querySelector(".novel_title")?.innerText ??
          "";
        let desc = "";
        if (chaptersDLs.length === 0) {
          console.log("oneshot!");
          chapters.push({
            name: "Oneshot",
            ognum: 0,
            url,
          });
        } else {
          const chs =
            chaptersDLs.map<ScrapperChapterInfo | null>(
              (elem, i) => {
                const sub =
                  elem.querySelector(".subtitle a");
                if (!sub) return null;
                const href = sub.getAttribute("href");
                if (!href) return null;
                return {
                  name: sub.innerText,
                  ognum: i + 1,
                  url: new URL(href, url).href,
                };
              },
            );
          for (const ch of chs) {
            if (ch) chapters.push(ch);
          }

          desc =
            parsed.querySelector("#novel_ex")?.innerText ??
            "";
        }

        return {
          chapters,
          info: {
            novelURL: url,
            novelDescription: desc,
            novelName: name,
          },
        };
      },
    ),
  getChapter: publicProcedure
    .input(
      z.object({
        novelURL: z.string(),
        chapterURL: z.string(),
      }),
    )
    .query(
      async ({
        ctx: _,
        input,
      }): Promise<ScrapperChapter | { error: string }> => {
        if (input.novelURL.startsWith("http://dummy")) {
          const novel = DummyNovels.find(
            (n) => n.info.novelURL === input.novelURL,
          );
          if (!novel)
            return { error: "Incorrect dummy novel" };
          const chap = novel.chapters.find(
            (ch) => ch.info.url === input.chapterURL,
          );
          if (!chap)
            return { error: "Incorrect chapter url" };
          return chap;
        }

        return { error: "TODO" };
      },
    ),
});
