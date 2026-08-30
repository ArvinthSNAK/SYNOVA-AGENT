import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Wallet,
  Shield,
  FileText,
  PlusCircle,
  RefreshCw,
  Bell,
  HelpCircle,
  ChevronDown,
  User,
  Settings,
  LogOut,
  CheckCircle,
  AlertCircle,
  Info,
} from 'lucide-react';
import { dashboardData } from '../../features/dashboard/data/dashboardData.js';
import './UserNavbar.css';

const { user, notifications } = dashboardData;

const notifIconMap = {
  warning: AlertCircle,
  info: Info,
  success: CheckCircle,
};

const notifColorMap = {
  warning: 'var(--color-warning)',
  info: 'var(--color-primary)',
  success: 'var(--color-success)',
};

// The 4 requested essential quick links
const USER_NAV_LINKS = [
  { label: 'Overview', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Wallet', to: '/wallet', icon: Wallet },
  { label: 'Policies', to: '/policies', icon: Shield },
  { label: 'Applications', to: '/applications', icon: FileText },
];

export default function UserNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifList, setNotifList] = useState(notifications);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const unreadCount = notifList.filter((n) => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Escape key closes dropdowns
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setProfileOpen(false);
        setNotifOpen(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const markAllRead = () => {
    setNotifList(notifList.map((n) => ({ ...n, read: true })));
  };

  return (
    <header className="user-navbar" role="banner">
      <div className="user-navbar-inner">
        {/* Brand / Logo */}
        <div className="user-navbar-brand">
          <Link to="/dashboard" className="user-navbar-logo-link">
            <div className="user-navbar-logo-badge">
              <span className="user-navbar-logo-mark">S</span>
            </div>
            <div className="user-navbar-logo-text">
              <span className="user-navbar-brand-title">SYNOVA</span>
            </div>
          </Link>
        </div>

        {/* Center: Exact 4 Quick Links (Overview, Wallet, Policies, Applications) */}
        <nav className="user-navbar-links" aria-label="Main User Navigation">
          {USER_NAV_LINKS.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `user-nav-item ${isActive ? 'user-nav-item--active' : ''}`
              }
            >
              <Icon size={16} className="user-nav-item-icon" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Right Section: Action Buttons & Menus */}
        <div className="user-navbar-actions">
          {/* Direct CTA: + New Insurance */}
          <Link
            to="/new-insurance"
            className={`user-nav-cta-btn ${location.pathname.startsWith('/new-insurance') ? 'user-nav-cta-btn--active' : ''}`}
          >
            <PlusCircle size={15} />
            <span>New Insurance</span>
          </Link>

          {/* Quick Renewal Link */}
          <Link
            to="/renewal"
            className={`user-nav-renew-btn ${location.pathname.startsWith('/renewal') ? 'user-nav-renew-btn--active' : ''}`}
          >
            <RefreshCw size={14} />
            <span>Renewal</span>
          </Link>

          {/* Notifications */}
          <div className="user-nav-dropdown-wrap" ref={notifRef}>
            <button
              className="user-nav-icon-btn"
              onClick={() => {
                setNotifOpen(!notifOpen);
                setProfileOpen(false);
              }}
              aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
              aria-expanded={notifOpen}
            >
              <Bell size={17} />
              {unreadCount > 0 && <span className="user-nav-badge-dot" />}
            </button>

            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="user-nav-dropdown user-notif-dropdown"
                >
                  <div className="user-notif-head">
                    <span className="user-notif-title">Notifications</span>
                    {unreadCount > 0 && (
                      <button className="user-notif-mark-read" onClick={markAllRead}>
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="user-notif-list">
                    {notifList.map((notif) => {
                      const Icon = notifIconMap[notif.type] || Info;
                      const color = notifColorMap[notif.type] || 'var(--color-primary)';
                      return (
                        <div
                          key={notif.id}
                          className={`user-notif-item ${notif.read ? '' : 'user-notif-item--unread'}`}
                        >
                          <div className="user-notif-item-icon" style={{ color }}>
                            <Icon size={15} />
                          </div>
                          <div className="user-notif-item-body">
                            <div className="user-notif-item-title">{notif.title}</div>
                            <div className="user-notif-item-desc">{notif.message}</div>
                            <div className="user-notif-item-time">{notif.time}</div>
                          </div>
                          {!notif.read && <div className="user-notif-unread-dot" />}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Profile Menu */}
          <div className="user-nav-dropdown-wrap" ref={profileRef}>
            <button
              className="user-nav-profile-btn"
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotifOpen(false);
              }}
              aria-label={`Profile menu for ${user.name}`}
              aria-expanded={profileOpen}
            >
              <div className="user-nav-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="user-nav-user-name">{user.name}</span>
              <ChevronDown
                size={13}
                className={`user-nav-chevron ${profileOpen ? 'user-nav-chevron--open' : ''}`}
              />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="user-nav-dropdown user-profile-dropdown"
                >
                  <div className="user-profile-head">
                    <div className="user-profile-avatar-lg">{user.name.charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="user-profile-fullname">{user.fullName}</div>
                      <div className="user-profile-email">{user.email || 'naresh.kumar@synova.ai'}</div>
                    </div>
                  </div>
                  <div className="user-nav-divider" />
                  <Link
                    to="/wallet"
                    className="user-profile-link"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Wallet size={14} /> My Insurance Wallet
                  </Link>
                  <Link
                    to="/policies"
                    className="user-profile-link"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Shield size={14} /> Policy Certificates
                  </Link>
                  <Link
                    to="/settings"
                    className="user-profile-link"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Settings size={14} /> Account Settings
                  </Link>
                  <Link
                    to="/help"
                    className="user-profile-link"
                    onClick={() => setProfileOpen(false)}
                  >
                    <HelpCircle size={14} /> Help & 24/7 Support
                  </Link>
                  <div className="user-nav-divider" />
                  <button
                    className="user-profile-link user-profile-link--logout"
                    onClick={() => navigate('/')}
                  >
                    <LogOut size={14} /> Sign Out
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
