import { trpcClient } from "@/pages/_app";
import {
  Mutation,
  MutationType,
  type StoreNovel,
} from "../mutation";

export type SaveData = {
  novelURL: string;
  novelName: string;
  novelID: string;
  novelDescription: string;
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
  constructor(
    novelURL: string,
    novelName: string,
    novelDescription: string,
    novelID?: string,
  ) {
    const novel: StoreNovel = {
      id: `localnovel_${novelID ?? ++AddNovelMutation.novelID}`,
      chapters: [],
      ogname: novelName,
      tlname: "",
      url: novelURL,
      local: true,
      ogdesc: "",
      tldesc: "",
    };
    super(
      AddNovelMutation.getID(novel.id),
      (p) => [...p, novel],
      novelName,
      MutationType.ADD_NOVEL,
      async () => {
        await trpcClient.db.registerNovel.mutate({
          name: novelName,
          url: novelURL,
          description: novelDescription,
        });
      },
      [],
      {
        novelDescription,
        novelID: novel.id,
        novelName,
        novelURL,
      },
    );
  }
  static fromData(d: SaveData) {
    return new AddNovelMutation(
      d.novelURL,
      d.novelName,
      d.novelDescription,
      d.novelID,
    );
  }
}
