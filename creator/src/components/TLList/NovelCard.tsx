import { useNovelStore } from "@/hooks/novelStore";
import React, { useMemo, useState } from "react";

import novelItem from "./novelItem.module.css";
import { api } from "@/utils/api";
import { cssIf } from "@/utils/utils";
import { EditField, useEditRef } from "../EditField";
import { ChapterList } from "./ChapterList";
import { type StoreNovel } from "@/hooks/mutations/mutation";
import { ChangeNovelNameMutation } from "@/hooks/mutations/novelMutations/changeName";
import { ChangeNovelDescriptionMutation } from "@/hooks/mutations/novelMutations/changeDescription";
import { RemoveNovelMutation } from "@/hooks/mutations/novelMutations/removeNovel";
import { AddNovelMutation } from "@/hooks/mutations/novelMutations/addNovel";
import { HTRText } from "../htrLabel";
import { usePopupMenu } from "../PopupMenu";

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

  const popupMenu = usePopupMenu();

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
        onContextMenu={(e) => {
          popupMenu.show(e.clientX, e.clientY, [
            {
              label: "Go to page",
              action() {
                if (novel.url)
                  window.open(
                    decodeURIComponent(novel.url),
                    "_blank",
                  );
              },
            },
            {
              label: "Copy original name",
              action() {
                if (novel.ogname)
                  void navigator.clipboard.writeText(
                    novel.ogname,
                  );
              },
            },
          ]);
          e.preventDefault();
        }}
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
            <HTRText htr={novel.ogname} />
          </div>
        </button>
      </div>
      {show && (
        <>
          <div className="box-content grid grid-cols-[1fr_1fr] sm:grid-cols-[1fr]">
            <div className="px-3 pt-1">
              <div className="border-b-2">
                <EditField
                  fieldName="Author"
                  defaultValue={novel.author}
                  lock={false}
                  onSave={() => {
                    throw "TODO! Add Author changes";
                  }}
                />
              </div>
              <div
                className="grid grid-flow-col grid-cols-[1fr_1fr] gap-[2px] border-x-[1px] border-b-2 border-dotted px-3 pb-2"
                style={{
                  borderLeftStyle: "solid",
                  borderRightStyle: "solid",
                }}
              >
                <EditField
                  fieldName="OGName"
                  lock={true}
                  defaultValue={novel.ogname}
                  className={{
                    staticField: {
                      div: `max-h-40 overflow-y-auto text-balance leading-[normal]`,
                      span: `text-center`,
                    },
                    editField: {
                      div: `max-h-40 overflow-y-auto text-center leading-[normal]`,
                    },
                  }}
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
                  onRestore={() => {
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
                      div: `max-h-40 overflow-y-auto text-balance leading-[normal] ${cssIf(
                        tlnameChanged,
                        "rounded-lg bg-[#ff02]",
                      )}`,
                      span: `text-center`,
                    },
                    editField: {
                      div: `max-h-40 overflow-y-auto text-center leading-[normal]`,
                    },
                  }}
                />
              </div>
              <div className="mb-1 grid grid-flow-col grid-cols-[1fr_1fr] gap-[2px] border-x-[1px] border-b-[1px] px-3 pb-1">
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
                  onRestore={() => {
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
                      div: `max-h-40 overflow-y-auto leading-[normal] ${cssIf(
                        ogdescChanged,
                        "rounded-lg bg-[#ff02]",
                      )}`,
                      span: `text-center`,
                    },
                    editField: {
                      div: `max-h-40 overflow-y-auto text-center leading-[normal]`,
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
                        og: false,
                      }),
                      true,
                    );
                  }}
                  onRestore={() => {
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
                      div: `max-h-40 overflow-y-auto leading-[normal] ${cssIf(
                        tldescChanged,
                        "rounded-lg bg-[#ff02]",
                      )}`,
                      span: `text-center`,
                    },
                    editField: {
                      div: `max-h-40 overflow-y-auto text-center leading-[normal]`,
                    },
                  }}
                />
              </div>
            </div>

            <div
              className="grid min-h-24 overflow-hidden px-5"
              style={{ gridAutoRows: "min-content" }}
            >
              <div className="relative right-0 justify-self-end">
                <button
                  className="absolute right-0 mt-1 justify-self-end text-red-400"
                  style={{ transform: "translateX(5px)" }}
                  onClick={() => {
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
