import { type NovelStore } from "@/hooks/novelStore";
import { Mutation, MutationType } from "../mutation";
import { trpcClient } from "@/pages/_app";

type SaveData = {
  tlID: string;
  novelID: string;
  chapterID: string;
};

export const isRemoveTLSaveData = (
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
    typeof o.novelID === "string"
  );
};

export class RemoveTLMutation extends Mutation<
  MutationType.REMOVE_TRANSLATION,
  SaveData
> {
  static getID = (tlID: string) => `remove_tl_${tlID}`;
  constructor({ tlID, novelID, chapterID }: SaveData) {
    super(
      RemoveTLMutation.getID(tlID),
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
                          { ...tl, forDeletion: true }
                        : tl,
                    ),
                  }
                : ch,
              ),
            }
          : n,
        ),
      (p): string =>
        p.find((x) => x.id === this.data.tlID)?.ogname ??
        this.data.tlID,
      MutationType.REMOVE_TRANSLATION,
      async function (this: RemoveTLMutation, store) {
        await trpcClient.db.removeTL.mutate(this.data.tlID);
        RemoveTLMutation.removeAllDependantMutations(
          this.data.tlID,
          store,
          this,
        );
      },
      { tlID, novelID, chapterID },
    );
  }
  updateID(): void {
    this.id = RemoveTLMutation.getID(this.data.tlID);
  }
  override onRemoved(): void {}
  static removeAllDependantMutations(
    tlID: string,
    store: NovelStore,
    callingMut: Mutation<MutationType, object>,
  ) {
    store.getMutations(true).forEach((mut) => {
      if (!("tlID" in mut.data)) return;
      if (
        mut.data.tlID === tlID &&
        callingMut.id !== mut.id
      ) {
        console.log(
          "removing mutation",
          mut,
          "because it depended on tl",
          tlID,
        );
        store.removeMutation(mut.id);
      }
    });
  }
  override beforeAdd(): void {}
}
