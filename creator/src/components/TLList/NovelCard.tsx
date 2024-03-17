import {
  type StoreNovel,
  useNovelStore,
} from "@/hooks/novelStore";
import React, { useState } from "react";
import { Mutation } from "@/hooks/novelStore";

import novelItem from "./novelItem.module.css";
import { api } from "@/utils/api";
import { cssIf, cssPIf } from "@/utils/utils";
import { EditField, useEditRef } from "../EditField";
import { ChapterList } from "./ChapterList";

export const compareChapterNums = (
  n: string,
  r: string,
) => {
  return parseInt(n) - parseInt(r);
};

export const NovelCard = ({
  novel,
}: {
  novel: StoreNovel;
}) => {
  const [unwrapped, setShow] = useState(false);

  const novelData = api.scrapper.getNovel.useQuery(
    novel.url,
  ).data;

  const show = unwrapped && !novel.forDeletion;

  // const isAdmin = useAdmin();

  const { mutate, removeMutation, getNovel } =
    useNovelStore();

  const nameEdit = useEditRef();
  const ogdescEdit = useEditRef();
  const tldescEdit = useEditRef();

  const checkNovelPropEquality = <T,>(
    novel: StoreNovel,
    v: (n: StoreNovel) => T,
    noNovel = true,
  ): boolean => {
    const nvl = getNovel(novel.id);
    if (!nvl) return noNovel;
    return v(novel) === v(nvl);
  };

  return (
    <div
      className="w-full justify-center rounded-xl border-2 border-gray-400"
      id={`novel_${novel.id}`}
    >
      <div
        className={`${cssIf(novel.local, novelItem.local)} ${cssIf(show, "border-b-2")} ${cssIf(novel.forDeletion, novelItem.forDeletion)} grid grid-flow-col text-balance border-gray-400 text-center text-sm`}
      >
        <button
          className="grid w-full"
          onClick={() => {
            setShow((p) => !p);
            nameEdit.current?.hide();
          }}
        >
          <div
            className="justify-self-center"
            style={{ maxWidth: "90%" }}
          >
            {novel.ogname}
          </div>
        </button>
      </div>
      {show && (
        <>
          <div
            className="box-content grid grid-flow-col gap-5 "
            style={{ gridTemplateColumns: "1fr 1fr 2fr" }}
          >
            <div className="px-3 pb-1">
              <div className="h-min text-sm">
                <small>OG Name:</small>
                <div className="text-center">
                  {novel.ogname}
                </div>
              </div>
              <EditField
                fieldName="TLName"
                ref={nameEdit}
                lock={!!novel.forDeletion}
                onSave={(v) =>
                  mutate(
                    Mutation.changeTLName(novel.id, v),
                    true,
                  )
                }
                onReset={() =>
                  mutate(
                    Mutation.changeTLName(
                      novel.id,
                      getNovel(novel.id)?.tlname ?? "",
                    ),
                    true,
                  )
                }
                defaultValue={novel.tlname ?? ""}
                className={{
                  staticField: {
                    div: cssIf(
                      !checkNovelPropEquality(
                        novel,
                        (n) => n.tlname,
                        !!novel.tlname,
                      ),
                      "rounded-lg",
                    ),
                  },
                }}
                style={{
                  staticField: {
                    div: cssPIf(
                      !checkNovelPropEquality(
                        novel,
                        (n) => n.tlname,
                        !!novel.tlname,
                      ),
                      { backgroundColor: "#ff02" },
                    ),
                  },
                }}
              />
            </div>
            <div className="px-3 pb-1">
              <EditField
                fieldName="OGDesc"
                onSave={(v) =>
                  mutate(
                    Mutation.changeOGDesc(novel.id, v),
                    true,
                  )
                }
                onReset={() => {
                  mutate(
                    Mutation.changeOGDesc(
                      novel.id,
                      getNovel(novel.id)?.ogdesc ?? "",
                    ),
                    true,
                  );
                }}
                ref={ogdescEdit}
                lock={!!novel.forDeletion}
                defaultValue={novel.ogdesc}
                className={{
                  staticField: {
                    div: cssIf(
                      !checkNovelPropEquality(
                        novel,
                        (n) => n.ogdesc,
                        !!novel.ogdesc,
                      ),
                      "rounded-lg",
                    ),
                  },
                }}
                style={{
                  staticField: {
                    div: cssPIf(
                      !checkNovelPropEquality(
                        novel,
                        (n) => n.ogdesc,
                        !!novel.ogdesc,
                      ),
                      { backgroundColor: "#ff02" },
                    ),
                  },
                }}
              />
              <EditField
                fieldName="TLDesc"
                ref={tldescEdit}
                lock={!!novel.forDeletion}
                onSave={(v) => {
                  mutate(
                    Mutation.changeTLDesc(novel.id, v),
                    true,
                  );
                }}
                onReset={() =>
                  mutate(
                    Mutation.changeTLDesc(
                      novel.id,
                      getNovel(novel.id)?.tldesc ?? "",
                    ),
                    true,
                  )
                }
                defaultValue={novel.tldesc ?? ""}
                className={{
                  staticField: {
                    div: cssIf(
                      !checkNovelPropEquality(
                        novel,
                        (n) => n.tldesc,
                        !!novel.tldesc,
                      ),
                      "rounded-lg",
                    ),
                  },
                }}
                style={{
                  staticField: {
                    div: cssPIf(
                      !checkNovelPropEquality(
                        novel,
                        (n) => n.tldesc,
                        !!novel.tldesc,
                      ),
                      { backgroundColor: "#ff02" },
                    ),
                  },
                }}
              />
            </div>

            <div
              className="grid h-full min-h-24 overflow-hidden px-5"
              style={{ gridAutoRows: "min-content" }}
            >
              <div className="relative right-0 justify-self-end">
                <button
                  className="absolute right-0 mt-1 justify-self-end text-red-400"
                  style={{ transform: "translateX(5px)" }}
                  onClick={() => {
                    if (!novel.local)
                      mutate(
                        Mutation.removeNovel(novel.id),
                      );
                    else
                      removeMutation(
                        `add_novel_${novel.url}`,
                      );
                  }}
                >
                  Delete
                </button>
              </div>
              <ChapterList
                novel={novel}
                novelData={novelData}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
