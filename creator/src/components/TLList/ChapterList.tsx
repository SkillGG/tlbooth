import { useNovelStore } from "@/hooks/novelStore";
import novelItem from "./novelItem.module.css";
import { api } from "@/utils/api";
import { RefreshButton } from "../Icons/refreshButton";
import type {
  ScrapperChapterInfo,
  ScrapperNovel,
} from "@/server/api/routers/scrapper";
import { useMediaQuery } from "@uidotdev/usehooks";
import { compareChapterNums } from "./NovelCard";
import React from "react";
import { useRouter } from "next/router";
import { StageChapterMutation } from "@/hooks/mutations/chapterMutations/stageChapter";
import { type StoreNovel } from "@/hooks/mutations/mutation";
import { Skeleton } from "../Skeleton/Skeleton";

import dayjs from "dayjs";
import {
  type ChapterActionMenuItem,
  type PopupMenuObject,
  usePopupMenu,
} from "../PopupMenu";

type StagedChapterInfo = ScrapperChapterInfo & {
  staged: boolean;
};

const getChapterDate = (d: Date | number | string) => {
  const num =
    typeof d === "string" ? parseInt(d)
    : typeof d === "object" ? d.getTime()
    : d;
  const numjs = dayjs(new Date(num));
  const now = dayjs(Date.now());

  const dayDiff = now.diff(numjs, "days");

  if (dayDiff > 5) {
    console.log("nore than 5 days");
    return numjs.format("DD-MM-YYYY");
  } else {
    if (dayDiff >= 2) return `${dayDiff} days ago`;
    if (dayDiff === 1) return `yesterday`;
    const hdiff = now.diff(numjs, "hours");
    console.log(hdiff === 0);
    if (hdiff === 0)
      return `${now.diff(numjs, "minutes")} minutes ago`;
    return `${hdiff}h ago`;
  }
};

const useGotoEdit = () => {
  const router = useRouter();
  return (novelID: string, chapterID: string) => {
    void router.push(
      `/edit/${encodeURIComponent(novelID)}/${encodeURIComponent(chapterID)}`,
    );
  };
};

function ChapterMenuButton({
  actions,
  openMenu,
  onClick,
  ...props
}: React.ComponentPropsWithoutRef<"button"> & {
  actions: ChapterActionMenuItem[];
  openMenu?: PopupMenuObject["show"];
}) {
  return (
    <button
      {...props}
      data-openspopup
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        openMenu?.(e.clientX, e.clientY, actions);
      }}
    >
      ...
    </button>
  );
}

const ChapterItem = React.memo(function ChapterItem({
  novelID,
  db,
  local,
  openMenu,
}: {
  db?: StagedChapterInfo;
  novelID: string;
  local?: StagedChapterInfo;
  openMenu?: PopupMenuObject["show"];
}): React.ReactElement {
  const toEdit = useGotoEdit();

  const {
    mutate,
    getChapterBy,
    getDBChapterBy,
    removeMutation,
  } = useNovelStore();

  if (db && !local) {
    // only in DB
    const dbChap = getDBChapterBy(
      novelID,
      (c) => c.url === db.url,
    );
    const localChap = getChapterBy(
      novelID,
      (c) => c.url === db.url,
    );
    console.log(dbChap, localChap);
    return (
      <div
        className={`${novelItem.chaplinked} ${!dbChap ? "text-chapstate-localonly" : "text-chapstate-dbonly"}`}
        title={"DB: " + db.url}
      >
        <div className="grid h-full w-full content-center justify-center text-balance text-center">
          {db.name} ({getChapterDate(db.date)})
        </div>
        <ChapterMenuButton
          actions={[
            {
              label: "Edit",
              action() {
                if (localChap)
                  toEdit(novelID, localChap.id);
              },
            },
            "-",
            !dbChap ?
              {
                label: "Unstage",
                className: "bg-red-300 hover:bg-red-600",
                action() {
                  localChap &&
                    removeMutation(
                      StageChapterMutation.getID({
                        novelID,
                        chapterID: localChap.id,
                      }),
                    );
                },
              }
            : {
                label: "Remove",
                className: "bg-red-300 hover:bg-red-600",
                action() {
                  throw "TODO _removeChapterAction";
                },
              },
          ]}
          openMenu={openMenu}
        />
      </div>
    );
  } else if (!db && local) {
    return (
      <div
        className={`${novelItem.chaplinked} text-chapstate-localonly`}
        title={"Local:" + local.url}
      >
        <div className="h-full w-full text-balance text-center">
          {local.name} ({getChapterDate(local.date)})
        </div>
        <ChapterMenuButton
          actions={[
            {
              label: "Add",
              className: "bg-green-400 hover:bg-green-600",
              action: async () => {
                console.log("Staging chapter", local);
                mutate(
                  new StageChapterMutation({
                    ...local,
                    novelID,
                  }),
                );
              },
            },
            "-",
            {
              label: "Open Page",
              action: () => {
                window.open(local.url, "_blank");
              },
            },
          ]}
          openMenu={openMenu}
        />
      </div>
    );
  } else if (db && local) {
    if (local.url === db.url) {
      const localChap = getChapterBy(
        novelID,
        (c) =>
          c.url === local.url &&
          c.ognum === local.ognum &&
          c.ogname === local.name,
      );
      const dbChap = getDBChapterBy(
        novelID,
        (c) =>
          c.url === db.url &&
          c.ognum === local.ognum &&
          c.ogname === local.name,
      );
      const isLocalFromMutation = !dbChap;

      return (
        <div
          className={`${novelItem.chaplinked} text-chapstate-good`}
          title={"DB: " + db.url + " Local: " + local.url}
        >
          <div className="grid w-full content-center justify-center">
            {db.name} ({getChapterDate(db.date)})
          </div>
          <ChapterMenuButton
            actions={[
              {
                label: "Edit",
                action() {
                  toEdit(
                    novelID,
                    (dbChap ?? localChap)?.id ?? "",
                  );
                },
              },
              "-",
              isLocalFromMutation ?
                {
                  label: "Unstage",
                  className: "bg-red-300 hover:bg-red-600",
                  action() {
                    if (localChap) {
                      removeMutation(
                        StageChapterMutation.getID({
                          novelID,
                          chapterID: localChap.id,
                        }),
                      );
                    }
                  },
                }
              : {
                  label: "Remove",
                  className: "bg-red-300 hover:bg-red-600",
                  action() {
                    throw "TODO _removeChapterAction";
                  },
                },
            ]}
            openMenu={openMenu}
          />
        </div>
      );
    } else {
      return (
        <>
          <div
            className={`${novelItem.chapremote} text-chapstate-dbonly`}
          >
            {db.name} ({getChapterDate(db.date)})
          </div>
          <div className={`${novelItem.chapedit}`}>
            <ChapterMenuButton
              actions={[
                { label: "Same numbers, different URLs!" },
              ]}
              openMenu={openMenu}
            />
          </div>
          <div
            className={`${novelItem.chaplocal} text-chapstate-localonly`}
          >
            {local.name} ({getChapterDate(local.date)})
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
});

export const ChapterList = ({
  novel,
  novelData,
  erred,
}: {
  novel: StoreNovel;
  novelData?: ScrapperNovel;
  erred?: string | false;
}) => {
  const utils = api.useUtils();

  const { getNovel, getChapterBy, getDBChapterBy } =
    useNovelStore();

  const popupMenu = usePopupMenu();

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
      ognum: u.ognum,
      date: u.ogPub,
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
        [n.ognum]: { ...p[n.ognum], db: n },
      };
    return { ...p, [n.ognum]: { ...p[n.ognum], local: n } };
  }, {});

  return (
    <div
      className="flex h-full max-h-64 flex-col sm:max-h-[24rem]"
      id={`chapter_list_${novel.id}`}
    >
      <div className="mt-1">
        <RefreshButton
          className="grid h-6 w-fit min-w-14 items-center justify-center"
          refreshFn={async () => {
            try {
              const r = await utils.scrapper.getNovel
                .invalidate()
                .catch(() => "error");
              if (r === "error") throw "Error";
            } catch (e) {
              console.log(e);
            }
          }}
        >
          Refresh
        </RefreshButton>
      </div>
      <div
        className={`${isPhone ? novelItem.phonechaps : novelItem.pcchaps} grid h-full max-h-full grid-flow-row overflow-y-auto`}
        onScroll={() => popupMenu.hide()}
      >
        <div
          className={`${novelItem.chapnum} text-center font-bold`}
        >
          CH#
        </div>
        <div
          className={`${novelItem.chapremote} text-center font-bold text-chapstate-dbonly`}
        >
          DB
        </div>
        <div className={`${novelItem.chapedit} `}></div>
        <div
          className={`${novelItem.chaplocal} ${erred ? "text-red-600" : ""} text-center font-bold text-chapstate-localonly`}
        >
          Online
          {erred && (
            <small className="text-[0.7rem]">{erred}</small>
          )}
        </div>
        {Object.entries(chapterInfos).length > 0 ?
          Object.entries(chapterInfos)
            .sort((p, n) => compareChapterNums(p[0], n[0]))
            .map(([num, chapterInfo]) => {
              if (!chapterInfo) return null;
              const lNum =
                getChapterBy(
                  novel.id,
                  (c) => c.url === chapterInfo.local?.url,
                )?.num ??
                getDBChapterBy(
                  novel.id,
                  (c) => c.url === chapterInfo.local?.url,
                )?.num ??
                null;
              return (
                <React.Fragment
                  key={`${novel.id}_chapter_${num}`}
                >
                  <div
                    className={`${novelItem.chapnum} whitespace-nowrap px-1 text-center`}
                  >
                    {num}
                    {lNum ? " / " + lNum : ""}
                  </div>
                  <ChapterItem
                    novelID={novel.id}
                    db={chapterInfo.db}
                    local={chapterInfo.local}
                    openMenu={popupMenu.show}
                  />
                </React.Fragment>
              );
            })
        : Array.from({ length: 40 }).map((_, i) => (
            <Skeleton
              key={`scrap_chapter_skeleton_${i}`}
              className="h-8 min-h-8 border-b-2"
              style={{ gridColumn: "1 / span 4" }}
            />
          ))
        }
      </div>
    </div>
  );
};
