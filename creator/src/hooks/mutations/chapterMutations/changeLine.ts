import { LineStatus } from "@prisma/client";
import {
  type CommonSaveData,
  getMDate,
  isPropertyType,
  Mutation,
  MutationType,
  type StoreChapter,
  type StoreTextLine,
  type StoreTranslation,
} from "../mutation";
import { trpcClient } from "@/pages/_app";

type ConstParam = ConstructorParameters<
  typeof ChangeLineMutation
>[0];

type SaveData = {
  value: string;
  novelID: string;
  chapterID: string;
  tlID: string;
  og: boolean;
  lineID: string;
  status?: LineStatus;
};

export const isChangeLineSaveData = (
  o: unknown,
): o is ConstParam => {
  if (
    !!o &&
    typeof o === "object" &&
    isPropertyType(
      o,
      "value",
      (q) => typeof q === "string",
    ) &&
    isPropertyType(
      o,
      "novelID",
      (q) => typeof q === "string",
    ) &&
    isPropertyType(
      o,
      "og",
      (q) => typeof q === "boolean",
    ) &&
    isPropertyType(
      o,
      "chapterID",
      (q) => typeof q === "string",
    ) &&
    isPropertyType(
      o,
      "tlID",
      (q) => typeof q === "string",
    ) &&
    isPropertyType(
      o,
      "lineID",
      (q) => typeof q === "string",
    ) &&
    ("status" in o ?
      Object.values(LineStatus).includes(
        o.status as LineStatus,
      )
    : true)
  ) {
    o satisfies ConstParam;
    return true;
  }
  return false;
};

export class ChangeLineMutation extends Mutation<
  MutationType.CHANGE_LINE,
  SaveData
> {
  static getID = ({
    novelID,
    chapterID,
    tlID,
    lineID,
    og,
  }: Omit<SaveData, "value" | "status" | "linePos">) =>
    `change_line_${og ? "og" : "tl"}_${novelID}_${chapterID}_${tlID}_${lineID}`;
  constructor({
    novelID,
    chapterID,
    og,
    tlID,
    value,
    lineID,
    status,
    mutationDate,
  }: SaveData & Partial<CommonSaveData>) {
    const mDate = getMDate(mutationDate);
    super(
      ChangeLineMutation.getID({
        novelID,
        chapterID,
        tlID,
        lineID,
        og,
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
                                    lastUpdatedAt: mDate,
                                    lines: tl.lines.map(
                                      (
                                        l: StoreTextLine,
                                      ) => {
                                        return (
                                          l.id === lineID ?
                                            og ?
                                              {
                                                ...l,
                                                ogline:
                                                  value,
                                                lastUpdatedAt:
                                                  mDate,
                                                status:
                                                  status ?
                                                    status
                                                  : l.status,
                                              }
                                            : {
                                                ...l,
                                                tlline:
                                                  value,
                                                lastUpdatedAt:
                                                  mDate,
                                                status:
                                                  status ?
                                                    status
                                                  : l.status,
                                              }
                                          : l
                                        );
                                      },
                                    ),
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
      value,
      MutationType.CHANGE_LINE,
      async () => {
        await trpcClient.db.changeLine.mutate({
          lineID: this.data.lineID,
          status: this.data.status,
          value: {
            og: this.data.og,
            text: this.data.value,
          },
          mutationDate: mDate,
        });
      },
      {
        novelID,
        og,
        lineID,
        chapterID,
        tlID,
        value,
        status,
        mutationDate: mDate,
      },
      mDate,
    );
  }
  updateID(): void {
    this.id = ChangeLineMutation.getID(this.data);
  }
  override onRemoved(): void {}
  override beforeAdd(): void {}
}
