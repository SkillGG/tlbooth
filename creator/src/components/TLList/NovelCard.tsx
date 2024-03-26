import { useNovelStore } from "@/hooks/novelStore";
import React, { useMemo, useState } from "react";

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

  const { mutate, removeMutation, mutations, isMutation } =
    useNovelStore();

  const nameEdit = useEditRef();
  const ogdescEdit = useEditRef();
  const tldescEdit = useEditRef();

  const [ogdescChanged, tldescChanged, , tlnameChanged] =
    useMemo(
      () => [
        isMutation(
          ChangeNovelDescriptionMutation.getID({
            novelID: novel.id,
            og: true,
          }),
        ),
        isMutation(
          ChangeNovelDescriptionMutation.getID({
            novelID: novel.id,
            og: false,
          }),
        ),
        isMutation(
          ChangeNovelNameMutation.getID({
            novelID: novel.id,
            og: true,
          }),
        ),
        isMutation(
          ChangeNovelNameMutation.getID({
            novelID: novel.id,
            og: false,
          }),
          false,
        ),
        mutations,
      ],
      [isMutation, novel.id, mutations],
    );
  return (
    <div
      className="w-full justify-center rounded-xl border-2 border-gray-400"
      id={`novel_${novel.id}`}
    >
      <div
        className={`${cssIf(novel.local, novelItem.local)}
        ${cssIf(show, "border-b-2")}
        ${cssIf(novelData && "error" in novelData, "rounded-lg bg-red-300")}
        ${cssIf(novel.forDeletion, novelItem.forDeletion)}
        grid grid-flow-col text-balance border-gray-400 text-center text-sm`}
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
              <EditField
                fieldName="OGName"
                lock={true}
                defaultValue={novel.ogname}
              />
              <EditField
                fieldName="TLName"
                ref={nameEdit}
                lock={!!novel.forDeletion}
                showRestore={tlnameChanged}
                onSave={(v) =>
                  mutate(
                    new ChangeNovelNameMutation({
                      novelID: novel.id,
                      name: v,
                      og: false,
                    }),
                    true,
                  )
                }
                onReset={() => {
                  removeMutation(
                    ChangeNovelNameMutation.getID({
                      novelID: novel.id,
                      og: false,
                    }),
                  );
                }}
                defaultValue={novel.tlname ?? ""}
                className={{
                  staticField: {
                    div: cssIf(
                      !tlnameChanged,
                      "rounded-lg",
                    ),
                  },
                }}
                style={{
                  staticField: {
                    div: cssPIf(tlnameChanged, {
                      backgroundColor: "#ff02",
                    }),
                  },
                }}
              />
            </div>
            <div className="px-3 pb-1">
              <EditField
                fieldName="OGDesc"
                onSave={(v) =>
                  mutate(
                    new ChangeNovelDescriptionMutation({
                      novelID: novel.id,
                      desc: v,
                      og: true,
                    }),
                    true,
                  )
                }
                onReset={() => {
                  removeMutation(
                    ChangeNovelDescriptionMutation.getID({
                      novelID: novel.id,
                      og: true,
                    }),
                  );
                }}
                showRestore={ogdescChanged}
                ref={ogdescEdit}
                lock={!!novel.forDeletion}
                defaultValue={novel.ogdesc}
                className={{
                  staticField: {
                    div: cssIf(
                      ogdescChanged,
                      "rounded-lg bg-[#ff02]",
                    ),
                  },
                }}
              />
              <EditField
                fieldName="TLDesc"
                ref={tldescEdit}
                lock={!!novel.forDeletion}
                showRestore={tldescChanged}
                onSave={(v) => {
                  mutate(
                    new ChangeNovelDescriptionMutation({
                      novelID: novel.id,
                      desc: v,
                      og: true,
                    }),
                    true,
                  );
                }}
                onReset={() => {
                  removeMutation(
                    ChangeNovelDescriptionMutation.getID({
                      novelID: novel.id,
                      og: false,
                    }),
                  );
                }}
                defaultValue={novel.tldesc ?? ""}
                className={{
                  staticField: {
                    div: cssIf(
                      tldescChanged,
                      "rounded-lg bg-[#ff02]",
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
                novelData={
                  novelData && "error" in novelData ?
                    undefined
                  : novelData
                }
                erred={
                  novelData &&
                  "error" in novelData &&
                  novelData.error
                }
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
