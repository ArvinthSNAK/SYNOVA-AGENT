import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  ShieldCheck,
  ClipboardList,
  FolderOpen,
  Settings,
  HelpCircle,
  LogOut,
  X,
} from 'lucide-react';
import './DashboardSidebar.css';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Overview', end: true },
  { to: '/policies', icon: ShieldCheck, label: 'Policies' },
  { to: '/applications', icon: ClipboardList, label: 'Applications' },
  { to: '/documents', icon: FolderOpen, label: 'Documents' },
];

const bottomNavItems = [
  { to: '/settings', icon: Settings, label: 'Settings' },
  { to: '/help', icon: HelpCircle, label: 'Help & Support' },
];

export default function DashboardSidebar({ open, onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`dashboard-sidebar${open ? ' sidebar-open' : ''}`}
        aria-label="Main navigation"
      >
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <span className="sidebar-logo-mark">S</span>
          </div>
          <span className="sidebar-brand-name">SYNOVA</span>
          <button
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="sidebar-nav" aria-label="Primary navigation">
          <ul className="sidebar-nav-list" role="list">
            {navItems.map(({ to, icon: Icon, label, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `sidebar-nav-item${isActive ? ' sidebar-nav-item--active' : ''}`
                  }
                  onClick={onClose}
                >
                  <Icon size={18} aria-hidden="true" />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-divider" />

        {/* Bottom Navigation */}
        <nav className="sidebar-nav sidebar-nav--bottom" aria-label="Secondary navigation">
          <ul className="sidebar-nav-list" role="list">
            {bottomNavItems.map(({ to, icon: Icon, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `sidebar-nav-item${isActive ? ' sidebar-nav-item--active' : ''}`
                  }
                  onClick={onClose}
                >
                  <Icon size={18} aria-hidden="true" />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}

            <li>
              <button
                className="sidebar-nav-item sidebar-nav-item--logout"
                onClick={handleLogout}
                aria-label="Log out"
              >
                <LogOut size={18} aria-hidden="true" />
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
}
