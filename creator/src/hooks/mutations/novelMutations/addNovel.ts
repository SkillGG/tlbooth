import { trpcClient } from "@/pages/_app";
import {
  Mutation,
  MutationType,
  type StoreNovel,
} from "../mutation";
import { type Optional } from "@/utils/utils";
import { type NovelStore } from "@/hooks/novelStore";
import { RemoveNovelMutation } from "./removeNovel";

export type SaveData = {
  novelURL: string;
  novelName: string;
  novelDescription: string;
  novelID: string;
};

export const isAddNovelMutationSaveData = (
  o: unknown,
): o is SaveData => {
  return (
    typeof o === "object" &&
    !!o &&
    "novelURL" in o &&
    "novelName" in o &&
    "novelID" in o &&
    "novelDescription" in o &&
    typeof o.novelID === "string" &&
    typeof o.novelName === "string" &&
    typeof o.novelURL === "string" &&
    typeof o.novelDescription === "string"
  );
};

export class AddNovelMutation extends Mutation<
  MutationType.ADD_NOVEL,
  SaveData
> {
  static novelID = 0;
  static getID = (novelID: string) =>
    `add_novel_${novelID}`;
  constructor({
    novelDescription,
    novelName,
    novelURL,
    novelID,
  }: Optional<SaveData, "novelID">) {
    const novel: StoreNovel = {
      id:
        novelID ??
        `localnovel_${++AddNovelMutation.novelID}`,
      chapters: [],
      ogname: novelName,
      tlname: "",
      url: novelURL,
      local: true,
      ogdesc: novelDescription,
      tldesc: "",
    };
    super(
      AddNovelMutation.getID(novel.id),
      (p) => [...p, novel],
      novelName,
      MutationType.ADD_NOVEL,
      async (novelStore) => {
        const retNovel =
          await trpcClient.db.registerNovel.mutate({
            novelName,
            novelURL,
            novelDescription,
          });
        // update all novelIDs in every mutation with new novelID from database
        novelStore.getMutations().forEach((n) => {
          if (n.data) {
            if (n.data.novelID === novel.id) {
              n.data.novelID = retNovel.id;
              n.updateID();
            }
          }
        });
      },
      {
        novelDescription,
        novelID: novel.id,
        novelName,
        novelURL,
      },
    );
  }
  updateID(): void {
    this.id = AddNovelMutation.getID(this.data.novelID);
  }
  override onRemoved(store: NovelStore): void {
    RemoveNovelMutation.removeMutationsDependingOnNovel(
      this.data.novelID,
      store,
      this,
    );
  }
}
