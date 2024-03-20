import type { ScrapperChapterInfo } from "@/server/api/routers/scrapper";
import { LANG } from "@prisma/client";
import { assert } from "console";

export enum MutationType {
  CHANGE_NAME = "Change Title",
  ADD_NOVEL = "Add Novel",
  STAGE_CHAPTER = "Add Chapter",
  DELETE_NOVEL = "Delete Novel",
  CHANGE_DESC = "Change description",
  ADD_TRANSLATION = "Add translation",
}

export type MutationSavedType = {
  muts: RegularMutationData[];
  undoneMuts: RegularMutationData[];
  statics: { chapterID: number; novelID: number };
};

export type RegularMutationData =
  | {
      type: MutationType.ADD_NOVEL;
      novel: {
        url: string;
        id: string;
        ogdesc: string;
        ogname: string;
      };
    }
  | {
      type: MutationType.CHANGE_DESC;
      og: boolean;
      novelID: string;
      desc: string;
    }
  | {
      type: MutationType.CHANGE_NAME;
      og: boolean;
      novelID: string;
      name: string;
    }
  | { type: MutationType.DELETE_NOVEL; novelID: string }
  | {
      type: MutationType.STAGE_CHAPTER;
      novelID: string;
      chapter: ScrapperChapterInfo;
      chapterID: string;
    }
  | {
      type: MutationType.ADD_TRANSLATION;
      novelID: string;
      chapterID: string;
      ogLang: LANG;
      tlLang: LANG;
      tlID: string;
    };

export const isMutationSavedType = (
  s: unknown,
): s is MutationSavedType => {
  if (typeof s !== "object" || !s) {
    console.error(
      "mutationSaveObject type should be an object",
    );
    return false;
  }
  if (
    !("muts" in s && Array.isArray(s.muts)) ||
    !("undoneMuts" in s && Array.isArray(s.undoneMuts)) ||
    !(
      "statics" in s &&
      typeof s.statics === "object" &&
      s.statics
    )
  ) {
    console.error(
      "mutationSaveObject should have 3 fields",
    );
    return false;
  }
  if (
    !("chapterID" in s.statics && "novelID" in s.statics)
  ) {
    console.error(
      "mutationSaveObject should have static IDs",
    );
    return false;
  }
  for (const z of s.muts.concat(s.undoneMuts)) {
    const x = z as unknown;
    if (typeof x !== "object" || !x) {
      console.error("mutationSave should be an object!");
      return false;
    }
    if (!("type" in x && x)) {
      console.error("mutationSave should have a type");
      return false;
    }
    if (typeof x.type !== "string") {
      console.error("mutationSave.type should be string");
      return false;
    }
    if (
      !Object.values(MutationType).includes(
        x.type as MutationType,
      )
    ) {
      console.error("Unknown MutationType");
      return false;
    }
    const u = x as { type: MutationType };

    switch (u.type) {
      case MutationType.ADD_NOVEL:
        if (
          !(
            "novel" in u &&
            typeof u.novel === "object" &&
            u.novel
          )
        ) {
          console.error("ADD_NOVEL: Err1");
          return false;
        }
        if (
          !(
            "id" in u.novel &&
            typeof u.novel.id === "string"
          ) ||
          !(
            "ogname" in u.novel &&
            typeof u.novel.ogname === "string"
          ) ||
          !(
            "ogname" in u.novel &&
            typeof u.novel.ogname === "string"
          ) ||
          !(
            "url" in u.novel &&
            typeof u.novel.url === "string"
          )
        ) {
          console.error("ADD_NOVEL: Err2");
          return false;
        }
        break;
      case MutationType.CHANGE_DESC:
        if (
          !(
            "novelID" in u && typeof u.novelID === "string"
          ) ||
          !("desc" in u && typeof u.desc === "string") ||
          !("og" in u && typeof u.og === "boolean")
        ) {
          console.error("CHANGE_DESC");
          return false;
        }
        break;
      case MutationType.CHANGE_NAME:
        if (
          !("name" in u && typeof u.name === "string") ||
          !(
            "novelID" in u && typeof u.novelID === "string"
          ) ||
          !("og" in u && typeof u.og === "boolean")
        ) {
          console.error("CHANGE_NAME");
          return false;
        }
        break;
      case MutationType.STAGE_CHAPTER:
        if (
          !(
            "chapterID" in u &&
            typeof u.chapterID === "string"
          ) ||
          !(
            "novelID" in u && typeof u.novelID === "string"
          ) ||
          !(
            "chapter" in u &&
            typeof u.chapter === "object" &&
            u.chapter
          )
        ) {
          console.error("STAGE_CHAPTER: Err1");
          return false;
        }

        if (
          !(
            "url" in u.chapter &&
            typeof u.chapter.url === "string"
          ) ||
          !(
            "name" in u.chapter &&
            typeof u.chapter.name === "string"
          ) ||
          !(
            "num" in u.chapter &&
            typeof u.chapter.num === "string"
          )
        ) {
          console.error("STAGE_CHAPTER: Err2");
          return false;
        }
        break;
      case MutationType.ADD_TRANSLATION:
        if (
          !(
            "novelID" in u && typeof u.novelID === "string"
          ) ||
          !(
            "chapterID" in u &&
            typeof u.chapterID === "string"
          ) ||
          !(
            "tlLang" in u &&
            typeof u.tlLang === "string" &&
            Object.values(LANG).includes(u.tlLang as LANG)
          ) ||
          !(
            "ogLang" in u &&
            typeof u.ogLang === "string" &&
            Object.values(LANG).includes(u.ogLang as LANG)
          ) ||
          !("tlID" in u && typeof u.tlID === "string")
        ) {
          console.error("ADD_TRANSLATION", u);
        }
        break;
      case MutationType.DELETE_NOVEL:
        if (
          !("novelID" in u && typeof u.novelID === "string")
        )
          return false;
        break;
      default:
        u.type satisfies never;
    }
  }
  return true;
};
