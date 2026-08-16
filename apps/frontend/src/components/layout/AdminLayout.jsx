import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./AdminLayout.css";

export default function AdminLayout({ title, subtitle, children }) {
  return (
    <div className="admin-shell">
      <Sidebar />
      <div className="admin-main">
        <Topbar title={title} subtitle={subtitle} />
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
