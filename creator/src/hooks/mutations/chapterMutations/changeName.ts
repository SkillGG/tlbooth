import { Mutation, MutationType } from "../mutation";

type SaveData = {
  og: boolean;
  name: string;
  novelID: string;
  chapterID: string;
};

export const isChangeChapterNameSaveData = (
  o: unknown,
): o is SaveData => {
  return (
    !!o &&
    typeof o === "object" &&
    "name" in o &&
    "novelID" in o &&
    "og" in o &&
    "chapterID" in o &&
    typeof o.name === "string" &&
    typeof o.novelID === "string" &&
    typeof o.og === "boolean" &&
    typeof o.chapterID === "string"
  );
};

export class ChangeChapterNameMutation extends Mutation<
  MutationType.CHANGE_CHAPTER_NAME,
  SaveData
> {
  static getID = ({
    novelID,
    chapterID,
    og,
  }: Omit<SaveData, "name">) =>
    `change_chapter_${og ? "og" : "tl"}_name_${novelID}_${chapterID}`;
  constructor({ novelID, chapterID, name, og }: SaveData) {
    super(
      ChangeChapterNameMutation.getID({
        novelID,
        chapterID,
        og,
      }),
      (p) => {
        if (og)
          return p.map((n) =>
            n.id === novelID ?
              {
                ...n,
                chapters: n.chapters.map((ch) =>
                  ch.id === chapterID ?
                    { ...ch, ogname: name }
                  : ch,
                ),
              }
            : n,
          );
        return p.map((n) =>
          n.id === novelID ?
            {
              ...n,
              chapters: n.chapters.map((ch) =>
                ch.id === chapterID ?
                  { ...ch, tlname: name }
                : ch,
              ),
            }
          : n,
        );
      },
      name,
      MutationType.CHANGE_CHAPTER_NAME,
      async () => {
        throw "TODO";
      },
      [{ novelID }],
      { novelID, name, og, chapterID },
    );
  }
  static fromData(d: SaveData) {
    return new ChangeChapterNameMutation(d);
  }
}
