import { type DBNovel } from "@/server/api/routers/db";
import { type MutationSaveData } from "./mutationSave";
import { type NovelStore } from "../novelStore";
import type { SaveMutationDatas } from "./mutationTypes";

export function isString<K extends keyof T, T>(
  host: T,
  property: K,
): host is T & Record<K, string> {
  return typeof host[property] === "string";
}

export function isPropertyTypeOrUndefined<
  K extends string,
  T extends object,
  Z,
>(
  host: T,
  key: K,
  check: (v: unknown) => v is Z,
): host is T & Record<K, Z | undefined> {
  return key in host ?
      check((host as Record<typeof key, unknown>)[key])
    : true;
}

export function isPropertyType<
  K extends string,
  T extends object,
  Z,
>(
  host: T,
  key: K,
  check: (v: unknown) => v is Z,
): host is T & Record<K, Z> {
  if (!(key in host)) {
    throw `No ${key}!`;
  }
  if (check((host as Record<typeof key, unknown>)[key])) {
    return true;
  }
  throw `Invalid value for ${key}`;
}

type ToLocal<T> = WithDate<LocalDeletable<T>>;

type LocalDeletable<T> = T & {
  forDeletion?: true;
  local?: true;
};

type WithDate<T> = T & {
  createdAt?: Date;
  lastUpdatedAt?: Date;
};

export const getMDate = (d: string | Date | undefined) =>
  d ? new Date(d) : new Date();
export type StoreNovel = ToLocal<
  DBNovel & {
    chapters: ToLocal<
      DBNovel["chapters"][number] & {
        translations: (ToLocal<
          DBNovel["chapters"][number]["translations"][number]
        > & {
          lines: ToLocal<
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
  // misc
  CHANGE_NAME = "Change Title",

  // novel
  ADD_NOVEL = "Add Novel",
  REMOVE_NOVEL = "Delete Novel",
  CHANGE_DESC = "Change Novel description",

  // chapter
  STAGE_CHAPTER = "Add Chapter",
  CHANGE_CHAPTER_NAME = "Change chapter name",
  CHANGE_CHAPTER_NUMBER = "Change Chapter Number",
  REMOVE_CHAPTER = "Remove Chapter",

  // TL
  ADD_TRANSLATION = "Add translation",
  REMOVE_TRANSLATION = "Remove translation",
  CHANGE_TL_STATUS = "Change TL Status",

  // Liens
  FETCH_LINES = "Fetch lines",
  REMOVE_LINE = "Remove line",
  CHANGE_LINE = "Change Text Line",
  CHANGE_LINE_STATUS = "Change Line Status",
}

export type CommonSaveData = {
  mutationDate: string | Date;
};

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
  mutationDate: Date;
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
    data: C & CommonSaveData,
    date: Date | string = new Date(),
  ) {
    this.fn = fn;
    this.id = id;
    this.desc = desc;
    this.type = type;
    this.apiFn = apiFn;
    this.mutationDate = new Date(date);
    this.data = { type, ...data };
  }
  abstract updateID(): void;
  abstract onRemoved(store: NovelStore): void;
  abstract beforeAdd(store: NovelStore): void;
  static getSaveData<
    Q extends MutationType,
    C extends object,
  >(m: Mutation<Q, C>): C & CommonSaveData {
    return {
      ...m.data,
      mutationDate: new Date(m.mutationDate),
    };
  }
  getDescription(n: StoreNovel[]) {
    return typeof this.desc === "function" ?
        this.desc(n)
      : this.desc;
  }
}
