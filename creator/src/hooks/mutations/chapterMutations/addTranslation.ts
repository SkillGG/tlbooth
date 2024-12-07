import { type LANG } from "@prisma/client";
import {
  type CommonSaveData,
  getMDate,
  isPropertyType,
  Mutation,
  MutationType,
  type StoreChapter,
  type StoreTranslation,
} from "../mutation";
import { type Optional, isLang } from "@/utils/utils";
import { RemoveTLMutation } from "./removeTranslation";
import { type NovelStore } from "@/hooks/novelStore";
import { trpcClient } from "@/pages/_app";

type SaveData = {
  novelID: string;
  chapterID: string;
  from: LANG;
  to: LANG;
  tlID: string;
  date: Date;
};

type ConstParam = ConstructorParameters<
  typeof AddTranslationMutation
>[0];

export const isAddTranslationSaveData = (
  o: unknown,
): o is ConstParam => {
  if (
    !!o &&
    typeof o === "object" &&
    isPropertyType(
      o,
      "date",
      (q): q is Date =>
        typeof q === "string" || q instanceof Date,
    ) &&
    isPropertyType(
      o,
      "chapterID",
      (q) => typeof q === "string",
    ) &&
    isPropertyType(
      o,
      "novelID",
      (q) => typeof q === "string",
    ) &&
    isPropertyType(o, "from", isLang) &&
    isPropertyType(o, "to", isLang)
  ) {
    o satisfies ConstParam;
    return true;
  }
  return false;
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
  }: Omit<SaveData, "author" | "date">) =>
    `add_translation_${novelID}_${chapterID}_${from}_${to}_${tlID}`;
  constructor({
    novelID,
    chapterID,
    from,
    date,
    tlID,
    to,
    mutationDate,
  }: Optional<
    SaveData & CommonSaveData,
    "tlID" | "mutationDate"
  >) {
    const local_id =
      tlID ??
      `translation_${++AddTranslationMutation.translationID}`;
    const mDate = getMDate(mutationDate);
    const newTL: StoreTranslation = {
      chapterID,
      id: local_id,
      lines: [],
      oglang: from,
      tllang: to,
      local: true,
      status: "STAGED",
      publishDate: date,
      createdAt: mDate,
      lastUpdatedAt: mDate,
    };
    super(
      AddTranslationMutation.getID({
        novelID,
        chapterID,
        tlID: local_id,
        from,
        to,
      }),
      (p) => {
        return p.map((n) =>
          n.id === this.data.novelID ?
            {
              ...n,
              lastUpdatedAt: mDate,
              chapters: n.chapters.map(
                (ch: StoreChapter) =>
                  ch.id === this.data.chapterID ?
                    {
                      ...ch,
                      lastUpdatedAt: mDate,
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
      local_id,
      MutationType.ADD_TRANSLATION,
      async (novelStore) => {
        const retTL = await trpcClient.db.addTL.mutate({
          chapterID: this.data.chapterID,
          oglang: this.data.from,
          status: "STAGED",
          tllang: this.data.to,
          mutationDate: mDate,
        });
        // update all novelIDs in every mutation with new novelID from database
        novelStore.getMutations().forEach((n) => {
          if (n.data && "tlID" in n.data) {
            if (n.data.tlID === newTL.id) {
              n.data.tlID = retTL.id;
              n.updateID();
            }
          }
        });
        return (path) =>
          path.includes(newTL.id) ?
            path.replace(newTL.id, this.data.tlID)
          : null;
      },
      {
        novelID,
        chapterID,
        from,
        tlID: local_id,
        to,
        date,
        mutationDate: mDate,
      },
      mDate,
    );
  }
  updateID(): void {
    this.id = AddTranslationMutation.getID(this.data);
  }
  override onRemoved(store: NovelStore): void {
    RemoveTLMutation.removeAllDependantMutations(
      this.data.tlID,
      store,
      this,
    );
  }
  override beforeAdd(): void {}
}
