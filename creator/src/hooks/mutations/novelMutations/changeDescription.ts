import { Mutation, MutationType } from "../mutation";

type SaveData = {
  desc: string;
  novelID: string;
  og: boolean;
};

export const isChangeNovelDescriptionSaveData = (
  o: unknown,
): o is SaveData => {
  return (
    !!o &&
    typeof o === "object" &&
    "desc" in o &&
    "novelID" in o &&
    "og" in o &&
    typeof o.desc === "string" &&
    typeof o.novelID === "string" &&
    typeof o.og === "boolean"
  );
};

export class ChangeNovelDescriptionMutation extends Mutation<
  MutationType.CHANGE_DESC,
  SaveData
> {
  static getID = (novelID: string, og: boolean) =>
    `change_novel_${og ? "og" : "tl"}_desc_${novelID}`;
  constructor(novelID: string, desc: string, og: boolean) {
    super(
      ChangeNovelDescriptionMutation.getID(novelID, og),
      (p) => {
        if (og)
          return p.map((n) =>
            n.id === novelID ? { ...n, ogdesc: desc } : n,
          );
        return p.map((n) =>
          n.id === novelID ? { ...n, tldesc: desc } : n,
        );
      },
      desc,
      MutationType.CHANGE_DESC,
      async () => {
        throw "TODO";
      },
      [{ novelID }],
      { desc, novelID, og },
    );
  }
  static fromData(d: SaveData) {
    return new ChangeNovelDescriptionMutation(
      d.novelID,
      d.desc,
      d.og,
    );
  }
}
