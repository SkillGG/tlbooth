import { useAdmin } from "@/hooks/admin";
import { api } from "@/utils/api";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "../Skeleton/Skeleton";
import type {
  ScrapperNovelInfo,
  ScrapperFilter,
} from "@/server/api/routers/scrapper";
import { useState } from "react";
import { Mutation, useNovelStore } from "@/hooks/novelStore";
import { RefreshButton } from "../LoadingIcon/refreshButton";

export const ScrapperFilterSelector = () => {
  const [showDialog, setShowDialog] = useState(false);

  const [filters, setFilters] = useState<ScrapperFilter>({});

  return (
    <div className="inline-block">
      <button
        onClick={() => {
          setShowDialog(true);
        }}
      >
        Filters
      </button>
      <div
        className={`${showDialog ? "block" : "hidden"} absolute left-0 top-0 z-10 grid h-full w-full bg-transparent text-black`}
      >
        <div className="z-20 mt-5 grid h-fit w-fit items-center justify-center justify-self-center bg-white p-5">
          <div className="grid grid-flow-col">
            <input
              type="checkbox"
              id="filterCheckbox"
              className="mr-2"
              onChange={() => {
                if ("search" in filters) {
                  setFilters((p) => {
                    delete p.search;
                    return { ...p };
                  });
                } else {
                  setFilters((p) => {
                    return { ...p, search: "" };
                  });
                }
              }}
              checked={"search" in filters}
            />
            <label htmlFor="filterCheckbox">
              Search
              <input
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="ml-2 border-b-2 border-black outline-none"
                type="text"
                id="searchbox"
                disabled={!("search" in filters)}
              />
            </label>
          </div>
          <button className="border-2">Apply filters</button>
        </div>
        <div
          className="absolute left-0 top-0 z-10 grid h-full w-full items-center justify-center bg-red-200 opacity-5"
          onClick={() => {
            setShowDialog(false);
          }}
        ></div>
      </div>
    </div>
  );
};

const NovelItem = ({ novel }: { novel: ScrapperNovelInfo }) => {
  const { getMutated: getNovels, mutate } = useNovelStore();

  const novelStore = getNovels();

  return (
    <div
      className="grid grid-flow-col rounded-xl border-2 border-gray-400"
      style={{ gridTemplateColumns: "auto min-content" }}
    >
      <div
        className={`w-full text-balance border-gray-400 px-3 text-center text-sm`}
      >
        {novel.name}
      </div>
      {!novelStore?.find((n) => n.url === novel.url) && (
        <div className="h-min w-min self-center px-4">
          {
            <button
              className="h-full"
              onClick={() => {
                mutate(Mutation.addNovel(novel.url, novel.name));
              }}
            >
              Add
            </button>
          }
        </div>
      )}
    </div>
  );
};

export const ScraperList = () => {
  const search = useSearchParams();

  const novels = search.has("filters")
    ? api.scrapper.getList.useQuery().data
    : api.scrapper.getList.useQuery().data;

  const isAdmin = useAdmin();

  const [showSkeleton, setSkeleton] = useState(false);

  const utils = api.useUtils();

  return (
    <div className="flex max-h-full flex-col overflow-hidden">
      <div className="grid w-fit grid-flow-col gap-3">
        <RefreshButton
          className="grid items-center"
          refreshFn={async () => {
            await utils.scrapper.getList.invalidate();
          }}
        />
        {novels && !("error" in novels) && (
          <>
            <ScrapperFilterSelector />
            <button onClick={() => setSkeleton((p) => !p)}>
              Toggle skeleton
            </button>
          </>
        )}
      </div>
      {novels && "error" in novels ? (
        <div className="w-full text-center text-red-400">{novels.error}</div>
      ) : (
        <>
          <div className="grid h-full gap-1 overflow-auto">
            {!showSkeleton && novels ? (
              novels.map((novel) => {
                return <NovelItem key={novel.url} novel={novel} />;
              })
            ) : (
              <>
                {Array.from({ length: 30 }).map((_, i) => (
                  <Skeleton
                    key={`scraper_skeleton_${i}`}
                    className={`${Math.random() > 0.7 ? (Math.random() > 0.9 ? (Math.random() > 0.7 ? "h-36" : "h-24") : "h-12") : "h-6"}`}
                  />
                ))}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};
