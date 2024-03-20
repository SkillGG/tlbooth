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

  const { getChapter, getDBChapter, getNovel } =
    useNovelStore();

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
        {novel?.ogname} / {novel?.tlname}
        <div className={`grid`}>
          <div className="grid">
            <div>{chapter?.ogname}</div>
            <div>{chapter?.tlname}</div>
          </div>
        </div>
      </div>
    </>
  );
}
