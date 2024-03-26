import { EditField } from "@/components/EditField";
import { TransformationHistory } from "@/components/TLList/TransformHistory";
import { type StoreTranslation } from "@/hooks/mutations/mutation";
import { ChangeNovelNameMutation } from "@/hooks/mutations/novelMutations/changeName";
import { useNovelStore } from "@/hooks/novelStore";
import { cssIf } from "@/utils/utils";
import { LANG } from "@prisma/client";
import Head from "next/head";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";
import { useState } from "react";

function TranslationItem({ tl }: { tl: StoreTranslation }) {
  const router = useRouter();
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
                // TODO
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

export default function ChapterEdit() {
  const { chapterID, novelID } = useParams();

  const router = useRouter();

  const {
    getChapter,
    getDBChapter,
    getDBNovel,
    getNovel,
    removeMutation,
    mutate,
    isMutation,
  } = useNovelStore();

  const [[from, to], setSelectedLang] = useState<
    [LANG, LANG]
  >([LANG.JP, LANG.EN]);

  if (
    !chapterID ||
    typeof chapterID !== "string" ||
    !novelID ||
    typeof novelID !== "string"
  )
    return void router.replace("/");

  const novel = getNovel(novelID);

  const localNovel = !getDBNovel(novelID);

  const chapter = getChapter(novelID, chapterID);

  const localChapter = !getDBChapter(novelID, chapterID);

  console.log(novel, chapter);

  const isThickLine = !localChapter && !localNovel;

  return (
    <>
      <Head>
        <title>Editing chapter</title>
      </Head>
      <div className="px-4">
        <TransformationHistory />
      </div>
      <div
        className={`grid px-2 ${localNovel ? "text-chapstate-localonly" : "text-chapstate-good"} mx-auto max-w-[90%]`}
      >
        <div
          className={`border-2 ${localNovel ? "border-chapstate-localonly" : "border-chapstate-good"} w-[100%] pb-2`}
        >
          <div>Novel info</div>
          <div className="flex w-full justify-evenly gap-3">
            <EditField
              lock={true}
              fieldName="Original name"
              defaultValue={novel?.ogname}
            />
            <EditField
              fieldName="Translated name"
              showRestore={isMutation(
                ChangeNovelNameMutation.getID({
                  novelID,
                  og: false,
                }),
              )}
              defaultValue={novel?.tlname}
              lock={false}
              onSave={(v) => {
                mutate(
                  new ChangeNovelNameMutation({
                    novelID,
                    og: false,
                    name: v,
                  }),
                  true,
                );
              }}
              onReset={() => {
                /** */
                removeMutation(
                  ChangeNovelNameMutation.getID({
                    novelID,
                    og: false,
                  }),
                );
              }}
            />
          </div>
        </div>
        <div>
          <div
            className={`border-2 ${isThickLine ? "border-t-0" : ""} ${cssIf(localChapter) ? "border-chapstate-localonly text-chapstate-localonly" : "border-chapstate-good text-chapstate-good"}`}
          >
            <div>Chapter</div>
            <div className="flex w-full justify-evenly gap-3">
              <EditField
                fieldName="Original name"
                lock={false}
                className={{ main: "mx-4 inline-block" }}
                defaultValue={chapter?.ogname}
              />
              <EditField
                fieldName="Translated name"
                lock={false}
                className={{ main: "mx-4 inline-block" }}
                defaultValue={chapter?.tlname ?? ""}
              />
            </div>
            <div>Translations:</div>
            <div className="grid justify-items-center">
              {chapter?.translations.map((tl) => {
                return (
                  <TranslationItem key={tl.id} tl={tl} />
                );
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
                    const selected =
                      selectedOptions[0]?.value;
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
                    const selected =
                      selectedOptions[0]?.value;
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
                    else
                      setSelectedLang((_) => [from, lang]);
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
                        t.oglang === from &&
                        t.tllang === to,
                    )
                  }
                >
                  {(
                    chapter?.translations.find(
                      (t) =>
                        t.oglang === from &&
                        t.tllang === to,
                    )
                  ) ?
                    "That TL already exists"
                  : "ADD"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
