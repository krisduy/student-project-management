import { useEffect, useState } from "react";
import {
  BookOpen,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  Edit3,
  FileText,
  GraduationCap,
  Mail,
  MapPin,
  Save,
  ShieldCheck,
  Star,
  User,
  X,
} from "lucide-react";
import StudentSidebar from "../components/StudentSidebar.jsx";
import { getMyTopicRegistration, getStudentOptions, updateAvatar, updateMyProfile, getMyProgress } from "../lib/api.js";
import { getSession, setSession } from "../lib/session.js";
import { AvatarDisplay } from "../components/AvatarDisplay.jsx";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

const DEFAULT_CLASSES = ["CNTT-01", "CNTT-02", "CNTT-03", "CNTT-04", "KTPM-01", "KTPM-02", "KHMT-01", "HTTT-01"];
const DEFAULT_MAJORS = ["Công nghệ thông tin", "Kỹ thuật phần mềm", "Khoa học máy tính", "Hệ thống thông tin", "An toàn thông tin"];

const PROGRESS_STAGES = [
  { key: "register",    label: "Đăng ký đề tài",       color: "#3b82f6", bg: "#eff6ff",  border: "#bfdbfe",  dot: "#3b82f6" },
  { key: "analysis",    label: "Phân tích yêu cầu",     color: "#6366f1", bg: "#eef2ff",  border: "#c7d2fe",  dot: "#6366f1" },
  { key: "development", label: "Thiết kế & lập trình", color: "#8b5cf6", bg: "#f5f3ff",  border: "#ddd6fe",  dot: "#8b5cf6" },
  { key: "report",      label: "Hoàn thiện báo cáo",    color: "#f59e0b", bg: "#fffbeb",  border: "#fde68a",  dot: "#f59e0b" },
  { key: "complete",    label: "Hoàn thành",             color: "#10b981", bg: "#ecfdf5",  border: "#a7f3d0",  dot: "#10b981" },
];
const STAGE_PCT = { register: 20, analysis: 40, development: 70, report: 90, complete: 100 };

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
    studentCode: user?.studentId?.studentCode || "",
    class: user?.studentId?.class || "",
    major: user?.studentId?.major || "",
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
      <StudentSidebar />
      <section className="admin-content">
        <div className="animate-pulse">
          <div className="h-6 w-24 bg-slate-200 rounded mb-3" />
          <div className="h-10 w-64 bg-slate-200 rounded mb-2" />
          <div className="h-4 w-96 bg-slate-200 rounded mb-8" />
          <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
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

export default function StudentProfilePage() {
  const [sessionState, setSessionState] = useState(() => getSession());
  const user = sessionState?.user;
  const student = user?.studentId;
  const [myTopic, setMyTopic] = useState(null);
  const [progress, setProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "");
  const [isUploading, setIsUploading] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(() => getProfileForm(user));
  const [profileError, setProfileError] = useState("");
  const [classOptions, setClassOptions] = useState(DEFAULT_CLASSES);
  const [majorOptions, setMajorOptions] = useState(DEFAULT_MAJORS);

  async function loadData() {
    setIsLoading(true);
    try {
      const [topicResult, optionsResult, progressResult] = await Promise.allSettled([
        getMyTopicRegistration(),
        getStudentOptions(),
        getMyProgress(),
      ]);
      if (topicResult.status === "fulfilled") setMyTopic(topicResult.value.topic);
      if (optionsResult.status === "fulfilled" && optionsResult.value) {
        if (optionsResult.value.classes?.length) setClassOptions(optionsResult.value.classes);
        if (optionsResult.value.majors?.length) setMajorOptions(optionsResult.value.majors);
      }
      if (progressResult.status === "fulfilled" && progressResult.value?._id) {
        setProgress(progressResult.value);
      }
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

  async function handleProfileSubmit(event) {
    event.preventDefault();
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

  const completedCount = progress?.completedStages?.length || 0;
  const totalPct = progress?.percentage || 0;

  return (
    <main className="admin-shell">
      <StudentSidebar />
      <section className="admin-content">
        {/* Page Header */}
        <div className="page-header">
          <div className="page-header-decoration" />
          <div className="page-header-decoration-2" />
          <h1>Hồ sơ <span className="highlight">Cá nhân</span></h1>
          <p>Thông tin cá nhân và tiến độ thực hiện đồ án</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          {/* LEFT COLUMN */}
          <div className="space-y-6">

            {/* Hero Profile Card */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl">
              {/* Background Art */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700" />
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
                        <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Camera size={16} className="text-indigo-600" />
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
                        <p className="text-2xl font-extrabold text-white">{myTopic ? "1" : "0"}</p>
                        <p className="text-xs text-white/70 font-medium">Đề tài</p>
                      </div>
                      <div className="w-px h-8 bg-white/20" />
                      <div className="text-center">
                        <p className="text-2xl font-extrabold text-white">{completedCount}</p>
                        <p className="text-xs text-white/70 font-medium">Giai đoạn</p>
                      </div>
                      <div className="w-px h-8 bg-white/20" />
                      <div className="text-center">
                        <p className="text-2xl font-extrabold text-yellow-300">{totalPct}%</p>
                        <p className="text-xs text-white/70 font-medium">Hoàn thành</p>
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

            {/* Edit Form */}
            {isEditingProfile && (
              <div className="rounded-3xl bg-white shadow-lg border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="px-6 py-5 bg-gradient-to-r from-indigo-500 to-violet-600">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Edit3 size={18} />
                    Chỉnh sửa thông tin cá nhân
                  </h3>
                  <p className="text-indigo-100 text-sm mt-1">Cập nhật thông tin hồ sơ của bạn</p>
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
                      <span className="form-label">Mã sinh viên</span>
                      <input className="form-input" value={profileForm.studentCode} onChange={(e) => updateProfileField("studentCode", e.target.value)} required />
                    </label>
                    <label className="form-field">
                      <span className="form-label">Lớp</span>
                      <select className="form-input" value={profileForm.class} onChange={(e) => updateProfileField("class", e.target.value)} required>
                        <option value="">-- Chọn lớp --</option>
                        {classOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </label>
                    <label className="form-field">
                      <span className="form-label">Chuyên ngành</span>
                      <select className="form-input" value={profileForm.major} onChange={(e) => updateProfileField("major", e.target.value)} required>
                        <option value="">-- Chọn chuyên ngành --</option>
                        {majorOptions.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
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
                <InfoRow icon={User} label="Mã sinh viên" value={student?.studentCode} color="#3b82f6" bg="#eff6ff" />
                <InfoRow icon={BookOpen} label="Lớp" value={student?.class} color="#8b5cf6" bg="#f5f3ff" />
                <InfoRow icon={GraduationCap} label="Chuyên ngành" value={student?.major} color="#10b981" bg="#ecfdf5" />
              </div>
            )}

            {/* Topic Card */}
            <div className="rounded-3xl bg-white shadow-lg border border-slate-100 overflow-hidden">
              <div className="px-6 py-5 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center">
                    <FileText size={16} className="text-indigo-600" />
                  </div>
                  Đề tài đang thực hiện
                </h2>
              </div>

              {myTopic ? (
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                      <CheckCircle2 size={12} />
                      Đã đăng ký
                    </span>
                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">{myTopic.topicCode}</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 leading-snug mb-5">{myTopic.topicName}</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
                        <User size={16} className="text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-indigo-400 uppercase tracking-wide">GV Hướng dẫn</p>
                        <p className="font-bold text-slate-800 text-sm">{myTopic.teacherId ? fullName(myTopic.teacherId.userId) : "Chưa phân công"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                        <Calendar size={16} className="text-amber-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-amber-400 uppercase tracking-wide">Ngày đăng ký</p>
                        <p className="font-bold text-slate-800 text-sm">{formatDate(myTopic.updatedAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-10 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <FileText size={28} className="text-slate-400" />
                  </div>
                  <p className="font-bold text-slate-600 text-base">Chưa đăng ký đề tài</p>
                  <p className="text-sm text-slate-400 mt-1 mb-5">Hãy chọn một đề tài để bắt đầu thực hiện đồ án</p>
                  <a href="/student/topics" className="btn btn-primary inline-flex">
                    <BookOpen size={16} />
                    <span>Đăng ký đề tài</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <aside className="space-y-5">
            {/* 5-Stage Progress */}
            <div className="rounded-3xl bg-white shadow-lg border border-slate-100 overflow-hidden">
              <div className="px-5 py-4 bg-gradient-to-r from-indigo-500 to-violet-600">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                    <Star size={14} className="text-white" />
                  </div>
                  Tiến độ học tập
                </h3>
                {progress ? (
                  <p className="text-indigo-100 text-xs mt-0.5">Cập nhật: {formatDateTime(progress.updatedAt)}</p>
                ) : (
                  <p className="text-indigo-100 text-xs mt-0.5">Theo dõi 5 giai đoạn đồ án</p>
                )}
              </div>

              <div className="p-5">
                {/* Overall progress bar */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-600">Tổng tiến độ</span>
                    <span className={`text-xl font-extrabold ${totalPct === 100 ? "text-emerald-600" : totalPct >= 50 ? "text-indigo-600" : "text-slate-600"}`}>
                      {totalPct}%
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${totalPct === 100 ? "bg-gradient-to-r from-emerald-500 to-teal-500" : totalPct >= 50 ? "bg-gradient-to-r from-indigo-500 to-violet-500" : "bg-gradient-to-r from-slate-400 to-slate-500"}`}
                      style={{ width: `${totalPct}%` }}
                    />
                  </div>
                </div>

                {/* Stage list */}
                <div className="relative">
                  {/* Vertical connector line */}
                  <div className="absolute left-[19px] top-5 bottom-5 w-0.5 bg-slate-200" />

                  <div className="space-y-3">
                    {PROGRESS_STAGES.map((s, i) => {
                      const done = progress?.completedStages?.includes(s.key);
                      const isActive = progress?.currentStage === s.key;
                      const isLast = i === PROGRESS_STAGES.length - 1;
                      return (
                        <div key={s.key} className="relative flex items-start gap-3">
                          {/* Node dot */}
                          <div
                            className="relative z-10 shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all duration-300 shadow-sm"
                            style={{
                              background: done ? s.color : isActive ? s.color : "#f1f5f9",
                              color: done || isActive ? "white" : "#94a3b8",
                              border: done || isActive ? "none" : "2px solid #e2e8f0",
                            }}
                          >
                            {done ? (
                              <CheckCircle2 size={18} />
                            ) : (
                              <span>{i + 1}</span>
                            )}
                          </div>

                          {/* Content */}
                          <div className={`flex-1 min-w-0 pb-5 ${isLast ? "pb-0" : ""}`}>
                            <div
                              className="inline-block px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200"
                              style={{
                                background: done ? s.bg : isActive ? s.bg : "#f8fafc",
                                color: done ? s.color : isActive ? s.color : "#94a3b8",
                                border: `1px solid ${done || isActive ? s.border : "#e2e8f0"}`,
                              }}
                            >
                              {s.label}
                            </div>
                            <p className="text-xs mt-1 font-medium" style={{ color: done || isActive ? s.color : "#94a3b8" }}>
                              {done ? `Hoàn thành (${STAGE_PCT[s.key]}%)` : isActive ? "Đang thực hiện" : "Chưa bắt đầu"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-3xl bg-white shadow-lg border border-slate-100 overflow-hidden">
              <div className="px-5 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-emerald-100">
                <h3 className="text-base font-bold text-emerald-800 flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Clock size={14} className="text-emerald-600" />
                  </div>
                  Hoạt động gần đây
                </h3>
              </div>
              <div className="p-5">
                {myTopic ? (
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                        <FileText size={12} className="text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Đăng ký đề tài</p>
                        <p className="text-xs text-slate-500 mt-0.5">{myTopic.topicCode} · {formatDate(myTopic.updatedAt)}</p>
                      </div>
                    </div>
                    {progress && progress.completedStages?.length > 0 && (
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-violet-50 border border-violet-100">
                        <div className="w-7 h-7 rounded-lg bg-violet-500 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 size={12} className="text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">Cập nhật tiến độ</p>
                          <p className="text-xs text-slate-500 mt-0.5">{progress.completedStages.length} giai đoạn hoàn thành</p>
                        </div>
                      </div>
                    )}
                    {progress && progress.teacherComment && (
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
                        <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                          <Star size={12} className="text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800">Nhận xét GV</p>
                          <p className="text-xs text-slate-500 mt-0.5 italic">"{progress.teacherComment}"</p>
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
            <div className="rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 p-5 text-white shadow-lg">
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                  <Star size={12} className="text-white" />
                </div>
                Mẹo hữu ích
              </h3>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-indigo-100 text-xs">
                  <span className="mt-0.5 shrink-0">•</span>
                  <span>Cập nhật tiến độ thường xuyên để GV theo dõi</span>
                </li>
                <li className="flex items-start gap-2 text-indigo-100 text-xs">
                  <span className="mt-0.5 shrink-0">•</span>
                  <span>Đọc kỹ đề cương trước khi bắt đầu lập trình</span>
                </li>
                <li className="flex items-start gap-2 text-indigo-100 text-xs">
                  <span className="mt-0.5 shrink-0">•</span>
                  <span>Nộp báo cáo đúng hạn để đạt kết quả tốt nhất</span>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
