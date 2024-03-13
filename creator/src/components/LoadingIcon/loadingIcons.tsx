import type { ComponentPropsWithoutRef } from "react";
import spinner from "./loadingicons.module.css";

export function LoadingSpinner({
  className,
  style,
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={`${spinner.spinner} ${className}`}
      style={style}
      {...props}
    ></div>
  );
}
