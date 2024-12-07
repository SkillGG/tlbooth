import { create } from "zustand";

import {
  type MutationType,
  type Mutation,
  type SaveMutationData,
  type StoreChapter,
  type StoreNovel,
  type StoreTranslation,
} from "./mutations/mutation";
import {
  type MutationSavedType,
  isMutationSavedType,
} from "./mutations/mutationSave";
import { StageChapterMutation } from "./mutations/chapterMutations/stageChapter";
import { AddNovelMutation } from "./mutations/novelMutations/addNovel";
import { AddTranslationMutation } from "./mutations/chapterMutations/addTranslation";
import { FetchLinesMutation } from "./mutations/chapterMutations/fetchLines";
import { MutationFromData } from "./mutations/mutationTypes";

export type TLInfo = {
  tl: StoreTranslation;
  chap: StoreChapter;
  novel: StoreNovel;
} | null;

export type AnyMutation<
  T extends MutationType = MutationType,
> = Mutation<T, SaveMutationData<{ type: T }>>;

type Settings = {
  alwaysRawEdit: boolean;
};

export type NovelStore = {
  settings: Settings;

  toggleAlwaysRawEdit: () => void;

  novels: StoreNovel[] | null;
  mutations: AnyMutation[];
  undoneMutations: AnyMutation[];
  loadData: (remote: NovelStore["novels"]) => void;

  getMutations: (undone?: boolean) => AnyMutation[];

  loadMutations: (l: Storage) => void;
  saveMutations: (s: Storage) => void;

  mutate: (t: AnyMutation, override?: boolean) => void;
  removeMutation: (id: string) => void;
  undo: (id: string) => void;
  redo: (id: string) => void;
  getMutated: () => StoreNovel[] | null;

  getNovel: (id: string) => StoreNovel | null;
  getNovelBy: (
    pred: (n: StoreNovel) => boolean,
  ) => StoreNovel | null;
  getDBNovel: (id: string) => StoreNovel | null;
  getDBNovelBy: (
    pred: (n: StoreNovel) => boolean,
  ) => StoreNovel | null;
  getNovelByURL: (url: string) => StoreNovel | null;
  getDBNovelByURL: (url: string) => StoreNovel | null;

  isMutation: (id: string, undone?: boolean) => boolean;
  isMutationWhere: (
    p: (m: AnyMutation) => boolean,
    undone?: boolean,
  ) => boolean;
  findMutation: (
    id: string,
    undone?: boolean,
  ) => AnyMutation | null;
  findMutationWhere: (
    n: (m: AnyMutation) => boolean,
    undone?: boolean,
  ) => AnyMutation | null;

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

  getTranslationInfo: (tlID: string) => TLInfo;

  apply: () => Promise<{
    storeChanges: (() => void)[];
    locationChange: () => string | null;
  }>;
};

export const useNovelStore = create<NovelStore>()(
  (set, get) => ({
    novels: null,
    mutations: [],
    undoneMutations: [],

    settings: { alwaysRawEdit: false },
    toggleAlwaysRawEdit: () =>
      set((p) => ({
        ...p,
        settings: {
          ...p.settings,
          alwaysRawEdit: !p.settings.alwaysRawEdit,
        },
      })),

    getMutations: (u = true) => [
      ...get().mutations,
      ...(u ? [] : get().undoneMutations),
    ],

    getDBNovel: (id) =>
      get().novels?.find((n) => n.id === id) ?? null,
    getNovel: (id) =>
      get()
        .getMutated()
        ?.find((n) => n.id === id) ?? null,

    saveMutations: (s) => {
      const muts = get()
        .mutations.filter(({ data }) => data)
        .map((mut) => mut.data);
      const undoneMuts = get()
        .undoneMutations.filter(({ data }) => data)
        .map((mut) => mut.data);
      s.setItem(
        "mutations",
        JSON.stringify({
          muts,
          undoneMuts,
          statics: {
            stageChapterID: StageChapterMutation.chapterID,
            addNovelID: AddNovelMutation.novelID,
            addTLID: AddTranslationMutation.translationID,
            fetchID: FetchLinesMutation.fetchLineID,
          },
        } satisfies MutationSavedType),
      );
    },
    loadMutations: (s) => {
      if (get().getMutations().length > 0)
        return void console.warn(
          "Cannot overwite existing mutations",
        );
      const str = s.getItem("mutations");
      if (str) {
        const savedData = JSON.parse(str) as unknown;
        if (!isMutationSavedType(savedData)) {
          console.error("failed to parse savedData");
          return;
        }
        AddNovelMutation.novelID =
          savedData.statics.addNovelID;
        StageChapterMutation.chapterID =
          savedData.statics.stageChapterID;
        AddTranslationMutation.translationID =
          savedData.statics.addTLID;
        FetchLinesMutation.fetchLineID =
          savedData.statics.fetchID;
        set((p) => {
          return {
            ...p,
            mutations: savedData.muts.map(MutationFromData),
            undoneMutations: savedData.undoneMuts.map(
              MutationFromData,
            ),
          };
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
    findMutationWhere: (fn, undone = true) =>
      [
        ...get().mutations,
        ...(undone ? get().undoneMutations : []),
      ].find((n) => fn(n)) ?? null,
    isMutationWhere: (fn, undone) => {
      return !!get().findMutationWhere(fn, undone);
    },
    getDBNovelByURL: (url) =>
      get().novels?.find((n) => n.url === url) ?? null,
    getNovelByURL: (url) =>
      get()
        .getMutated()
        ?.find((n) => n.url === url) ?? null,
    getChapter: (nID, id) =>
      get()
        ?.getNovel(nID)
        ?.chapters?.find((c) => c.id === id) ?? null,
    getDBChapter: (nID, id) =>
      get()
        ?.getDBNovel(nID)
        ?.chapters?.find((c) => c.id === id) ?? null,
    getChapterBy: (nID, fn) => {
      console.log(
        "getChBy Cahpters:",
        get()?.getNovel(nID)?.chapters,
      );
      return (
        get()
          ?.getNovel(nID)
          ?.chapters?.find((c) => fn(c)) ?? null
      );
    },
    getDBChapterBy: (nID, fn) =>
      get()
        ?.getDBNovel(nID)
        ?.chapters?.find((c) => fn(c)) ?? null,
    getTranslationInfo: (tlID) => {
      let chap: StoreChapter | undefined;
      const novel = get().getNovelBy((p) => {
        const ch = (p.chapters as StoreChapter[]).find(
          (c) => c.translations.find((t) => t.id === tlID),
        );
        return !!(chap = ch);
      });
      const novelID = novel?.id;
      if (novelID && chap) {
        const tl = get()
          .getChapter(novelID, chap.id)
          ?.translations.find((t) => t.id === tlID);
        if (!chap || !tl) return null;
        return {
          tl,
          chap,
          novel,
        };
      }
      return null;
    },
    getNovelBy: (by) =>
      get().getMutated()?.find(by) ?? null,
    getDBNovelBy: (by) => get().novels?.find(by) ?? null,
    loadData: (remote) =>
      set((s) => ({ ...s, novels: remote })),
    mutate: (t, o = false) => {
      set((s) => {
        const muts = [
          ...get().mutations,
          ...get().undoneMutations,
        ];
        if (muts.find((m) => m.id === t.id)) {
          if (o) {
            t.beforeAdd(get());
            return {
              mutations: [
                ...s.mutations.filter((m) => m.id !== t.id),
                t,
              ],
            };
          }
          return s;
        }
        t.beforeAdd(get());
        return { mutations: [...s.mutations, t] };
      });
      get().saveMutations(localStorage);
    },
    removeMutation: (id) => {
      const mut = get().findMutation(id, true);
      if (mut) mut.onRemoved(get());
      else
        console.error(
          "Could not find mutation with ID: ",
          id,
        );
      set((s) => {
        const filterFn = (x: AnyMutation) => {
          if (x.id === id) return false;
          return true;
        };
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
      const sets: [string, () => void][] = [];
      let locChangeFunc: () => string | null = () => null;
      try {
        const locationChanges: (
          | void
          | ((s: string) => string | null)
        )[] = [];
        for (const mut of get().mutations) {
          locationChanges.push(await mut.apiFn(get()));
          sets.push([
            mut.type +
              ": " +
              mut.getDescription(get().getMutated() ?? []),
            () =>
              set((st) => ({
                mutations: st.mutations.filter(
                  (f) => f.id !== mut.id,
                ),
              })),
          ]);
        }
        const actualLCs = locationChanges.filter((f) => f);
        locChangeFunc = () => {
          if (actualLCs.length === 0) return null;
          const newpath = actualLCs.reduce<string>(
            (p, f) => f?.(p) ?? p,
            window.location.pathname,
          );
          if (newpath === window.location.pathname)
            return null;
          return newpath;
        };
      } catch (e) {
        console.error(e);
        const getErrorMsg = (x: unknown): string => {
          return (
            typeof x === "string" ? x
            : typeof x === "object" && x ?
              x instanceof Error ? x.message
              : (
                "error" in x && typeof x.error === "string"
              ) ?
                x.error
              : ""
            : ""
          );
        };
        const err = getErrorMsg(e);
        alert(
          "Could not apply all mutations!\n" +
            (err ? err + "\n" : "") +
            "Applied mutations:" +
            sets
              .map((v) => v[0])
              .reduce((p, n) => p + "\n" + n, ""),
        );
      }
      return {
        storeChanges: sets.map((r) => r[1]),
        locationChange: locChangeFunc,
      };
    },
  }),
);
