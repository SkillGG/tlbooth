import { type DBNovel } from "@/server/api/routers/db";
import { type MutationSaveData } from "./mutationSave";
import { type AddNovelMutation } from "./novelMutations/addNovel";
import { type ChangeNovelDescriptionMutation } from "./novelMutations/changeDescription";
import { type ChangeNovelNameMutation } from "./novelMutations/changeName";
import { type RemoveNovelMutation } from "./novelMutations/removeNovel";
import { type StageChapterMutation } from "./chapterMutations/stageChapter";

export type StoreNovel = DBNovel & {
  local?: true;
  forDeletion?: true;
};

export type StoreChapter = StoreNovel["chapters"][number];

export type Dependency =
  | {
      novelID: string;
    }
  | { chapterID: string };

export enum MutationType {
  CHANGE_NAME = "Change Title",
  ADD_NOVEL = "Add Novel",
  STAGE_CHAPTER = "Add Chapter",
  REMOVE_NOVEL = "Delete Novel",
  CHANGE_DESC = "Change description",
  //   ADD_TRANSLATION = "Add translation",
  //   CHANGE_CHAPTER_NAME = "Change chapter name",
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
