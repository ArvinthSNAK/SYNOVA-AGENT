import { Link, useLocation } from "react-router-dom";
import Logo from "../common/Logo";
import { GridIcon, UsersIcon, BuildingIcon, FileTextIcon, ShieldIcon, SettingsIcon, LogOutIcon } from "../common/icons";
import "./Sidebar.css";

const NAV = [
  { label: "Dashboard", to: "/admin", icon: <GridIcon width={18} height={18} /> },
  { label: "Users", to: "/admin/users", icon: <UsersIcon width={18} height={18} /> },
  { label: "Companies", to: "/admin/companies", icon: <BuildingIcon width={18} height={18} /> },
  { label: "Applications", to: "/admin/applications", icon: <FileTextIcon width={18} height={18} /> },
  { label: "Insurers", to: "/admin/insurers", icon: <ShieldIcon width={18} height={18} /> },
  { label: "Settings", to: "/admin/settings", icon: <SettingsIcon width={18} height={18} /> },
];

export default function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-logo">
          <Logo size={24} />
        </div>
        <nav className="sidebar-nav" aria-label="Admin">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`sidebar-link ${pathname === item.to ? "active" : ""}`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-profile">
          <span className="sidebar-avatar">AK</span>
          <div>
            <div className="sidebar-profile-name">Admin User</div>
            <div className="sidebar-profile-role">Platform admin</div>
          </div>
        </div>
        <button type="button" className="sidebar-logout">
          <LogOutIcon width={18} height={18} />
          Log out
        </button>
      </div>
    </aside>
  );
}
