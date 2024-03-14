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
import { EditField, useEditRef } from "../EditField";

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
          className="grid h-6 w-fit min-w-14 items-center justify-center"
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

export const NovelCard = ({ novel }: { novel: StoreNovel }) => {
  const [unwrapped, setShow] = useState(false);

  const novelData = api.scrapper.getNovel.useQuery(novel.url).data;

  const show = unwrapped && !novel.forDeletion;

  const isAdmin = useAdmin();

  const { mutate, removeMutation, novels } = useNovelStore();

  const nameEdit = useEditRef();
  const ogdescEdit = useEditRef();
  const tldescEdit = useEditRef();

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
          <div className="justify-self-center" style={{ maxWidth: "90%" }}>
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
                <div className="text-center">{novel.ogname}</div>
              </div>
              <EditField
                fieldName="TLName"
                ref={nameEdit}
                lock={!!novel.forDeletion}
                onSave={(v) => mutate(Mutation.changeTLName(novel.id, v), true)}
                defaultValue={novel.tlname ?? ""}
              />
            </div>
            <div className="px-3 pb-1">
              <EditField
                fieldName="OGDesc"
                onSave={(v) => mutate(Mutation.changeOGDesc(novel.id, v), true)}
                ref={ogdescEdit}
                lock={!!novel.forDeletion}
                defaultValue={novel.ogdesc}
              />
              <EditField
                fieldName="TLDesc"
                ref={tldescEdit}
                lock={!!novel.forDeletion}
                onSave={(v) => {
                  mutate(Mutation.changeTLDesc(novel.id, v), true);
                }}
                defaultValue={novel.tldesc ?? ""}
                classNames={{
                  staticField: {
                    span:
                      novels?.find((n) => n.id === novel.id)?.tldesc ===
                      novel.tldesc
                        ? ""
                        : "bg-yellow-300",
                  },
                }}
              />
            </div>

            <div
              className="grid h-full min-h-24 overflow-y-scroll px-5"
              style={{ gridAutoRows: "min-content" }}
            >
              {isAdmin && (
                <div className="relative right-0 justify-self-end">
                  <button
                    className="absolute right-0 mt-1 justify-self-end text-red-400"
                    style={{ transform: "translateX(5px)" }}
                    onClick={() => {
                      console.log("removing novel", novel);
                      if (!novel.local) mutate(Mutation.removeNovel(novel.id));
                      else removeMutation(`add_novel_${novel.url}`);
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
              <ChapterList novel={novel} novelData={novelData} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
