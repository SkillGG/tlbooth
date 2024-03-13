import { useAdmin } from "@/hooks/admin";
import { type StoreNovel, useNovelStore } from "@/hooks/novelStore";
import Link from "next/link";
import React, { ComponentPropsWithoutRef, useRef, useState } from "react";
import { Mutation } from "@/hooks/novelStore";

import novelItem from "./novelItem.module.css";
import { api } from "@/utils/api";

const ChapterList = ({ novel }: { novel: StoreNovel }) => {
  const scrappedData = api.scrapper.getNovelInfo.useQuery(novel.url);

  return (
    <>
      <div className="ml-1 mt-1">
        <button
          onClick={async () => {
            /** */
          }}
          className="text-green-400"
        >
          {novel.chapters.length ? "Refresh" : "Load"}
        </button>
      </div>
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
    </>
  );
};

const EditField = React.forwardRef(function EditField({
  onSave,
  onCancel,
  defaultValue,
  lock,
  unappliedChange,
  ref,
}: {
  lock: boolean;
  defaultValue?: string;
  onSave: (s: string) => Promise<void> | void;
  onCancel: (s: string) => Promise<void> | void;
  unappliedChange: boolean;
  ref: {
    hide(): void;
    show(): void;
  } | null;
}) {
  const isAdmin = useAdmin();

  const [edit, setEdit] = useState(false);

  const textRef = useRef<HTMLSpanElement>(null);

  return (
    <>
      <div className="h-min text-sm">
        <small>
          TLName:
          {isAdmin &&
            !lock &&
            (!edit ? (
              <button onClick={() => setEdit((p) => !p)}>Edit</button>
            ) : (
              <div className="inline-grid grid-flow-col gap-x-1">
                <button
                  className="text-green-300"
                  onClick={() => {
                    if (textRef.current) {
                      const value = textRef.current.innerText;
                      void onSave(value);
                      setEdit(false);
                    }
                  }}
                >
                  Save
                </button>
                <button
                  className="text-red-400"
                  onClick={() => setEdit((p) => !p)}
                >
                  Cancel
                </button>
              </div>
            ))}
        </small>
        {edit ? (
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
              ref={textRef}
            >
              {defaultValue}
            </span>
          </div>
        ) : (
          <div
            className={`${!unappliedChange ? "" : `${novelItem.local}`} text-center`}
          >
            {defaultValue}
          </div>
        )}
      </div>
    </>
  );
});

export const NovelCard = ({ novel }: { novel: StoreNovel }) => {
  const [unwrapped, setShow] = useState(false);

  const show = unwrapped && !novel.forDeletion;

  const isAdmin = useAdmin();

  const { mutate, removeMutation, novels } = useNovelStore();

  const nameEdit = useRef<typeof EditField>(null);

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
              <EditField
                ref={nameEdit}
                lock={!!novel.forDeletion}
                onCancel={() => {
                  /** */
                }}
                onSave={() => {
                  /** */
                }}
                unappliedChange={
                  novels?.find((n) => n.id === novel.id)?.tlname ===
                  novel.tlname
                }
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
              <ChapterList novel={novel} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
