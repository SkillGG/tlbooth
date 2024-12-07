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
import { type NovelStore } from "@/hooks/novelStore";

type ConstParam = ConstructorParameters<
  typeof ChangeLineStatusMutation
>[0];

type SaveData = {
  status: LineStatus;
  novelID: string;
  chapterID: string;
  tlID: string;
  lineID: string;
};

export const isChangeLineStatusSaveData = (
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
    isPropertyType(o, "status", (q): q is LineStatus =>
      Object.values(LineStatus).includes(q as LineStatus),
    )
  ) {
    o satisfies ConstParam;
    return true;
  }
  return false;
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
    mutationDate,
  }: SaveData & Partial<CommonSaveData>) {
    const mDate = getMDate(mutationDate);
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
                                            l.id === lineID
                                          ) ?
                                            {
                                              ...l,
                                              status,
                                              lastUpdatedAt:
                                                mDate,
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
                  },
                ),
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
          mutationDate: mDate,
        });
      },
      {
        novelID,
        chapterID,
        lineID,
        tlID,
        status,
        mutationDate: mDate,
      },
      mDate,
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
  override beforeAdd(): void {}
}
