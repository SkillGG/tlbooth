import { Mutation, MutationType } from "../mutation";

type SaveData = {
  og: boolean;
  name: string;
  novelID: string;
};

export const isChangeNovelNameSaveData = (
  o: unknown,
): o is SaveData => {
  return (
    !!o &&
    typeof o === "object" &&
    "name" in o &&
    "novelID" in o &&
    "og" in o &&
    typeof o.name === "string" &&
    typeof o.novelID === "string" &&
    typeof o.og === "boolean"
  );
};

export class ChangeNovelNameMutation extends Mutation<
  MutationType.CHANGE_NAME,
  SaveData
> {
  static getID = ({
    novelID,
    og,
  }: Omit<SaveData, "name">) =>
    `change_novel_${og ? "og" : "tl"}_name_${novelID}`;
  constructor({ name, novelID, og }: SaveData) {
    super(
      ChangeNovelNameMutation.getID({ novelID, og }),
      (p) => {
        if (og)
          return p.map((n) =>
            n.id === novelID ? { ...n, ogname: name } : n,
          );
        return p.map((n) =>
          n.id === novelID ? { ...n, tlname: name } : n,
        );
      },
      name,
      MutationType.CHANGE_NAME,
      async () => {
        throw "TODO";
      },
      [{ novelID }],
      { novelID, name, og },
    );
  }
  static fromData(d: SaveData) {
    return new ChangeNovelNameMutation(d);
  }
}
