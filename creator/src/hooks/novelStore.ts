import { type DBNovel } from "@/server/api/routers/db";
import { create } from "zustand";
import deepEquals from "fast-deep-equal";

import { trpcClient } from "@/pages/_app";
import type { ScrapperChapterInfo } from "@/server/api/routers/scrapper";
import type { LANG } from "@prisma/client";
import {
  MutationSavedType,
  isMutationSavedType,
  type RegularMutationData,
  MutationType,
} from "./utils/storageSaveHelpers";

type NovelStore = {
  novels: StoreNovel[] | null;
  mutations: Mutation[];
  undoneMutations: Mutation[];
  loadData: (remote: NovelStore["novels"]) => void;

  loadMutations: (l: Storage) => void;
  saveMutations: (s: Storage) => void;

  mutate: (t: Mutation, override?: boolean) => void;
  removeMutation: (id: string) => void;
  undo: (id: string) => void;
  redo: (id: string) => void;
  getMutated: () => StoreNovel[] | null;

  getNovel: (id: string) => StoreNovel | null;
  getDBNovel: (id: string) => StoreNovel | null;
  getNovelByURL: (url: string) => StoreNovel | null;
  getDBNovelByURL: (url: string) => StoreNovel | null;

  isMutation: (id: string, undone?: boolean) => boolean;
  findMutation: (
    id: string,
    undone?: boolean,
  ) => Mutation | null;
  findMutationBy: (
    n: (m: Mutation, undone?: boolean) => boolean,
  ) => Mutation | null;

  getChapter: (
    novelID: string,
    chapterID: string,
  ) => StoreChapter | null;
  getDBChapter: (
    novelID: string,
    chapterID: string,
  ) => StoreChapter | null;
  getDBChapterBy: (
    novelID: string,
    predicate: (c: StoreChapter) => boolean,
  ) => StoreChapter | null;
  getChapterBy: (
    novelID: string,
    predicate: (c: StoreChapter) => boolean,
  ) => StoreChapter | null;

  apply: () => Promise<(() => void)[]>;
};

export type StoreNovel = DBNovel & {
  local?: true;
  forDeletion?: true;
};

export type StoreChapter = StoreNovel["chapters"][number];


type MutationDescription =
  | string
  | ((p: StoreNovel[]) => string);

export type Dependency =
  | {
      novelID: string;
    }
  | { chapterID: string };

export class Mutation {
  fn: (p: StoreNovel[]) => StoreNovel[];
  desc: MutationDescription;
  type: MutationType;
  id: string;
  apiFn: () => Promise<void>;
  dependencies: Dependency[];
  data?: RegularMutationData;
  constructor(
    id: string,
    fn: (p: StoreNovel[]) => StoreNovel[],
    desc: MutationDescription,
    type: MutationType,
    apiFn: () => Promise<void>,
    dependencies: Dependency[],
    data?: RegularMutationData,
  ) {
    this.fn = fn;
    this.id = id;
    this.desc = desc;
    this.type = type;
    this.apiFn = apiFn;
    this.data = data;
    this.dependencies = dependencies;
  }
  getDesc(n: StoreNovel[]) {
    return typeof this.desc === "function" ?
        this.desc(n)
      : this.desc;
  }

  static addNovelID = 0;
  static addNovelMutationID = (novelID: string) =>
    `add_novel_${novelID}`;
  static addNovel(
    novelUrl: string,
    novelName: string,
    novelDescription: string,
    id?: string,
  ) {
    const novel: StoreNovel = {
      id: `localnovel_${id ?? ++this.addNovelID}`,
      chapters: [],
      ogname: novelName,
      tlname: "",
      url: novelUrl,
      local: true,
      ogdesc: "",
      tldesc: "",
    };
    const type = MutationType.ADD_NOVEL;
    return new Mutation(
      this.addNovelMutationID(novel.id),
      (p) => [...p, novel],
      novelName,
      type,
      async () => {
        await trpcClient.db.registerNovel.mutate({
          name: novelName,
          url: novelUrl,
          description: novelDescription,
        });
      },
      [{ novelID: novel.id }],
      { type, novel },
    );
  }
  static removeNovelMutationID = (novelID: string) =>
    `remove_novel_${novelID}`;
  static removeNovel(novelID: string) {
    const type = MutationType.DELETE_NOVEL;
    return new Mutation(
      this.removeNovelMutationID(novelID),
      (p) =>
        p.map((n) =>
          n.id === novelID ?
            { ...n, forDeletion: true }
          : n,
        ),
      (p) =>
        p.find((x) => x.id === novelID)?.ogname ?? novelID,
      type,
      async () => {
        await trpcClient.db.removeNovel.mutate(novelID);
      },
      [{ novelID }],
      { type, novelID },
    );
  }
  static changeOGNameMutationID = (novelID: string) =>
    `change_ogname_${novelID}`;
  static changeOGName(novelID: string, name: string) {
    const type = MutationType.CHANGE_NAME;
    return new Mutation(
      this.changeOGNameMutationID(novelID),
      (p) =>
        p.map((n) =>
          n.id === novelID ? { ...n, ogname: name } : n,
        ),
      name,
      type,
      async () => {
        // await trpcClient.db.updateNovel.mutate({ id, tlname: name });
        console.error("TODO:");
      },
      [{ novelID }],
      { type, novelID, name, og: true },
    );
  }
  static changeTLNameMutationID = (novelID: string) =>
    `change_tlname_${novelID}`;
  static changeTLName(novelID: string, name: string) {
    const type = MutationType.CHANGE_NAME;
    return new Mutation(
      this.changeTLNameMutationID(novelID),
      (p) =>
        p.map((n) =>
          n.id === novelID ? { ...n, tlname: name } : n,
        ),
      name,
      type,
      async () => {
        // await trpcClient.db.updateNovel.mutate({ id, tlname: name });
        console.error("TODO:");
      },
      [{ novelID }],
      { type, novelID, name, og: false },
    );
  }
  static changeTLDescMutationID = (novelID: string) =>
    `change_tldesc_${novelID}`;
  static changeTLDesc(novelID: string, desc: string) {
    const type = MutationType.CHANGE_DESC;
    return new Mutation(
      this.changeTLDescMutationID(novelID),
      (p) =>
        p.map((n) =>
          n.id === novelID ? { ...n, tldesc: desc } : n,
        ),
      desc.substring(0, 10),
      type,
      async () => {
        // TODO
      },
      [{ novelID }],
      { type, desc, novelID: novelID, og: false },
    );
  }
  static changeOGDescMutationID = (novelID: string) =>
    `change_ogdesc_${novelID}`;
  static changeOGDesc(novelID: string, desc: string) {
    const type = MutationType.CHANGE_DESC;
    return new Mutation(
      this.changeOGDescMutationID(novelID),
      (p) =>
        p.map((n) =>
          n.id === novelID ? { ...n, ogdesc: desc } : n,
        ),
      desc.substring(0, 10),
      MutationType.CHANGE_DESC,
      async () => {
        // TODO
      },
      [{ novelID }],
      { type, desc, novelID: novelID, og: true },
    );
  }
  static stageChapterID = 0;
  static stageChapterMutationID = (chapterID: string) =>
    `stage_chapter_${chapterID}`;
  static stageChapter(
    novelID: string,
    chapter: ScrapperChapterInfo,
    id?: string,
  ) {
    const type = MutationType.STAGE_CHAPTER;
    const chapterID =
      id ?? `staged_chapter_${++Mutation.stageChapterID}`;
    return new Mutation(
      this.stageChapterMutationID(chapterID),
      (p) =>
        p.map((n) => {
          return n.id === novelID ?
              {
                ...n,
                chapters: [
                  ...n.chapters,
                  {
                    id: chapterID,
                    novelID: novelID,
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
      type,
      async () => {
        // TODO
      },
      [{ novelID }],
      {
        type,
        novelID: novelID,
        chapter,
        chapterID: chapterID,
      },
    );
  }
  static addTLID = 0;
  static addTLMutationID = (
    nID: string,
    cID: string,
    oL: LANG,
    tL: LANG,
  ) => `add_translation_${oL}.${tL}_${nID}_${cID}`;
  static addTranslation(
    novelID: string,
    chapterID: string,
    ogLang: LANG,
    tlLang: LANG,
    id?: string,
  ) {
    const tlID =
      id ??
      this.addTLMutationID(
        novelID,
        chapterID,
        ogLang,
        tlLang,
      );
    const type = MutationType.ADD_TRANSLATION;
    return new Mutation(
      tlID,
      (p) => p,
      `${ogLang}=>${tlLang}`,
      type,
      async () => {
        /** TODO */
      },
      [{ novelID: novelID }, { chapterID: chapterID }],
      {
        type,
        chapterID,
        novelID,
        ogLang,
        tlID,
        tlLang,
      },
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

    saveMutations: (s) => {
      const muts = get()
        .mutations.filter(({ data }) => data)
        .map((mut) => mut.data!);
      const undoneMuts = get()
        .undoneMutations.filter(({ data }) => data)
        .map((mut) => mut.data!);
      s.setItem(
        "mutations",
        JSON.stringify({
          muts,
          undoneMuts,
          statics: {
            chapterID: Mutation.stageChapterID,
            novelID: Mutation.addNovelID,
          },
        } satisfies MutationSavedType),
      );
    },
    loadMutations: (s) => {
      console.log("loading mutations!");
      const rmd2Mut = (
        rmd: RegularMutationData,
      ): Mutation => {
        switch (rmd.type) {
          case MutationType.ADD_NOVEL:
            return Mutation.addNovel(
              rmd.novel.url,
              rmd.novel.ogname,
              rmd.novel.ogdesc,
              rmd.novel.id,
            );
          case MutationType.CHANGE_DESC:
            if (rmd.og)
              return Mutation.changeOGDesc(
                rmd.novelID,
                rmd.desc,
              );
            return Mutation.changeTLDesc(
              rmd.novelID,
              rmd.desc,
            );
          case MutationType.CHANGE_NAME:
            if (rmd.og)
              return Mutation.changeOGName(
                rmd.novelID,
                rmd.name,
              );
            return Mutation.changeTLDesc(
              rmd.novelID,
              rmd.name,
            );
          case MutationType.DELETE_NOVEL:
            return Mutation.removeNovel(rmd.novelID);
          case MutationType.STAGE_CHAPTER:
            return Mutation.stageChapter(
              rmd.novelID,
              rmd.chapter,
              rmd.chapterID,
            );
          case MutationType.ADD_TRANSLATION:
            return Mutation.addTranslation(
              rmd.novelID,
              rmd.chapterID,
              rmd.ogLang,
              rmd.tlLang,
              rmd.tlID,
            );
        }
      };

      const str = s.getItem("mutations");
      if (str) {
        const savedData = JSON.parse(str) as unknown;
        if (!isMutationSavedType(savedData)) return;
        Mutation.addNovelID = savedData.statics.novelID;
        Mutation.stageChapterID =
          savedData.statics.chapterID;
        set((p) => {
          const nStore: NovelStore = {
            ...p,
            mutations: savedData.muts.map(rmd2Mut),
            undoneMutations:
              savedData.undoneMuts.map(rmd2Mut),
          };
          return nStore;
        });
      }
    },

    isMutation: (id: string, undone = true) =>
      !![
        ...get().mutations,
        ...(undone ? get().undoneMutations : []),
      ].find((n) => n.id === id),
    findMutation: (id, undone = true) =>
      [
        ...get().mutations,
        ...(undone ? get().undoneMutations : []),
      ].find((n) => n.id === id) ?? null,
    findMutationBy: (fn, undone = true) =>
      [
        ...get().mutations,
        ...(undone ? get().undoneMutations : []),
      ].find((n) => fn(n)) ?? null,

    getDBNovelByURL: (url) =>
      get().novels?.find((n) => n.url === url) ?? null,
    getNovelByURL: (url) =>
      get()
        .getMutated()
        ?.find((n) => n.url === url) ?? null,
    getChapter: (nID, id) =>
      get()
        .getNovel(nID)
        ?.chapters.find((c) => c.id === id) ?? null,
    getDBChapter: (nID, id) =>
      get()
        .getDBNovel(nID)
        ?.chapters.find((c) => c.id === id) ?? null,
    getChapterBy: (nID, fn) =>
      get()
        .getNovel(nID)
        ?.chapters.find((c) => fn(c)) ?? null,
    getDBChapterBy: (nID, fn) =>
      get()
        .getDBNovel(nID)
        ?.chapters.find((c) => fn(c)) ?? null,
    loadData: (remote) =>
      set((s) => ({ ...s, novels: remote })),
    mutate: (t, o = false) => {
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
      });
      get().saveMutations(localStorage);
    },
    removeMutation: (id) => {
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
          if (x.id === id) {
            console.error(s);
            return false;
          }
          if (linkedMutations.find((n) => n.id === x.id)) {
            console.error(s);
            return false;
          }
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
      });
      get().saveMutations(localStorage);
    },
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
      get().saveMutations(localStorage);
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
      get().saveMutations(localStorage);
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
      get().saveMutations(localStorage);
      return sets;
    },
  }),
);
