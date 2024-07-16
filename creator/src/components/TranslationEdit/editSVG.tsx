export default function EditSVG({
  width = 50,
  height = 50,
  className = "",
  accentColor = "pink",
  bgColor = "white",
  outlineColor = "red",
  strokeWidth = 4,
}: {
  width?: number;
  height?: number;
  className?: string;
  outlineColor?: string;
  bgColor?: string;
  accentColor?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 200 200"
      className={className}
      style={{
        "--accent": accentColor,
        "--bg": bgColor,
        "--outlineColor": outlineColor,
      }}
    >
      <g
        id="layer1"
        transform="translate(-53.336098,-68.106094)"
      >
        <path
          style={{
            fill: "var(--bg)",
            fillRule: "evenodd",
            stroke: "var(--outlineColor)",
            strokeWidth,
          }}
          d="m 208.31977,-99.5297 c -0.90375,0.903749 -1.46271,2.15438 -1.46271,3.539378 l 5.6e-4,189.999071 c 2e-5,6.508941 5.2376,12.536711 7.5925,17.175451 11.02647,18.0436 11.00516,18.06502 22.78631,1.22432 6.05499,-8.99989 6.07851,-9.00458 9.62165,-18.399965 3.54314,-9.395386 -5.6e-4,-189.999071 -5.6e-4,-189.999071 0,-2.769997 -2.22905,-5.000034 -4.99905,-5.000034 l -30,-2.1e-4 c -1.385,0 -2.63496,0.55731 -3.5387,1.46106 z"
          transform="rotate(45.310859)"
        />
        <rect
          style={{
            stroke: "var(--accent)",
            fillRule: "evenodd",
            strokeWidth,
          }}
          width="1"
          height="20"
          x="129.65021"
          y="196.8597"
          rx="1"
          ry="1"
          transform="rotate(14.119358)"
        />
        <path
          style={{
            fill: "none",
            fillRule: "evenodd",
            stroke: "var(--outlineColor)",
            strokeWidth,
          }}
          d="m 217.26188,78.106097 0.0788,8.119608 16.97056,16.837975 8.83991,0.0261"
        />
        <ellipse
          style={{
            fill: "var(--accent)",
            fillRule: "evenodd",
            stroke: "none",
          }}
          cx="234.26823"
          cy="-76.158623"
          rx="1.8437499"
          ry="0.96874964"
          transform="rotate(40)"
        />
        <path
          style={{
            fill: "none",
            fillRule: "evenodd",
            stroke: "var(--outlineColor)",
            strokeWidth,
          }}
          d="m 106.77164,241.61195 -0.005,-6.97117 -19.84227,-21.46352 -8.283806,-0.003"
          id="path2524"
        />
        <path
          style={{
            fill: "none",
            fillRule: "evenodd",
            stroke: "var(--outlineColor)",
            strokeWidth,
          }}
          d="M 86.92437,213.17726 217.34068,86.225705"
        />
        <path
          style={{
            fill: "none",
            fillRule: "evenodd",
            stroke: "var(--outlineColor)",
            strokeWidth,
          }}
          d="m 106.76664,234.64078 127.5446,-131.5771"
          id="path2591"
        />
        <path
          style={{
            fill: "none",
            fillRule: "evenodd",
            stroke: "var(--outlineColor)",
            strokeWidth,
          }}
          d="M 96.845505,223.90902 225.82596,94.644693"
          id="path2593"
        />
      </g>
    </svg>
  );
}
