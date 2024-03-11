import { useState, type FC } from "react";
import { Skeleton } from "../Skeleton/Skeleton";
import { type DBNovel } from "@/server/api/routers/db";
import Link from "next/link";
import { useNovelStore } from "@/hooks/novelStore";
import { api } from "@/utils/api";
import LoadingSpinner from "../LoadingIcon/loadingIcons";
import { useAdmin } from "@/hooks/admin";

interface TLListProps {
  tls?: DBNovel[];
}

const NovelCard = ({ novel }: { novel: DBNovel }) => {
  const [show, setShow] = useState(false);

  const [loadDeletion, setLoadDeletion] = useState(false);

  const { mutate: removeNovel } = api.db.removeNovel.useMutation();

  const utils = api.useUtils();

  const isAdmin = useAdmin();

  return (
    <div className="w-full rounded-xl border-2 border-gray-400">
      <div
        className={`w-full ${show ? "border-b-2" : ""} grid grid-flow-col text-balance border-gray-400 text-center text-sm`}
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
                <small>TLName:</small>
                <div className="text-center">{novel.tlname}</div>
              </div>
            </div>
            <div
              className="grid h-full min-h-24 overflow-y-scroll px-5"
              style={{ gridAutoRows: "min-content" }}
            >
              {isAdmin && (
                <>
                  {!loadDeletion ? (
                    <button
                      className="m-1  justify-self-end text-red-400"
                      style={{ transform: "translateX(5px)" }}
                      onClick={() => {
                        setLoadDeletion(true);
                        removeNovel(novel.id, {
                          onSettled: () => {
                            utils.db.getFromDB
                              .invalidate()
                              .then(() => {
                                setLoadDeletion(false);
                              })
                              .catch(console.error);
                          },
                        });
                      }}
                    >
                      Delete novel
                    </button>
                  ) : (
                    <>
                      <LoadingSpinner
                        className="m-1  justify-self-end"
                        style={{
                          "--size": "24px",
                          "--accent": "red",
                          "--bg": "transparent",
                          "--weight": "2px",
                        }}
                      />
                    </>
                  )}
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

  const { novelStore: tls } = useNovelStore();

  const showSkele = !(!skeleton && tls);

  return (
    <>
      <button onClick={() => setSkeleton((p) => !p)}>Toggle skeleton</button>
      <div className={`grid ${showSkele ? "" : ""} gap-y-1 p-5 text-white`}>
        {!showSkele ? (
          tls.map((tl) => (
            <>
              <NovelCard key={tl.id} novel={tl} />
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
