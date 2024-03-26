import { Optional } from "@/utils/utils";
import { Mutation, MutationType } from "../mutation";

type SaveData = {
  novelID: string;
  url: string;
  name: string;
  num: string;
  description: string;
  chapterID: string;
};

export const isStageChapterSaveData = (
  o: unknown,
): o is SaveData => {
  return (
    !!o &&
    typeof o === "object" &&
    "chapterID" in o &&
    typeof o.chapterID === "string" &&
    "novelID" in o &&
    typeof o.novelID === "string" &&
    "url" in o &&
    typeof o.url === "string" &&
    "num" in o &&
    typeof o.num === "string" &&
    "name" in o &&
    typeof o.name === "string" &&
    "description" in o &&
    typeof o.description === "string"
  );
};

export class StageChapterMutation extends Mutation<
  MutationType.STAGE_CHAPTER,
  SaveData
> {
  static getID({
    novelID,
    chapterID,
  }: {
    novelID: string;
    chapterID: string;
  }) {
    return `stage_chapter_${novelID}_${chapterID}`;
  }
  static chapterID = 0;
  constructor({
    novelID,
    description,
    name,
    num,
    url,
    chapterID,
  }: Optional<SaveData, "chapterID">) {
    const id =
      chapterID ??
      `local_chapter_${++StageChapterMutation.chapterID}`;
    super(
      StageChapterMutation.getID({
        novelID,
        chapterID: id,
      }),
      (p) =>
        p.map((n) => {
          return n.id === novelID ?
              {
                ...n,
                chapters: [
                  ...n.chapters,
                  {
                    id,
                    novelID: novelID,
                    num: num,
                    ogname: name,
                    url: url,
                    status: "STAGED",
                    tlname: "",
                    translations: [],
                  },
                ],
              }
            : n;
        }),
      name,
      MutationType.STAGE_CHAPTER,
      async () => {
        throw "ERROR";
      },
      [{ novelID }],
      {
        description,
        chapterID: id,
        name,
        novelID,
        num,
        url,
      },
    );
  }
  static fromData(o: SaveData) {
    return new StageChapterMutation(o);
  }
}
