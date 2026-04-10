// Inline SVG logo — no image file needed, always scales correctly
export default function Logo({ width = 160 }: { width?: number }) {
  return (
    <svg
      width={width}
      viewBox="0 0 320 52"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      {/* Pixel chart arrow icon */}
      <g fill="#39ff14">
        {/* Rising bars / arrow pixels */}
        <rect x="0"  y="36" width="8" height="8" opacity="0.5"/>
        <rect x="10" y="28" width="8" height="16" opacity="0.6"/>
        <rect x="20" y="20" width="8" height="24" opacity="0.7"/>
        <rect x="30" y="12" width="8" height="32" opacity="0.85"/>
        {/* Arrow head (pixelated) */}
        <rect x="38" y="4"  width="8" height="8"/>
        <rect x="30" y="4"  width="8" height="8"/>
        <rect x="38" y="12" width="8" height="8"/>
      </g>
      {/* EDGELEDGER text */}
      <text
        x="58"
        y="39"
        fontFamily="'JetBrains Mono', monospace"
        fontWeight="700"
        fontSize="28"
        letterSpacing="1"
        fill="#39ff14"
        style={{ filter: "drop-shadow(0 0 6px rgba(57,255,20,0.4))" }}
      >
        EDGELEDGER
      </text>
    </svg>
  );
}
