import { trpcClient } from "@/pages/_app";
import {
  type CommonSaveData,
  getMDate,
  isPropertyType,
  Mutation,
  MutationType,
  type StoreChapter,
} from "../mutation";
import { type NovelStore } from "@/hooks/novelStore";

type ConstParam = ConstructorParameters<
  typeof RemoveChapterMutation
>[0];

type SaveData = { novelID: string; chapterID: string };

export const isRemoveChapterSaveData = (
  o: unknown,
): o is ConstParam => {
  if (
    !!o &&
    typeof o === "object" &&
    isPropertyType(
      o,
      "novelID",
      (q): q is string => typeof q === "string",
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

export class RemoveChapterMutation extends Mutation<
  MutationType.REMOVE_CHAPTER,
  SaveData
> {
  static getID = (novelID: string, chapterID: string) =>
    `remove_chapter_${novelID}_${chapterID}`;
  constructor({
    novelID,
    mutationDate,
    chapterID,
  }: SaveData & Partial<CommonSaveData>) {
    const mDate = getMDate(mutationDate);
    super(
      RemoveChapterMutation.getID(novelID, chapterID),
      (p) => {
        return p.map((n) =>
          n.id === this.data.novelID ?
            {
              ...n,
              chapters: n.chapters.map((c: StoreChapter) =>
                c.id === chapterID ?
                  { ...c, forDeletion: true }
                : c,
              ),
            }
          : n,
        );
      },
      (p) =>
        p
          .find((x) => x.id === this.data.novelID)
          ?.chapters?.find(
            (c) => c.id === this.data.chapterID,
          )?.ogname ?? this.data.chapterID,
      MutationType.REMOVE_CHAPTER,
      async (store) => {
        await trpcClient.db.removeChapter.mutate({
          novelID,
          chapterID,
        });
        // remove every mutation done to novel
        RemoveChapterMutation.removeMutationsDependingOnChapter(
          novelID,
          chapterID,
          store,
          this,
        );
      },
      { novelID, mutationDate: mDate, chapterID },
      mDate,
    );
  }
  updateID(): void {
    this.id = RemoveChapterMutation.getID(
      this.data.novelID,
      this.data.chapterID,
    );
  }
  override onRemoved(): void {}
  static removeMutationsDependingOnChapter(
    novelID: string,
    chapterID: string,
    store: NovelStore,
    callingMut: Mutation<MutationType, object>,
  ) {
    store.getMutations(true).forEach((mut) => {
      if (!("chapterID" in mut.data)) return;
      if (
        mut.data.novelID === novelID &&
        mut.data.chapterID === chapterID &&
        mut.id !== callingMut.id
      ) {
        console.log(
          "removing mutation",
          mut,
          "because it depended on novel",
          novelID,
        );
        store.removeMutation(mut.id);
      }
    });
  }
  override beforeAdd(): void {}
}
