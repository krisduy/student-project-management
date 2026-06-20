import { useEffect, useState } from "react";
import {
  BookOpen,
  Calendar,
  GraduationCap,
  Mail,
  User,
  Clock,
  FileText,
  TrendingUp,
  Briefcase,
} from "lucide-react";
import TeacherSidebar from "../components/TeacherSidebar.jsx";
import { getMySupervisingTopics } from "../lib/api.js";
import { getSession } from "../lib/session.js";

function fullName(user) { return [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "Người dùng"; }
function initials(user) { return [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "GV"; }
function formatDate(value) { if (!value) return "Chưa có"; return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value)); }

export default function TeacherProfilePage() {
  const session = getSession();
  const user = session?.user;
  const teacher = user?.teacherId;
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  async function loadData() {
    setIsLoading(true);
    try { setTopics(await getMySupervisingTopics()); }
    catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  }

  useEffect(() => { loadData(); }, []);

  return (
    <main className="admin-shell">
      <TeacherSidebar />
      <section className="admin-content">
        <div className="page-header">
          <p className="eyebrow">Giảng viên</p>
          <h1>Hồ sơ cá nhân</h1>
          <p>Thông tin cá nhân và đề tài đang hướng dẫn</p>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="grid gap-5">
            {/* Profile Card */}
            <section className="main-panel overflow-hidden">
              <div className="profile-header" style={{ background: 'linear-gradient(135deg, #059669, #0d9488)' }}>
                <div className="profile-avatar">
                  <Briefcase size={40} strokeWidth={2} />
                </div>
                <h2>{fullName(user)}</h2>
                <p>Giảng viên hướng dẫn · Thành viên từ {formatDate(user?.createdAt)}</p>
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
                    <span>Mã giảng viên</span>
                    <strong>{teacher?.teacherCode || "Chưa có"}</strong>
                  </div>
                </div>
                <div className="info-card">
                  <div className="info-icon purple"><GraduationCap size={20} /></div>
                  <div>
                    <span>Khoa</span>
                    <strong>{teacher?.department || "Chưa có"}</strong>
                  </div>
                </div>
                <div className="info-card">
                  <div className="info-icon amber"><Briefcase size={20} /></div>
                  <div>
                    <span>Chức vụ</span>
                    <strong>{teacher?.title || "Giảng viên"}</strong>
                  </div>
                </div>
              </div>
            </section>

            {/* Topics Card */}
            <section className="main-panel">
              <div className="p-5 border-b border-slate-100">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <FileText size={22} className="text-emerald-600" />
                  Đề tài đang hướng dẫn
                </h2>
              </div>

              {isLoading ? (
                <div className="p-8 text-center"><span className="font-semibold text-slate-500">Đang tải thông tin...</span></div>
              ) : topics.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {topics.slice(0, 5).map((topic) => (
                    <div className="flex items-start gap-4 p-4" key={topic._id || topic.id}>
                      <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700">
                        <BookOpen size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="role-badge badge-assigned">{topic.topicCode}</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 mt-1">{topic.topicName}</h3>
                        {topic.studentId && <p className="text-xs text-slate-500 mt-1">SV: {fullName(topic.studentId.userId)}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-10 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="grid size-16 place-items-center rounded-2xl bg-slate-100 text-slate-400"><FileText size={28} /></div>
                    <div>
                      <p className="font-semibold text-slate-600">Chưa có đề tài nào</p>
                      <p className="text-sm text-slate-500">Đang chờ sinh viên đăng ký</p>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>

          <aside className="grid gap-4 h-fit">
            <div className="p-5 rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-sm">
              <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-900 mb-4">
                <TrendingUp size={18} />
                Thống kê hướng dẫn
              </h3>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">Tổng đề tài</span>
                  <span className="text-2xl font-bold text-emerald-700">{topics.length}</span>
                </div>
                <div className="h-2 rounded-full bg-white overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500" style={{ width: topics.length > 0 ? "100%" : "0%" }} />
                </div>
              </div>
              <div className="grid gap-2 text-sm">
                <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
                  <span className="text-slate-600">Đã có sinh viên</span>
                  <strong className="text-slate-900">{topics.filter((t) => t.studentId).length}</strong>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
                  <span className="text-slate-600">Chưa có sinh viên</span>
                  <strong className="text-slate-900">{topics.filter((t) => !t.studentId).length}</strong>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-2 text-blue-700 mb-3">
                <Clock size={18} />
                <strong className="text-sm font-bold">Hoạt động gần đây</strong>
              </div>
              {topics.length > 0 ? (
                <div className="text-sm leading-relaxed text-slate-600">
                  <p>Đang hướng dẫn <strong>{topics.length}</strong> đề tài</p>
                  <p className="text-xs text-slate-500 mt-1">Cập nhật: {formatDate(topics[0]?.updatedAt)}</p>
                </div>
              ) : (
                <p className="text-sm italic text-slate-500">Chưa có hoạt động nào</p>
              )}
            </div>

            <div className="p-4 rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 shadow-sm">
              <div className="flex items-center gap-2 text-violet-700 mb-2">
                <Calendar size={16} />
                <strong className="text-xs font-bold uppercase">Học kỳ hiện tại</strong>
              </div>
              <p className="text-lg font-bold text-slate-900 m-0">2026 - 2027</p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
