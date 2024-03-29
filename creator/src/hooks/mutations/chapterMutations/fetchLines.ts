import { type Optional } from "@/utils/utils";
import { Mutation, MutationType } from "../mutation";
import { type TextLine } from "@prisma/client";
import { type ScrapperTextLine } from "@/server/api/routers/scrapper";

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
  console.log("Checking if is line", d);
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
): d is SaveData {
  console.log(d);
  return (
    !!d &&
    typeof d === "object" &&
    "chapterID" in d &&
    typeof d.chapterID === "string" &&
    "novelID" in d &&
    typeof d.novelID === "string" &&
    "tlID" in d &&
    typeof d.tlID === "string" &&
    "fetchID" in d &&
    typeof d.fetchID === "string" &&
    "lines" in d &&
    Array.isArray(d.lines) &&
    d.lines.reduce<boolean>((p, n: unknown) => {
      return !p ? p : isScrapperTextLine(n);
    }, true)
  );
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
  constructor({
    chapterID,
    novelID,
    tlID,
    lines,
    fetchID,
  }: Optional<SaveData, "fetchID">) {
    const id =
      fetchID ??
      `fetch_lines_${++FetchLinesMutation.fetchLineID}`;

    const textLines: TextLine[] = lines.map<TextLine>(
      (l) => {
        return {
          id: `textline_${tlID}_${l.pos}`,
          pos: l.pos,
          ogline: l.text,
          status: "STAGED",
          textID: tlID,
          tlline: "",
        } satisfies TextLine;
      },
    );
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
              chapters: n.chapters.map((ch) => {
                return ch.id === this.data.chapterID ?
                    {
                      ...ch,
                      translations: ch.translations.map(
                        (tl) => {
                          return tl.id === this.data.tlID ?
                              {
                                ...tl,
                                lines: textLines,
                              }
                            : tl;
                        },
                      ),
                    }
                  : ch;
              }),
            }
          : n,
        );
      },
      () =>
        `...${this.data.novelID.substring(this.data.novelID.length - 4)}/...${this.data.chapterID.substring(this.data.chapterID.length - 4)}/...${this.data.tlID.substring(this.data.tlID.length - 4)}`,
      MutationType.FETCH_LINES,
      async () => {
        throw "TODO _fetchLine";
      },
      {
        chapterID,
        novelID,
        fetchID: id,
        lines,
        tlID,
      },
    );
  }
  updateID(): void {
    this.id = FetchLinesMutation.getID(this.data);
  }
  override onRemoved(): void {}
}
