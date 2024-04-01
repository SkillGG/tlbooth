import {
  useNovelStore,
  type TLInfo,
} from "@/hooks/novelStore";
import { ChapterEditCard } from "../ChapterEdit/ChapterEditCard";
import { NovelEditCard } from "../ChapterEdit/NovelEditCard";
import {
  type LineStatus,
  type TextLine,
} from "@prisma/client";
import { trpcClient } from "@/pages/_app";
import { FetchLinesMutation } from "@/hooks/mutations/chapterMutations/fetchLines";
import { EditField } from "../EditField";
import { ChangeLineMutation } from "@/hooks/mutations/chapterMutations/changeLine";
import { usePopupMenu } from "../PopupMenu";
import { ChangeLineStatusMutation } from "@/hooks/mutations/chapterMutations/changeLineStatus";
import Head from "next/head";
import { ChangeTLStatusMutation } from "@/hooks/mutations/chapterMutations/changeTLStatus";
import { useEffect, useMemo, useState } from "react";

function LineItem({
  line,
  tlID,
  lock,
}: {
  line: TextLine;
  tlID: string;
  lock: boolean;
}) {
  const {
    mutate,
    getTranslationInfo,
    removeMutation,
    isMutation,
  } = useNovelStore();

  const [raw, setRaw] = useState<boolean>(false);

  const tlInfo = getTranslationInfo(tlID);
  const popup = usePopupMenu();

  useEffect(() => {
    const abort = new AbortController();
    window.addEventListener(
      "scroll",
      () => {
        popup.hide();
      },
      {
        signal: abort.signal,
      },
    );
    return () => {
      abort.abort();
    };
  }, [popup]);

  if (!tlInfo) return <></>;

  const {
    novel: { id: novelID },
    chap: { id: chapterID },
  } = tlInfo;

  const textStyle = `${
    line.status === "STAGED" ? "text-chapstate-localonly"
    : line.status === "TL" ? "text-chapstate-dbonly"
    : "text-chapstate-good"
  }`;

  const changeStateTo = (status: LineStatus) => {
    mutate(
      new ChangeLineStatusMutation({
        novelID,
        chapterID,
        status,
        tlID,
        lineID: line.id,
      }),
      true,
    );
  };

  return (
    <>
      <div
        className={`${textStyle} col-[1/span_1] grid w-min content-center justify-center`}
      >
        #{line.pos}
      </div>
      <div
        className={`${textStyle} col-[2/span_1] grid h-full content-center pl-2`}
      >
        <button
          data-openspopup
          onClick={(e) => {
            popup.show(e.clientX, e.clientY, [
              line.status === "STAGED" && {
                label: "Mark as\ntranslated",
                action() {
                  changeStateTo("TL");
                },
              },
              ...(line.status === "TL" ?
                [
                  {
                    label: "Approve",
                    action() {
                      changeStateTo("PR");
                    },
                  },
                  {
                    label: "Reject",
                    action() {
                      changeStateTo("STAGED");
                    },
                  },
                ]
              : []),
              {
                label: raw ? "HTML Edit" : "Raw edit",
                action() {
                  setRaw((p) => !p);
                },
              },
            ]);
          }}
        >
          {raw ? "[" : "("}
          {line.status.substring(0, 2)}
          {raw ? "]" : ")"}
        </button>
      </div>
      <div
        className={`${textStyle} col-[3/span_1] grid content-center justify-center px-2 text-center`}
      >
        <EditField
          fieldName=""
          lock={true}
          defaultValue={line.ogline}
          className={{
            editField: { div: "text-center" },
            header: { main: "block min-h-[15px]" },
          }}
        />
      </div>
      <div
        className={`${textStyle} col-[4/span_1] flex align-middle`}
      >
        <button
          disabled={lock}
          onClick={() => {
            mutate(
              new ChangeLineMutation({
                novelID,
                chapterID,
                tlID,
                lineID: line.id,
                og: false,
                value: line.ogline,
                status: "TL",
              }),
            );
          }}
        >
          ={">"}
        </button>
      </div>
      <div
        className={`${textStyle} col-[5/span_1] grid content-center justify-center px-2 text-center`}
      >
        <EditField
          fieldName=""
          className={{
            editField: {
              span: "min-h-6 break-normal text-center",
            },
            staticField: { span: "min-h-6 text-center" },
          }}
          lock={lock}
          defaultValue={line.tlline}
          onRestore={() => {
            removeMutation(
              ChangeLineMutation.getID({
                chapterID: tlInfo.chap.id,
                novelID: tlInfo.novel.id,
                tlID: tlInfo.tl.id,
                lineID: line.id,
                og: false,
              }),
            );
          }}
          rawHTR={raw ? true : undefined}
          showRestore={isMutation(
            ChangeLineMutation.getID({
              chapterID: tlInfo.chap.id,
              novelID: tlInfo.novel.id,
              tlID: tlInfo.tl.id,
              lineID: line.id,
              og: false,
            }),
          )}
          onSave={(value) => {
            mutate(
              new ChangeLineMutation({
                chapterID: tlInfo.chap.id,
                novelID: tlInfo.novel.id,
                tlID: tlInfo.tl.id,
                lineID: line.id,
                og: false,
                value,
                status: "TL",
              }),
              true,
            );
          }}
        />
      </div>
    </>
  );
}

const lowerLineStatus = (
  a: LineStatus,
  b: LineStatus,
): LineStatus => {
  if (a === "STAGED" || b === "STAGED") return "STAGED";
  if (a === "TL" || b === "TL") return "TL";
  return "PR";
};

export function TranslationEditor({
  info,
}: {
  info: NonNullable<TLInfo>;
}) {
  const { tl, novel, chap } = info;

  const { mutate } = useNovelStore();

  const checkStatus = useMemo(
    () => () => {
      console.log("Checking TL Status");

      if (tl.lines.length === 0) {
        if (tl.status !== "STAGED") {
          mutate(
            new ChangeTLStatusMutation({
              novelID: novel.id,
              chapterID: chap.id,
              tlID: tl.id,
              status: "STAGED",
            }),
            true,
          );
        }
        return;
      }

      const lowest = tl.lines.reduce<LineStatus>(
        (p, line) => lowerLineStatus(p, line.status),
        "PR",
      );

      if (tl.status === "PUBLISH") return;

      if (tl.status !== lowest) {
        mutate(
          new ChangeTLStatusMutation({
            novelID: novel.id,
            chapterID: chap.id,
            tlID: tl.id,
            status: lowest,
          }),
          true,
        );
      }
    },
    [chap.id, mutate, novel.id, tl.id, tl.lines, tl.status],
  );

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const getBorderColor = () => {
    if (tl.status === "STAGED")
      return "border-chapstate-localonly";
    if (tl.status === "TL")
      return "border-chapstate-dbonly";
    if (tl.status === "PR")
      return "border-chapstate-dbonly";
    if (tl.status === "PUBLISH")
      return "border-chapstate-good";
  };

  return (
    <div className={`mx-auto grid max-w-[90%] px-2`}>
      <Head>
        <title>Editing translation: {novel.ogname}</title>
      </Head>
      <NovelEditCard id={novel.id} />
      <ChapterEditCard
        novelID={novel.id}
        chapterID={chap.id}
      />
      <div
        className={`border-2 pb-2 ${getBorderColor()} ${getBorderColor()?.replace("border", "text")}`}
      >
        <div className="px-2">
          Translation{" "}
          {tl.status !== "PUBLISH" && (
            <button
              className="text-white"
              onClick={async () => {
                if (!chap) return;
                const lines =
                  await trpcClient.scrapper.getChapterLines.query(
                    {
                      novelURL: novel.url,
                      chapterURL: chap.url,
                    },
                  );
                if (!lines) return;
                if ("error" in lines) {
                  console.error(lines.error);
                  return;
                }
                mutate(
                  new FetchLinesMutation({
                    chapterID: chap.id,
                    lines,
                    novelID: novel.id,
                    tlID: tl.id,
                  }),
                );
              }}
            >
              {tl.lines.length === 0 ?
                "Init fetch"
              : "Refetch"}{" "}
              lines
            </button>
          )}
          {tl.status === "PR" && (
            <button
              className="ml-1 text-chapstate-good"
              onClick={() => {
                mutate(
                  new ChangeTLStatusMutation({
                    chapterID: chap.id,
                    novelID: novel.id,
                    status: "PUBLISH",
                    tlID: tl.id,
                  }),
                  true,
                );
              }}
            >
              Publish
            </button>
          )}
        </div>
        <div
          className={`grid grid-cols-[min-content_min-content_1fr_min-content_1fr] px-2 `}
        >
          {tl.lines.map((line) => (
            <LineItem
              key={line.id}
              line={line}
              tlID={tl.id}
              lock={tl.status === "PUBLISH"}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
