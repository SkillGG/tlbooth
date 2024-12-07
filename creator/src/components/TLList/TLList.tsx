import { useState } from "react";
import { Skeleton } from "../Skeleton/Skeleton";
import { useNovelStore } from "@/hooks/novelStore";

import { TransformationHistory } from "./TransformHistory";
import { NovelCard } from "./NovelCard";

export const TLList = () => {
  const [skeleton] = useState(false);

  const { getMutated } = useNovelStore();

  const tls = getMutated();

  console.log(tls);

  const showSkele = !(!skeleton && tls);

  return (
    <div className="flex max-h-full flex-col overflow-hidden px-5">
      <div>
        {/* <button
          className="mr-2"
          onClick={() => setSkeleton((p) => !p)}
        >
          Toggle skeleton
        </button> */}
        <TransformationHistory />
      </div>
      <div
        className={`flex w-full flex-col gap-y-1 overflow-auto text-white`}
      >
        {!showSkele ?
          tls.map((tl) => (
            <NovelCard key={tl.ogname} novel={tl} />
          ))
        : <>
            {Array.from({ length: 40 }).map((_, i) => (
              <Skeleton
                key={`scraper_skeleton_${i}`}
                className={`${
                  Math.random() > 0.7 ?
                    Math.random() > 0.9 ?
                      "h-24 min-h-24"
                    : "h-12 min-h-12"
                  : "h-6 min-h-6"
                }`}
              />
            ))}
          </>
        }
      </div>
    </div>
  );
};
