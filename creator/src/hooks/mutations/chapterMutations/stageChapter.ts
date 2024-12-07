import { type Optional } from "@/utils/utils";
import {
  type CommonSaveData,
  getMDate,
  isPropertyType,
  Mutation,
  MutationType,
} from "../mutation";
import { trpcClient } from "@/pages/_app";
import { type NovelStore } from "@/hooks/novelStore";

type ConstParam = ConstructorParameters<
  typeof StageChapterMutation
>[0];

type SaveData = {
  novelID: string;
  url: string;
  name: string;
  ognum: number;
  chapterID: string;
  date: Date | string;
};

export const isStageChapterSaveData = (
  o: unknown,
): o is ConstParam => {
  if (
    !!o &&
    typeof o === "object" &&
    isPropertyType(
      o,
      "chapterID",
      (q) => typeof q === "string",
    ) &&
    isPropertyType(
      o,
      "novelID",
      (q) => typeof q === "string",
    ) &&
    isPropertyType(
      o,
      "url",
      (q) => typeof q === "string",
    ) &&
    isPropertyType(
      o,
      "ognum",
      (q) => typeof q === "number",
    ) &&
    isPropertyType(
      o,
      "date",
      (q) => typeof q === "string" || q instanceof Date,
    ) &&
    isPropertyType(o, "name", (q) => typeof q === "string")
  ) {
    o satisfies ConstParam;
    return true;
  }
  return false;
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
    mutationDate,
  }: Optional<
    SaveData & CommonSaveData,
    "chapterID" | "mutationDate"
  >) {
    const id =
      chapterID ??
      `local_chapter_${++StageChapterMutation.chapterID}`;
    const mDate = getMDate(mutationDate);
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
                    createdAt: mDate,
                    url: url,
                    tlname: "",
                    translations: [],
                    ogPub: new Date(date),
                  },
                ],
              }
            : n;
        }),
      name,
      MutationType.STAGE_CHAPTER,
      async (store) => {
        const result =
          await trpcClient.db.addChapter.mutate({
            ...this.data,
            date: new Date(this.data.date),
          });
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
        mutationDate: mDate,
      },
      mDate,
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
  override beforeAdd(): void {}
}
