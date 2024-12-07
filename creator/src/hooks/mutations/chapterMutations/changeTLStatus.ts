import { TLStatus } from "@prisma/client";
import {
  type CommonSaveData,
  getMDate,
  isPropertyType,
  isPropertyTypeOrUndefined,
  Mutation,
  MutationType,
  type StoreChapter,
  type StoreTranslation,
} from "../mutation";
import { trpcClient } from "@/pages/_app";
type ConstParam = ConstructorParameters<
  typeof ChangeTLStatusMutation
>[0];
type SaveData = {
  novelID: string;
  chapterID: string;
  tlID: string;
  publishdate?: string;
  editdate?: string;
  status: TLStatus;
};

export const isChangeTLStatusSaveData = (
  o: unknown,
): o is ConstParam => {
  if (
    !!o &&
    typeof o === "object" &&
    isPropertyType(
      o,
      "novelID",
      (q): q is string => typeof q === "string",
    ) &&
    isPropertyType(
      o,
      "chapterID",
      (q): q is string => typeof q === "string",
    ) &&
    isPropertyType(
      o,
      "tlID",
      (q): q is string => typeof q === "string",
    ) &&
    isPropertyType(
      o,
      "lineID",
      (q): q is string => typeof q === "string",
    ) &&
    isPropertyType(o, "status", (q): q is TLStatus =>
      Object.values(TLStatus).includes(q as TLStatus),
    ) &&
    isPropertyTypeOrUndefined(
      o,
      "publishdate",
      (q): q is string => typeof q === "string",
    ) &&
    isPropertyTypeOrUndefined(
      o,
      "editdate",
      (q): q is string => typeof q === "string",
    )
  ) {
    o satisfies ConstParam;
    return true;
  }
  return false;
};

export class ChangeTLStatusMutation extends Mutation<
  MutationType.CHANGE_TL_STATUS,
  SaveData
> {
  static getID = ({
    novelID,
    chapterID,
    tlID,
  }: Omit<
    SaveData,
    "status" | "publishdate" | "editdate"
  >) => `change_tl_status_${novelID}_${chapterID}_${tlID}`;
  constructor({
    novelID,
    chapterID,
    tlID,
    status,
    publishdate,
    editdate,
    mutationDate,
  }: SaveData & Partial<CommonSaveData>) {
    const mDate = getMDate(mutationDate);
    super(
      ChangeTLStatusMutation.getID({
        novelID,
        chapterID,
        tlID,
      }),
      (p) => {
        return p.map((n) => {
          return n.id === this.data.novelID ?
              {
                ...n,
                chapters: n.chapters.map(
                  (ch: StoreChapter) => {
                    return ch.id === this.data.chapterID ?
                        {
                          ...ch,
                          lastUpdatedAt: mDate,
                          translations: ch.translations.map(
                            (tl: StoreTranslation) => {
                              return (
                                  tl.id === this.data.tlID
                                ) ?
                                  {
                                    ...tl,
                                    status,
                                    lastUpdatedAt: mDate,
                                  }
                                : tl;
                            },
                          ),
                        }
                      : ch;
                  },
                ),
              }
            : n;
        });
      },
      status,
      MutationType.CHANGE_TL_STATUS,
      async () => {
        await trpcClient.db.changeTLStatus.mutate({
          tlID: this.data.tlID,
          status: this.data.status,
          mutationDate: mDate,
        });
      },
      {
        novelID,
        chapterID,
        tlID,
        status,
        publishdate,
        editdate,
        mutationDate: mDate,
      },
      mDate,
    );
  }
  updateID(): void {
    this.id = ChangeTLStatusMutation.getID(this.data);
  }
  override onRemoved(): void {}
  override beforeAdd(): void {}
}
