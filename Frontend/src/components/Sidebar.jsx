import { NavLink } from "react-router-dom";
import "./sidebar.css";

function Sidebar() {
  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: "⌂" },
    { path: "/users", label: "Users", icon: "◉" },
    { path: "/mentors", label: "Mentors", icon: "◎" },
    { path: "/career-paths", label: "Career Paths", icon: "◇" },
    { path: "/chat-feedback", label: "Chat & Feedback", icon: "✉" },
    { path: "/payments", label: "Payments", icon: "◌" },
    { path: "/analytics", label: "Analytics", icon: "△" },
    { path: "/event-requests", label: "Event Requests", icon: "□" },
    { path: "/events-management", label: "Events", icon: "▣" },
    { path: "/settings", label: "Settings", icon: "⚙" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img src="/logo.png" alt="SkillSync Logo" />
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-title">SkillSync</span>
          <span className="sidebar-brand-subtitle">Admin Panel</span>
        </div>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              isActive ? "sidebar-link active" : "sidebar-link"
            }
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;