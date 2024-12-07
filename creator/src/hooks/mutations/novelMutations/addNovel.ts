import { trpcClient } from "@/pages/_app";
import {
  type CommonSaveData,
  getMDate,
  isPropertyType,
  Mutation,
  MutationType,
  type StoreNovel,
} from "../mutation";
import { type Optional } from "@/utils/utils";
import { type NovelStore } from "@/hooks/novelStore";
import { RemoveNovelMutation } from "./removeNovel";

type ConstParam = ConstructorParameters<
  typeof AddNovelMutation
>[0];

export type SaveData = {
  novelURL: string;
  novelName: string;
  novelDescription: string;
  novelID: string;
};

export const isAddNovelMutationSaveData = (
  o: unknown,
): o is ConstParam => {
  if (
    typeof o === "object" &&
    !!o &&
    isPropertyType(
      o,
      "novelID",
      (q): q is string => typeof q === "string",
    ) &&
    isPropertyType(
      o,
      "novelName",
      (q): q is string => typeof q === "string",
    ) &&
    isPropertyType(
      o,
      "novelURL",
      (q): q is string => typeof q === "string",
    ) &&
    isPropertyType(
      o,
      "novelDescription",
      (q): q is string => typeof q === "string",
    )
  ) {
    o satisfies ConstParam;
    return true;
  }
  return false;
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
    mutationDate,
  }: Optional<
    CommonSaveData & SaveData,
    "novelID" | "mutationDate"
  >) {
    const mDate = getMDate(mutationDate);
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
      author: "",
      createdAt: mDate,
    };
    console.log("adding novel", novel);
    super(
      AddNovelMutation.getID(novel.id),
      (p) => [...p, novel],
      novelName,
      MutationType.ADD_NOVEL,
      async (novelStore) => {
        console.log("applying add novel");
        const retNovel =
          await trpcClient.db.registerNovel.mutate({
            novelName,
            novelURL,
            novelDescription,
            createdAt: novel.createdAt ?? mDate,
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
        return (path) =>
          path.includes(novel.id) ?
            path.replace(novel.id, this.data.novelID)
          : null;
      },
      {
        novelDescription,
        novelID: novel.id,
        novelName,
        novelURL,
        mutationDate: mDate,
      },
      mDate,
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
  override beforeAdd(): void {}
}
