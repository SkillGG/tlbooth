import { useState, type FC, useRef } from "react";
import { Skeleton } from "../Skeleton/Skeleton";
import Link from "next/link";
import {
  type StoreNovel,
  useNovelStore,
  Mutation,
  MutationType,
} from "@/hooks/novelStore";
import { useAdmin } from "@/hooks/admin";

import novelItem from "./novelItem.module.css";
import { TransformationHistory } from "./TransformHistory";

interface TLListProps {
  tls?: StoreNovel[];
}

const NovelCard = ({ novel }: { novel: StoreNovel }) => {
  const [unwrapped, setShow] = useState(false);

  const show = unwrapped && !novel.forDeletion;

  const [editName, setEditName] = useState(false);

  const isAdmin = useAdmin();

  const { mutate, removeMutation, novels } = useNovelStore();

  const titleEditRef = useRef<HTMLSpanElement>(null);

  const hasChangedTitle =
    novels?.find((n) => n.id === novel.id)?.tlname === novel.tlname;

  return (
    <div className="w-full rounded-xl border-2 border-gray-400">
      <div
        className={`${novel.local && novelItem.local} ${novel.forDeletion && novelItem.forDeletion} w-full ${show ? "border-b-2" : ""} grid grid-flow-col text-balance border-gray-400 text-center text-sm`}
      >
        <button className="w-full" onClick={() => setShow((p) => !p)}>
          {novel.ogname}
        </button>
      </div>
      {show && (
        <>
          <div
            className="box-content grid grid-flow-col gap-5 "
            style={{ gridTemplateColumns: "1fr 2fr" }}
          >
            <div className="px-3 pb-1">
              <div className="h-min text-sm">
                <small>OG Name:</small>
                <div className="text-center">{novel.ogname}</div>
              </div>
              <div className="h-min text-sm">
                <small>
                  TLName:
                  {isAdmin &&
                    !novel.forDeletion &&
                    (!editName ? (
                      <button onClick={() => setEditName((p) => !p)}>
                        Edit
                      </button>
                    ) : (
                      <div className="inline-grid grid-flow-col gap-x-1">
                        <button
                          className="text-green-300"
                          onClick={() => {
                            if (titleEditRef.current) {
                              const value = titleEditRef.current.innerText;
                              mutate(Mutation.changeTLName(novel.id, value));
                              setEditName(false);
                            }
                          }}
                        >
                          Save
                        </button>
                        <button
                          className="text-red-400"
                          onClick={() => setEditName((p) => !p)}
                        >
                          Cancel
                        </button>
                      </div>
                    ))}
                </small>
                {editName ? (
                  <div
                    className="grid grid-flow-col gap-x-2"
                    style={{ gridTemplateColumns: "auto min-content" }}
                  >
                    <span
                      contentEditable
                      className="block min-w-4 border-b-2 text-center"
                      onChange={(e) => {
                        console.log(e.currentTarget.innerText);
                      }}
                      ref={titleEditRef}
                    ></span>
                  </div>
                ) : (
                  <div
                    className={`${hasChangedTitle ? "" : `${novelItem.local}`} text-center`}
                  >
                    {novel.tlname}
                  </div>
                )}
              </div>
            </div>
            <div
              className="grid h-full min-h-24 overflow-y-scroll px-5"
              style={{ gridAutoRows: "min-content" }}
            >
              {isAdmin && (
                <>
                  <button
                    className="m-1  justify-self-end text-red-400"
                    style={{ transform: "translateX(5px)" }}
                    onClick={() => {
                      setEditName(false);
                      console.log("removing novel", novel);
                      if (!novel.local) mutate(Mutation.removeNovel(novel.id));
                      else removeMutation(`add_novel_${novel.url}`);
                    }}
                  >
                    Delete novel
                  </button>
                </>
              )}
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
      )}
    </div>
  );
};

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
