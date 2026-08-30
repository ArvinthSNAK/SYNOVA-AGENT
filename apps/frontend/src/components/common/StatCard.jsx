import "./common.css";

export default function StatCard({ label, value, delta, deltaDirection = "up", icon }) {
  return (
    <div className="stat-card hover-lift">
      <div className="stat-card-top">
        <span className="stat-card-label">{label}</span>
        {icon && <span className="stat-card-icon">{icon}</span>}
      </div>
      <span className="stat-card-value">{value}</span>
      {delta && (
        <span className={`stat-card-delta ${deltaDirection}`}>
          {deltaDirection === "up" ? "▲" : "▼"} {delta}
        </span>
      )}
    </div>
  );
}
