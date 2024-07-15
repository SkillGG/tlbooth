import {
  useNovelStore,
  type TLInfo,
} from "@/hooks/novelStore";
import { ChapterEditCard } from "../ChapterEdit/ChapterEditCard";
import { NovelEditCard } from "../ChapterEdit/NovelEditCard";
import { type LineStatus } from "@prisma/client";
import { trpcClient } from "@/pages/_app";
import { FetchLinesMutation } from "@/hooks/mutations/chapterMutations/fetchLines";
import { EditField } from "../EditField";
import { ChangeLineMutation } from "@/hooks/mutations/chapterMutations/changeLine";
import { usePopupMenu } from "../PopupMenu";
import { ChangeLineStatusMutation } from "@/hooks/mutations/chapterMutations/changeLineStatus";
import Head from "next/head";
import { ChangeTLStatusMutation } from "@/hooks/mutations/chapterMutations/changeTLStatus";
import { useEffect, useMemo, useState } from "react";
import {
  type StoreTextLine,
} from "@/hooks/mutations/mutation";
import { useAdmin, UserType } from "@/hooks/admin";
import ApproveSVG from "./approveSVG";
import CancelSVG from "./cancelSVG";

function LineItem({
  line,
  tlID,
  lock,
}: {
  line: StoreTextLine;
  tlID: string;
  lock: boolean;
}) {
  const {
    mutate,
    getTranslationInfo,
    removeMutation,
    isMutation,
  } = useNovelStore();

  const [raw] = useState<boolean>(false);

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

  const textStyle =
    line.forDeletion ? `text-red-400` : (
      `${
        line.status === "STAGED" ?
          "text-chapstate-localonly"
        : line.status === "TL" ? "text-chapstate-dbonly"
        : "text-chapstate-good"
      }`
    );

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
    <div className="grid grid-cols-[min-content_min-content_1fr_min-content_1fr] gap-2 border-b-2 border-dotted px-2 pb-1">
      <div
        className={`${textStyle} col-[1/span_1] grid w-min content-center justify-center`}
      >
        #{line.pos}
      </div>
      <div
        className={`${textStyle} col-[3/span_1] grid content-center justify-center px-2 text-center`}
        data-type="ogline"
      >
        <EditField
          fieldName=""
          lock={true}
          defaultValue={line.ogline}
          className={{
            editField: { div: { normal: "text-center" } },
            header: {
              main: {
                normal: "block min-h-[15px]",
                lock: "min-h-0",
              },
            },
          }}
        />
      </div>
      <div
        className={`${textStyle} col-[4/span_1] flex flex-col justify-center`}
        data-type="statusbox"
      >
        {line.status === "TL" && (
          <div className="flex">
            <button
              title="Approve"
              onClick={() => {
                changeStateTo("PR");
              }}
            >
              <ApproveSVG
                width={25}
                height={25}
                className="box-content border-[1px] border-transparent fill-green-400 hover:border-green-300"
              />
            </button>
            <button
              title="Reject"
              onClick={() => changeStateTo("STAGED")}
            >
              <CancelSVG
                width={25}
                height={25}
                className="box-content border-[1px] border-transparent fill-red-400 hover:border-red-300"
              />
            </button>
          </div>
        )}
        <button
          disabled={lock || line.forDeletion}
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
        data-type="tlline"
      >
        <EditField
          fieldName=""
          className={{
            editField: {
              span: {
                normal: "min-h-6 break-normal text-center",
              },
            },
            staticField: {
              span: { normal: "min-h-6 text-center" },
            },
          }}
          lock={line.forDeletion ?? lock}
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
    </div>
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

  const { type: userType } = useAdmin();

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
              editdate: `${Date.now()}`,
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
          {tl.status === "PR" &&
            userType === UserType.ADMIN && (
              <button
                className="ml-1 text-chapstate-good"
                onClick={() => {
                  mutate(
                    new ChangeTLStatusMutation({
                      chapterID: chap.id,
                      novelID: novel.id,
                      status: "PUBLISH",
                      tlID: tl.id,
                      publishdate: `${Date.now()}`,
                    }),
                    true,
                  );
                }}
              >
                Publish
              </button>
            )}
        </div>
        <div className={`flex flex-col`}>
          {tl.lines
            .sort((p, n) => p.pos - n.pos)
            .map((line) => (
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
