import { useNovelStore } from "@/hooks/novelStore";
import { LANG } from "@prisma/client";
import { useState } from "react";
import { type StoreTranslation } from "@/hooks/mutations/mutation";
import Link from "next/link";
import { AddTranslationMutation } from "@/hooks/mutations/chapterMutations/addTranslation";
import { RemoveTLMutation } from "@/hooks/mutations/chapterMutations/removeTranslation";
import { NovelEditCard } from "./NovelEditCard";
import { ChapterEditCard } from "./ChapterEditCard";

function TranslationItem({ tl }: { tl: StoreTranslation }) {
  const {
    removeMutation,
    isMutation,
    getTranslationInfo,
    mutate,
  } = useNovelStore();

  const tlInfo = getTranslationInfo(tl.id);

  if (!tlInfo) return <></>;

  return (
    <div
      className={`${tl.forDeletion ? "text-red-300" : ""} grid w-[50%] grid-flow-col px-4`}
    >
      <div>
        {tl.id} ({tl.oglang} {"=>"} {tl.tllang})
      </div>
      <div className="flex gap-2 justify-self-end">
        {!tl.forDeletion && (
          <>
            <Link href={`/edittl/${tl.id}`}>Edit</Link>
            <button
              onClick={() => {
                const addTLID =
                  AddTranslationMutation.getID({
                    chapterID: tlInfo.chap.id,
                    novelID: tlInfo.novel.id,
                    from: tl.oglang,
                    to: tl.tllang,
                    tlID: tl.id,
                  });
                if (isMutation(addTLID)) {
                  removeMutation(addTLID);
                } else {
                  mutate(
                    new RemoveTLMutation({
                      tlID: tl.id,
                      novelID: tlInfo.novel.id,
                      chapterID: tlInfo.chap.id,
                    }),
                  );
                }
              }}
              className="text-red-500"
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function ChapterEdit(props: {
  novelID: string;
  chapterID: string;
}) {
  const { novelID, chapterID } = props;

  const [[from, to], setSelectedLang] = useState<
    [LANG, LANG]
  >([LANG.JP, LANG.EN]);

  const { getChapter, getDBNovel, mutate } =
    useNovelStore();

  const localNovel = !getDBNovel(novelID);

  const chapter = getChapter(novelID, chapterID);

  return (
    <div
      className={`grid px-2 ${localNovel ? "text-chapstate-localonly" : "text-chapstate-good"} mx-auto max-w-[90%]`}
    >
      <NovelEditCard id={novelID} />
      <ChapterEditCard
        novelID={novelID}
        chapterID={chapterID}
      >
        <div className="px-2">Translations:</div>
        <div className="grid justify-items-center">
          {chapter?.translations.map((tl) => {
            return <TranslationItem key={tl.id} tl={tl} />;
          })}
          <div
            className="grid w-[50%] grid-flow-col gap-4 px-4 text-white"
            style={{
              gridTemplateColumns:
                "min-content min-content min-content auto",
            }}
          >
            <select
              className="w-fit text-black"
              value={from}
              onChange={({
                currentTarget: { selectedOptions },
              }) => {
                const selected = selectedOptions[0]?.value;
                if (
                  !selected ||
                  !Object.values(LANG).includes(
                    selected as LANG,
                  )
                )
                  return;
                const lang: LANG = selected as LANG;
                if (lang === to)
                  setSelectedLang((_) => [to, from]);
                else setSelectedLang((_) => [lang, to]);
              }}
            >
              {Object.entries(LANG).map(([n, v]) => (
                <option key={`fromlang_${n}`} value={v}>
                  {n}
                </option>
              ))}
            </select>
            <span className="text-center">{"=>"}</span>
            <select
              className="text-black"
              value={to}
              onChange={({
                currentTarget: { selectedOptions },
              }) => {
                const selected = selectedOptions[0]?.value;
                if (
                  !selected ||
                  !Object.values(LANG).includes(
                    selected as LANG,
                  )
                )
                  return;
                const lang: LANG = selected as LANG;
                if (lang === from)
                  setSelectedLang((_) => [to, from]);
                else setSelectedLang((_) => [from, lang]);
              }}
            >
              {Object.entries(LANG).map(([n, v]) => (
                <option key={`tolang_${n}`} value={v}>
                  {n}
                </option>
              ))}
            </select>
            <button
              className="justify-self-end disabled:text-red-400"
              disabled={
                !!chapter?.translations.find(
                  (t) =>
                    t.oglang === from && t.tllang === to,
                )
              }
              onClick={() =>
                mutate(
                  new AddTranslationMutation({
                    novelID,
                    chapterID,
                    from,
                    to,
                  }),
                )
              }
            >
              {(
                chapter?.translations.find(
                  (t) =>
                    t.oglang === from && t.tllang === to,
                )
              ) ?
                "That TL already exists"
              : "ADD"}
            </button>
          </div>
        </div>
      </ChapterEditCard>
    </div>
  );
}
