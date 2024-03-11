import type { FC } from "react";
import { Skeleton } from "../Skeleton/Skeleton";
import { type DBNovel } from "@/server/api/routers/db";

interface TLListProps {
  tls?: DBNovel[];
}

export const TLList: FC<TLListProps> = ({ tls }) => {
  return (
    <div className="grid grid-flow-row justify-center gap-2  p-5 text-white">
      {tls ? (
        tls.map((tl) => (
          <>
            <div key={tl.id} className="w-fit">
              {tl.ogname} / {tl.tlname} ({tl.id.substring(0, 5)}...)
              {tl.chapters.map((ch) => {
                return (
                  <div className="relative left-4" key={`${tl.id}_${ch.id}`}>
                    {ch.ogname} / {ch.tlname} ({ch.id.substring(0, 5)}...)
                  </div>
                );
              })}
            </div>
            <div></div>
          </>
        ))
      ) : (
        <>
          <Skeleton className="w-64">
            <Skeleton className="relative left-4 w-44" />
            <Skeleton className="relative left-4 w-44" />
          </Skeleton>
          <Skeleton empty />
          <Skeleton className="w-64">
            <Skeleton className="relative left-4 w-44" />
          </Skeleton>
          <Skeleton empty />
          <Skeleton className="w-64">
            <Skeleton className="relative left-4 w-44" />
            <Skeleton className="relative left-4 w-44" />
            <Skeleton className="relative left-4 w-44" />
            <Skeleton className="relative left-4 w-44" />
          </Skeleton>
        </>
      )}
    </div>
  );
};
