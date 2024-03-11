import { useState, type FC } from "react";
import { Skeleton } from "../Skeleton/Skeleton";
import { type DBNovel } from "@/server/api/routers/db";
import Link from "next/link";

interface TLListProps {
  tls?: DBNovel[];
}

const NovelCard = ({ novel }: { novel: DBNovel }) => {
  return (
    <>
      <div
        className="box-content grid grid-flow-col gap-5 rounded-2xl border-4 border-gray-500"
        style={{ gridTemplateColumns: "1fr 2fr" }}
      >
        <div className="px-3 pb-1">
          <div className="h-min text-sm">
            <small>OG Name:</small>
            <div className="text-center">{novel.ogname}</div>
          </div>
          <div className="h-min text-sm">
            <small>TLName:</small>
            <div className="text-center">{novel.tlname}</div>
          </div>
        </div>
        <div className="h-full min-h-24 overflow-y-scroll px-5">
          <div>
            {novel.chapters.map((r) => {
              return (
                <div key={r.id} className="grid grid-flow-col">
                  {r.ogname}
                  <Link href={"/edit/"}>
                    <div className="text-right">Edit</div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export const TLList: FC<TLListProps> = ({ tls }) => {
  const [skeleton, setSkeleton] = useState(false);

  return (
    <>
      <button onClick={() => setSkeleton((p) => !p)}>Toggle skeleton</button>
      <div className="grid justify-center gap-y-1 p-5 text-white">
        {!skeleton && tls ? (
          tls.map((tl) => (
            <>
              <NovelCard novel={tl} />
            </>
          ))
        ) : (
          <>
            <Skeleton className="mb-1 h-6 w-64"></Skeleton>
            <Skeleton className="mb-1 h-6 w-64"></Skeleton>
            <Skeleton className="h-6 w-64"></Skeleton>
          </>
        )}
      </div>
    </>
  );
};
