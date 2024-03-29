import { type AddTranslationMutation } from "./chapterMutations/addTranslation";
import { type ChangeLineMutation } from "./chapterMutations/changeLine";
import { type ChangeChapterNameMutation } from "./chapterMutations/changeName";
import { type ChangeChapterNumMutation } from "./chapterMutations/changeNum";
import { type FetchLinesMutation } from "./chapterMutations/fetchLines";
import { type RemoveTLMutation } from "./chapterMutations/removeTranslation";
import { type StageChapterMutation } from "./chapterMutations/stageChapter";
import { type AddNovelMutation } from "./novelMutations/addNovel";
import { type ChangeNovelDescriptionMutation } from "./novelMutations/changeDescription";
import { type ChangeNovelNameMutation } from "./novelMutations/changeName";
import { type RemoveNovelMutation } from "./novelMutations/removeNovel";

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
