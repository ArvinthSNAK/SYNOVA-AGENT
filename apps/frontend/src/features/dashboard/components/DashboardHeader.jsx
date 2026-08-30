import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  HelpCircle,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Menu,
  Check,
  AlertCircle,
  Info,
  CheckCircle,
} from 'lucide-react';
import { dashboardData } from '../data/dashboardData.js';
import './DashboardHeader.css';

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

export default function DashboardHeader({ onMenuToggle }) {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
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
    <header className="dashboard-header" role="banner">
      {/* Left: Menu + Title */}
      <div className="header-left">
        <button
          className="header-menu-btn"
          onClick={onMenuToggle}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="header-title">Dashboard</h1>
      </div>

      {/* Center: Search */}
      <div className={`header-search${searchFocused ? ' header-search--focused' : ''}`}>
        <Search size={15} className="header-search-icon" aria-hidden="true" />
        <input
          type="search"
          className="header-search-input"
          placeholder="Search policies, applications, documents..."
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          aria-label="Search policies, applications, and documents"
        />
        <span className="header-search-shortcut" aria-hidden="true">
          <kbd>Ctrl</kbd><kbd>K</kbd>
        </span>
      </div>

      {/* Right: Actions */}
      <div className="header-actions">
        {/* Notifications */}
        <div className="header-action-group" ref={notifRef}>
          <button
            className="header-icon-btn"
            onClick={() => {
              setNotifOpen(!notifOpen);
              setProfileOpen(false);
            }}
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
            aria-expanded={notifOpen}
            aria-haspopup="true"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="header-badge" aria-hidden="true">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="header-dropdown notif-dropdown" role="dialog" aria-label="Notifications">
              <div className="notif-dropdown-header">
                <span className="notif-dropdown-title">Notifications</span>
                {unreadCount > 0 && (
                  <button className="notif-mark-read" onClick={markAllRead}>
                    Mark all read
                  </button>
                )}
              </div>
              <div className="notif-list">
                {notifList.map((notif) => {
                  const Icon = notifIconMap[notif.type] || Info;
                  const color = notifColorMap[notif.type] || 'var(--color-primary)';
                  return (
                    <div
                      key={notif.id}
                      className={`notif-item${notif.read ? '' : ' notif-item--unread'}`}
                    >
                      <div className="notif-icon" style={{ color }}>
                        <Icon size={16} />
                      </div>
                      <div className="notif-content">
                        <div className="notif-item-title">{notif.title}</div>
                        <div className="notif-item-message">{notif.message}</div>
                        <div className="notif-item-time">{notif.time}</div>
                      </div>
                      {!notif.read && <div className="notif-dot" aria-hidden="true" />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Help */}
        <button
          className="header-icon-btn header-icon-btn--desktop"
          onClick={() => navigate('/help')}
          aria-label="Help and support"
        >
          <HelpCircle size={18} />
        </button>

        {/* Profile */}
        <div className="header-action-group" ref={profileRef}>
          <button
            className="header-profile-btn"
            onClick={() => {
              setProfileOpen(!profileOpen);
              setNotifOpen(false);
            }}
            aria-expanded={profileOpen}
            aria-haspopup="true"
            aria-label={`Profile menu for ${user.name}`}
          >
            <div className="header-avatar" aria-hidden="true">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="header-profile-name">{user.name}</span>
            <ChevronDown
              size={14}
              className={`header-chevron${profileOpen ? ' header-chevron--open' : ''}`}
              aria-hidden="true"
            />
          </button>

          {profileOpen && (
            <div className="header-dropdown profile-dropdown" role="menu" aria-label="Profile menu">
              <div className="profile-dropdown-user">
                <div className="profile-dropdown-avatar">{user.name.charAt(0).toUpperCase()}</div>
                <div>
                  <div className="profile-dropdown-name">{user.fullName}</div>
                  <div className="profile-dropdown-role">{user.role}</div>
                </div>
              </div>
              <div className="profile-dropdown-divider" />
              <button
                className="profile-dropdown-item"
                onClick={() => { navigate('/settings'); setProfileOpen(false); }}
                role="menuitem"
              >
                <User size={15} aria-hidden="true" />
                View Profile
              </button>
              <button
                className="profile-dropdown-item"
                onClick={() => { navigate('/settings'); setProfileOpen(false); }}
                role="menuitem"
              >
                <Settings size={15} aria-hidden="true" />
                Account Settings
              </button>
              <button
                className="profile-dropdown-item"
                onClick={() => { navigate('/help'); setProfileOpen(false); }}
                role="menuitem"
              >
                <HelpCircle size={15} aria-hidden="true" />
                Help & Support
              </button>
              <div className="profile-dropdown-divider" />
              <button
                className="profile-dropdown-item profile-dropdown-item--danger"
                onClick={() => navigate('/')}
                role="menuitem"
              >
                <LogOut size={15} aria-hidden="true" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
