import {
  type StoreNovel,
  useNovelStore,
} from "@/hooks/novelStore";
import novelItem from "./novelItem.module.css";
import { api } from "@/utils/api";
import { RefreshButton } from "../Icons/refreshButton";
import type {
  ScrapperChapterInfo,
  ScrapperNovel,
} from "@/server/api/routers/scrapper";
import { useMediaQuery } from "@uidotdev/usehooks";
import { compareChapterNums } from "./NovelCard";
import deepEquals from "fast-deep-equal";
import { ChapterMenuButton } from "./ChapterMenuButton";
import React from "react";

type StagedChapterInfo = ScrapperChapterInfo & {
  staged: boolean;
};

function ChapterItem({
  db,
  local,
}: {
  db?: StagedChapterInfo;
  local?: StagedChapterInfo;
}): React.ReactElement {
  if (db && !local) {
    return (
      <div
        className={`${novelItem.chaplinked} text-chapstate-dbonly`}
      >
        <div className="grid h-full w-full content-center justify-center text-balance text-center">
          {db.name}
        </div>
        <ChapterMenuButton
          actions={[
            {
              label: "Edit",
            },
            "-",
            { label: "Delete" },
          ]}
        />
      </div>
    );
  } else if (!db && local) {
    return (
      <div
        className={`${novelItem.chaplinked} text-chapstate-localonly`}
      >
        <div className="h-full w-full text-balance text-center">
          {local.name}
        </div>
        <ChapterMenuButton
          actions={[
            !local.staged ?
              { label: "Stage" }
            : { label: "Unstage" },
          ]}
        />
      </div>
    );
  } else if (db && local) {
    if (deepEquals({ ...db, staged: false }, local)) {
      return (
        <div
          className={`${novelItem.chaplinked} text-chapstate-good`}
        >
          <div className="grid w-full content-center justify-center">
            {db.name}
          </div>
          <ChapterMenuButton
            actions={[
              { label: "Edit" },
              "-",
              { label: "Remove" },
            ]}
          />
        </div>
      );
    } else {
      console.log(local, db);
      return (
        <>
          <div
            className={`${novelItem.chapremote} text-chapstate-dbonly`}
          >
            {db.name}
          </div>
          <ChapterMenuButton
            className={`${novelItem.chapedit}`}
            actions={[]}
          />
          <div
            className={`${novelItem.chaplocal} text-chapstate-localonly`}
          >
            {local.name}
          </div>
        </>
      );
    }
  }
  return (
    <>
      <div className={`${novelItem.chaplinked}`}></div>
    </>
  );
}

export const ChapterList = ({
  novel,
  novelData,
}: {
  novel: StoreNovel;
  novelData?: ScrapperNovel;
}) => {
  const utils = api.useUtils();

  const { getNovel } = useNovelStore();

  const isPhone = useMediaQuery(
    "only screen and (max-width: 1024px)",
  );

  const allChapters: StagedChapterInfo[] = [
    ...(novelData?.chapters.map((u) => ({
      staged: false,
      ...u,
    })) ?? []),
    ...(getNovel(novel.id)?.chapters.map((u) => ({
      staged: true,
      name: u.ogname,
      url: u.url,
      num: u.num,
    })) ?? []),
  ];

  const chapterInfos = allChapters.reduce<
    Record<
      string,
      | {
          local?: StagedChapterInfo;
          db?: StagedChapterInfo;
        }
      | undefined
    >
  >((p, n) => {
    if (!n) return p;
    if (n.staged)
      return {
        ...p,
        [n.num]: { ...p[n.num], db: n },
      };
    return { ...p, [n.num]: { ...p[n.num], local: n } };
  }, {});

  return (
    <div
      className="flex h-full max-h-64 flex-col"
      id={`chapter_list_${novel.id}`}
    >
      <div className="mt-1">
        <RefreshButton
          className="grid h-6 w-fit min-w-14 items-center justify-center"
          refreshFn={async () => {
            await utils.scrapper.getNovel.invalidate();
          }}
        />
      </div>
      <div
        className={`${isPhone ? novelItem.phonechaps : novelItem.pcchaps} grid h-full max-h-full grid-flow-row overflow-y-auto`}
      >
        <div
          className={`${novelItem.chapnum} text-center font-bold`}
        >
          CH#
        </div>
        <div
          className={`${novelItem.chapremote} text-chapstate-dbonly text-center font-bold`}
        >
          DB
        </div>
        <div className={`${novelItem.chapedit} `}></div>
        <div
          className={`${novelItem.chaplocal} text-chapstate-localonly text-center font-bold`}
        >
          Online
        </div>
        {Object.entries(chapterInfos)
          .sort((p, n) => compareChapterNums(p[0], n[0]))
          .map(([num, chapterInfo]) => {
            if (!chapterInfo) return null;
            return (
              <React.Fragment
                key={`${novel.id}_chapter_${num}`}
              >
                <div
                  className={`${novelItem.chapnum} px-1 text-center`}
                >
                  {num}
                </div>
                <ChapterItem
                  db={chapterInfo.db}
                  local={chapterInfo.local}
                />
              </React.Fragment>
            );
          })}
      </div>
    </div>
  );
};
