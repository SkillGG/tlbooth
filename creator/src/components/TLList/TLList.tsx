import { useState, type FC } from "react";
import { Skeleton } from "../Skeleton/Skeleton";
import {
  type StoreNovel,
  useNovelStore,
} from "@/hooks/novelStore";

import { TransformationHistory } from "./TransformHistory";
import { NovelCard } from "./NovelCard";

interface TLListProps {
  tls?: StoreNovel[];
}

export const TLList: FC<TLListProps> = () => {
  const [skeleton, setSkeleton] = useState(false);

  const { getMutated: transformed } = useNovelStore();

  const tls = transformed();

  const showSkele = !(!skeleton && tls);

  return (
    <>
      <button className="mr-2" onClick={() => setSkeleton((p) => !p)}>
        Toggle skeleton
      </button>
      <TransformationHistory />
      <div className={`grid ${showSkele ? "" : ""} gap-y-1 p-5 text-white`}>
        {!showSkele ? (
          tls.map((tl) => (
            <>
              <NovelCard key={tl.ogname} novel={tl} />
            </>
          ))
        ) : (
          <>
            <Skeleton className="mb-1 h-5 w-full"></Skeleton>
            <Skeleton className="mb-1 h-5 w-full"></Skeleton>
            <Skeleton className="h-5 w-full"></Skeleton>
          </>
        )}
      </div>
    </>
  );
};
