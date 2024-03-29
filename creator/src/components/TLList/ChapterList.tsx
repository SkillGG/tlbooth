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
import deepEquals from "fast-deep-equal";
import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  ChapterActionMenu,
  type ChapterActionMenuItem,
} from "./ChapterActionMenu";
import { useRouter } from "next/router";
import { StageChapterMutation } from "@/hooks/mutations/chapterMutations/stageChapter";
import { type StoreNovel } from "@/hooks/mutations/mutation";

type StagedChapterInfo = ScrapperChapterInfo & {
  staged: boolean;
};

type ActionMenuData = {
  x: number;
  y: number;
  actions: ChapterActionMenuItem[];
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
  openMenu?(d: ActionMenuData): void;
}) {
  return (
    <button
      {...props}
      data-ismenubutton="true"
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        openMenu?.({
          x: e.clientX,
          y: e.clientY,
          actions,
        });
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
  openMenu?(d: ActionMenuData): void;
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
    return (
      <div
        className={`${novelItem.chaplinked} text-chapstate-dbonly`}
        title={"DB: " + db.url}
      >
        <div className="grid h-full w-full content-center justify-center text-balance text-center">
          {db.name}
        </div>
        <ChapterMenuButton
          actions={[
            { label: "db not local" },
            "-",
            { label: "Kill da ho!" },
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
          {local.name}
        </div>
        <ChapterMenuButton
          actions={[
            {
              label: "Stage",
              action: async () => {
                console.log("Staging chapter", local);
                mutate(
                  new StageChapterMutation({
                    ...local,
                    novelID,
                    description: "",
                  }),
                );
              },
            },
          ]}
          openMenu={openMenu}
        />
      </div>
    );
  } else if (db && local) {
    if (deepEquals({ ...db, staged: false }, local)) {
      const localChap = getChapterBy(
        novelID,
        (c) =>
          c.url === local.url &&
          c.num === local.num &&
          c.ogname === local.name,
      );
      const dbChap = getDBChapterBy(
        novelID,
        (c) =>
          c.url === db.url &&
          c.num === local.num &&
          c.ogname === local.name,
      );
      const isLocalFromMutation = !(localChap && dbChap);

      return (
        <div
          className={`${novelItem.chaplinked} text-chapstate-good`}
          title={"DB: " + db.url + " Local: " + local.url}
        >
          <div className="grid w-full content-center justify-center">
            {db.name}
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
              isLocalFromMutation ? "-" : undefined,
              isLocalFromMutation ?
                {
                  label: "Unstage",
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
              : undefined,
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
            {db.name}
          </div>
          <div className={`${novelItem.chapedit}`}>
            <ChapterMenuButton
              actions={[{ label: "different!" }, "-"]}
              openMenu={openMenu}
            />
          </div>
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
  const [showMenu, setShowMenu] = useState<
    false | ActionMenuData
  >(false);

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
            try {
              const r = await utils.scrapper.getNovel
                .invalidate()
                .catch(() => "error");
              if (r === "error") throw "Error";
            } catch (e) {
              console.log(e);
            }
          }}
        />
      </div>
      <div
        className={`${isPhone ? novelItem.phonechaps : novelItem.pcchaps} grid h-full max-h-full grid-flow-row overflow-y-auto`}
        onScroll={() =>
          showMenu && setShowMenu(() => false)
        }
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
          Online{" "}
          {erred && (
            <small className="text-[0.7rem]">{erred}</small>
          )}
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
                  novelID={novel.id}
                  db={chapterInfo.db}
                  local={chapterInfo.local}
                  openMenu={(data) => {
                    setShowMenu(data);
                  }}
                />
              </React.Fragment>
            );
          })}

        {showMenu &&
          createPortal(
            <ChapterActionMenu
              hide={() => setShowMenu(() => false)}
              x={showMenu.x}
              y={showMenu.y}
              actions={showMenu.actions}
            />,
            document.body,
          )}
      </div>
    </div>
  );
};
