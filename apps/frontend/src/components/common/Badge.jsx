import "./common.css";

const TONE_CLASS = {
  neutral: "badge-neutral",
  good: "badge-good",
  warning: "badge-warning",
  critical: "badge-critical",
  accent: "badge-accent",
};

export default function Badge({ tone = "neutral", dot = true, children }) {
  return (
    <span className={`badge ${TONE_CLASS[tone] || TONE_CLASS.neutral}`}>
      {dot && <span className="badge-dot" aria-hidden="true" />}
      {children}
    </span>
  );
}
