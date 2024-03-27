import { TranslationEditor } from "@/components/TranslationEdit";
import {
  type TLInfo,
  useNovelStore,
} from "@/hooks/novelStore";
import Head from "next/head";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EditTL() {
  const { tlid } = useParams();

  const { getTranslationInfo } = useNovelStore();
  const tlinf =
    tlid && typeof tlid === "string" ?
      getTranslationInfo(tlid)
    : null;

  const [tlInfo, setTLInfo] = useState<TLInfo | null>(
    tlinf,
  );

  useEffect(() => {
    setTLInfo(tlinf);
  }, [tlinf]);

  if (!tlInfo) return <>Loading...</>;

  const { novel, chap } = tlInfo;

  return (
    <>
      <Head>
        <title>Editing translation</title>
      </Head>
      <div>
        <div>
          <Link
            href={`/edit/${encodeURIComponent(novel.id)}/${encodeURIComponent(chap.id)}`}
          >
            Back to Edit Chapter
          </Link>
        </div>
        <TranslationEditor info={tlInfo} />
      </div>
    </>
  );
}
