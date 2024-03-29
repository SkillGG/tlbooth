import { trpcClient } from "@/pages/_app";
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
  static getID = ({
    novelID,
    og,
  }: Omit<SaveData, "desc">) =>
    `change_novel_${og ? "og" : "tl"}_desc_${novelID}`;
  constructor({ desc, novelID, og }: SaveData) {
    super(
      ChangeNovelDescriptionMutation.getID({ novelID, og }),
      (p) => {
        return p.map((n) =>
          n.id === this.data.novelID ?
            og ? { ...n, ogdesc: desc }
            : { ...n, tldesc: desc }
          : n,
        );
      },
      desc,
      MutationType.CHANGE_DESC,
      async () => {
        await trpcClient.db.changeNovelDescription.mutate(
          this.data,
        );
      },
      { desc, novelID, og },
    );
  }
  updateID(): void {
    this.id = ChangeNovelDescriptionMutation.getID(
      this.data,
    );
  }
  override onRemoved(): void {}
}
