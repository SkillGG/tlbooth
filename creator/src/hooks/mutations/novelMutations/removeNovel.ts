import { trpcClient } from "@/pages/_app";
import { Mutation, MutationType } from "../mutation";

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
      (p) =>
        p.map((n) =>
          n.id === novelID ?
            { ...n, forDeletion: true }
          : n,
        ),
      (p): string =>
        p.find((x) => x.id === novelID)?.ogname ?? novelID,
      MutationType.REMOVE_NOVEL,
      async () => {
        await trpcClient.db.removeNovel.mutate(novelID);
      },
      [{ novelID }],
      { novelID },
    );
  }
  static fromData(d: SaveData) {
    return new RemoveNovelMutation(d.novelID);
  }
}
