import { type LANG } from "@prisma/client";
import {
  Mutation,
  MutationType,
  type StoreTranslation,
} from "../mutation";
import { type Optional, isLang } from "@/utils/utils";

type SaveData = {
  novelID: string;
  chapterID: string;
  from: LANG;
  to: LANG;
  tlID: string;
};

export const isAddTranslationSaveData = (
  o: unknown,
): o is SaveData => {
  return (
    !!o &&
    typeof o === "object" &&
    "from" in o &&
    "to" in o &&
    "novelID" in o &&
    "chapterID" in o &&
    typeof o.novelID === "string" &&
    typeof o.chapterID === "string" &&
    isLang(o.from) &&
    isLang(o.to)
  );
};

export class AddTranslationMutation extends Mutation<
  MutationType.ADD_TRANSLATION,
  SaveData
> {
  static translationID = 0;
  static getID = ({
    novelID,
    chapterID,
    tlID,
    from,
    to,
  }: SaveData) =>
    `add_translation_${novelID}_${chapterID}_${from}_${to}_${tlID}`;
  constructor({
    novelID,
    chapterID,
    from,
    tlID,
    to,
  }: Optional<SaveData, "tlID">) {
    const id =
      tlID ??
      `translation_${++AddTranslationMutation.translationID}`;
    super(
      AddTranslationMutation.getID({
        novelID,
        chapterID,
        tlID: id,
        from,
        to,
      }),
      (p) => {
        const newTL: StoreTranslation = {
          chapterID,
          id,
          lines: [],
          oglang: from,
          tllang: to,
          local: true,
          status: "STAGED",
        };
        return p.map((n) =>
          n.id === novelID ?
            {
              ...n,
              chapters: n.chapters.map((ch) =>
                ch.id === chapterID ?
                  {
                    ...ch,
                    translations: [
                      ...ch.translations,
                      newTL,
                    ],
                  }
                : ch,
              ),
            }
          : n,
        );
      },
      id,
      MutationType.ADD_TRANSLATION,
      async () => {
        throw "TODO";
      },
      [{ novelID }],
      { novelID, chapterID, from, tlID: id, to },
    );
  }
  static fromData(d: SaveData) {
    return new AddTranslationMutation(d);
  }
}
