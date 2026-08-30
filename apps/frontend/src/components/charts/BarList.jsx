import { useState } from "react";
import "./BarList.css";

const TONE_COLOR = {
  default: "var(--color-primary)",
  good: "var(--viz-good)",
  warning: "var(--viz-warning)",
  serious: "var(--viz-serious)",
  critical: "var(--viz-critical)",
};

export default function BarList({ data, unit = "" }) {
  const [hovered, setHovered] = useState(null);
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="barlist" role="table" aria-label="Bar chart">
      {data.map((row, i) => {
        const pct = Math.round((row.value / max) * 100);
        const shareOfTotal = row.total ? Math.round((row.value / row.total) * 100) : null;
        return (
          <div
            className="barlist-row"
            key={row.label}
            role="row"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered((cur) => (cur === i ? null : cur))}
          >
            <span className="barlist-label" title={row.label}>
              {row.icon}
              {row.label}
            </span>
            <span className="barlist-track">
              <span
                className="barlist-fill"
                style={{ width: `${pct}%`, background: TONE_COLOR[row.tone] || TONE_COLOR.default }}
              />
              {hovered === i && (
                <span className="barlist-tooltip">
                  {row.value.toLocaleString()}
                  {unit}
                  {shareOfTotal !== null ? ` · ${shareOfTotal}%` : ""}
                </span>
              )}
            </span>
            <span className="barlist-value">
              {row.value.toLocaleString()}
              {unit}
            </span>
          </div>
        );
      })}
    </div>
  );
}
