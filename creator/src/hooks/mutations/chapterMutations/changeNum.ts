import { trpcClient } from "@/pages/_app";
import {
  type CommonSaveData,
  getMDate,
  isPropertyType,
  Mutation,
  MutationType,
  type StoreChapter,
} from "../mutation";

type ConstParam = ConstructorParameters<
  typeof ChangeChapterNumMutation
>[0];

type SaveData = {
  ognum: number;
  num: string;
  novelID: string;
  chapterID: string;
};

export const isChangeChapterNumSaveData = (
  o: unknown,
): o is ConstParam => {
  if (
    !!o &&
    typeof o === "object" &&
    isPropertyType(
      o,
      "num",
      (q) => typeof q === "string",
    ) &&
    isPropertyType(
      o,
      "novelID",
      (q) => typeof q === "string",
    ) &&
    isPropertyType(
      o,
      "chapterID",
      (q) => typeof q === "string",
    ) &&
    isPropertyType(o, "ognum", (q) => typeof q === "number")
  ) {
    o satisfies ConstParam;
    return true;
  }
  return false;
};

export class ChangeChapterNumMutation extends Mutation<
  MutationType.CHANGE_CHAPTER_NUMBER,
  SaveData
> {
  static getID = ({
    novelID,
    chapterID,
  }: Omit<SaveData, "ognum" | "num">) =>
    `change_chapter_num_${novelID}_${chapterID}`;
  constructor({
    novelID,
    ognum,
    num,
    chapterID,
    mutationDate,
  }: SaveData & Partial<CommonSaveData>) {
    const mDate = getMDate(mutationDate);
    super(
      ChangeChapterNumMutation.getID({
        novelID,
        chapterID,
      }),
      (p) => {
        return p.map((n) =>
          n.id === this.data.novelID ?
            {
              ...n,
              chapters: n.chapters.map(
                (ch: StoreChapter) =>
                  ch.ognum === this.data.ognum ?
                    {
                      ...ch,
                      num,
                      lastUpdatedAt: mDate,
                    }
                  : ch,
              ),
            }
          : n,
        );
      },
      `${ognum}=>${num}`,
      MutationType.CHANGE_CHAPTER_NUMBER,
      async () => {
        await trpcClient.db.changeChapterNumber.mutate(
          this.data,
        );
      },
      {
        novelID,
        num,
        ognum,
        chapterID,
        mutationDate: mDate,
      },
      mDate,
    );
  }
  updateID(): void {
    this.id = ChangeChapterNumMutation.getID(this.data);
  }
  override onRemoved(): void {}
  override beforeAdd(): void {}
}
