import { Mutation, MutationType } from "../mutation";
import { trpcClient } from "@/pages/_app";

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
        return p.map((n) =>
          n.id === this.data.novelID ?
            og ? { ...n, ogname: name }
            : { ...n, tlname: name }
          : n,
        );
      },
      name,
      MutationType.CHANGE_NAME,
      async () => {
        await trpcClient.db.changeNovelName.mutate(
          this.data,
        );
      },
      { novelID, name, og },
    );
  }
  updateID(): void {
    this.id = ChangeNovelNameMutation.getID(this.data);
  }
  override onRemoved(): void {}
  override beforeAdd(): void {}
}
