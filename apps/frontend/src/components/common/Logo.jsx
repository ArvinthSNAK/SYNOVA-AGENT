export default function Logo({ size = 28, tone = "color", className = "" }) {
  const mark = tone === "light" ? "#FFFFFF" : "#0F6E6E";
  const dot = tone === "light" ? "#FFFFFF" : "#D06A4E";
  const textColor = tone === "light" ? "#FFFFFF" : "#101828";

  return (
    <span className={`logo ${className}`.trim()} style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <path
          d="M16 3l11 4v8.2c0 7-4.7 12-11 13.8-6.3-1.8-11-6.8-11-13.8V7l11-4Z"
          stroke={mark}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle cx="16" cy="15" r="3.4" fill={dot} />
      </svg>
      <span
        style={{
          fontFamily: "var(--font-heading)",
          fontWeight: 700,
          fontSize: 20,
          letterSpacing: "-0.01em",
          color: textColor,
        }}
      >
        Synova
      </span>
    </span>
  );
}
