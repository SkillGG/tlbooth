import { create } from "zustand";
import deepEquals from "fast-deep-equal";

import {
  type Mutation,
  MutationType,
  type SaveMutationData,
  type SaveMutationDatas,
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
import { ChangeNovelDescriptionMutation } from "./mutations/novelMutations/changeDescription";
import { ChangeNovelNameMutation } from "./mutations/novelMutations/changeName";
import { RemoveNovelMutation } from "./mutations/novelMutations/removeNovel";
import { AddTranslationMutation } from "./mutations/chapterMutations/addTranslation";
import { ChangeChapterNameMutation } from "./mutations/chapterMutations/changeName";
import { RemoveTLMutation } from "./mutations/chapterMutations/removeTranslation";
import { FetchLinesMutation } from "./mutations/chapterMutations/fetchLines";
import { ChangeLineMutation } from "./mutations/chapterMutations/changeLine";

export type TLInfo = {
  tl: StoreTranslation;
  chap: StoreChapter;
  novel: StoreNovel;
} | null;

type AnyMutation<T extends MutationType = MutationType> =
  Mutation<T, SaveMutationData<{ type: T }>>;

type NovelStore = {
  novels: StoreNovel[] | null;
  mutations: AnyMutation[];
  undoneMutations: AnyMutation[];
  loadData: (remote: NovelStore["novels"]) => void;

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
  findMutation: (
    id: string,
    undone?: boolean,
  ) => AnyMutation | null;
  findMutationBy: (
    n: (m: AnyMutation, undone?: boolean) => boolean,
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

  apply: () => Promise<(() => void)[]>;
};

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
            stageChapterID: StageChapterMutation.chapterID,
            addNovelID: AddNovelMutation.novelID,
            addTLID: AddTranslationMutation.translationID,
            fetchID: FetchLinesMutation.fetchLineID,
          },
        } satisfies MutationSavedType),
      );
    },
    loadMutations: (s) => {
      console.log("loading mutations!");
      const rmd2mut = (rmd: SaveMutationDatas) => {
        switch (rmd.type) {
          case MutationType.ADD_NOVEL:
            return AddNovelMutation.fromData(rmd);
          case MutationType.CHANGE_DESC:
            return ChangeNovelDescriptionMutation.fromData(
              rmd,
            );
          case MutationType.CHANGE_NAME:
            return ChangeNovelNameMutation.fromData(rmd);
          case MutationType.REMOVE_NOVEL:
            return RemoveNovelMutation.fromData(rmd);
          case MutationType.STAGE_CHAPTER:
            return StageChapterMutation.fromData(rmd);
          case MutationType.ADD_TRANSLATION:
            return AddTranslationMutation.fromData(rmd);
          case MutationType.CHANGE_CHAPTER_NAME:
            return ChangeChapterNameMutation.fromData(rmd);
          case MutationType.REMOVE_TRANSLATION:
            return RemoveTLMutation.fromData(rmd);
          case MutationType.FETCH_LINES:
            return new FetchLinesMutation(rmd);
          case MutationType.CHANGE_LINE:
            return new ChangeLineMutation(rmd);
          default:
            rmd satisfies never;
            throw "Unknown mutation type!";
        }
      };
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
            mutations: savedData.muts.map(rmd2mut),
            undoneMutations:
              savedData.undoneMuts.map(rmd2mut),
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
    getTranslationInfo: (tlID) => {
      console.log("getting tlinfo for", tlID);
      let chap: StoreChapter | undefined;
      const novel = get().getNovelBy((p) => {
        const ch = p.chapters.find((c) =>
          c.translations.find((t) => t.id === tlID),
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
        const linkedMutations: AnyMutation[] = [];
        const muts = [
          ...get().mutations,
          ...get().undoneMutations,
        ];
        const thisMut = muts.find((t) => t.id === id);
        if (!thisMut) {
          console.error(
            "There is no mutation found with id",
            id,
            muts,
          );
          return s;
        }
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

        const filterFn = (x: AnyMutation) => {
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
      return sets;
    },
  }),
);
