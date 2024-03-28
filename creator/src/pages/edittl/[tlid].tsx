import { TransformationHistory } from "@/components/TLList/TransformHistory";
import { TranslationEditor } from "@/components/TranslationEdit";
import { useNovelStore } from "@/hooks/novelStore";
import Head from "next/head";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function EditTL() {
  const { tlid } = useParams();

  const { getTranslationInfo } = useNovelStore();
  const tlinf =
    tlid && typeof tlid === "string" ?
      getTranslationInfo(tlid)
    : null;

  if (!tlinf) return <>Loading...</>;

  return (
    <>
      <Head>
        <title>Editing translation</title>
      </Head>
      <div>
        <div>
          <TransformationHistory />
          <br />
          {tlinf && (
            <Link
              href={`/edit/${encodeURIComponent(tlinf.novel.id)}/${encodeURIComponent(tlinf.chap.id)}`}
            >
              Back to Edit Chapter
            </Link>
          )}
        </div>
        {tlinf && <TranslationEditor info={tlinf} />}
      </div>
    </>
  );
}
