import { useLocation, useNavigate } from "react-router-dom";
import {
  ClipboardList,
  GraduationCap,
  LogOut,
  ShieldCheck,
  UserCog,
  Users,
  Home,
} from "lucide-react";
import { clearSession, getSession } from "../lib/session.js";

function fullName(user) {
  return (
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    "Người dùng"
  );
}

function initials(user) {
  return (
    [user?.firstName?.[0], user?.lastName?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "A"
  );
}

export default function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const session = getSession();
  const currentUser = session?.user;

  function handleLogout() {
    clearSession();
    navigate("/login", { replace: true });
  }

  const navItems = [
    { path: "/admin", icon: Home, label: "Tổng quan" },
    { path: "/admin/users", icon: UserCog, label: "Quản lý tài khoản" },
    { path: "/admin/students", icon: Users, label: "Quản lý sinh viên" },
    { path: "/admin/teachers", icon: ShieldCheck, label: "Quản lý giảng viên" },
    { path: "/admin/topics", icon: ClipboardList, label: "Quản lý đề tài" },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <div className="admin-brand-mark">
          <GraduationCap size={24} strokeWidth={2.4} />
        </div>
        <div>
          <p className="admin-brand-name">FBU</p>
          <p className="admin-brand-sub">Project System</p>
        </div>
      </div>

      <nav className="admin-nav">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              className={`admin-nav-item ${isActive ? "active" : ""}`}
              type="button"
              onClick={() => navigate(item.path)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="admin-userbox">
        <div className="admin-avatar">{initials(currentUser)}</div>
        <div>
          <strong>{fullName(currentUser)}</strong>
          <span>Quản trị viên</span>
        </div>
        <button
          className="action-btn"
          type="button"
          onClick={handleLogout}
          aria-label="Đăng xuất"
          title="Đăng xuất"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
