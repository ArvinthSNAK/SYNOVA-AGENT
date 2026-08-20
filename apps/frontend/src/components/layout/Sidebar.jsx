import { Link, useLocation } from "react-router-dom";
import Logo from "../common/Logo";
import {
  GridIcon,
  UsersIcon,
  BuildingIcon,
  FileTextIcon,
  ShieldIcon,
  SettingsIcon,
  LogOutIcon,
  LayersIcon,
} from "../common/icons";
import { RefreshCcw, TrendingUp, AlertCircle } from "lucide-react";
import "./Sidebar.css";

const NAV = [
  { label: "Overview", to: "/admin", icon: <GridIcon width={18} height={18} /> },
  { label: "Customers", to: "/admin/users", icon: <UsersIcon width={18} height={18} /> },
  { label: "Policies", to: "/admin/applications", icon: <FileTextIcon width={18} height={18} /> },
  { label: "Quotes", to: "/admin/companies", icon: <LayersIcon width={18} height={18} /> },
  { label: "Renewals", to: "/admin/applications", icon: <RefreshCcw size={18} /> },
  { label: "Claims", to: "/admin/applications", icon: <AlertCircle size={18} /> },
  { label: "Providers", to: "/admin/insurers", icon: <ShieldIcon width={18} height={18} /> },
  { label: "Analytics", to: "/admin", icon: <TrendingUp size={18} /> },
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
          {NAV.map((item, idx) => (
            <Link
              key={`${item.label}-${idx}`}
              to={item.to}
              className={`sidebar-link ${pathname === item.to && (item.label === "Overview" || item.label === "Analytics" ? pathname === "/admin" : false) ? "active" : ""}`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-profile">
          <span className="sidebar-avatar">SA</span>
          <div>
            <div className="sidebar-profile-name">Synova Admin</div>
            <div className="sidebar-profile-role">Operations & Carrier Ops</div>
          </div>
        </div>
        <button type="button" className="sidebar-logout" onClick={() => window.location.href = '/'}>
          <LogOutIcon width={18} height={18} />
          Log out
        </button>
      </div>
    </aside>
  );
}
