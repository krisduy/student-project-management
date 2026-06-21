import { useEffect, useState } from "react";
import {
  BookOpen,
  Briefcase,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  Edit3,
  FileText,
  GraduationCap,
  Mail,
  Save,
  Star,
  TrendingUp,
  User,
  Users,
  X,
} from "lucide-react";
import TeacherSidebar from "../components/TeacherSidebar.jsx";
import { getMySupervisingTopics, updateAvatar, updateMyProfile } from "../lib/api.js";
import { getSession, setSession } from "../lib/session.js";
import { AvatarDisplay } from "../components/AvatarDisplay.jsx";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

const SUPERVISION_STAGES = [
  { key: "register", label: "Đăng ký đề tài", color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
  { key: "analysis", label: "Phân tích yêu cầu", color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe" },
  { key: "development", label: "Thiết kế & lập trình", color: "#8b5cf6", bg: "#f5f3ff", border: "#ddd6fe" },
  { key: "report", label: "Hoàn thiện báo cáo", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
  { key: "complete", label: "Hoàn thành", color: "#10b981", bg: "#ecfdf5", border: "#a7f3d0" },
];

function fullName(user) {
  return [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "Người dùng";
}

function formatDate(value) {
  if (!value) return "Chưa có";
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
}

function formatDateTime(value) {
  if (!value) return "--";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(value));
}

function getProfileForm(user) {
  return {
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    teacherCode: user?.teacherId?.teacherCode || "",
    degree: user?.teacherId?.degree || "",
    department: user?.teacherId?.department || "",
    title: user?.teacherId?.title || "",
  };
}

function InfoRow({ icon: Icon, label, value, color = "#6366f1", bg = "#eef2ff" }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="font-bold text-slate-800 truncate">{value || "Chưa có"}</p>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <main className="admin-shell">
      <TeacherSidebar />
      <section className="admin-content">
        <div className="animate-pulse">
          <div className="h-6 w-24 bg-slate-200 rounded mb-3" />
          <div className="h-10 w-64 bg-slate-200 rounded mb-2" />
          <div className="h-4 w-96 bg-slate-200 rounded mb-8" />
          <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
            <div className="space-y-5">
              <div className="rounded-3xl bg-white h-72 animate-pulse" />
              <div className="rounded-3xl bg-white h-48 animate-pulse" />
            </div>
            <div className="space-y-4">
              <div className="rounded-3xl bg-white h-80 animate-pulse" />
              <div className="rounded-3xl bg-white h-28 animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function TeacherProfilePage() {
  const [sessionState, setSessionState] = useState(() => getSession());
  const user = sessionState?.user;
  const teacher = user?.teacherId;
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "");
  const [isUploading, setIsUploading] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(() => getProfileForm(user));
  const [profileError, setProfileError] = useState("");

  async function loadData() {
    setIsLoading(true);
    try {
      setTopics(await getMySupervisingTopics());
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  function persistUser(nextUser) {
    const nextSession = { ...sessionState, user: nextUser };
    setSession(nextSession);
    setSessionState(nextSession);
    setAvatarUrl(nextUser?.avatar || "");
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Vui lòng chọn file ảnh."); e.target.value = ""; return; }
    if (file.size > MAX_AVATAR_SIZE) { alert("Avatar tối đa 2MB."); e.target.value = ""; return; }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result;
      setIsUploading(true);
      try {
        const updated = await updateAvatar(base64);
        persistUser({ ...user, ...updated, avatar: updated?.avatar || base64 });
      } catch (err) {
        alert("Lỗi cập nhật avatar: " + err.message);
      } finally {
        setIsUploading(false);
        e.target.value = "";
      }
    };
    reader.readAsDataURL(file);
  }

  function updateProfileField(field, value) {
    setProfileForm((current) => ({ ...current, [field]: value }));
  }

  function startEditProfile() {
    setProfileForm(getProfileForm(user));
    setProfileError("");
    setIsEditingProfile(true);
  }

  function cancelEditProfile() {
    setProfileForm(getProfileForm(user));
    setProfileError("");
    setIsEditingProfile(false);
  }

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setIsSavingProfile(true);
    setProfileError("");
    try {
      const updatedUser = await updateMyProfile(profileForm);
      persistUser(updatedUser);
      setIsEditingProfile(false);
    } catch (err) {
      setProfileError(err.status === 409 ? "Email này đã tồn tại." : err.message || "Không thể cập nhật hồ sơ.");
    } finally {
      setIsSavingProfile(false);
    }
  }

  if (isLoading) return <LoadingSkeleton />;

  const assignedCount = topics.filter((t) => t.studentId).length;
  const unassignedCount = topics.filter((t) => !t.studentId).length;

  return (
    <main className="admin-shell">
      <TeacherSidebar />
      <section className="admin-content">

        {/* Hero Profile Card */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700" />
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 40%)' }} />
          <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-white/5 translate-x-16 translate-y-16" />
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-10 translate-x-10" />

          <div className="relative p-8 pt-10">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/30 bg-white/10 backdrop-blur-sm">
                  <AvatarDisplay user={{ ...user, avatar: avatarUrl }} size="profileHero" />
                </div>
                <label className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform border-2 border-white">
                  {isUploading ? (
                    <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Camera size={16} className="text-emerald-600" />
                  )}
                  <input type="file" accept="image/*" onChange={handleAvatarChange} disabled={isUploading} hidden />
                </label>
              </div>

              {/* Info */}
              <div className="flex-1 pt-2">
                <h2 className="text-2xl font-extrabold text-white leading-tight">{fullName(user)}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 text-white/80 text-xs">
                    <Clock size={12} />
                    Thành viên từ {formatDate(user?.createdAt)}
                  </span>
                </div>

                {/* Quick stats */}
                <div className="flex items-center gap-4 mt-4">
                  <div className="text-center">
                    <p className="text-2xl font-extrabold text-white">{topics.length}</p>
                    <p className="text-xs text-white/70 font-medium">Đề tài</p>
                  </div>
                  <div className="w-px h-8 bg-white/20" />
                  <div className="text-center">
                    <p className="text-2xl font-extrabold text-white">{assignedCount}</p>
                    <p className="text-xs text-white/70 font-medium">Đang hướng dẫn</p>
                  </div>
                  <div className="w-px h-8 bg-white/20" />
                  <div className="text-center">
                    <p className="text-2xl font-extrabold text-yellow-300">{teacher?.department || "—"}</p>
                    <p className="text-xs text-white/70 font-medium">Khoa</p>
                  </div>
                </div>
              </div>

              {/* Edit button */}
              {!isEditingProfile ? (
                <button className="shrink-0 mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-sm font-bold backdrop-blur-sm transition-all border border-white/20 hover:border-white/40 hover:shadow-lg" type="button" onClick={startEditProfile}>
                  <Edit3 size={14} />
                  <span>Chỉnh sửa</span>
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          {/* LEFT COLUMN */}
          <div className="space-y-6">

            {/* Edit Form */}
            {isEditingProfile && (
              <div className="rounded-3xl bg-white shadow-lg border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="px-6 py-5 bg-gradient-to-r from-emerald-600 to-teal-600">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Edit3 size={18} />
                    Chỉnh sửa thông tin cá nhân
                  </h3>
                  <p className="text-emerald-100 text-sm mt-1">Cập nhật thông tin hồ sơ của bạn</p>
                </div>
                <form className="p-6" onSubmit={handleProfileSubmit}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="form-field">
                      <span className="form-label">Họ</span>
                      <input className="form-input" value={profileForm.firstName} onChange={(e) => updateProfileField("firstName", e.target.value)} required />
                    </label>
                    <label className="form-field">
                      <span className="form-label">Tên</span>
                      <input className="form-input" value={profileForm.lastName} onChange={(e) => updateProfileField("lastName", e.target.value)} required />
                    </label>
                    <label className="form-field">
                      <span className="form-label">Email</span>
                      <input className="form-input" type="email" value={profileForm.email} onChange={(e) => updateProfileField("email", e.target.value)} required />
                    </label>
                    <label className="form-field">
                      <span className="form-label">Mã giảng viên</span>
                      <input className="form-input" value={profileForm.teacherCode} onChange={(e) => updateProfileField("teacherCode", e.target.value)} required />
                    </label>
                    <label className="form-field">
                      <span className="form-label">Học vị</span>
                      <input className="form-input" value={profileForm.degree} onChange={(e) => updateProfileField("degree", e.target.value)} required />
                    </label>
                    <label className="form-field">
                      <span className="form-label">Khoa</span>
                      <input className="form-input" value={profileForm.department} onChange={(e) => updateProfileField("department", e.target.value)} />
                    </label>
                    <label className="form-field">
                      <span className="form-label">Chức vụ</span>
                      <input className="form-input" value={profileForm.title} onChange={(e) => updateProfileField("title", e.target.value)} />
                    </label>
                  </div>
                  {profileError ? <div className="notice notice-error mt-4">{profileError}</div> : null}
                  <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                    <button className="btn btn-secondary" type="button" onClick={cancelEditProfile} disabled={isSavingProfile}>
                      <X size={16} />
                      <span>Hủy</span>
                    </button>
                    <button className="btn btn-primary" type="submit" disabled={isSavingProfile}>
                      {isSavingProfile ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : <Save size={16} />}
                      <span>{isSavingProfile ? "Đang lưu..." : "Lưu thay đổi"}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Info Cards — shown when NOT editing */}
            {!isEditingProfile && (
              <div className="grid gap-4 sm:grid-cols-2">
                <InfoRow icon={Mail} label="Email" value={user?.email} color="#6366f1" bg="#eef2ff" />
                <InfoRow icon={User} label="Mã giảng viên" value={teacher?.teacherCode} color="#3b82f6" bg="#eff6ff" />
                <InfoRow icon={GraduationCap} label="Khoa" value={teacher?.department} color="#10b981" bg="#ecfdf5" />
                <InfoRow icon={Briefcase} label="Chức vụ" value={teacher?.title} color="#f59e0b" bg="#fffbeb" />
              </div>
            )}

            {/* Topics Card */}
            <div className="rounded-3xl bg-white shadow-lg border border-slate-100 overflow-hidden">
              <div className="px-6 py-5 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <BookOpen size={16} className="text-emerald-600" />
                  </div>
                  Đề tài đang hướng dẫn
                </h2>
              </div>

              {topics.length > 0 ? (
                <div className="p-6 space-y-3">
                  {topics.slice(0, 5).map((topic) => (
                    <div key={topic._id || topic.id} className="flex items-start gap-4 p-4 rounded-2xl border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                      <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-600 shadow-sm">
                        <BookOpen size={22} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold" style={{ background: topic.studentId ? "#ecfdf5" : "#fffbeb", color: topic.studentId ? "#059669" : "#d97706" }}>
                            {topic.studentId ? <CheckCircle2 size={12} /> : null}
                            {topic.studentId ? "Đã nhận SV" : "Chưa có SV"}
                          </span>
                          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{topic.topicCode}</span>
                        </div>
                        <h3 className="font-extrabold text-slate-900 text-sm leading-snug mb-1">{topic.topicName}</h3>
                        {topic.studentId ? (
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 p-2 rounded-xl bg-indigo-50 border border-indigo-100">
                              <Users size={12} className="text-indigo-500" />
                              <span className="text-xs font-bold text-slate-700">{fullName(topic.studentId.userId)}</span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-amber-500 font-medium">Đang chờ sinh viên đăng ký</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <FileText size={28} className="text-slate-400" />
                  </div>
                  <p className="font-bold text-slate-600 text-base">Chưa có đề tài nào</p>
                  <p className="text-sm text-slate-400 mt-1">Đang chờ sinh viên đăng ký</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <aside className="space-y-5">

            {/* Topics Progress */}
            <div className="rounded-3xl bg-white shadow-lg border border-slate-100 overflow-hidden">
              <div className="px-5 py-4 bg-gradient-to-r from-emerald-600 to-teal-600">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                    <TrendingUp size={14} className="text-white" />
                  </div>
                  Thống kê hướng dẫn
                </h3>
                {topics.length > 0 ? (
                  <p className="text-emerald-100 text-xs mt-0.5">Cập nhật: {formatDateTime(topics[0]?.updatedAt)}</p>
                ) : (
                  <p className="text-emerald-100 text-xs mt-0.5">Theo dõi các đề tài đang hướng dẫn</p>
                )}
              </div>

              <div className="p-5">
                {/* Overall progress bar */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-600">Tổng đề tài</span>
                    <span className="text-xl font-extrabold text-emerald-600">{topics.length}</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-700 ease-out"
                      style={{ width: topics.length > 0 ? "100%" : "0%" }}
                    />
                  </div>
                </div>

                {/* Stage list */}
                <div className="relative">
                  <div className="absolute left-[19px] top-5 bottom-5 w-0.5 bg-slate-200" />

                  <div className="space-y-3">
                    <div className="relative flex items-start gap-3">
                      <div className="relative z-10 shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm bg-emerald-500 text-white shadow-sm">
                        <BookOpen size={16} />
                      </div>
                      <div className="flex-1 min-w-0 pb-5">
                        <div className="inline-block px-3 py-1.5 rounded-xl text-xs font-bold" style={{ background: "#ecfdf5", color: "#059669", border: "1px solid #a7f3d0" }}>
                          Tổng đề tài
                        </div>
                        <p className="text-xs mt-1 font-medium" style={{ color: "#059669" }}>
                          {topics.length} đề tài đang hướng dẫn
                        </p>
                      </div>
                    </div>

                    <div className="relative flex items-start gap-3">
                      <div className="relative z-10 shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm bg-violet-500 text-white shadow-sm">
                        <Users size={16} />
                      </div>
                      <div className="flex-1 min-w-0 pb-5">
                        <div className="inline-block px-3 py-1.5 rounded-xl text-xs font-bold" style={{ background: "#f5f3ff", color: "#7c3aed", border: "1px solid #ddd6fe" }}>
                          Đã nhận sinh viên
                        </div>
                        <p className="text-xs mt-1 font-medium" style={{ color: "#7c3aed" }}>
                          {assignedCount} đề tài có sinh viên
                        </p>
                      </div>
                    </div>

                    <div className="relative flex items-start gap-3">
                      <div className="relative z-10 shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm bg-amber-500 text-white shadow-sm">
                        <Clock size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="inline-block px-3 py-1.5 rounded-xl text-xs font-bold" style={{ background: "#fffbeb", color: "#d97706", border: "1px solid #fde68a" }}>
                          Chưa có sinh viên
                        </div>
                        <p className="text-xs mt-1 font-medium" style={{ color: "#d97706" }}>
                          {unassignedCount} đề tài đang chờ
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-3xl bg-white shadow-lg border border-slate-100 overflow-hidden">
              <div className="px-5 py-4 bg-gradient-to-r from-indigo-50 to-violet-50 border-b border-indigo-100">
                <h3 className="text-base font-bold text-indigo-800 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <Clock size={14} className="text-indigo-600" />
                  </div>
                  Hoạt động gần đây
                </h3>
              </div>
              <div className="p-5">
                {topics.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                        <BookOpen size={12} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Đề tài được phân công</p>
                        <p className="text-xs text-slate-500 mt-0.5">{topics.length} đề tài đang hướng dẫn</p>
                      </div>
                    </div>
                    {assignedCount > 0 && (
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-violet-50 border border-violet-100">
                        <div className="w-7 h-7 rounded-lg bg-violet-500 flex items-center justify-center shrink-0 mt-0.5">
                          <Users size={12} className="text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">Sinh viên đăng ký</p>
                          <p className="text-xs text-slate-500 mt-0.5">{assignedCount} sinh viên đang làm việc</p>
                        </div>
                      </div>
                    )}
                    {topics[0]?.updatedAt && (
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="w-7 h-7 rounded-lg bg-slate-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Clock size={12} className="text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">Cập nhật cuối</p>
                          <p className="text-xs text-slate-500 mt-0.5">{formatDate(topics[0].updatedAt)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm italic text-slate-400">Chưa có hoạt động nào</p>
                  </div>
                )}
              </div>
            </div>

            {/* Tips Card */}
            <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-600 p-5 text-white shadow-lg">
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                  <Star size={12} className="text-white" />
                </div>
                Mẹo hữu ích
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-emerald-100 text-xs">
                  <span className="mt-0.5 shrink-0">•</span>
                  <span>Theo dõi tiến độ sinh viên thường xuyên qua trang cá nhân</span>
                </li>
                <li className="flex items-start gap-2 text-emerald-100 text-xs">
                  <span className="mt-0.5 shrink-0">•</span>
                  <span>Nhận xét kịp thời giúp sinh viên hoàn thành tốt đồ án</span>
                </li>
                <li className="flex items-start gap-2 text-emerald-100 text-xs">
                  <span className="mt-0.5 shrink-0">•</span>
                  <span>Phân công đề tài phù hợp với năng lực từng sinh viên</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
