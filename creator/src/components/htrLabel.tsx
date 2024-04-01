import { SanitizedText } from "@/utils/sanitizer";
import { useMemo } from "react";

export function HTRText({ htr }: { htr: string }) {
  const data = useMemo(() => {
    return new SanitizedText({ htr }).toJSX();
  }, [htr]);

  return <>{data}</>;
}
