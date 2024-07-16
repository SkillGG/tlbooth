import { type NovelStore } from "@/hooks/novelStore";
import { Mutation, MutationType } from "../mutation";
import { trpcClient } from "@/pages/_app";

type SaveData = {
  tlID: string;
  novelID: string;
  chapterID: string;
  lineID: string;
};

export const isRemoveLineSaveData = (
  o: unknown,
): o is SaveData => {
  return (
    !!o &&
    typeof o === "object" &&
    "tlID" in o &&
    typeof o.tlID === "string" &&
    "chapterID" in o &&
    typeof o.chapterID === "string" &&
    "novelID" in o &&
    typeof o.novelID === "string" &&
    "lineID" in o &&
    typeof o.lineID === "string"
  );
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
  }: SaveData) {
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
              chapters: n.chapters.map((ch) =>
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
      { tlID, novelID, chapterID, lineID },
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
