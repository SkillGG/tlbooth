import { useAdmin } from "@/hooks/admin";
import { type StoreNovel, useNovelStore } from "@/hooks/novelStore";
import Link from "next/link";
import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import { Mutation } from "@/hooks/novelStore";

import novelItem from "./novelItem.module.css";
import { api } from "@/utils/api";
import { RefreshButton } from "../LoadingIcon/refreshButton";
import { cssIf } from "@/utils/utils";
import type { ScrapperNovel } from "@/server/api/routers/scrapper";

const ChapterList = ({
  novel,
  novelData,
}: {
  novel: StoreNovel;
  novelData?: ScrapperNovel;
}) => {
  const utils = api.useUtils();

  const { mutate } = useNovelStore();

  const getRemote = (id: string) => novel.chapters.find((c) => c.id === id);
  const chapters = novelData?.chapters.map((r) => {
    return { ...r, scrapped: !novel.chapters.find((c) => c.url === r.url) };
  });


  return (
    <>
      <div className="ml-1 mt-1">
        <RefreshButton
          refreshFn={async () => {
            await utils.scrapper.getNovel.invalidate();
          }}
        />
      </div>
      <div>
        {chapters?.map((r) => {
          return (
            <div
              key={r.url}
              className={`${cssIf(r.scrapped, novelItem.scrapped)} grid grid-flow-col`}
            >
              <div>{r.name}</div>
              <div>
                <button
                  onClick={() => {
                    mutate(Mutation.stageChapter(novel.id, r));
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

type EditFieldProps = {
  lock: boolean;
  fieldName: string;
  defaultValue?: string;
  onSave: (s: string) => Promise<void> | void;
  onCancel?: (s: string) => Promise<void> | void;
  changed: boolean;
  ref: {
    hide(): void;
    show(): void;
  } | null;
};

type EditFieldRef = { show: () => void; hide: () => void };

const EditField = React.forwardRef<EditFieldRef, EditFieldProps>(
  function EditField(
    { onSave, onCancel, defaultValue, lock, changed, fieldName },
    ref,
  ) {
    const isAdmin = useAdmin();

    const [edit, setEdit] = useState(false);

    const textRef = useRef<HTMLSpanElement>(null);
    const saveRef = useRef<HTMLButtonElement>(null);

    useImperativeHandle(ref, () => {
      return { show: () => setEdit(true), hide: () => setEdit(false) };
    });

    const changedClass = !changed ? "" : novelItem.local;

    useEffect(() => {
      console.log(defaultValue);
      if (textRef.current) textRef.current.innerText = defaultValue ?? "";
    }, [defaultValue, edit]);

    return (
      <>
        <div data-edit={edit} className="h-min text-sm">
          <small>
            {fieldName}:
            {isAdmin &&
              !lock &&
              (!edit ? (
                <button className="ml-1" onClick={() => setEdit((p) => !p)}>
                  Edit
                </button>
              ) : (
                <div className="inline-grid grid-flow-col gap-x-1">
                  <button
                    ref={saveRef}
                    className="text-green-300"
                    onClick={() => {
                      if (textRef.current) {
                        const value = textRef.current.innerText.trim();
                        void onSave(value);
                        setEdit(false);
                      }
                    }}
                  >
                    Save
                  </button>
                  <button
                    className="text-red-400"
                    onClick={() => {
                      setEdit((p) => !p);
                      if (textRef.current)
                        void onCancel?.(textRef.current.innerText);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ))}
          </small>
          {edit ? (
            <div
              key="editfield"
              className="grid grid-flow-col gap-x-2"
              style={{ gridTemplateColumns: "auto min-content" }}
            >
              <span
                contentEditable
                className="block min-w-4 border-b-2 text-center"
                onKeyDown={(e) => {
                  if (e.code === "Enter") {
                    saveRef.current?.click();
                  }
                }}
                ref={textRef}
              ></span>
            </div>
          ) : (
            <div
              key="nonEditField"
              className={`${changedClass} min-h-5 text-center`}
            >
              <span>{defaultValue}</span>
            </div>
          )}
        </div>
      </>
    );
  },
);

export const NovelCard = ({ novel }: { novel: StoreNovel }) => {
  const [unwrapped, setShow] = useState(false);

  const novelData = api.scrapper.getNovel.useQuery(novel.url).data;

  const show = unwrapped && !novel.forDeletion;

  const isAdmin = useAdmin();

  const { mutate, removeMutation, novels } = useNovelStore();

  const nameEdit = useRef<EditFieldRef>(null);
  const ogdescEdit = useRef<EditFieldRef>(null);
  const tldescEdit = useRef<EditFieldRef>(null);

  return (
    <div className="w-full justify-center rounded-xl border-2 border-gray-400">
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
          <span
            className="block w-max justify-self-center"
            style={{ maxWidth: "90%" }}
          >
            {novel.ogname}
          </span>
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
                <div className="text-center">{novel.ogname}</div>
              </div>
              <EditField
                fieldName="TLName"
                ref={nameEdit}
                lock={!!novel.forDeletion}
                onCancel={() => {
                  /** */
                }}
                onSave={(v) => mutate(Mutation.changeTLName(novel.id, v), true)}
                changed={
                  novels?.find((n) => n.id === novel.id)?.tlname !==
                  novel.tlname
                }
                defaultValue={novel.tlname ?? ""}
              />
            </div>
            <div className="px-3 pb-1">
              <EditField
                fieldName="OGDesc"
                onSave={(v) => mutate(Mutation.changeOGDesc(novel.id, v), true)}
                ref={ogdescEdit}
                lock={!!novel.forDeletion}
                changed={
                  novels?.find((n) => n.id === novel.id)?.ogdesc !==
                  novel.ogdesc
                }
                defaultValue={novel.ogdesc}
              />
              <EditField
                fieldName="TLDesc"
                ref={tldescEdit}
                lock={!!novel.forDeletion}
                onCancel={() => {
                  /** */
                }}
                onSave={(v) => {
                  mutate(Mutation.changeTLDesc(novel.id, v), true);
                }}
                changed={
                  novels?.find((n) => n.id === novel.id)?.tldesc !==
                  novel.tldesc
                }
                defaultValue={novel.tldesc ?? ""}
              />
            </div>

            <div
              className="grid h-full min-h-24 overflow-y-scroll px-5"
              style={{ gridAutoRows: "min-content" }}
            >
              {isAdmin && (
                <>
                  <button
                    className="absolute mr-1 mt-1 justify-self-end text-red-400"
                    style={{ transform: "translateX(5px)" }}
                    onClick={() => {
                      console.log("removing novel", novel);
                      if (!novel.local) mutate(Mutation.removeNovel(novel.id));
                      else removeMutation(`add_novel_${novel.url}`);
                    }}
                  >
                    Delete novel
                  </button>
                </>
              )}
              <ChapterList novel={novel} novelData={novelData} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
