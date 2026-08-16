import { SearchIcon, BellIcon } from "../common/icons";
import "./Topbar.css";

export default function Topbar({ title, subtitle }) {
  return (
    <div className="topbar">
      <div className="topbar-title">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="topbar-actions">
        <div className="topbar-search">
          <SearchIcon width={16} height={16} />
          <input type="text" placeholder="Search applications, agents..." />
        </div>
        <button className="topbar-icon-btn" type="button" aria-label="Notifications">
          <BellIcon width={18} height={18} />
        </button>
        <span className="sidebar-avatar">AK</span>
      </div>
    </div>
  );
}
