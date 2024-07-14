import { type Optional } from "@/utils/utils";
import { Mutation, MutationType } from "../mutation";
import { trpcClient } from "@/pages/_app";
import { type NovelStore } from "@/hooks/novelStore";

type SaveData = {
  novelID: string;
  url: string;
  name: string;
  ognum: number;
  chapterID: string;
  date: Date;
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
    "ognum" in o &&
    typeof o.ognum === "number" &&
    "name" in o &&
    typeof o.name === "string" &&
    "date" in o &&
    typeof o.date === "object" &&
    o.date instanceof Date
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
    name,
    ognum,
    url,
    chapterID,
    date,
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
          return n.id === this.data.novelID ?
              {
                ...n,
                chapters: [
                  ...n.chapters,
                  {
                    id,
                    novelID: novelID,
                    num: `${ognum}`,
                    ogname: name,
                    ognum,
                    url: url,
                    tlname: "",
                    translations: [],
                    ogPub: date,
                  },
                ],
              }
            : n;
        }),
      name,
      MutationType.STAGE_CHAPTER,
      async (store) => {
        const result =
          await trpcClient.db.addChapter.mutate(this.data);
        if (result) {
          store.getMutations().forEach((mut) => {
            if ("chapterID" in mut.data) {
              mut.data.chapterID = result.id;
              mut.updateID();
            }
          });
          return (path) =>
            path.includes(id) ?
              path.replace(id, this.data.chapterID)
            : null;
        }
      },
      {
        chapterID: id,
        name,
        novelID,
        date,
        ognum,
        url,
      },
    );
  }
  updateID(): void {
    this.id = StageChapterMutation.getID(this.data);
  }
  override onRemoved(store: NovelStore): void {
    store.getMutations(true).forEach((mut) => {
      if (!("chapterID" in mut.data)) return;
      if (
        mut.data.chapterID === this.data.chapterID &&
        this.id !== mut.id
      ) {
        console.log(
          "removing mutation",
          mut,
          "because it depended on chapter",
          this.data.chapterID,
        );
        store.removeMutation(mut.id);
      }
    });
  }
}
