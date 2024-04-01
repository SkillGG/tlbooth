import { LineStatus } from "@prisma/client";
import { Mutation, MutationType } from "../mutation";
import { trpcClient } from "@/pages/_app";
import { type NovelStore } from "@/hooks/novelStore";

type SaveData = {
  status: LineStatus;
  novelID: string;
  chapterID: string;
  tlID: string;
  lineID: string;
};

export const isChangeLineStatusSaveData = (
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
    Object.values(LineStatus).includes(
      o.status as LineStatus,
    )
  );
};

export class ChangeLineStatusMutation extends Mutation<
  MutationType.CHANGE_LINE_STATUS,
  SaveData
> {
  static getID = ({
    novelID,
    chapterID,
    lineID,
    tlID,
    status,
  }: SaveData) =>
    `change_line_status_${novelID}_${chapterID}_${tlID}_${lineID}_${status}`;
  constructor({
    novelID,
    chapterID,
    tlID,
    lineID,
    status,
  }: SaveData) {
    super(
      ChangeLineStatusMutation.getID({
        novelID,
        chapterID,
        tlID,
        lineID,
        status,
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
                                          l.id === lineID
                                        ) ?
                                          {
                                            ...l,
                                            status,
                                          }
                                        : l;
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
      status,
      MutationType.CHANGE_LINE_STATUS,
      async () => {
        await trpcClient.db.changeLine.mutate({
          lineID: this.data.lineID,
          status: this.data.status,
        });
      },
      {
        novelID,
        chapterID,
        lineID,
        tlID,
        status,
      },
    );
  }
  updateID(): void {
    this.id = ChangeLineStatusMutation.getID(this.data);
  }
  override onRemoved(store: NovelStore): void {
    if (this.data.status === "TL") {
      store.removeMutation(
        ChangeLineStatusMutation.getID({
          novelID: this.data.novelID,
          chapterID: this.data.chapterID,
          lineID: this.data.lineID,
          tlID: this.data.tlID,
          status: "PR",
        }),
      );
    }
  }
}
