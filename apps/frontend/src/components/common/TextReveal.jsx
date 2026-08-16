import "./common.css";

export default function TextReveal({ lines, as: Tag = "span", className = "", baseDelay = 0 }) {
  return (
    <Tag className={className}>
      {lines.map((line, i) => (
        <span className="text-reveal-line" key={i}>
          <span className="text-reveal-inner" style={{ "--i": i + baseDelay }}>
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}
