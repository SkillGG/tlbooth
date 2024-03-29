import { type PropsWithChildren } from "react";
import { EditField } from "../EditField";
import { cssIf } from "@/utils/utils";
import { useNovelStore } from "@/hooks/novelStore";
import { ChangeChapterNameMutation } from "@/hooks/mutations/chapterMutations/changeName";

export function ChapterEditCard({
  novelID,
  chapterID,
  children,
}: PropsWithChildren<{
  novelID: string;
  chapterID: string;
}>) {
  const {
    getChapter,
    getDBChapter,
    getDBNovel,
    removeMutation,
    mutate,
    isMutation,
  } = useNovelStore();

  const localNovel = !getDBNovel(novelID);

  const chapter = getChapter(novelID, chapterID);

  const localChapter = !getDBChapter(novelID, chapterID);

  const isThickLine = !localChapter && !localNovel;

  return (
    <div
      className={`border-2 pb-2 ${cssIf(isThickLine, "border-t-0")} ${cssIf(localChapter) ? "border-chapstate-localonly text-chapstate-localonly" : "border-chapstate-good text-chapstate-good"}`}
    >
      <div className="px-2">Chapter</div>
      <div className="flex w-full justify-evenly gap-3">
        <EditField
          fieldName="Original name"
          lock={false}
          className={{ main: "mx-4 inline-block" }}
          defaultValue={chapter?.ogname}
          showRestore={isMutation(
            ChangeChapterNameMutation.getID({
              chapterID,
              novelID,
              og: true,
            }),
          )}
          onSave={(name) => {
            mutate(
              new ChangeChapterNameMutation({
                chapterID,
                novelID,
                name,
                og: true,
              }),
              true,
            );
          }}
          onRestore={() => {
            removeMutation(
              ChangeChapterNameMutation.getID({
                chapterID,
                novelID,
                og: true,
              }),
            );
          }}
        />
        <EditField
          fieldName="Translated name"
          lock={false}
          className={{ main: "mx-4 inline-block" }}
          defaultValue={chapter?.tlname ?? ""}
          showRestore={isMutation(
            ChangeChapterNameMutation.getID({
              chapterID,
              novelID,
              og: false,
            }),
          )}
          onSave={(name) =>
            mutate(
              new ChangeChapterNameMutation({
                novelID,
                chapterID,
                name,
                og: false,
              }),
            )
          }
          onRestore={() =>
            removeMutation(
              ChangeChapterNameMutation.getID({
                novelID,
                chapterID,
                og: false,
              }),
            )
          }
        />
      </div>
      {children}
    </div>
  );
}
