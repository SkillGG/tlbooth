import { useAdmin } from "@/hooks/admin";
import { ScrapperFilter } from "@/server/api/routers/scrapper";
import { api } from "@/utils/api";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRef, useState } from "react";

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

  return (
    <>
      <ScrapperFilterSelector />
      <div
        className="ontent-center grid grid-flow-row text-white"
        style={{ gridTemplateColumns: "auto min-content" }}
      >
        {novels?.map((novel) => {
          return (
            <>
              <div key={novel.url}>{novel.name}</div>
              <div className="w-max">
                <Link href={`/edit/${novel.url}`}>Edit novel</Link>
              </div>
            </>
          );
        })}
      </div>
    </>
  );
};
