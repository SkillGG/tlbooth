import { type DBNovel } from "@/server/api/routers/db";
import { api } from "@/utils/api";
import { create } from "zustand";
import deepEquals from "fast-deep-equal";

import { trpcClient } from "@/pages/_app";
import {
  ScrapperChapter,
  ScrapperNovel,
  ScrapperNovelInfo,
} from "@/server/api/routers/scrapper";

type NovelStore = {
  novels: StoreNovel[] | null;
  mutations: Mutation[];
  undoneMutations: Mutation[];
  loadData: (remote: NovelStore["novels"]) => void;
  mutate: (t: Mutation, override?: boolean) => void;
  removeMutation: (id: string) => void;
  undo: (id: string) => void;
  redo: (id: string) => void;
  getMutated: () => StoreNovel[] | null;

  getNovel: (id: string) => StoreNovel | null;
  getDBNovel: (id: string) => StoreNovel | null;
  getNovelByURL: (url: string) => StoreNovel | null;
  getDBNovelByURL: (url: string) => StoreNovel | null;

  getChapter: (
    novelId: string,
    chapterId: string,
  ) => StoreChapter | null;
  getDBChapter: (
    novelId: string,
    chapterId: string,
  ) => StoreChapter | null;
  getDBChapterByURL: (
    novelId: string,
    url: string,
  ) => StoreChapter | null;
  getChapterByURL: (
    novelId: string,
    chapterId: string,
  ) => StoreChapter | null;

  apply: () => Promise<(() => void)[]>;
};

export type StoreNovel = DBNovel & {
  local?: true;
  forDeletion?: true;
};

export type StoreChapter = StoreNovel["chapters"][number];

export enum MutationType {
  CHANGE_TITLE = "Change Title",
  ADD_NOVEL = "Add Novel",
  STAGE_CHAPTER = "Add Chapter",
  DELETE_NOVEL = "Delete Novel",
  CHANGE_DESC = "Change description",
}

type MutationDescription =
  | string
  | ((p: StoreNovel[]) => string);

export type Dependency = {
  novelId: string;
};

export class Mutation {
  fn: (p: StoreNovel[]) => StoreNovel[];
  desc: MutationDescription;
  type: MutationType;
  id: string;
  apiFn: () => Promise<void>;
  dependencies: Dependency[];
  constructor(
    id: string,
    fn: (p: StoreNovel[]) => StoreNovel[],
    desc: MutationDescription,
    type: MutationType,
    apiFn: () => Promise<void>,
    dependencies: Dependency[],
  ) {
    this.fn = fn;
    this.id = id;
    this.desc = desc;
    this.type = type;
    this.apiFn = apiFn;
    this.dependencies = dependencies;
  }
  getDesc(n: StoreNovel[]) {
    return typeof this.desc === "function" ?
        this.desc(n)
      : this.desc;
  }
  static addNovelID = 0;
  static addNovel(
    url: string,
    name: string,
    description: string,
  ) {
    const novel: StoreNovel = {
      id: `localnovel_${++this.addNovelID}`,
      chapters: [],
      ogname: name,
      tlname: "",
      url,
      local: true,
      ogdesc: "",
      tldesc: "",
    };
    return new Mutation(
      `add_novel_${url}`,
      (p) => [...p, novel],
      name,
      MutationType.ADD_NOVEL,
      async () => {
        await trpcClient.db.registerNovel.mutate({
          name,
          url,
          description,
        });
      },
      [{ novelId: novel.id }],
    );
  }
  static removeNovel(id: string) {
    return new Mutation(
      `remove_novel_${id}`,
      (p) =>
        p.map((n) =>
          n.id === id ? { ...n, forDeletion: true } : n,
        ),
      (p) => p.find((x) => x.id === id)?.ogname ?? id,
      MutationType.DELETE_NOVEL,
      async () => {
        await trpcClient.db.removeNovel.mutate(id);
      },
      [{ novelId: id }],
    );
  }
  static changeOGName(id: string, name: string) {
    return new Mutation(
      `change_ogname_${id}`,
      (p) =>
        p.map((n) =>
          n.id === id ? { ...n, ogname: name } : n,
        ),
      name,
      MutationType.CHANGE_TITLE,
      async () => {
        // await trpcClient.db.updateNovel.mutate({ id, tlname: name });
        console.error("TODO:");
      },
      [{ novelId: id }],
    );
  }
  static changeTLName(id: string, name: string) {
    return new Mutation(
      `change_tlname_${id}`,
      (p) =>
        p.map((n) =>
          n.id === id ? { ...n, tlname: name } : n,
        ),
      name,
      MutationType.CHANGE_TITLE,
      async () => {
        // await trpcClient.db.updateNovel.mutate({ id, tlname: name });
        console.error("TODO:");
      },
      [{ novelId: id }],
    );
  }
  static changeTLDesc(id: string, desc: string) {
    return new Mutation(
      `change_tldesc_${id}`,
      (p) =>
        p.map((n) =>
          n.id === id ? { ...n, tldesc: desc } : n,
        ),
      desc.substring(0, 10),
      MutationType.CHANGE_DESC,
      async () => {
        // TODO
      },
      [{ novelId: id }],
    );
  }
  static changeOGDesc(id: string, desc: string) {
    return new Mutation(
      `change_ogdesc_${id}`,
      (p) =>
        p.map((n) =>
          n.id === id ? { ...n, ogdesc: desc } : n,
        ),
      desc.substring(0, 10),
      MutationType.CHANGE_DESC,
      async () => {
        // TODO
      },
      [{ novelId: id }],
    );
  }
  static stageChapterId = 0;
  static stageChapter(
    novelId: string,
    chapter: ScrapperNovel["chapters"][number],
  ) {
    return new Mutation(
      `stage_chapter_${chapter.url}`,
      (p) =>
        p.map((n) => {
          return n.id === novelId ?
              {
                ...n,
                chapters: [
                  ...n.chapters,
                  {
                    id: `staged_chapter_${++Mutation.stageChapterId}`,
                    novelId,
                    num: chapter.num,
                    ogname: chapter.name,
                    url: chapter.url,
                    status: "STAGED",
                    tlname: "",
                    translations: [],
                  },
                ],
              }
            : n;
        }),
      chapter.name,
      MutationType.STAGE_CHAPTER,
      async () => {
        // TODO
      },
      [{ novelId }],
    );
  }
}

export const useNovelStore = create<NovelStore>()(
  (set, get) => ({
    novels: null,
    mutations: [],
    undoneMutations: [],
    getDBNovel: (id) =>
      get().novels?.find((n) => n.id === id) ?? null,
    getNovel: (id) =>
      get()
        .getMutated()
        ?.find((n) => n.id === id) ?? null,
    getDBNovelByURL: (url) =>
      get().novels?.find((n) => n.url === url) ?? null,
    getNovelByURL: (url) =>
      get()
        .getMutated()
        ?.find((n) => n.url === url) ?? null,
    getChapter: (nId, id) =>
      get()
        .getNovel(nId)
        ?.chapters.find((c) => c.id === id) ?? null,
    getDBChapter: (nId, id) =>
      get()
        .getDBNovel(nId)
        ?.chapters.find((c) => c.id === id) ?? null,
    getChapterByURL: (nId, url) =>
      get()
        .getNovel(nId)
        ?.chapters.find((c) => c.url === url) ?? null,
    getDBChapterByURL: (nId, url) =>
      get()
        .getDBNovel(nId)
        ?.chapters.find((c) => c.url === url) ?? null,
    loadData: (remote) =>
      set((s) => ({ ...s, novels: remote })),
    mutate: (t, o = false) =>
      set((s) => {
        console.log("adding mutation", t.id);
        const muts = [
          ...get().mutations,
          ...get().undoneMutations,
        ];
        if (muts.find((m) => m.id === t.id)) {
          if (o)
            return {
              mutations: [
                ...s.mutations.filter((m) => m.id !== t.id),
                t,
              ],
            };
          return s;
        }
        return { mutations: [...s.mutations, t] };
      }),
    removeMutation: (id) =>
      set((s) => {
        console.log("removing mutation", id);
        const linkedMutations: Mutation[] = [];
        const muts = [
          ...get().mutations,
          ...get().undoneMutations,
        ];
        const thisMut = muts.find((t) => t.id === id);
        if (!thisMut) return s;
        if (thisMut.type === MutationType.ADD_NOVEL) {
          console.log("searching for linked mutations!");
          const dependants = [];
          for (const mut of muts) {
            for (const dep of mut.dependencies) {
              if (
                thisMut.dependencies.find((d) =>
                  deepEquals(d, dep),
                )
              )
                dependants.push(mut);
            }
          }
          if (dependants)
            linkedMutations.push(...dependants);
        }

        console.log("linked", linkedMutations);

        const filterFn = (x: Mutation) => {
          if (x.id === id) return false;
          if (linkedMutations.find((n) => n.id === x.id))
            return false;
          return true;
        };

        console.log(
          "bef,aft",
          s.mutations,
          s.mutations.filter(filterFn),
        );

        return {
          mutations: s.mutations.filter(filterFn),
          undoneMutations:
            s.undoneMutations.filter(filterFn),
        };
      }),
    undo: (id) => {
      set((s) => {
        const infT = s.mutations.find((t) => t.id === id);
        if (infT)
          return {
            mutations: s.mutations.filter(
              (t) => t.id !== id,
            ),
            undoneMutations: [...s.undoneMutations, infT],
          };
        else return s;
      });
    },
    redo: (id) => {
      set((s) => {
        const infT = s.undoneMutations.find(
          (t) => t.id === id,
        );
        if (!infT) return s;
        return {
          mutations: [...s.mutations, infT],
          undoneMutations: s.undoneMutations.filter(
            (t) => t.id !== id,
          ),
        };
      });
    },
    getMutated: () => {
      const remote = get().novels;
      if (!remote) return null;
      return get().mutations.reduce((p, n) => {
        return n.fn(p);
      }, remote);
    },
    apply: async () => {
      console.log("applying mutations");
      const sets: (() => void)[] = [];
      try {
        for (const mut of get().mutations) {
          await mut.apiFn();
          sets.push(() =>
            set((st) => ({
              mutations: st.mutations.filter(
                (f) => f.id !== mut.id,
              ),
            })),
          );
        }
      } catch (e) {
        console.error(e);
      }
      return sets;
    },
  }),
);
