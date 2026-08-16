import { Link } from "react-router-dom";
import Logo from "../../../components/common/Logo";
import "./AuthLayout.css";

const STATS = [
  { value: "3+", label: "Insurers connected" },
  { value: "< 2 min", label: "Doc to profile" },
  { value: "100%", label: "Quotes compared" },
];

const INSURERS = ["ICICI Lombard", "ACKO", "Tata AIG"];

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-shell">
      <aside className="auth-panel">
        <span className="auth-panel-tag">Synova — Agent Platform</span>

        <div className="auth-panel-heading">
          <h1>
            Quote it.
            <br />
            Compare it.
            <br />
            Close it.
          </h1>
          <p>
            One workspace for new business and renewals — the AI assistant fills
            the forms, extracts the documents, and lines up every insurer&apos;s
            quote side by side.
          </p>

          <div className="auth-stats">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="auth-panel-footer">
          <div className="auth-trusted-label">Quoting live across</div>
          <div className="auth-trusted-card">
            {INSURERS.map((name) => (
              <span key={name}>{name}</span>
            ))}
          </div>
        </div>
      </aside>

      <div className="auth-form-side">
        <div className="auth-form-wrap">
          <div className="auth-form-logo">
            <Link to="/">
              <Logo />
            </Link>
          </div>
          <h1>{title}</h1>
          {subtitle && <p className="auth-form-sub">{subtitle}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}
