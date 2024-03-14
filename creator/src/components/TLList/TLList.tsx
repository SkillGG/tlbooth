import { useState, type FC } from "react";
import { Skeleton } from "../Skeleton/Skeleton";
import { type StoreNovel, useNovelStore } from "@/hooks/novelStore";

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
    <div className="flex max-h-full flex-col overflow-hidden px-5">
      <div className="">
        <button className="mr-2" onClick={() => setSkeleton((p) => !p)}>
          Toggle skeleton
        </button>
        <TransformationHistory />
      </div>
      <div className={`flex w-full flex-col gap-y-1 overflow-auto text-white`}>
        {!showSkele ? (
          tls.map((tl) => <NovelCard key={tl.ogname} novel={tl} />)
        ) : (
          <>
            {Array.from({ length: 40 }).map((_, i) => (
              <Skeleton
                key={`scraper_skeleton_${i}`}
                className={`${Math.random() > 0.7 ? (Math.random() > 0.9 ? "h-24" : "h-12") : "h-6"}`}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};
