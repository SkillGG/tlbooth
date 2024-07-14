import { type LANG } from "@prisma/client";
import {
  Mutation,
  MutationType,
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
  author: string;
  date: Date;
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
    "author" in o &&
    typeof o.novelID === "string" &&
    typeof o.author === "string" &&
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
  }: Omit<SaveData, "author" | "date">) =>
    `add_translation_${novelID}_${chapterID}_${from}_${to}_${tlID}`;
  constructor({
    novelID,
    chapterID,
    from,
    date,
    tlID,
    to,
    author,
  }: Optional<SaveData, "tlID">) {
    const id =
      tlID ??
      `translation_${++AddTranslationMutation.translationID}`;
    const newTL: StoreTranslation = {
      chapterID,
      id,
      lines: [],
      oglang: from,
      tllang: to,
      local: true,
      status: "STAGED",
      lastEditDate: date,
      publishDate: date,
      editAuthors: [author],
      author,
    };
    super(
      AddTranslationMutation.getID({
        novelID,
        chapterID,
        tlID: id,
        from,
        to,
      }),
      (p) => {
        return p.map((n) =>
          n.id === this.data.novelID ?
            {
              ...n,
              chapters: n.chapters.map((ch) =>
                ch.id === this.data.chapterID ?
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
      async (novelStore) => {
        const retTL = await trpcClient.db.addTL.mutate({
          chapterID: this.data.chapterID,
          oglang: this.data.from,
          status: "STAGED",
          tllang: this.data.to,
          author: this.data.author,
          lastEditDate: this.data.date,
          pubDate: this.data.date,
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
        tlID: id,
        to,
        author,
        date,
      },
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
