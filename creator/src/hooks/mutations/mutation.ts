import { type DBNovel } from "@/server/api/routers/db";
import { type MutationSaveData } from "./mutationSave";
import { type AddNovelMutation } from "./novelMutations/addNovel";
import { type ChangeNovelDescriptionMutation } from "./novelMutations/changeDescription";
import { type ChangeNovelNameMutation } from "./novelMutations/changeName";
import { type RemoveNovelMutation } from "./novelMutations/removeNovel";
import { type StageChapterMutation } from "./chapterMutations/stageChapter";
import { type ChangeChapterNameMutation } from "./chapterMutations/changeName";
import { type AddTranslationMutation } from "./chapterMutations/addTranslation";
import { type RemoveTLMutation } from "./chapterMutations/removeTranslation";

type MakeLocalDeletable<T> = T & {
  forDeletion?: true;
  local?: true;
};

export type StoreNovel = MakeLocalDeletable<
  DBNovel & {
    chapters: MakeLocalDeletable<
      DBNovel["chapters"][number] & {
        translations: MakeLocalDeletable<
          DBNovel["chapters"][number]["translations"][number]
        >[];
      }
    >[];
  }
>;

export type StoreChapter = StoreNovel["chapters"][number];
export type StoreTranslation =
  StoreNovel["chapters"][number]["translations"][number];

export type Dependency =
  | {
    novelID: string;
  }
  | { chapterID: string } | { tlID: string };

export enum MutationType {
  CHANGE_NAME = "Change Title",
  ADD_NOVEL = "Add Novel",
  STAGE_CHAPTER = "Add Chapter",
  REMOVE_NOVEL = "Delete Novel",
  CHANGE_DESC = "Change description",
  CHANGE_CHAPTER_NAME = "Change chapter name",
  ADD_TRANSLATION = "Add translation",
  REMOVE_TRANSLATION = "Remove translation",
  // FETCH_LINES = "Fetch lines"
  //   CHANGE_CHAPTER_DESC = "Change chapter description",
}

export type SaveMutationDatas = NonNullable<
  | ({
    type: MutationType.ADD_NOVEL;
  } & typeof AddNovelMutation.prototype.data)
  | ({
    type: MutationType.CHANGE_DESC;
  } & typeof ChangeNovelDescriptionMutation.prototype.data)
  | ({
    type: MutationType.CHANGE_NAME;
  } & typeof ChangeNovelNameMutation.prototype.data)
  | ({
    type: MutationType.REMOVE_NOVEL;
  } & typeof RemoveNovelMutation.prototype.data)
  | ({
    type: MutationType.STAGE_CHAPTER;
  } & typeof StageChapterMutation.prototype.data)
  | ({
    type: MutationType.CHANGE_CHAPTER_NAME;
  } & typeof ChangeChapterNameMutation.prototype.data)
  | ({
    type: MutationType.ADD_TRANSLATION;
  } & typeof AddTranslationMutation.prototype.data)
  | ({
    type: MutationType.REMOVE_TRANSLATION;
  } & typeof RemoveTLMutation.prototype.data)
>;

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
  apiFn: () => Promise<void>;
  dependencies: Dependency[];
  data?: MutationSaveData<Q, C>;
  constructor(
    id: string,
    fn: (p: StoreNovel[]) => StoreNovel[],
    desc: MutationDescription,
    type: Q,
    apiFn: () => Promise<void>,
    dependencies: Dependency[],
    data?: C,
  ) {
    this.fn = fn;
    this.id = id;
    this.desc = desc;
    this.type = type;
    this.apiFn = apiFn;
    if (data) this.data = { type, ...data };
    this.dependencies = dependencies;
  }
  getDescription(n: StoreNovel[]) {
    return typeof this.desc === "function" ?
      this.desc(n)
      : this.desc;
  }
}
