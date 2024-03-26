import { useNovelStore } from "@/hooks/novelStore";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function EditTL() {
  const { tlid } = useParams();

  const { getTranslationInfo } = useNovelStore();
  if (!tlid || !(typeof tlid === "string"))
    return <>Wrong TL ID!</>;
  const tlInfo = getTranslationInfo(tlid);

  if (!tlInfo) return <>Loading...</>;

  const { tl, novel, chap } = tlInfo;

  return (
    <div>
      <div>
        <Link
          href={`/edit/${encodeURIComponent(novel.id)}/${encodeURIComponent(chap.id)}`}
        >
          Go to Edit chapter
        </Link>
      </div>
      Editing {tl.id} {tl.oglang}
      {"=>"}
      {tl.tllang}
    </div>
  );
}
