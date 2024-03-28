import { Mutation, MutationType } from "../mutation";

type SaveData = {
  value: string;
  novelID: string;
  chapterID: string;
  tlID: string;
  linePos: number;
  og: boolean;
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
    "linePos" in o &&
    typeof o.linePos === "number"
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
    linePos,
    og,
  }: Omit<SaveData, "value">) =>
    `change_line_${og ? "og" : "tl"}_${novelID}_${chapterID}_${tlID}_${linePos}`;
  constructor({
    novelID,
    chapterID,
    og,
    linePos,
    tlID,
    value,
  }: SaveData) {
    super(
      ChangeLineMutation.getID({
        novelID,
        chapterID,
        linePos,
        tlID,
        og,
      }),
      (p) => {
        return p.map((n) => {
          return n.id === novelID ?
              {
                ...n,
                chapters: n.chapters.map((ch) => {
                  return ch.id === chapterID ?
                      {
                        ...ch,
                        translations: ch.translations.map(
                          (tl) => {
                            return tl.id === tlID ?
                                {
                                  ...tl,
                                  lines: tl.lines.map(
                                    (l) => {
                                      return (
                                        l.pos === linePos ?
                                          og ?
                                            {
                                              ...l,
                                              ogline: value,
                                            }
                                          : {
                                              ...l,
                                              tlline: value,
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
        throw "TODO";
      },
      [{ novelID }],
      { novelID, og, chapterID, linePos, tlID, value },
    );
  }
  static fromData(d: SaveData) {
    return new ChangeLineMutation(d);
  }
}
