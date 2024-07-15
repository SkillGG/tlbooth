export default function CancelSVG({
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
      viewBox="0 0 200 200"
      className={`${className ?? ""}`}
    >
      <g
        id="layer1"
        transform="translate(0,-5), scale(0.65,0.65)"
      >
        <g
          id="g3572"
          transform="translate(26.052543,26.05254)"
        >
          <rect
            style={{
              fillRule: "evenodd",
              strokeWidth: 1.32292,
            }}
            id="rect3564"
            width="15"
            height="200"
            x="-17.94397"
            y="90.450089"
            rx="5"
            ry="5"
            transform="rotate(-45)"
          />
          <rect
            style={{
              fillRule: "evenodd",
              strokeWidth: 1.32292,
            }}
            id="rect3566"
            width="15"
            height="200"
            x="-197.9501"
            y="-110.44396"
            rx="5"
            ry="5"
            transform="rotate(-135)"
          />
        </g>
      </g>
    </svg>
  );
}
