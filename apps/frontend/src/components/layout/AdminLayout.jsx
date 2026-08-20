import React from "react";
import AdminTopNav from "./AdminTopNav";
import "./AdminLayout.css";

export default function AdminLayout({ title, subtitle, children }) {
  return (
    <div className="admin-shell">
      <AdminTopNav />
      <main className="admin-main">
        {title && (
          <div className="admin-page-hero">
            <h1 className="admin-page-title">{title}</h1>
            {subtitle && <p className="admin-page-subtitle">{subtitle}</p>}
          </div>
        )}
        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
}
