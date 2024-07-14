import { LineStatus } from "@prisma/client";
import { Mutation, MutationType } from "../mutation";
import { trpcClient } from "@/pages/_app";
import { NovelStore } from "@/hooks/novelStore";

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
): o is SaveData => {
  return (
    !!o &&
    typeof o === "object" &&
    "value" in o &&
    typeof o.value === "string" &&
    "novelID" in o &&
    typeof o.novelID === "string" &&
    "og" in o &&
    typeof o.og === "boolean" &&
    "chapterID" in o &&
    typeof o.chapterID === "string" &&
    "tlID" in o &&
    typeof o.tlID === "string" &&
    ("status" in o ?
      Object.values(LineStatus).includes(
        o.status as LineStatus,
      )
    : true)
  );
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
  }: SaveData) {
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
                                  lines: tl.lines.map(
                                    (l) => {
                                      return (
                                        l.id === lineID ?
                                          og ?
                                            {
                                              ...l,
                                              ogline: value,
                                              status:
                                                status ?
                                                  status
                                                : l.status,
                                            }
                                          : {
                                              ...l,
                                              tlline: value,
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
                }),
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
      },
    );
  }
  updateID(): void {
    this.id = ChangeLineMutation.getID(this.data);
  }
  override onRemoved(): void {}
  override beforeAdd(): void {}
}
