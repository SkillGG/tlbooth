import {
  useNovelStore,
  type TLInfo,
} from "@/hooks/novelStore";
import { ChapterEditCard } from "../ChapterEdit/ChapterEditCard";
import { NovelEditCard } from "../ChapterEdit/NovelEditCard";
import { cssIf } from "@/utils/utils";
import { TextLine } from "@prisma/client";
import { trpcClient } from "@/pages/_app";
import { FetchLinesMutation } from "@/hooks/mutations/chapterMutations/fetchLines";

function LineItem({
  line,
  tlID,
}: {
  line: TextLine;
  tlID: string;
}) {
  return (
    <>
      <div className="w-full justify-self-start text-center">
        {line.ogline}
      </div>
      <div className="w-full justify-self-end text-center">
        {line.tlline}
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
          <button className="text-white" onClick={async () => {
            if (!chap) return;
            const ch = await trpcClient.scrapper.getChapter.query({ novelURL: novel.url, chapterURL: chap.url });
            if (!ch) return;
            if ("error" in ch) {
              console.error(ch.error);
              return;
            }
            mutate(new FetchLinesMutation({ chapterID: chap.id, lines: ch.lines, novelID: novel.id, tlID: tl.id }))
          }}>
            Fetch lines
          </button>
        </div>
        <div className="grid w-full grid-cols-2 gap-3">
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
