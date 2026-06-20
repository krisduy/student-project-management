import { useLocation, useNavigate } from "react-router-dom";
import { BookOpenCheck, GraduationCap, LogOut, Home, UserRound, TrendingUp } from "lucide-react";
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
      .toUpperCase() || "S"
  );
}

export default function StudentSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const session = getSession();
  const currentUser = session?.user;

  function handleLogout() {
    clearSession();
    navigate("/login", { replace: true });
  }

  const navItems = [
    { path: "/student", icon: Home, label: "Tổng quan" },
    { path: "/student/topics", icon: BookOpenCheck, label: "Đăng ký đề tài" },
    { path: "/student/progress", icon: TrendingUp, label: "Theo dõi tiến độ" },
    { path: "/student/profile", icon: UserRound, label: "Hồ sơ cá nhân" },
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
          <span>Sinh viên</span>
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
