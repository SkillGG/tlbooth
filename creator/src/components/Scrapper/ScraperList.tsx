import { api } from "@/utils/api";
import { Skeleton } from "../Skeleton/Skeleton";
import type {
  ScrapperNovelInfo,
  ScrapperFilter,
} from "@/server/api/routers/scrapper";
import {
  type Dispatch,
  type SetStateAction,
  useState,
} from "react";
import { useNovelStore } from "@/hooks/novelStore";
import { RefreshButton } from "../Icons/refreshButton";
import { AddNovelMutation } from "@/hooks/mutations/novelMutations/addNovel";

export const ScrapperFilterSelector = ({
  filters: orgFilts,
  setFilters: setOrgFilts,
}: {
  filters: ScrapperFilter;
  setFilters: Dispatch<SetStateAction<ScrapperFilter>>;
}) => {
  const [showDialog, setShowDialog] = useState(false);

  const [filters, setFilters] =
    useState<ScrapperFilter>(orgFilts);

  return (
    <div className="grid">
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
          <div className="grid select-none grid-flow-col">
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
            <label
              htmlFor="filterCheckbox"
              className="select-none"
            >
              Search
              <input
                onClick={(e) => {
                  e.preventDefault();
                }}
                className="ml-2 select-none border-b-2 border-black outline-none"
                type="text"
                id="searchbox"
                disabled={!("search" in filters)}
                value={filters.search ?? ""}
                onChange={(e) => {
                  const val = e.currentTarget.value;
                  if (typeof val === "string")
                    setFilters((p) => ({
                      ...p,
                      search: val,
                    }));
                }}
              />
            </label>
          </div>
          <button
            className="border-2"
            onClick={() => {
              setOrgFilts(filters);
              setShowDialog(false);
            }}
          >
            Apply filters
          </button>
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

const NovelItem = ({
  novel,
}: {
  novel: ScrapperNovelInfo;
}) => {
  const { getMutated: getNovels, mutate } = useNovelStore();

  const novelStore = getNovels();

  return (
    <div
      className="grid grid-flow-col rounded-xl border-2 border-gray-400"
      style={{ gridTemplateColumns: "auto min-content" }}
    >
      <div
        className={`grid w-full content-center text-balance border-gray-400 px-3 text-center text-sm`}
      >
        {novel.novelName}
      </div>
      {!novelStore?.find(
        (n) => n.url === novel.novelURL,
      ) && (
        <div className="h-min w-min self-center px-4">
          {
            <button
              className="h-full"
              onClick={() => {
                console.log(novel);
                mutate(new AddNovelMutation(novel));
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
  const [useDummy, setUseDummy] = useState(false);

  const [filters, setFilters] = useState<ScrapperFilter>(
    {},
  );

  const novels =
    useDummy ?
      api.scrapper.getListDummy.useQuery().data
    : api.scrapper.getList.useQuery(filters).data;

  const [showSkeleton, setSkeleton] = useState(false);

  const utils = api.useUtils();

  return (
    <div className="sm:px-5 sm:mt-4 flex max-h-full flex-col overflow-hidden">
      <div className="grid w-fit grid-flow-col gap-3">
        {novels && !("error" in novels) ?
          <>
            <RefreshButton
              className="grid items-center"
              refreshFn={async () => {
                if (!useDummy)
                  await utils.scrapper.getList.invalidate();
                else
                  await utils.scrapper.getListDummy.invalidate();
              }}
            />
            <ScrapperFilterSelector
              filters={filters}
              setFilters={setFilters}
            />
            <button onClick={() => setSkeleton((p) => !p)}>
              Toggle skeleton
            </button>
            <button
              onClick={() => {
                setUseDummy((p) => !p);
              }}
            >
              Toggle dummy
            </button>
          </>
        : <div className="min-h-6"></div>}
      </div>
      {novels && "error" in novels ?
        <div>
          <div className="w-full text-center text-red-400">
            {novels.error}
          </div>
          {novels.allowTestData && (
            <div className="grid w-full">
              <button
                onClick={() => setUseDummy(true)}
                className="w-fit justify-self-center rounded-md border-2 border-green-200 bg-slate-600 px-2 text-blue-400 hover:bg-green-400 hover:text-black active:bg-green-100 active:text-black"
              >
                Use dummy data
              </button>
            </div>
          )}
        </div>
      : <>
          <div className="flex h-full flex-col gap-1 overflow-auto">
            {!showSkeleton && novels ?
              novels.map((novel) => {
                return (
                  <NovelItem
                    key={novel.novelURL}
                    novel={novel}
                  />
                );
              })
            : <>
                {Array.from({ length: 30 }).map((_, i) => (
                  <Skeleton
                    key={`scraper_skeleton_${i}`}
                    className={`${
                      Math.random() > 0.7 ?
                        Math.random() > 0.9 ?
                          Math.random() > 0.7 ?
                            "h-36"
                          : "h-24"
                        : "h-12"
                      : "h-6"
                    }`}
                  />
                ))}
              </>
            }
          </div>
        </>
      }
    </div>
  );
};
