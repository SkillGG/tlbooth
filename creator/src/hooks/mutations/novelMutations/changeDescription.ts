import { trpcClient } from "@/pages/_app";
import {
  type CommonSaveData,
  getMDate,
  isPropertyType,
  Mutation,
  MutationType,
} from "../mutation";

type ConstParam = ConstructorParameters<
  typeof ChangeNovelDescriptionMutation
>[0];

type SaveData = {
  desc: string;
  novelID: string;
  og: boolean;
};

export const isChangeNovelDescriptionSaveData = (
  o: unknown,
): o is ConstParam => {
  if (
    !!o &&
    typeof o === "object" &&
    isPropertyType(
      o,
      "desc",
      (q) => typeof q === "string",
    ) &&
    isPropertyType(
      o,
      "novelID",
      (q) => typeof q === "string",
    ) &&
    isPropertyType(o, "og", (q) => typeof q === "boolean")
  ) {
    o satisfies ConstParam;
    return true;
  }
  return false;
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
  constructor({
    desc,
    novelID,
    og,
    mutationDate,
  }: SaveData & Partial<CommonSaveData>) {
    const mDate = getMDate(mutationDate);
    super(
      ChangeNovelDescriptionMutation.getID({ novelID, og }),
      (p) => {
        return p.map((n) =>
          n.id === this.data.novelID ?
            og ?
              {
                ...n,
                ogdesc: desc,
                lastUpdatedAt: mDate,
              }
            : {
                ...n,
                tldesc: desc,
                lastUpdatedAt: mDate,
              }
          : n,
        );
      },
      desc,
      MutationType.CHANGE_DESC,
      async () => {
        await trpcClient.db.changeNovelDescription.mutate(
          Mutation.getSaveData(this),
        );
      },
      { desc, novelID, og, mutationDate: mDate },
      mDate,
    );
  }
  updateID(): void {
    this.id = ChangeNovelDescriptionMutation.getID(
      this.data,
    );
  }
  override onRemoved(): void {}
  override beforeAdd(): void {}
}
