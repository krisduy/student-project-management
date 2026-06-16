import { useLocation, useNavigate } from "react-router-dom";
import { BookCheck, GraduationCap, LogOut, Telescope } from "lucide-react";
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
      .toUpperCase() || "G"
  );
}

function SidebarAvatar({ user }) {
  return (
    <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-blue-600 to-emerald-600 text-xs font-black text-white">
      {initials(user)}
    </div>
  );
}

function navClass(isActive) {
  if (isActive) {
    return "flex min-h-11 items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-3 text-left font-black text-blue-700";
  }

  return "flex min-h-11 items-center gap-3 rounded-lg border border-transparent px-3 text-left font-black text-slate-600 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-950";
}

export default function TeacherSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const session = getSession();
  const currentUser = session?.user;

  function handleLogout() {
    clearSession();
    navigate("/login", { replace: true });
  }

  return (
    <aside className="flex min-h-full flex-col gap-6 border-b border-slate-200 bg-white p-5 lg:min-h-screen lg:border-b-0 lg:border-r lg:p-6">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-5">
        <div className="grid size-12 place-items-center rounded-lg bg-gradient-to-br from-blue-600 to-emerald-600 text-white shadow-lg shadow-blue-200">
          <GraduationCap size={24} strokeWidth={2.4} />
        </div>
        <div>
          <p className="m-0 text-2xl font-black">FBU</p>
          <p className="m-0 text-xs text-slate-500">Project System</p>
        </div>
      </div>

      <nav className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        <button
          className={navClass(location.pathname === "/teacher")}
          type="button"
          onClick={() => navigate("/teacher")}
        >
          <BookCheck size={18} />
          <span>Đề tài đang hướng dẫn</span>
        </button>
        <button
          className={navClass(location.pathname === "/teacher/progress")}
          type="button"
          onClick={() => navigate("/teacher/progress")}
        >
          <Telescope size={18} />
          <span>Theo dõi tiến độ</span>
        </button>
      </nav>

      <div className="mt-auto grid grid-cols-[40px_minmax(0,1fr)_34px] items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <SidebarAvatar user={currentUser} />
        <div className="min-w-0">
          <strong className="block truncate text-sm">
            {fullName(currentUser)}
          </strong>
          <span className="block truncate text-xs text-slate-500">
            Giảng viên
          </span>
        </div>
        <button
          className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-950"
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
