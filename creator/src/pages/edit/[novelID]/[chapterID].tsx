import { ChapterEdit } from "@/components/ChapterEdit";
import { TransformationHistory } from "@/components/TLList/TransformHistory";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";

export default function EditChapterPage() {
  const { chapterID, novelID } = useParams();

  const router = useRouter();

  if (
    !chapterID ||
    typeof chapterID !== "string" ||
    !novelID ||
    typeof novelID !== "string"
  )
    return void router.replace("/");

  return (
    <>
      <div className="px-4">
        <TransformationHistory />
      </div>
      <ChapterEdit
        novelID={novelID}
        chapterID={chapterID}
      />
    </>
  );
}
