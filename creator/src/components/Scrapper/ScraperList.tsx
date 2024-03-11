import { useAdmin } from "@/hooks/admin";
import { api } from "@/utils/api";
import { useSearchParams } from "next/navigation";
import { Skeleton } from "../Skeleton/Skeleton";
import type {
  ScrapperNovelInfo,
  ScrapperFilter,
} from "@/server/api/routers/scrapper";
import { useState } from "react";
import { useNovelStore } from "@/hooks/novelStore";
import LoadingSpinner from "../LoadingIcon/loadingIcons";

export const ScrapperFilterSelector = () => {
  const [showDialog, setShowDialog] = useState(false);

  const [filters, setFilters] = useState<ScrapperFilter>({});

  return (
    <div className="inline-block">
      <button
        className="border-4 border-black"
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
              className="mr-2"
              checked={"search" in filters}
            />
            <label
              onClick={() => {
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
            >
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

const NovelCard = ({ novel }: { novel: ScrapperNovelInfo }) => {
  const { novelStore, refresh: refreshStore } = useNovelStore();

  const [loading, setLoading] = useState(false);

  const { mutate: addNovel } = api.db.registerNovel.useMutation();

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
          {!loading ? (
            <button
              className="h-full"
              onClick={() => {
                addNovel(novel, {
                  onSuccess: () => {
                    refreshStore()
                      .then(() => {
                        setLoading(false);
                      })
                      .catch(console.error);
                  },
                  onError: () => {
                    console.error("Could not add!");
                    setLoading(false);
                  },
                });
                setLoading(true);
              }}
            >
              Add
            </button>
          ) : (
            <>
              <LoadingSpinner
                className="place-self-center"
                style={{
                  "--accent": "white",
                  "--bg": "transparent",
                  "--size": "16px",
                  "--weight": "2px",
                }}
              />
            </>
          )}
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
    <>
      <ScrapperFilterSelector />
      <button
        className="mx-2"
        onClick={() => {
          void utils.scrapper.getList.invalidate();
        }}
      >
        Refresh
      </button>
      <button onClick={() => setSkeleton((p) => !p)}>Toggle skeleton</button>
      <div
        className="mt-1 grid grid-flow-row gap-1 overflow-x-hidden overflow-y-scroll px-3 text-white"
        style={{ maxHeight: "90%" }}
      >
        {!showSkeleton && novels ? (
          novels.map((novel) => {
            return <NovelCard key={novel.url} novel={novel} />;
          })
        ) : (
          <>
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={`scraper_skeleton_${i}`} className="h-7" />
            ))}
          </>
        )}
      </div>
    </>
  );
};
