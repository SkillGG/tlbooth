import { useAdmin } from "@/hooks/admin";
import { ScrapperFilter } from "@/server/api/routers/scrapper";
import { api } from "@/utils/api";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { Skeleton } from "../Skeleton/Skeleton";

export const ScrapperFilterSelector = () => {
  const [showDialog, setShowDialog] = useState(false);

  const [filters, setFilters] = useState<ScrapperFilter>({});
  console.log(filters);
  return (
    <div>
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
              checked={!!filters.search}
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
              />
            </label>
          </div>
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

export const ScraperList = () => {
  const search = useSearchParams();

  const novels = search.has("filters")
    ? api.scrapper.getList.useQuery().data
    : api.scrapper.getList.useQuery().data;

  const isAdmin = useAdmin();

  const [showSkeleton, setSkeleton] = useState(false);

  return (
    <>
      <ScrapperFilterSelector />
      <button onClick={() => setSkeleton((p) => !p)}>Toggle skeleton</button>
      <div
        className="mt-1 grid grid-flow-row gap-1 overflow-x-hidden overflow-y-scroll px-3 text-white"
        style={{ maxHeight: "90%" }}
      >
        {!showSkeleton && novels ? (
          novels.map((novel) => {
            return (
              <div
                key={novel.url}
                className="grid rounded-lg border-2 border-blue-800"
                style={{ gridTemplateColumns: "auto min-content" }}
              >
                <div key={novel.url} className="px-3">
                  {novel.name}
                </div>
                <div className="grid h-full w-full place-content-center border-l-2 border-l-blue-800 px-1">
                  <Link href={`/edit/${novel.url}`}>Translate</Link>
                </div>
              </div>
            );
          })
        ) : (
          <>
            {Array.from({ length: 10 }).map(() => (
              <>
                <Skeleton className="h-6" />
              </>
            ))}
          </>
        )}
      </div>
    </>
  );
};
