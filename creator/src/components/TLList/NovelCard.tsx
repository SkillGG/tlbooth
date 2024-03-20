import { useNovelStore } from "@/hooks/novelStore";
import React, { useState } from "react";

import novelItem from "./novelItem.module.css";
import { api } from "@/utils/api";
import { cssIf, cssPIf } from "@/utils/utils";
import { EditField, useEditRef } from "../EditField";
import { ChapterList } from "./ChapterList";
import { type StoreNovel } from "@/hooks/mutations/mutation";
import { ChangeNovelNameMutation } from "@/hooks/mutations/novelMutations/changeName";
import { ChangeNovelDescriptionMutation } from "@/hooks/mutations/novelMutations/changeDescription";
import { RemoveNovelMutation } from "@/hooks/mutations/novelMutations/removeNovel";
import { AddNovelMutation } from "@/hooks/mutations/novelMutations/addNovel";

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

  const { mutate, removeMutation, getDBNovel, isMutation } =
    useNovelStore();

  const nameEdit = useEditRef();
  const ogdescEdit = useEditRef();
  const tldescEdit = useEditRef();

  const checkNovelPropEquality = <T,>(
    novel: StoreNovel,
    v: (n: StoreNovel) => T,
    noNovel = true,
  ): boolean => {
    const nvl = getDBNovel(novel.id);
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
                showRestore={isMutation(
                  ChangeNovelNameMutation.getID(
                    novel.id,
                    false,
                  ),
                )}
                onSave={(v) =>
                  mutate(
                    new ChangeNovelNameMutation(
                      novel.id,
                      v,
                      false,
                    ),
                    true,
                  )
                }
                onReset={() => {
                  removeMutation(
                    ChangeNovelNameMutation.getID(
                      novel.id,
                      false,
                    ),
                  );
                }}
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
                    new ChangeNovelDescriptionMutation(
                      novel.id,
                      v,
                      true,
                    ),
                    true,
                  )
                }
                onReset={() => {
                  removeMutation(
                    ChangeNovelDescriptionMutation.getID(
                      novel.id,
                      true,
                    ),
                  );
                }}
                showRestore={isMutation(
                  ChangeNovelDescriptionMutation.getID(
                    novel.id,
                    true,
                  ),
                )}
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
                showRestore={isMutation(
                  ChangeNovelDescriptionMutation.getID(
                    novel.id,
                    false,
                  ),
                )}
                onSave={(v) => {
                  mutate(
                    new ChangeNovelDescriptionMutation(
                      novel.id,
                      v,
                      true,
                    ),
                    true,
                  );
                }}
                onReset={() => {
                  removeMutation(
                    ChangeNovelDescriptionMutation.getID(
                      novel.id,
                      false,
                    ),
                  );
                }}
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
                    console.log(novel.local);
                    if (!novel.local)
                      mutate(
                        new RemoveNovelMutation(novel.id),
                      );
                    else
                      removeMutation(
                        AddNovelMutation.getID(novel.id),
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
