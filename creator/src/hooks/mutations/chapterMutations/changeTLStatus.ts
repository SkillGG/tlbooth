import { TLStatus } from "@prisma/client";
import { Mutation, MutationType } from "../mutation";
import { trpcClient } from "@/pages/_app";

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
): o is SaveData => {
  return (
    !!o &&
    typeof o === "object" &&
    "novelID" in o &&
    typeof o.novelID === "string" &&
    "chapterID" in o &&
    typeof o.chapterID === "string" &&
    "tlID" in o &&
    typeof o.tlID === "string" &&
    "lineID" in o &&
    typeof o.lineID === "string" &&
    "status" in o &&
    Object.values(TLStatus).includes(
      o.status as TLStatus,
    ) &&
    ("publishdate" in o ?
      typeof o.publishdate === "string"
    : true) &&
    ("editdate" in o ?
      typeof o.editdate === "string"
    : true)
  );
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
  }: SaveData) {
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
                chapters: n.chapters.map((ch) => {
                  return ch.id === this.data.chapterID ?
                      {
                        ...ch,
                        translations: ch.translations.map(
                          (tl) => {
                            return (
                                tl.id === this.data.tlID
                              ) ?
                                {
                                  ...tl,
                                  status,
                                }
                              : tl;
                          },
                        ),
                      }
                    : ch;
                }),
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
        });
      },
      {
        novelID,
        chapterID,
        tlID,
        status,
        publishdate,
        editdate,
      },
    );
  }
  updateID(): void {
    this.id = ChangeTLStatusMutation.getID(this.data);
  }
  override onRemoved(): void {}
}
