"use client";
import { SanitizedText } from "@/utils/sanitizer";
import { useMemo } from "react";

export function HTRText({ htr }: { htr: string }) {
  if (!window.SanitizedText)
    window.SanitizedText = SanitizedText;
  const data = useMemo(() => {
    return new SanitizedText({ htr }).toJSX();
  }, [htr]);

  return <>{data}</>;
}
