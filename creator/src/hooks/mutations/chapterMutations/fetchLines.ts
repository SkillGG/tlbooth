import { type Optional } from "@/utils/utils";
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
import { type TextLine } from "@prisma/client";
import { type ScrapperTextLine } from "@/server/api/routers/scrapper";
import { trpcClient } from "@/pages/_app";

type ConstParam = ConstructorParameters<
  typeof FetchLinesMutation
>[0];

type SaveData = {
  lines: ScrapperTextLine[];
  chapterID: string;
  novelID: string;
  tlID: string;
  fetchID: string;
};

export function isScrapperTextLine(
  d: unknown,
): d is ScrapperTextLine {
  return (
    typeof d === "object" &&
    !!d &&
    "text" in d &&
    typeof d.text === "string" &&
    "pos" in d &&
    typeof d.pos === "number"
  );
}

export function isFetchLineSaveData(
  d: unknown,
): d is ConstParam {
  if (
    !!d &&
    typeof d === "object" &&
    isPropertyType(
      d,
      "chapterID",
      (q): q is string => typeof q === "string",
    ) &&
    isPropertyType(
      d,
      "novelID",
      (q): q is string => typeof q === "string",
    ) &&
    isPropertyType(
      d,
      "tlID",
      (q): q is string => typeof q === "string",
    ) &&
    isPropertyType(
      d,
      "fetchID",
      (q): q is string => typeof q === "string",
    ) &&
    isPropertyType(
      d,
      "lines",
      (l): l is ScrapperTextLine[] => {
        return (
          Array.isArray(l) &&
          l.every((p) => isScrapperTextLine(p))
        );
      },
    )
  ) {
    d satisfies ConstParam;
    return true;
  }
  return false;
}

export class FetchLinesMutation extends Mutation<
  MutationType.FETCH_LINES,
  SaveData
> {
  static fetchLineID = 0;
  static getID({
    chapterID,
    fetchID,
    novelID,
    tlID,
  }: Optional<SaveData, "lines">) {
    return `fetch_${novelID}_${chapterID}_${tlID}_${fetchID}`;
  }
  static toTextLines(
    tlID: string,
    lines: SaveData["lines"],
  ) {
    return lines.map<TextLine>((l) => {
      return {
        id: `textline_${tlID}_${l.pos}`,
        pos: l.pos,
        ogline: l.text,
        status: "STAGED",
        textID: tlID,
        tlline: "",
      } satisfies TextLine;
    });
  }
  constructor({
    chapterID,
    novelID,
    tlID,
    lines,
    fetchID,
    mutationDate,
  }: Optional<
    SaveData & CommonSaveData,
    "fetchID" | "mutationDate"
  >) {
    const id =
      fetchID ??
      `fetch_lines_${++FetchLinesMutation.fetchLineID}`;
    const mDate = getMDate(mutationDate);
    super(
      FetchLinesMutation.getID({
        chapterID,
        novelID,
        tlID,
        fetchID: id,
      }),
      (p) => {
        return p.map((n) =>
          n.id === this.data.novelID ?
            {
              ...n,
              // add lines and update all lastUpdatedAt values
              chapters: n.chapters.map<StoreChapter>(
                (ch) => {
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
                                  lines:
                                    FetchLinesMutation.toTextLines(
                                      this.data.tlID,
                                      this.data.lines,
                                    ).map(
                                      (
                                        l: StoreTextLine,
                                      ) => ({
                                        ...l,
                                        createdAt: mDate,
                                        lastUpdatedAt:
                                          mDate,
                                      }),
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
          : n,
        );
      },
      () =>
        // id creator
        `...${this.data.novelID.substring(this.data.novelID.length - 4)}/...${this.data.chapterID.substring(this.data.chapterID.length - 4)}/...${this.data.tlID.substring(this.data.tlID.length - 4)}`,
      MutationType.FETCH_LINES,
      async () => {
        await trpcClient.db.initLines.mutate({
          tlID: this.data.tlID,
          lines: this.data.lines.map((f) => ({
            ogline: f.text,
            pos: f.pos,
          })),
          mutationDate: mDate,
        });
      },
      {
        chapterID,
        novelID,
        fetchID: id,
        lines,
        tlID,
        mutationDate: mDate,
      },
      mDate,
    );
  }
  updateID(): void {
    this.id = FetchLinesMutation.getID(this.data);
  }
  override onRemoved(): void {}
  override beforeAdd(): void {}
}
