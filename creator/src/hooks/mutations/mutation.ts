import { type DBNovel } from "@/server/api/routers/db";
import { type MutationSaveData } from "./mutationSave";
import { type NovelStore } from "../novelStore";
import type { SaveMutationDatas } from "./mutationTypes";

type MakeLocalDeletable<T> = T & {
  forDeletion?: true;
  local?: true;
};

export type StoreNovel = MakeLocalDeletable<
  DBNovel & {
    chapters: MakeLocalDeletable<
      DBNovel["chapters"][number] & {
        translations: (MakeLocalDeletable<
          DBNovel["chapters"][number]["translations"][number]
        > & {
          lines: MakeLocalDeletable<
            DBNovel["chapters"][number]["translations"][number]["lines"][number]
          >[];
        })[];
      }
    >[];
  }
>;

export type StoreChapter = StoreNovel["chapters"][number];
export type StoreTranslation =
  StoreChapter["translations"][number];
export type StoreTextLine =
  StoreTranslation["lines"][number];

export enum MutationType {
  CHANGE_NAME = "Change Title",
  ADD_NOVEL = "Add Novel",
  STAGE_CHAPTER = "Add Chapter",
  REMOVE_NOVEL = "Delete Novel",
  CHANGE_DESC = "Change description",
  CHANGE_CHAPTER_NAME = "Change chapter name",
  ADD_TRANSLATION = "Add translation",
  REMOVE_TRANSLATION = "Remove translation",
  REMOVE_LINE = "Remove line",
  FETCH_LINES = "Fetch lines",
  CHANGE_LINE = "Change Text Line",
  CHANGE_CHAPTER_NUMBER = "Change Chapter Number",
  CHANGE_LINE_STATUS = "Change Line Status",
  CHANGE_TL_STATUS = "Change TL Status",
  // CHANGE_CHAPTER_DESC = "Change chapter description",
}

export type SaveMutationData<
  T extends { type: MutationType },
> = NonNullable<SaveMutationDatas & T>;

type MutationDescription =
  | string
  | ((p: StoreNovel[]) => string);

export abstract class Mutation<
  Q extends MutationType,
  C extends object,
> {
  fn: (p: StoreNovel[]) => StoreNovel[];
  desc: MutationDescription;
  type: Q;
  id: string;
  apiFn: (
    store: NovelStore,
  ) => Promise<((url: string) => string | null) | void>;
  data: MutationSaveData<Q, C>;
  constructor(
    id: string,
    fn: (p: StoreNovel[]) => StoreNovel[],
    desc: MutationDescription,
    type: Q,
    apiFn: (
      store: NovelStore,
    ) => Promise<((url: string) => string | null) | void>,
    data: C,
  ) {
    this.fn = fn;
    this.id = id;
    this.desc = desc;
    this.type = type;
    this.apiFn = apiFn;
    this.data = { type, ...data };
  }
  abstract updateID(): void;
  abstract onRemoved(store: NovelStore): void;
  abstract beforeAdd(store: NovelStore): void;
  getDescription(n: StoreNovel[]) {
    return typeof this.desc === "function" ?
        this.desc(n)
      : this.desc;
  }
}
