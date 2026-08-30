import React from 'react';
import UserNavbar from './UserNavbar';
import './UserLayout.css';

export default function UserLayout({ children, noPadding = false }) {
  return (
    <div className="user-shell mesh-ambient-bg">
      <UserNavbar />
      <main className={`user-main ${noPadding ? 'user-main--no-padding' : ''}`}>
        {children}
      </main>
    </div>
  );
}
