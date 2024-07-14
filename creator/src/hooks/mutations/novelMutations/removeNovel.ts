import { trpcClient } from "@/pages/_app";
import { Mutation, MutationType } from "../mutation";
import { type NovelStore } from "@/hooks/novelStore";

type SaveData = { novelID: string };

export const isRemoveNovelSaveData = (
  o: unknown,
): o is SaveData => {
  return (
    !!o &&
    typeof o === "object" &&
    "novelID" in o &&
    typeof o.novelID === "string"
  );
};

export class RemoveNovelMutation extends Mutation<
  MutationType.REMOVE_NOVEL,
  SaveData
> {
  static getID = (novelID: string) =>
    `remove_novel_${novelID}`;
  constructor(novelID: string) {
    super(
      RemoveNovelMutation.getID(novelID),
      (p) => {
        return p.map((n) =>
          n.id === this.data.novelID ?
            { ...n, forDeletion: true }
          : n,
        );
      },
      (p) =>
        p.find((x) => x.id === this.data.novelID)?.ogname ??
        this.data.novelID,
      MutationType.REMOVE_NOVEL,
      async (store) => {
        await trpcClient.db.removeNovel.mutate(novelID);
        // remove every mutation done to novel
        RemoveNovelMutation.removeMutationsDependingOnNovel(
          novelID,
          store,
          this,
        );
      },
      { novelID },
    );
  }
  updateID(): void {
    this.id = RemoveNovelMutation.getID(this.data.novelID);
  }
  override onRemoved(): void {}
  static removeMutationsDependingOnNovel(
    novelID: string,
    store: NovelStore,
    callingMut: Mutation<MutationType, object>,
  ) {
    store.getMutations(true).forEach((mut) => {
      if (
        mut.data.novelID === novelID &&
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
