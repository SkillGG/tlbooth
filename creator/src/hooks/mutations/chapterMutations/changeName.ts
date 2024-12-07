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
  typeof ChangeChapterNameMutation
>[0];
type SaveData = {
  og: boolean;
  name: string;
  novelID: string;
  chapterID: string;
};

export const isChangeChapterNameSaveData = (
  o: unknown,
): o is ConstParam => {
  if (
    !!o &&
    typeof o === "object" &&
    isPropertyType(
      o,
      "name",
      (q): q is string => typeof q === "string",
    ) &&
    isPropertyType(
      o,
      "novelID",
      (q): q is string => typeof q === "string",
    ) &&
    isPropertyType(
      o,
      "og",
      (q): q is boolean => typeof q === "boolean",
    ) &&
    isPropertyType(
      o,
      "chapterID",
      (q): q is string => typeof q === "string",
    )
  ) {
    o satisfies ConstParam;
    return true;
  }
  return false;
};

export class ChangeChapterNameMutation extends Mutation<
  MutationType.CHANGE_CHAPTER_NAME,
  SaveData
> {
  static getID = ({
    novelID,
    chapterID,
    og,
  }: Omit<SaveData, "name">) =>
    `change_chapter_${og ? "og" : "tl"}_name_${novelID}_${chapterID}`;
  constructor({
    novelID,
    chapterID,
    name,
    og,
    mutationDate,
  }: SaveData & Partial<CommonSaveData>) {
    const mDate = getMDate(mutationDate);
    super(
      ChangeChapterNameMutation.getID({
        novelID,
        chapterID,
        og,
      }),
      (p) => {
        return p.map((n) =>
          n.id === this.data.novelID ?
            {
              ...n,
              chapters: n.chapters.map(
                (ch: StoreChapter) =>
                  ch.id === this.data.chapterID ?
                    og ?
                      {
                        ...ch,
                        ogname: name,
                        lastUpdatedAt: mDate,
                      }
                    : {
                        ...ch,
                        tlname: name,
                        lastUpdatedAt: mDate,
                      }
                  : ch,
              ),
            }
          : n,
        );
      },
      name,
      MutationType.CHANGE_CHAPTER_NAME,
      async () => {
        await trpcClient.db.changeChapterName.mutate({
          ...this.data,
          mutationDate: this.mutationDate,
        });
      },
      { novelID, name, og, chapterID, mutationDate: mDate },
      mDate,
    );
  }
  updateID(): void {
    this.id = ChangeChapterNameMutation.getID(this.data);
  }
  override onRemoved(): void {}
  override beforeAdd(): void {}
}
