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
  Save,
  TrendingUp,
  User,
  X,
} from "lucide-react";
import StudentSidebar from "../components/StudentSidebar.jsx";
import { getMyTopicRegistration, getStudentOptions, updateAvatar, updateMyProfile } from "../lib/api.js";
import { getSession, setSession } from "../lib/session.js";
import { AvatarDisplay } from "../components/AvatarDisplay.jsx";

const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

const DEFAULT_CLASSES = ["CNTT-01", "CNTT-02", "CNTT-03", "CNTT-04", "KTPM-01", "KTPM-02", "KHMT-01", "HTTT-01"];
const DEFAULT_MAJORS = ["Công nghệ thông tin", "Kỹ thuật phần mềm", "Khoa học máy tính", "Hệ thống thông tin", "An toàn thông tin"];

function fullName(user) {
  return [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "Người dùng";
}

function formatDate(value) {
  if (!value) return "Chưa có";
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
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

export default function StudentProfilePage() {
  const [sessionState, setSessionState] = useState(() => getSession());
  const user = sessionState?.user;
  const student = user?.studentId;
  const [myTopic, setMyTopic] = useState(null);
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
      const [topicResult, optionsResult] = await Promise.allSettled([
        getMyTopicRegistration(),
        getStudentOptions(),
      ]);
      if (topicResult.status === "fulfilled") setMyTopic(topicResult.value.topic);
      if (optionsResult.status === "fulfilled" && optionsResult.value) {
        if (optionsResult.value.classes?.length) setClassOptions(optionsResult.value.classes);
        if (optionsResult.value.majors?.length) setMajorOptions(optionsResult.value.majors);
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

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file ảnh.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      alert("Avatar tối đa 2MB. Vui lòng chọn ảnh nhỏ hơn.");
      e.target.value = "";
      return;
    }

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

  return (
    <main className="admin-shell">
      <StudentSidebar />
      <section className="admin-content">
        <div className="page-header">
          <p className="eyebrow">Sinh viên</p>
          <h1>Hồ sơ cá nhân</h1>
          <p>Thông tin cá nhân và đề tài đang thực hiện</p>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="grid gap-5">
            <section className="main-panel overflow-hidden">
              <div className="profile-header">
                <div className="profile-avatar-wrapper">
                  <AvatarDisplay user={{ ...user, avatar: avatarUrl }} size="xl" />
                  <label className="avatar-upload-btn">
                    <Camera size={18} />
                    <input type="file" accept="image/*" onChange={handleAvatarChange} disabled={isUploading} hidden />
                  </label>
                </div>
                <h2>{fullName(user)}</h2>
                <p>Sinh viên · Thành viên từ {formatDate(user?.createdAt)}</p>
                {!isEditingProfile ? (
                  <button className="btn btn-secondary mt-4" type="button" onClick={startEditProfile}>
                    <Edit3 size={16} />
                    <span>Sửa thông tin</span>
                  </button>
                ) : null}
              </div>

              {isEditingProfile ? (
                <form className="p-5" onSubmit={handleProfileSubmit}>
                  <div className="form-grid form-grid-2">
                    <label className="form-field">
                      <span>Họ</span>
                      <input className="form-input" value={profileForm.firstName} onChange={(e) => updateProfileField("firstName", e.target.value)} required />
                    </label>
                    <label className="form-field">
                      <span>Tên</span>
                      <input className="form-input" value={profileForm.lastName} onChange={(e) => updateProfileField("lastName", e.target.value)} required />
                    </label>
                    <label className="form-field">
                      <span>Email</span>
                      <input className="form-input" type="email" value={profileForm.email} onChange={(e) => updateProfileField("email", e.target.value)} required />
                    </label>
                    <label className="form-field">
                      <span>Mã sinh viên</span>
                      <input className="form-input" value={profileForm.studentCode} onChange={(e) => updateProfileField("studentCode", e.target.value)} required />
                    </label>
                    <label className="form-field">
                      <span>Lớp</span>
                      <select className="form-input" value={profileForm.class} onChange={(e) => updateProfileField("class", e.target.value)} required>
                        <option value="">-- Chọn lớp --</option>
                        {classOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </label>
                    <label className="form-field">
                      <span>Chuyên ngành</span>
                      <select className="form-input" value={profileForm.major} onChange={(e) => updateProfileField("major", e.target.value)} required>
                        <option value="">-- Chọn chuyên ngành --</option>
                        {majorOptions.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </label>
                  </div>
                  {profileError ? <div className="notice notice-error mt-4">{profileError}</div> : null}
                  <div className="modal-actions mt-5">
                    <button className="btn btn-secondary" type="button" onClick={cancelEditProfile} disabled={isSavingProfile}>
                      <X size={16} />
                      <span>Hủy</span>
                    </button>
                    <button className="btn btn-primary" type="submit" disabled={isSavingProfile}>
                      <Save size={16} />
                      <span>{isSavingProfile ? "Đang lưu..." : "Lưu thay đổi"}</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="profile-info-grid">
                  <div className="info-card">
                    <div className="info-icon blue"><Mail size={20} /></div>
                    <div>
                      <span>Email</span>
                      <strong>{user?.email || "Chưa có"}</strong>
                    </div>
                  </div>
                  <div className="info-card">
                    <div className="info-icon green"><User size={20} /></div>
                    <div>
                      <span>Mã sinh viên</span>
                      <strong>{student?.studentCode || "Chưa có"}</strong>
                    </div>
                  </div>
                  <div className="info-card">
                    <div className="info-icon purple"><BookOpen size={20} /></div>
                    <div>
                      <span>Lớp</span>
                      <strong>{student?.class || "Chưa có"}</strong>
                    </div>
                  </div>
                  <div className="info-card">
                    <div className="info-icon amber"><GraduationCap size={20} /></div>
                    <div>
                      <span>Chuyên ngành</span>
                      <strong>{student?.major || "Chưa có"}</strong>
                    </div>
                  </div>
                </div>
              )}
            </section>

            <section className="main-panel">
              <div className="p-5 border-b border-slate-100">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <FileText size={22} className="text-indigo-600" />
                  Đề tài đang thực hiện
                </h2>
              </div>

              {isLoading ? (
                <div className="p-8 text-center"><span className="font-semibold text-slate-500">Đang tải thông tin...</span></div>
              ) : myTopic ? (
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="role-badge badge-available flex items-center gap-1"><CheckCircle2 size={14} /> Đã đăng ký</span>
                    <span className="text-sm font-semibold text-slate-500">{myTopic.topicCode}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 m-0">{myTopic.topicName}</h3>
                  <div className="grid gap-4 sm:grid-cols-2 mt-6">
                    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                      <div className="flex items-center gap-2 text-slate-500 mb-2"><User size={16} /><span className="text-xs font-bold uppercase">Giảng viên hướng dẫn</span></div>
                      <strong className="text-sm text-slate-900">{myTopic.teacherId ? fullName(myTopic.teacherId.userId) : "Chưa có"}</strong>
                    </div>
                    <div className="p-4 rounded-xl border border-slate-100 bg-slate-50">
                      <div className="flex items-center gap-2 text-slate-500 mb-2"><Calendar size={16} /><span className="text-xs font-bold uppercase">Ngày đăng ký</span></div>
                      <strong className="text-sm text-slate-900">{formatDate(myTopic.updatedAt)}</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-10 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="grid size-16 place-items-center rounded-2xl bg-slate-100 text-slate-400"><FileText size={28} /></div>
                    <div>
                      <p className="font-semibold text-slate-600">Chưa đăng ký đề tài</p>
                      <p className="text-sm text-slate-500">Hãy chọn một đề tài để bắt đầu</p>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>

          <aside className="grid gap-4 h-fit">
            <div className="p-5 rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-sm">
              <h3 className="flex items-center gap-2 text-sm font-bold text-indigo-900 mb-4">
                <TrendingUp size={18} />
                Tiến độ học tập
              </h3>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-slate-700">Đề tài đã đăng ký</span>
                <span className="text-lg font-bold text-indigo-600">{myTopic ? "1/1" : "0/1"}</span>
              </div>
              <div className="h-2 rounded-full bg-white overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all" style={{ width: myTopic ? "100%" : "0%" }} />
              </div>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 text-emerald-700 mb-3">
                <Clock size={18} />
                <strong className="text-sm font-bold">Hoạt động gần đây</strong>
              </div>
              {myTopic ? (
                <div className="text-sm leading-relaxed text-slate-600">
                  <p>Đăng ký đề tài <strong>{myTopic.topicCode}</strong></p>
                  <p className="text-xs text-slate-500 mt-1">{formatDate(myTopic.updatedAt)}</p>
                </div>
              ) : (
                <p className="text-sm italic text-slate-500">Chưa có hoạt động nào</p>
              )}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
