import { LANG } from "@prisma/client";
import { type CSSProperties } from "react";

export const cssIf = (
  condidion: unknown,
  onTrue?: string,
  onFalse = "",
): string => {
  return (
    !!condidion ?
      onTrue ? `${onTrue}`
      : onFalse
    : onFalse
  );
};

export const cssPIf = (
  condition: unknown,
  onTrue?: CSSProperties,
  onFalse: CSSProperties = {},
) => {
  return !!condition ? onTrue ?? onFalse : onFalse;
};

export const cssDef = (condidion?: unknown): string => {
  if (typeof condidion !== "string") return "";
  return cssIf(!!condidion, condidion, "");
};

export type Optional<T, K extends keyof T> = Pick<
  Partial<T>,
  K
> &
  Omit<T, K>;

export const isLang = (o: unknown): o is LANG => {
  return (
    typeof o === "string" &&
    Object.values(LANG).includes(o as LANG)
  );
};

export type NestedArray<T> = T | NestedArray<T>[];

export const flatten = <T>(arr: NestedArray<T>[]) => {
  return arr.flat(Infinity as 20) as T[];
};
