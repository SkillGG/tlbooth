import {
  useNovelStore,
  type TLInfo,
} from "@/hooks/novelStore";
import { ChapterEditCard } from "../ChapterEdit/ChapterEditCard";
import { NovelEditCard } from "../ChapterEdit/NovelEditCard";
import { cssIf } from "@/utils/utils";
import { type TextLine } from "@prisma/client";
import { trpcClient } from "@/pages/_app";
import { FetchLinesMutation } from "@/hooks/mutations/chapterMutations/fetchLines";
import { EditField } from "../EditField";
import { ChangeLineMutation } from "@/hooks/mutations/chapterMutations/changeLine";
// import { FetchLinesMutation } from "@/hooks/mutations/chapterMutations/fetchLines";

function LineItem({
  line,
  tlID,
}: {
  line: TextLine;
  tlID: string;
}) {
  const {
    mutate,
    getTranslationInfo,
    removeMutation,
    isMutation,
  } = useNovelStore();

  const tlInfo = getTranslationInfo(tlID);

  if (!tlInfo) return <></>;

  return (
    <>
      <div
        className="grid w-min content-center justify-center"
        style={{ gridColumn: "1 / span 1" }}
      >
        #{line.pos}
      </div>
      <div
        className="grid content-center justify-center"
        style={{ gridColumn: "2 / span 1" }}
      >
        <EditField
          fieldName=""
          lock={true}
          defaultValue={line.ogline}
        />
      </div>
      <div
        className="grid justify-center"
        style={{ gridColumn: "3 / span 1" }}
      >
        <EditField
          fieldName=""
          className={{
            editField: { span: "break-normal" },
          }}
          lock={false}
          defaultValue={line.tlline}
          onRestore={() => {
            removeMutation(
              ChangeLineMutation.getID({
                chapterID: tlInfo.chap.id,
                novelID: tlInfo.novel.id,
                tlID: tlInfo.tl.id,
                linePos: line.pos,
                og: false,
              }),
            );
          }}
          showRestore={isMutation(
            ChangeLineMutation.getID({
              chapterID: tlInfo.chap.id,
              novelID: tlInfo.novel.id,
              tlID: tlInfo.tl.id,
              linePos: line.pos,
              og: false,
            }),
          )}
          onSave={(value) => {
            mutate(
              new ChangeLineMutation({
                chapterID: tlInfo.chap.id,
                novelID: tlInfo.novel.id,
                tlID: tlInfo.tl.id,
                linePos: line.pos,
                og: false,
                value,
              }),
              true,
            );
          }}
        />
      </div>
    </>
  );
}

export function TranslationEditor({
  info,
}: {
  info: NonNullable<TLInfo>;
}) {
  const { tl, novel, chap } = info;

  const { getChapter, mutate } = useNovelStore();

  const localChapter = !!getChapter(novel.id, chap.id)
    ?.local;

  const isThickLine =
    (localChapter && tl.status === "STAGED") ||
    (!localChapter && tl.status !== "STAGED");

  return (
    <div
      className={`grid px-2 ${tl.status === "STAGED" ? "text-chapstate-localonly" : "text-chapstate-good"} mx-auto max-w-[90%]`}
    >
      <NovelEditCard id={novel.id} />
      <ChapterEditCard
        novelID={novel.id}
        chapterID={chap.id}
      />
      <div
        className={`border-2 pb-2 ${cssIf(isThickLine, "border-t-0")} ${cssIf(tl.status === "STAGED", "border-chapstate-localonly text-chapstate-localonly", "border-chapstate-good text-chapstate-good")}`}
      >
        <div className="px-2">
          Translation{" "}
          <button
            className="text-white"
            onClick={async () => {
              if (!chap) return;
              const ch =
                await trpcClient.scrapper.getChapter.query({
                  novelURL: novel.url,
                  chapterURL: chap.url,
                });
              if (!ch) return;
              if ("error" in ch) {
                console.error(ch.error);
                return;
              }
              mutate(
                new FetchLinesMutation({
                  chapterID: chap.id,
                  lines: ch.lines,
                  novelID: novel.id,
                  tlID: tl.id,
                }),
              );
            }}
          >
            Fetch lines
          </button>
        </div>
        <div
          className="grid px-2"
          style={{
            gridTemplateColumns: "min-content 1fr 1fr",
          }}
        >
          {tl.lines.map((line) => (
            <LineItem
              key={line.id}
              line={line}
              tlID={tl.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
