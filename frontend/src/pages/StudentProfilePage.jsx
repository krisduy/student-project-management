import { useEffect, useState } from "react";
import {
  BookOpen,
  Calendar,
  GraduationCap,
  Mail,
  User,
  Clock,
  CheckCircle2,
  FileText,
  TrendingUp,
} from "lucide-react";
import StudentSidebar from "../components/StudentSidebar.jsx";
import { getMyTopicRegistration } from "../lib/api.js";
import { getSession } from "../lib/session.js";

function fullName(user) { return [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "Người dùng"; }
function initials(user) { return [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "SV"; }
function formatDate(value) { if (!value) return "Chưa có"; return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value)); }

export default function StudentProfilePage() {
  const session = getSession();
  const user = session?.user;
  const student = user?.studentId;
  const [myTopic, setMyTopic] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadData() {
    setIsLoading(true);
    try {
      const result = await getMyTopicRegistration();
      setMyTopic(result.topic);
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  }

  useEffect(() => { loadData(); }, []);

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
            {/* Profile Card */}
            <section className="main-panel overflow-hidden">
              <div className="profile-header">
                <div className="profile-avatar">
                  <GraduationCap size={40} strokeWidth={2} />
                </div>
                <h2>{fullName(user)}</h2>
                <p>Sinh viên · Thành viên từ {formatDate(user?.createdAt)}</p>
              </div>

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
            </section>

            {/* Topic Card */}
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
