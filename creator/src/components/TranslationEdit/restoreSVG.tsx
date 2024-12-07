export default function RestoreSVG({
  width = 50,
  height = 50,
  className = "",
  color = "black",
  strokeWidth = 15,
}: {
  width?: number;
  height?: number;
  className?: string;
  color?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 200"
      version="1.1"
      className={className}
    >
      <defs id="defs658">
        <marker
          style={{ overflow: "visible" }}
          id="TriangleStart"
          refX="0"
          refY="0"
          orient="auto-start-reverse"
          markerWidth="5"
          markerHeight="5"
          viewBox="0 0 5.3244081 6.1553851"
          preserveAspectRatio="none"
        >
          <path
            transform="scale(0.5)"
            style={{
              fill: "context-stroke",
              fillRule: "evenodd",
              stroke: "context-stroke",
              strokeWidth: "1pt",
            }}
            d="M 5.77,0 -2.88,5 V -5 Z"
            id="path135"
          />
        </marker>
      </defs>
      <g
        id="layer1"
        transform="translate(-53.336098,-68.106094)"
      >
        <path
          id="path895"
          style={{
            fill: "none",
            fillRule: "evenodd",
            stroke: color,
            strokeWidth,
            strokeLinecap: "round",
            markerStart: "url(#TriangleStart)",
          }}
          d="m 120.00966,128.10609 h 20 c 41.13495,0 75,8.72764 75,49.94044 0,39.10034 -36.43362,48.40164 -74.75,50.05956 h -10.25"
        />
      </g>
    </svg>
  );
}
