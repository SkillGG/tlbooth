import { AddTranslationMutation } from "./chapterMutations/addTranslation";
import { ChangeLineMutation } from "./chapterMutations/changeLine";
import { ChangeLineStatusMutation } from "./chapterMutations/changeLineStatus";
import { ChangeChapterNameMutation } from "./chapterMutations/changeName";
import { ChangeChapterNumMutation } from "./chapterMutations/changeNum";
import { ChangeTLStatusMutation } from "./chapterMutations/changeTLStatus";
import { FetchLinesMutation } from "./chapterMutations/fetchLines";
import { RemoveChapterMutation } from "./chapterMutations/removeChapter";
import { RemoveLineMutation } from "./chapterMutations/removeLine";
import { RemoveTLMutation } from "./chapterMutations/removeTranslation";
import { StageChapterMutation } from "./chapterMutations/stageChapter";
import {
  type CommonSaveData,
  MutationType,
} from "./mutation";
import { AddNovelMutation } from "./novelMutations/addNovel";
import { ChangeNovelDescriptionMutation } from "./novelMutations/changeDescription";
import { ChangeNovelNameMutation } from "./novelMutations/changeName";
import { RemoveNovelMutation } from "./novelMutations/removeNovel";

export type AddNovelMutationData =
  typeof AddNovelMutation.prototype.data;
export type ChangeNovelDescriptionMutationData =
  typeof ChangeNovelDescriptionMutation.prototype.data;
export type ChangeNovelNameMutationData =
  typeof ChangeNovelNameMutation.prototype.data;
export type RemoveNovelMutationData =
  typeof RemoveNovelMutation.prototype.data;
export type StageChapterMutationData =
  typeof StageChapterMutation.prototype.data;
export type ChangeChapterNameMutationData =
  typeof ChangeChapterNameMutation.prototype.data;
export type AddTranslationMutationData =
  typeof AddTranslationMutation.prototype.data;
export type RemoveTLMutationData =
  typeof RemoveTLMutation.prototype.data;
export type FetchLinesMutationData =
  typeof FetchLinesMutation.prototype.data;
export type ChangeLineMutationData =
  typeof ChangeLineMutation.prototype.data;
export type ChangeChapterNumMutationData =
  typeof ChangeChapterNumMutation.prototype.data;
export type ChangeLineStatusMutationData =
  typeof ChangeLineStatusMutation.prototype.data;
export type ChangeTLStatusMutationData =
  typeof ChangeTLStatusMutation.prototype.data;
export type RemoveLineMutationData =
  typeof RemoveLineMutation.prototype.data;
export type RemoveChapterMutationData =
  typeof RemoveChapterMutation.prototype.data;

export type SaveMutationDatas = CommonSaveData &
  NonNullable<
    | ({
        type: MutationType.ADD_NOVEL;
      } & AddNovelMutationData)
    | ({
        type: MutationType.CHANGE_DESC;
      } & ChangeNovelDescriptionMutationData)
    | ({
        type: MutationType.CHANGE_NAME;
      } & ChangeNovelNameMutationData)
    | ({
        type: MutationType.REMOVE_NOVEL;
      } & RemoveNovelMutationData)
    | ({
        type: MutationType.STAGE_CHAPTER;
      } & StageChapterMutationData)
    | ({
        type: MutationType.CHANGE_CHAPTER_NAME;
      } & ChangeChapterNameMutationData)
    | ({
        type: MutationType.ADD_TRANSLATION;
      } & AddTranslationMutationData)
    | ({
        type: MutationType.REMOVE_TRANSLATION;
      } & RemoveTLMutationData)
    | ({
        type: MutationType.FETCH_LINES;
      } & FetchLinesMutationData)
    | ({
        type: MutationType.CHANGE_LINE;
      } & ChangeLineMutationData)
    | ({
        type: MutationType.CHANGE_CHAPTER_NUMBER;
      } & ChangeChapterNumMutationData)
    | ({
        type: MutationType.CHANGE_LINE_STATUS;
      } & ChangeLineStatusMutationData)
    | ({
        type: MutationType.CHANGE_TL_STATUS;
      } & ChangeTLStatusMutationData)
    | ({
        type: MutationType.REMOVE_LINE;
      } & RemoveLineMutationData)
    | ({
        type: MutationType.REMOVE_CHAPTER;
      } & RemoveChapterMutationData)
  >;

export const MutationFromData = (
  rmd: SaveMutationDatas,
) => {
  switch (rmd.type) {
    case MutationType.ADD_NOVEL:
      return new AddNovelMutation(rmd);
    case MutationType.CHANGE_DESC:
      return new ChangeNovelDescriptionMutation(rmd);
    case MutationType.CHANGE_NAME:
      return new ChangeNovelNameMutation(rmd);
    case MutationType.REMOVE_NOVEL:
      return new RemoveNovelMutation(rmd);
    case MutationType.STAGE_CHAPTER:
      return new StageChapterMutation(rmd);
    case MutationType.ADD_TRANSLATION:
      return new AddTranslationMutation(rmd);
    case MutationType.CHANGE_CHAPTER_NAME:
      return new ChangeChapterNameMutation(rmd);
    case MutationType.REMOVE_TRANSLATION:
      return new RemoveTLMutation(rmd);
    case MutationType.FETCH_LINES:
      return new FetchLinesMutation(rmd);
    case MutationType.CHANGE_LINE:
      return new ChangeLineMutation(rmd);
    case MutationType.CHANGE_CHAPTER_NUMBER:
      return new ChangeChapterNumMutation(rmd);
    case MutationType.CHANGE_LINE_STATUS:
      return new ChangeLineStatusMutation(rmd);
    case MutationType.CHANGE_TL_STATUS:
      return new ChangeTLStatusMutation(rmd);
    case MutationType.REMOVE_LINE:
      return new RemoveLineMutation(rmd);
    case MutationType.REMOVE_CHAPTER:
      return new RemoveChapterMutation(rmd);
    default:
      rmd satisfies never;
      throw "Unknown mutation type!";
  }
};
