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

const fetchDirectly = async ({
  syo,
  pages,
}: {
  syo: string;
  pages: string[];
}) => {
  const url = `https://${syo ? syo + "." : ""}syosetu.com${pages.reduce((p, n) => p + "/" + n, "")}`;
  console.log("Fetching directly");
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

const uri = (s: string) => encodeURIComponent(s);

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
        input: __,
      }): Promise<
        | ScrapperNovelInfo[]
        | { error: string; allowTestData: boolean }
      > => {
        try {
          const admin = await isAdmin(ctx.id);

          if (!admin) throw "User is not an admin";

          const isRemote = env.IS_REMOTE === "true";
          const syo = {
            syo: "yomou",
            pages: ["search.php"],
          };

          const rS =
            isRemote ?
              await fetchFromProxy(syo)
            : await fetchDirectly(syo);

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
                  novelName: header.text,
                  novelURL: uri(href),
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

        return {
          info: {
            novelURL: "https://testnovel.com/1",
            novelName: "",
            novelDescription: "",
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
