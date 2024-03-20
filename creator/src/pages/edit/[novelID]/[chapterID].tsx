import { EditField } from "@/components/EditField";
import { useNovelStore } from "@/hooks/novelStore";
import { cssIf } from "@/utils/utils";
import Head from "next/head";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";
import { useEffect } from "react";
// import { useParams } from "next/navigation";

export default function Dashboard() {
  const { chapterID, novelID } = useParams();

  const router = useRouter();

  const {
    getChapter,
    getDBChapter,
    getNovel,
    mutate,
    removeMutation,
  } = useNovelStore();

  if (
    !chapterID ||
    typeof chapterID !== "string" ||
    !novelID ||
    typeof novelID !== "string"
  )
    return void router.replace("/");

  const novel = getNovel(novelID);

  const chapter = getChapter(novelID, chapterID);

  const localEdit = !getDBChapter(novelID, chapterID);

  return (
    <>
      <Head>
        <title>Editing chapter</title>
      </Head>
      <div
        className={`${cssIf(localEdit) ? "text-chapstate-localonly" : "text-chapstate-good"} grid px-2`}
      >
        <div className="max-w-[50%] justify-center">
          <div>Novel name</div>
          <div className="flex w-full justify-evenly gap-3">
            <EditField
              lock={true}
              fieldName="Original"
              defaultValue={novel?.ogname}
            />
            <EditField
              fieldName="Translated"
              defaultValue={novel?.tlname}
              lock={false}
              onSave={(v) => {
                // mutate(
                //   Mutation.changeChapterTLName(
                //     novelID,
                //     chapterID,
                //     v,
                //   ),
                // );
              }}
              onReset={
                () => {
                  /** */
                }
                // removeMutation(
                //   Mutation.changeChapterTLNameID(
                //     novelID,
                //     chapterID,
                //   ),
                // )
              }
            />
          </div>
          <div className="">{novel?.tlname}</div>
        </div>
        <div>{chapter?.ogname}</div>
        <div className={`grid border-2 border-white`}>
          <h1></h1>
        </div>
      </div>
    </>
  );
}
