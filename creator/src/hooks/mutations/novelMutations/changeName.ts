import {
  type CommonSaveData,
  getMDate,
  isPropertyType,
  Mutation,
  MutationType,
} from "../mutation";
import { trpcClient } from "@/pages/_app";

type ConstParam = ConstructorParameters<
  typeof ChangeNovelNameMutation
>[0];

type SaveData = {
  og: boolean;
  name: string;
  novelID: string;
};

export const isChangeNovelNameSaveData = (
  o: unknown,
): o is ConstParam => {
  if (
    !!o &&
    typeof o === "object" &&
    isPropertyType(
      o,
      "name",
      (q): q is string => typeof q === "string",
    ) &&
    isPropertyType(
      o,
      "novelID",
      (q): q is string => typeof q === "string",
    ) &&
    isPropertyType(
      o,
      "og",
      (q): q is boolean => typeof q === "boolean",
    )
  ) {
    o satisfies ConstParam;
    return true;
  }
  return false;
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
  constructor({
    name,
    novelID,
    og,
    mutationDate,
  }: SaveData & Partial<CommonSaveData>) {
    const mDate = getMDate(mutationDate);
    super(
      ChangeNovelNameMutation.getID({ novelID, og }),
      (p) => {
        return p.map((n) =>
          n.id === this.data.novelID ?
            og ?
              {
                ...n,
                lastUpdatedAt: mDate,
                ogname: name,
              }
            : {
                ...n,
                tlname: name,
                lastUpdatedAt: mDate,
              }
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
      { novelID, name, og, mutationDate: mDate },
      mDate,
    );
  }
  updateID(): void {
    this.id = ChangeNovelNameMutation.getID(this.data);
  }
  override onRemoved(): void {}
  override beforeAdd(): void {}
}
