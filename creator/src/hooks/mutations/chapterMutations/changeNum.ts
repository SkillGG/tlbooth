import { trpcClient } from "@/pages/_app";
import { Mutation, MutationType } from "../mutation";

type SaveData = {
  ognum: number;
  num: string;
  novelID: string;
  chapterID: string;
};

export const isChangeChapterNumSaveData = (
  o: unknown,
): o is SaveData => {
  return (
    !!o &&
    typeof o === "object" &&
    "num" in o &&
    "novelID" in o &&
    "chapterID" in o &&
    "ognum" in o &&
    typeof o.num === "string" &&
    typeof o.novelID === "string" &&
    typeof o.chapterID === "string" &&
    typeof o.ognum === "number"
  );
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
  }: SaveData) {
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
              chapters: n.chapters.map((ch) =>
                ch.ognum === this.data.ognum ?
                  { ...ch, num }
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
      { novelID, num, ognum, chapterID },
    );
  }
  updateID(): void {
    this.id = ChangeChapterNumMutation.getID(this.data);
  }
  override onRemoved(): void {}
}
