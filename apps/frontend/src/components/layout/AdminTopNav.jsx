import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  FileText,
  RefreshCcw,
  AlertCircle,
  LogOut,
  ChevronDown,
  ExternalLink,
  Settings,
} from 'lucide-react';
import './AdminTopNav.css';

/* Admin Navigation Links: Overview, Customers, Policies, Renewals, Claims */
const NAV_LINKS = [
  { label: 'Overview',  to: '/admin',              icon: LayoutDashboard, end: true },
  { label: 'Customers', to: '/admin/users',         icon: Users                      },
  { label: 'Policies',  to: '/admin/applications',  icon: FileText                   },
  { label: 'Renewals',  to: '/admin/renewals',      icon: RefreshCcw                 },
  { label: 'Claims',    to: '/admin/claims',        icon: AlertCircle                },
];

export default function AdminTopNav() {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  /* Close dropdown on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="atnav-header" role="banner">
      <div className="atnav-inner">

        {/* ── Left: Brand ──────────────────────────────────── */}
        <div className="atnav-brand-wrap">
          <Link to="/admin" className="atnav-brand">
            <div className="atnav-logo-mark">S</div>
            <div className="atnav-brand-text">
              <span className="atnav-brand-name">SYNOVA</span>
              <span className="atnav-brand-badge">Admin</span>
            </div>
          </Link>
        </div>

        {/* ── Center: Quick Links Pill Group (Overview, Customers, Policies, Renewals, Claims) */}
        <nav className="atnav-links" aria-label="Admin Navigation">
          {NAV_LINKS.map(({ label, to, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `atnav-item ${isActive ? 'atnav-item--active' : ''}`
              }
            >
              <Icon size={15} className="atnav-item-icon" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* ── Right Controls ─────────────────────────────── */}
        <div className="atnav-right">
          {/* Switch to user portal */}
          <Link to="/dashboard" className="atnav-portal-btn">
            <span>User Portal</span>
            <ExternalLink size={12} />
          </Link>

          {/* Profile dropdown */}
          <div className="atnav-profile-wrap" ref={profileRef}>
            <button
              className="atnav-profile-btn"
              onClick={() => setProfileOpen(!profileOpen)}
              aria-label="Admin profile menu"
            >
              <div className="atnav-avatar">SA</div>
              <span className="atnav-uname">Operations</span>
              <ChevronDown size={13} className={`atnav-chevron ${profileOpen ? 'atnav-chevron--open' : ''}`} />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="atnav-dropdown"
                >
                  <div className="atnav-dropdown-header">
                    <div className="atnav-dd-name">Synova Admin</div>
                    <div className="atnav-dd-email">admin@synova.ai</div>
                  </div>
                  <div className="atnav-dd-divider" />
                  <Link
                    to="/admin/settings"
                    className="atnav-dd-link"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Settings size={13} /> Admin Settings
                  </Link>
                  <div className="atnav-dd-divider" />
                  <button
                    className="atnav-dd-link atnav-dd-link--danger"
                    onClick={() => navigate('/')}
                  >
                    <LogOut size={13} /> Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
