import { isAddTranslationSaveData } from "./chapterMutations/addTranslation";
import { isChangeLineSaveData } from "./chapterMutations/changeLine";
import { isChangeLineStatusSaveData } from "./chapterMutations/changeLineStatus";
import { isChangeChapterNameSaveData } from "./chapterMutations/changeName";
import { isChangeChapterNumSaveData } from "./chapterMutations/changeNum";
import { isChangeTLStatusSaveData } from "./chapterMutations/changeTLStatus";
import { isFetchLineSaveData } from "./chapterMutations/fetchLines";
import { isRemoveChapterSaveData } from "./chapterMutations/removeChapter";
import { isRemoveLineSaveData } from "./chapterMutations/removeLine";
import { isStageChapterSaveData } from "./chapterMutations/stageChapter";
import {
  type CommonSaveData,
  MutationType,
} from "./mutation";
import { type SaveMutationDatas } from "./mutationTypes";
import { isAddNovelMutationSaveData } from "./novelMutations/addNovel";
import { isChangeNovelDescriptionSaveData } from "./novelMutations/changeDescription";
import { isChangeNovelNameSaveData } from "./novelMutations/changeName";
import { isRemoveNovelSaveData } from "./novelMutations/removeNovel";

export type MutationSavedType = {
  muts: SaveMutationDatas[];
  undoneMuts: SaveMutationDatas[];
  statics: {
    stageChapterID: number;
    addNovelID: number;
    addTLID: number;
    fetchID: number;
  };
};
export type MutationSaveData<
  T extends MutationType,
  eX extends object,
> = { type: T } & CommonSaveData & eX;

const consistsOfValidMutationSaveData = (
  arr: unknown[],
): arr is MutationSaveData<MutationType, object>[] => {
  return arr.reduce<boolean>((p, n) => {
    if (!p) return p;
    if (typeof n !== "object" || !n) return false;
    if (
      !(
        "type" in n &&
        typeof n.type === "string" &&
        Object.values(MutationType).includes(
          n.type as MutationType,
        )
      )
    ) {
      console.error("Mutation has no type!");
      return false;
    }

    if (
      !(
        "mutationDate" in n &&
        (typeof n.mutationDate === "string" ||
          n.mutationDate instanceof Date)
      )
    ) {
      console.error("Mutation has no date!");
      console.warn(n);
      return false;
    }

    const typedN = n as { type: MutationType };
    try {
      switch (typedN.type) {
        case MutationType.ADD_NOVEL:
          if (!isAddNovelMutationSaveData(typedN))
            throw "ADD_NOVEL";
          break;
        case MutationType.CHANGE_DESC:
          if (!isChangeNovelDescriptionSaveData(typedN))
            throw "CHANGE_DESC";
          break;
        case MutationType.CHANGE_NAME:
          if (!isChangeNovelNameSaveData(typedN))
            throw "CHANGE_NAME";
          break;
        case MutationType.REMOVE_NOVEL:
          if (!isRemoveNovelSaveData(typedN))
            throw "DELETE_NOVEL";
          break;
        case MutationType.STAGE_CHAPTER:
          if (!isStageChapterSaveData(typedN))
            throw "STAGE_CHAPTER";
          break;
        case MutationType.CHANGE_CHAPTER_NAME:
          if (!isChangeChapterNameSaveData(typedN))
            throw "CHANGE_CHAPTER_NAME";
          break;
        case MutationType.ADD_TRANSLATION:
          if (!isAddTranslationSaveData(typedN))
            throw "ADD_TRANSLATION";
          break;
        case MutationType.REMOVE_TRANSLATION:
          if (!isRemoveNovelSaveData(typedN))
            throw "REMOVE_TL";
          break;
        case MutationType.FETCH_LINES:
          if (!isFetchLineSaveData(typedN))
            throw "FETCH_LINES";
          break;
        case MutationType.CHANGE_LINE:
          if (!isChangeLineSaveData(typedN))
            throw "CHANGE_LINE";
          break;
        case MutationType.CHANGE_CHAPTER_NUMBER:
          if (!isChangeChapterNumSaveData(typedN))
            throw "CHANGE_CHAPTER_NUMBER";
          break;
        case MutationType.CHANGE_LINE_STATUS:
          if (!isChangeLineStatusSaveData(typedN))
            throw "CHANGE_LINE_STATUS";
          break;
        case MutationType.CHANGE_TL_STATUS:
          if (!isChangeTLStatusSaveData(typedN))
            throw "CHANGE_TL_STATUS";
          break;
        case MutationType.REMOVE_LINE:
          if (!isRemoveLineSaveData(typedN))
            throw "REMOVE_LINE";
          break;
        case MutationType.REMOVE_CHAPTER:
          if (!isRemoveChapterSaveData(typedN))
            throw "REMOVE_CHAPTER";
          break;
        default:
          typedN.type satisfies never;
      }
    } catch (n) {
      console.error("reading error", n);
      return false;
    }
    return p;
  }, true);
};

export const isMutationSavedType = (
  o: unknown,
): o is MutationSavedType => {
  try {
    if (!o || typeof o !== "object") throw "Not an object";
    if (!("muts" in o && Array.isArray(o.muts)))
      throw "No .muts";
    if (!("undoneMuts" in o && Array.isArray(o.undoneMuts)))
      throw "No .undoneMuts";
    if (
      !(
        "statics" in o &&
        !!o.statics &&
        typeof o.statics === "object" &&
        "stageChapterID" in o.statics &&
        typeof o.statics.stageChapterID === "number" &&
        "addNovelID" in o.statics &&
        typeof o.statics.addNovelID === "number" &&
        "addTLID" in o.statics &&
        typeof o.statics.addTLID === "number"
      )
    )
      throw "No statics";
    if (
      !(
        consistsOfValidMutationSaveData(o.muts) &&
        consistsOfValidMutationSaveData(o.undoneMuts)
      )
    )
      throw "Invalid MutationSaveData";
    return true;
  } catch (e) {
    console.error(e, o);
    return false;
  }
};
