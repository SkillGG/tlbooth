// static stageChapterID = 0;
//   static stageChapterMutationID = (chapterID: string) =>
//     `stage_chapter_${chapterID}`;
//   static stageChapter(
//     novelID: string,
//     chapter: ScrapperChapterInfo,
//     id?: string,
//   ) {
//     const type = MutationType.STAGE_CHAPTER;
//     const chapterID =
//       id ?? `staged_chapter_${++Mutation.stageChapterID}`;
//     return new Mutation(
//       this.stageChapterMutationID(chapterID),
//       (p) =>
//         p.map((n) => {
//           return n.id === novelID ?
//               {
//                 ...n,
//                 chapters: [
//                   ...n.chapters,
//                   {
//                     id: chapterID,
//                     novelID: novelID,
//                     num: chapter.num,
//                     ogname: chapter.name,
//                     url: chapter.url,
//                     status: "STAGED",
//                     tlname: "",
//                     translations: [],
//                   },
//                 ],
//               }
//             : n;
//         }),
//       chapter.name,
//       type,
//       async () => {
//         // TODO
//       },
//       [{ novelID }],
//       {
//         type,
//         novelID: novelID,
//         chapter,
//         chapterID: chapterID,
//       },
//     );
//   }

import { Mutation, MutationType } from "../mutation";

type SaveData = {
  novelID: string;
  url: string;
  name: string;
  num: string;
  description: string;
  id: string;
};

export const isStageChapterSaveData = (
  o: unknown,
): o is SaveData => {
  return (
    !!o &&
    typeof o === "object" &&
    "id" in o &&
    typeof o.id === "string" &&
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
  static getID(novelID: string, chapterID: string) {
    return `stage_chapter_${novelID}_${chapterID}`;
  }
  static chapterID = 0;
  constructor(
    novelID: string,
    url: string,
    name: string,
    description: string,
    num: string,
    overrideID?: string,
  ) {
    const id =
      overrideID ??
      `local_chapter_${++StageChapterMutation.chapterID}`;
    super(
      StageChapterMutation.getID(novelID, id),
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
      { description, id, name, novelID, num, url },
    );
  }
  static fromData(o: SaveData) {
    return new StageChapterMutation(
      o.novelID,
      o.url,
      o.name,
      o.description,
      o.num,
      o.id,
    );
  }
}
