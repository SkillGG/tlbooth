import type { ComponentPropsWithoutRef } from "react";
import spinner from "./loadingicons.module.css";

export default function LoadingSpinner({
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
