import type {
  CSSProperties,
  ComponentPropsWithoutRef,
} from "react";
import spinner from "./icons.module.css";

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

type IconColors = {
  textColor?: CSSProperties["color"];
  backgroundColor?: CSSProperties["color"];
  rimColor?: CSSProperties["color"];
  rimWidth?: number;
};

export function InfoIcon({
  className,
  style,
  textColor,
  backgroundColor,
  rimColor,
  rimWidth,
  ...props
}: ComponentPropsWithoutRef<"svg"> & IconColors) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      style={style}
      {...props}
    >
      <circle
        cx={100}
        cy={100}
        r={50}
        stroke={rimColor}
        fill={backgroundColor}
        strokeWidth={rimWidth}
      />
      <text
        x={93.5}
        y={115}
        fontSize={60}
        fontFamily="serif"
        fill={textColor}
        stroke={textColor}
      >
        i
      </text>
    </svg>
  );
}
