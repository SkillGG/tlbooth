import { type NovelStore } from "@/hooks/novelStore";
import {
  type CommonSaveData,
  getMDate,
  isPropertyType,
  Mutation,
  MutationType,
  type StoreChapter,
} from "../mutation";
import { trpcClient } from "@/pages/_app";

type ConstParam = ConstructorParameters<
  typeof RemoveLineMutation
>[0];

type SaveData = {
  tlID: string;
  novelID: string;
  chapterID: string;
  lineID: string;
};

export const isRemoveLineSaveData = (
  o: unknown,
): o is ConstParam => {
  if (
    !!o &&
    typeof o === "object" &&
    isPropertyType(
      o,
      "tlID",
      (q): q is string => typeof q === "string",
    ) &&
    isPropertyType(
      o,
      "chapterID",
      (q): q is string => typeof q === "string",
    ) &&
    isPropertyType(
      o,
      "novelID",
      (q): q is string => typeof q === "string",
    ) &&
    isPropertyType(
      o,
      "lineID",
      (q): q is string => typeof q === "string",
    )
  ) {
    o satisfies ConstParam;
    return true;
  }
  return false;
};

export class RemoveLineMutation extends Mutation<
  MutationType.REMOVE_LINE,
  SaveData
> {
  static getID = ({
    tlID,
    chapterID,
    lineID,
    novelID,
  }: SaveData) =>
    `remove_line_${tlID}_${novelID}_${chapterID}_${lineID}`;
  constructor({
    tlID,
    novelID,
    chapterID,
    lineID,
    mutationDate,
  }: SaveData & Partial<CommonSaveData>) {
    const mDate = getMDate(mutationDate);
    super(
      RemoveLineMutation.getID({
        chapterID,
        lineID,
        novelID,
        tlID,
      }),
      (p) =>
        p.map((n) =>
          n.id === this.data.novelID ?
            {
              ...n,
              chapters: n.chapters.map(
                (ch: StoreChapter) =>
                  ch.id === this.data.chapterID ?
                    {
                      ...ch,
                      translations: ch.translations.map(
                        (tl) =>
                          tl.id === this.data.tlID ?
                            {
                              ...tl,
                              lines: tl.lines.map((line) =>
                                line.id === lineID ?
                                  {
                                    ...line,
                                    forDeletion: true,
                                  }
                                : line,
                              ),
                            }
                          : tl,
                      ),
                    }
                  : ch,
              ),
            }
          : n,
        ),
      () => this.data.lineID,
      MutationType.REMOVE_LINE,
      async function (this: RemoveLineMutation, store) {
        await trpcClient.db.removeLine.mutate(
          this.data.lineID,
        );
        RemoveLineMutation.removeAllDependantMutations(
          this.data.lineID,
          store,
          this,
        );
      },
      {
        tlID,
        novelID,
        chapterID,
        lineID,
        mutationDate: mDate,
      },
      mDate,
    );
  }
  updateID(): void {
    this.id = RemoveLineMutation.getID(this.data);
  }
  override onRemoved(): void {}
  static removeAllDependantMutations(
    lineID: string,
    store: NovelStore,
    callingMut: Mutation<MutationType, object>,
  ) {
    store.getMutations(true).forEach((mut) => {
      if (!("lineID" in mut.data)) return;
      if (
        mut.data.lineID === lineID &&
        callingMut.id !== mut.id
      ) {
        console.log(
          "removing mutation",
          mut,
          "because it depended on tl",
          lineID,
        );
        store.removeMutation(mut.id);
      }
    });
  }
  override beforeAdd(): void {}
}
