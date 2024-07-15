import { cssDef } from "@/utils/utils";

export default function ApproveSVG({
  width,
  height,
  className,
}: {
  width?: number;
  height?: number;
  className?: string;
}) {
  return (
    <svg
      width={width ?? 50}
      height={height ?? 50}
      viewBox={"0 0 250 250"}
      version={"1.1"}
      xmlns={"http://www.w3.org/2000/svg"}
      className={cssDef(className)}
    >
      <g id="layer1">
        <g
          id="g560"
          transform="matrix(0.49637067,0,0,0.49637067,61.413067,64.919942)"
        >
          <rect
            style={{
              fillRule: "evenodd",
              strokeWidth: 1.32292,
            }}
            width="19.84375"
            height="264.58334"
            x="191.80804"
            y="-116.78029"
            rx="13.229167"
            transform="rotate(32.294977)"
          />
          <rect
            style={{
              fillRule: "evenodd",
              strokeWidth: 1.32292,
            }}
            width="19.84375"
            height="132.29167"
            x="-63.778431"
            y="115.08541"
            rx="13.229167"
            transform="rotate(-35.443993)"
          />
        </g>
      </g>
    </svg>
  );
}
