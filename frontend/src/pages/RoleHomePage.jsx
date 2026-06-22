import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  BookOpen,
  BookOpenCheck,
  GraduationCap,
  LogOut,
  Shield,
  TrendingUp,
  Users,
  ClipboardList,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Zap,
  Target,
  Award,  FileText,
  UserPlus,
  BookMarked,
  Telescope,
  Home,
  Loader2,
  UserRound,
} from "lucide-react";
import { clearSession, getSession } from "../lib/session.js";
import { getDashboardStats, getMyTopicRegistration } from "../lib/api.js";

const roleLabels = {
  admin: "Quản trị viên",
  teacher: "Giảng viên",
  student: "Sinh viên",
};

const roleGradients = {
  admin: "from-violet-600 to-purple-600",
  teacher: "from-emerald-600 to-teal-600",
  student: "from-blue-600 to-indigo-600",
};

const roleBgGradients = {
  admin: "bg-gradient-to-br from-violet-500 to-purple-600",
  teacher: "bg-gradient-to-br from-emerald-500 to-teal-600",
  student: "bg-gradient-to-br from-blue-500 to-indigo-600",
};

const roleIcons = {
  admin: Shield,
  teacher: GraduationCap,
  student: BookOpen,
};

function fullName(user) {
  return [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "Người dùng";
}

function initials(user) {
  return (
    [user?.firstName?.[0], user?.lastName?.[0]]
      .filter(Boolean)
      .join("")
      .toUpperCase() || "U"
  );
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, color, gradient }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/50 border border-slate-100/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <div className={`absolute inset-0 ${gradient} rounded-full -translate-y-1/2 translate-x-1/3`}></div>
      </div>
      <div className="relative">
        <div className={`inline-flex items-center justify-center rounded-xl ${color} p-3 mb-4`}>
          <Icon size={24} className="text-white" />
        </div>
        <p className="text-4xl font-black text-slate-900 mb-1">{value ?? "—"}</p>
        <p className="text-sm font-medium text-slate-500">{label}</p>
      </div>
    </div>
  );
}

// Quick Action Button
function QuickAction({ icon: Icon, label, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`group flex flex-col items-center gap-3 p-6 rounded-2xl bg-gradient-to-br ${color} text-white transition-all duration-300 hover:scale-105 hover:shadow-xl`}
    >
      <div className="p-4 rounded-xl bg-white/20 backdrop-blur-sm group-hover:bg-white/30 transition-all">
        <Icon size={28} />
      </div>
      <span className="font-bold text-sm">{label}</span>
      <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0" />
    </button>
  );
}

// Navigation Items
const navItems = {
  admin: [
    { path: "/admin", icon: Home, label: "Tổng quan" },
    { path: "/admin/users", icon: UserPlus, label: "Quản lý tài khoản" },
    { path: "/admin/students", icon: Users, label: "Quản lý sinh viên" },
    { path: "/admin/teachers", icon: Shield, label: "Quản lý giảng viên" },
    { path: "/admin/topics", icon: ClipboardList, label: "Quản lý đề tài" },
    { path: "/admin/defense-scores", icon: Award, label: "Điểm bảo vệ" },
  ],
  teacher: [
    { path: "/teacher", icon: Home, label: "Tổng quan" },
    { path: "/teacher/topics", icon: BookMarked, label: "Đề tài đang hướng dẫn" },
    { path: "/teacher/progress", icon: TrendingUp, label: "Theo dõi tiến độ" },
    { path: "/teacher/notifications", icon: Bell, label: "Thông báo" },
    { path: "/teacher/profile", icon: UserRound, label: "Hồ sơ cá nhân" },
  ],
  student: [
    { path: "/student", icon: Home, label: "Tổng quan" },
    { path: "/student/topics", icon: BookOpenCheck, label: "Đăng ký đề tài" },
    { path: "/student/progress", icon: TrendingUp, label: "Theo dõi tiến độ" },
    { path: "/student/notifications", icon: Bell, label: "Thông báo" },
    { path: "/student/defense-scores", icon: Award, label: "Điểm bảo vệ" },
    { path: "/student/profile", icon: UserRound, label: "Hồ sơ cá nhân" },
  ],
};

// Quick Actions per role
const quickActions = {
  admin: [
    { icon: UserPlus, label: "Thêm tài khoản", color: "from-violet-500 to-purple-600", path: "/admin/users" },
    { icon: BookMarked, label: "Tạo đề tài", color: "from-blue-500 to-indigo-600", path: "/admin/topics" },
    { icon: Award, label: "Điểm bảo vệ", color: "from-emerald-500 to-teal-600", path: "/admin/defense-scores" },
    { icon: Shield, label: "Quản lý GV", color: "from-amber-500 to-orange-600", path: "/admin/teachers" },
  ],
  teacher: [
    { icon: BookMarked, label: "Xem đề tài", color: "from-emerald-500 to-teal-600", path: "/teacher/topics" },
    { icon: Bell, label: "Thông báo", color: "from-amber-500 to-orange-600", path: "/teacher/notifications" },
    { icon: TrendingUp, label: "Duyệt tiến độ", color: "from-blue-500 to-indigo-600", path: "/teacher/progress" },
    { icon: UserRound, label: "Hồ sơ cá nhân", color: "from-violet-500 to-purple-600", path: "/teacher/profile" },
  ],
  student: [
    { icon: BookOpenCheck, label: "Đăng ký đề tài", color: "from-blue-500 to-indigo-600", path: "/student/topics" },
    { icon: Bell, label: "Thông báo", color: "from-amber-500 to-orange-600", path: "/student/notifications" },
    { icon: TrendingUp, label: "Theo dõi tiến độ", color: "from-emerald-500 to-teal-600", path: "/student/progress" },
    { icon: UserRound, label: "Hồ sơ cá nhân", color: "from-violet-500 to-purple-600", path: "/student/profile" },
  ],
};

export default function RoleHomePage({ role }) {
  const navigate = useNavigate();
  const location = useLocation();
  const session = getSession();
  const user = session?.user;
  const RoleIcon = roleIcons[role] || BookOpen;
  const bgGradient = roleBgGradients[role] || roleBgGradients.student;
  const nav = navItems[role] || [];
  const actions = quickActions[role] || [];

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);
        const data = await getDashboardStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
        setError(err.message);
        setStats({});
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  function handleLogout() {
    clearSession();
    navigate("/login", { replace: true });
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Chào buổi sáng" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";

  return (
    <main className="admin-shell">
      {/* Sidebar */}
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
          {nav.map((item) => {
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

        <div className="flex-1"></div>

        <button
          className="w-full flex items-center justify-center gap-2 min-h-12 rounded-xl border-2 border-slate-200 bg-white font-bold text-slate-600 transition-all hover:border-red-300 hover:text-red-600 hover:shadow-md"
          type="button"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span>Đăng xuất</span>
        </button>
      </aside>

      {/* Main Content */}
      <section className="admin-content">
        {/* Hero Section */}
        <div className={`rounded-3xl ${bgGradient} p-8 mb-8 text-white relative overflow-hidden`}>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full"></div>
          <div className="absolute top-4 right-4 w-32 h-32 border border-white/10 rounded-full"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Zap size={20} className="text-yellow-300" />
              <span className="text-sm font-medium text-white/80">{greeting}</span>
            </div>
            <h1 className="text-4xl font-black mb-3">
              {fullName(user)}
            </h1>
            <p className="text-lg text-white/90 max-w-xl">
              {role === "admin" && "Quản lý toàn bộ hệ thống, người dùng và đề tài đồ án"}
              {role === "teacher" && "Hướng dẫn sinh viên và theo dõi tiến độ đồ án tốt nghiệp"}
              {role === "student" && "Đăng ký đề tài và thực hiện đồ án tốt nghiệp"}
            </p>
            <div className="flex items-center gap-4 mt-6">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm">
                <Calendar size={18} />
                <span className="text-sm font-medium">{new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long" })}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm">
                <Clock size={18} />
                <span className="text-sm font-medium">{new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={40} className="animate-spin text-indigo-600" />
            <span className="ml-3 text-slate-600 font-medium">Đang tải dữ liệu...</span>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <p className="font-medium">Không thể tải dữ liệu: {error}</p>
          </div>
        )}

        {/* Stats Grid */}
        {!loading && stats && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Admin Stats */}
              {role === "admin" && (
                <>
                  <StatCard icon={Users} label="Tổng sinh viên" value={stats.totalStudents} color="bg-gradient-to-br from-blue-500 to-indigo-600" gradient="from-blue-500 to-indigo-600" />
                  <StatCard icon={BookMarked} label="Tổng đề tài" value={stats.totalTopics} color="bg-gradient-to-br from-emerald-500 to-teal-600" gradient="from-emerald-500 to-teal-600" />
                  <StatCard icon={CheckCircle} label="Đề tài đã đăng ký" value={stats.registeredTopics} color="bg-gradient-to-br from-violet-500 to-purple-600" gradient="from-violet-500 to-purple-600" />
                  <StatCard icon={AlertCircle} label="Đề tài chưa đăng ký" value={stats.pendingTopics} color="bg-gradient-to-br from-amber-500 to-orange-600" gradient="from-amber-500 to-orange-600" />
                </>
              )}
              
              {/* Teacher Stats */}
              {role === "teacher" && (
                <>
                  <StatCard icon={BookMarked} label="Đề tài đang hướng dẫn" value={stats.supervisedTopics} color="bg-gradient-to-br from-emerald-500 to-teal-600" gradient="from-emerald-500 to-teal-600" />
                  <StatCard icon={Users} label="Sinh viên đang hướng dẫn" value={stats.totalStudents} color="bg-gradient-to-br from-blue-500 to-indigo-600" gradient="from-blue-500 to-indigo-600" />
                  <StatCard icon={CheckCircle} label="Đề tài có sinh viên" value={stats.commentedProgresses} color="bg-gradient-to-br from-violet-500 to-purple-600" gradient="from-violet-500 to-purple-600" />
                  <StatCard icon={Users} label="Tổng sinh viên" value={stats.totalStudents} color="bg-gradient-to-br from-amber-500 to-orange-600" gradient="from-amber-500 to-orange-600" />
                </>
              )}
              
              {/* Student Stats */}
              {role === "student" && (
                <>
                  <StatCard 
                    icon={BookMarked} 
                    label="Trạng thái đề tài" 
                    value={stats.hasTopic ? "Đã có đề tài" : "Chưa có"} 
                    color={stats.hasTopic ? "bg-gradient-to-br from-emerald-500 to-teal-600" : "bg-gradient-to-br from-amber-500 to-orange-600"} 
                    gradient={stats.hasTopic ? "from-emerald-500 to-teal-600" : "from-amber-500 to-orange-600"}
                  />
                  <StatCard icon={FileText} label="Tổng báo cáo tiến độ" value={stats.totalProgresses} color="bg-gradient-to-br from-blue-500 to-indigo-600" gradient="from-blue-500 to-indigo-600" />
                  <StatCard icon={CheckCircle} label="Đã phản hồi" value={stats.commentedProgresses} color="bg-gradient-to-br from-violet-500 to-purple-600" gradient="from-violet-500 to-purple-600" />
                  <StatCard icon={TrendingUp} label="Tiến độ" value={`${stats.progressPercentage || 0}%`} color="bg-gradient-to-br from-emerald-500 to-teal-600" gradient="from-emerald-500 to-teal-600" />
                </>
              )}
            </div>

            {/* Topic Details for Student */}
            {role === "student" && stats.hasTopic && stats.topic && (
              <div className="mb-8 bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100/50 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
                    <BookOpen size={20} className="text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Đề tài của bạn</h2>
                </div>
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
                  <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide mb-1">Mã đề tài</p>
                  <p className="text-lg font-bold text-slate-900 mb-3">{stats.topic.topicCode}</p>
                  <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide mb-1">Tên đề tài</p>
                  <p className="text-lg font-bold text-slate-900">{stats.topic.topicName}</p>
                </div>
              </div>
            )}

            {/* Topic Details for Student - No Topic */}
            {role === "student" && !stats.hasTopic && (
              <div className="mb-8 bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100/50 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
                    <AlertCircle size={20} className="text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Bạn chưa có đề tài</h2>
                </div>
                <p className="text-slate-600 mb-4">Hãy đăng ký đề tài để bắt đầu thực hiện đồ án tốt nghiệp.</p>
                <button
                  onClick={() => navigate("/student/topics")}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                >
                  <BookOpen size={18} />
                  Đăng ký đề tài
                </button>
              </div>
            )}

            {/* Supervised Topics for Teacher */}
            {role === "teacher" && stats.supervisedTopics > 0 && (
              <div className="mb-8 bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100/50 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
                    <BookMarked size={20} className="text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Danh sách đề tài đang hướng dẫn</h2>
                </div>
                <p className="text-slate-600 mb-4">Bạn đang hướng dẫn {stats.supervisedTopics} đề tài với {stats.totalStudents} sinh viên.</p>
                <button
                  onClick={() => navigate("/teacher/topics")}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-xl hover:shadow-lg transition-all"
                >
                  <BookMarked size={18} />
                  Xem chi tiết
                </button>
              </div>
            )}

            {/* Quick Actions & Recent Activity */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100/50 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                      <Zap size={20} className="text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">Thao tác nhanh</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {actions.map((action, idx) => (
                      <QuickAction
                        key={idx}
                        icon={action.icon}
                        label={action.label}
                        color={action.color}
                        onClick={() => navigate(action.path)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Summary Info */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100/50 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                      <TrendingUp size={20} className="text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900">Tổng quan hệ thống</h2>
                  </div>
                  
                  {role === "admin" && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-100">
                        <div className="flex items-center gap-3 mb-2">
                          <Users size={24} className="text-violet-600" />
                          <span className="font-semibold text-slate-900">Tài khoản hệ thống</span>
                        </div>
                        <p className="text-3xl font-black text-violet-600">{stats.totalUsers}</p>
                        <p className="text-xs text-slate-500 mt-1">Tổng số tài khoản</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                        <div className="flex items-center gap-3 mb-2">
                          <Shield size={24} className="text-emerald-600" />
                          <span className="font-semibold text-slate-900">Giảng viên</span>
                        </div>
                        <p className="text-3xl font-black text-emerald-600">{stats.totalTeachers}</p>
                        <p className="text-xs text-slate-500 mt-1">Đang hoạt động</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-3 mb-2">
                          <BookMarked size={24} className="text-blue-600" />
                          <span className="font-semibold text-slate-900">Đề tài đã đăng ký</span>
                        </div>
                        <p className="text-3xl font-black text-blue-600">{stats.registeredTopics}</p>
                        <p className="text-xs text-slate-500 mt-1">Sinh viên đã chọn đề tài</p>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                        <div className="flex items-center gap-3 mb-2">
                          <AlertCircle size={24} className="text-amber-600" />
                          <span className="font-semibold text-slate-900">Đề tài chưa đăng ký</span>
                        </div>
                        <p className="text-3xl font-black text-amber-600">{stats.pendingTopics}</p>
                        <p className="text-xs text-slate-500 mt-1">Cần được phân công</p>
                      </div>
                    </div>
                  )}

                  {role === "teacher" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                        <div className="flex items-center gap-3">
                          <BookMarked size={28} className="text-emerald-600" />
                          <div>
                            <p className="font-semibold text-slate-900">Đề tài đang hướng dẫn</p>
                            <p className="text-sm text-slate-500">Các đề tài bạn đang theo dõi</p>
                          </div>
                        </div>
                        <p className="text-4xl font-black text-emerald-600">{stats.supervisedTopics}</p>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-3">
                          <Users size={28} className="text-blue-600" />
                          <div>
                            <p className="font-semibold text-slate-900">Sinh viên đang hướng dẫn</p>
                            <p className="text-sm text-slate-500">Được phân công cho bạn</p>
                          </div>
                        </div>
                        <p className="text-4xl font-black text-blue-600">{stats.totalStudents}</p>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-100">
                        <div className="flex items-center gap-3">
                          <CheckCircle size={28} className="text-violet-600" />
                          <div>
                            <p className="font-semibold text-slate-900">Đề tài có sinh viên</p>
                            <p className="text-sm text-slate-500">Đã được đăng ký</p>
                          </div>
                        </div>
                        <p className="text-4xl font-black text-violet-600">{stats.commentedProgresses}</p>
                      </div>
                    </div>
                  )}

                  {role === "student" && stats.hasTopic && (
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                        <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide mb-1">Đề tài đã đăng ký</p>
                        <p className="text-xl font-bold text-slate-900">{stats.topic?.topicName || "—"}</p>
                        <p className="text-sm text-slate-500 mt-1">Mã: {stats.topic?.topicCode || "—"}</p>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-3">
                          <FileText size={28} className="text-blue-600" />
                          <div>
                            <p className="font-semibold text-slate-900">Báo cáo tiến độ</p>
                            <p className="text-sm text-slate-500">Đã nộp</p>
                          </div>
                        </div>
                        <p className="text-4xl font-black text-blue-600">{stats.totalProgresses}</p>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-100">
                        <div className="flex items-center gap-3">
                          <CheckCircle size={28} className="text-violet-600" />
                          <div>
                            <p className="font-semibold text-slate-900">Đã nhận phản hồi</p>
                            <p className="text-sm text-slate-500">Từ giảng viên</p>
                          </div>
                        </div>
                        <p className="text-4xl font-black text-violet-600">{stats.commentedProgresses}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
