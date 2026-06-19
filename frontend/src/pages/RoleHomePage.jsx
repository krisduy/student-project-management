import { useNavigate } from "react-router-dom";
import { BookOpen, GraduationCap, LogOut, Shield, TrendingUp } from "lucide-react";
import { clearSession, getSession } from "../lib/session.js";

const roleLabels = {
  admin: "Quản trị viên",
  teacher: "Giảng viên",
  student: "Sinh viên",
};

const roleDescriptions = {
  admin: "Quản lý toàn bộ hệ thống, người dùng và đề tài",
  teacher: "Hướng dẫn sinh viên và theo dõi tiến độ đồ án",
  student: "Đăng ký đề tài và thực hiện đồ án tốt nghiệp",
};

const roleIcons = {
  admin: Shield,
  teacher: GraduationCap,
  student: BookOpen,
};

function fullName(user) {
  return [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "Người dùng";
}

export default function RoleHomePage({ role }) {
  const navigate = useNavigate();
  const session = getSession();
  const user = session?.user;
  const RoleIcon = roleIcons[role] || BookOpen;

  function handleLogout() {
    clearSession();
    navigate("/login", { replace: true });
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="mx-auto max-w-5xl p-6 lg:p-12">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
              <GraduationCap size={24} strokeWidth={2.5} />
            </div>
            <div>
              <p className="m-0 text-sm font-bold text-slate-500">Hệ thống FBU</p>
              <h2 className="m-0 text-lg font-black text-slate-900">Quản lý đồ án</h2>
            </div>
          </div>
          <button
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 font-bold text-slate-700 shadow-sm hover:border-slate-300 hover:shadow-md transition-all"
            type="button"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>
        </div>

        <section className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-12 text-white">
            <div className="mb-6 flex items-center gap-3">
              <div className="grid size-16 place-items-center rounded-xl bg-white/20 backdrop-blur-sm">
                <RoleIcon size={32} strokeWidth={2} />
              </div>
              <div>
                <p className="m-0 text-sm font-bold opacity-90">{roleLabels[role] || role}</p>
                <h1 className="m-0 mt-1 text-4xl font-black">{fullName(user)}</h1>
              </div>
            </div>
            <p className="m-0 max-w-2xl text-lg leading-relaxed opacity-95">
              {roleDescriptions[role] || "Trang làm việc đã sẵn sàng"}
            </p>
          </div>

          <div className="grid gap-6 p-8 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
              <div className="mb-3 grid size-12 place-items-center rounded-lg bg-blue-600 text-white">
                <TrendingUp size={20} />
              </div>
              <h3 className="m-0 text-lg font-black text-slate-900">Hoạt động</h3>
              <p className="m-0 mt-2 text-sm leading-6 text-slate-600">
                Theo dõi hoạt động và tiến độ công việc
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-6">
              <div className="mb-3 grid size-12 place-items-center rounded-lg bg-emerald-600 text-white">
                <BookOpen size={20} />
              </div>
              <h3 className="m-0 text-lg font-black text-slate-900">Đề tài</h3>
              <p className="m-0 mt-2 text-sm leading-6 text-slate-600">
                Quản lý và theo dõi các đề tài đồ án
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-violet-50 to-purple-50 p-6">
              <div className="mb-3 grid size-12 place-items-center rounded-lg bg-violet-600 text-white">
                <RoleIcon size={20} />
              </div>
              <h3 className="m-0 text-lg font-black text-slate-900">Vai trò</h3>
              <p className="m-0 mt-2 text-sm leading-6 text-slate-600">
                {roleLabels[role]} - Quyền truy cập đầy đủ
              </p>
            </div>
          </div>
        </section>

        <div className="rounded-xl border border-blue-100 bg-blue-50 px-6 py-4">
          <p className="m-0 text-center text-sm font-bold text-blue-900">
            Sử dụng menu điều hướng để truy cập các chức năng của hệ thống
          </p>
        </div>
      </div>
    </main>
  );
}
