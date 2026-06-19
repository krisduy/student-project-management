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

function fullName(user) {
  return (
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    "Người dùng"
  );
}

function formatDate(value) {
  if (!value) return "Chưa có";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export default function TeacherProfilePage() {
  const session = getSession();
  const user = session?.user;
  const teacher = user?.teacherId;

  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  async function loadData() {
    setIsLoading(true);
    try {
      const data = await getMySupervisingTopics();
      setTopics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950 lg:grid lg:grid-cols-[276px_minmax(0,1fr)]">
      <TeacherSidebar />

      <section className="min-w-0 p-5 lg:p-7">
        <div className="mb-5">
          <p className="m-0 text-xs font-black uppercase text-blue-600">
            Giảng viên
          </p>
          <h1 className="m-0 mt-1 text-3xl font-black leading-tight">
            Hồ sơ cá nhân
          </h1>
          <p className="m-0 mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Thông tin cá nhân và đề tài đang hướng dẫn
          </p>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-5">
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-8 text-white">
                <div className="flex items-start gap-4">
                  <div className="grid size-20 shrink-0 place-items-center rounded-xl bg-white/20 backdrop-blur-sm">
                    <Briefcase size={36} strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="m-0 text-2xl font-black">{fullName(user)}</h2>
                    <p className="m-0 mt-1 text-sm font-bold opacity-90">
                      Giảng viên hướng dẫn
                    </p>
                    <p className="m-0 mt-3 text-sm opacity-80">
                      Thành viên từ {formatDate(user?.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 p-6 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-4">
                  <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-blue-100 text-blue-700">
                    <Mail size={18} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-black uppercase text-slate-500">
                      Email
                    </span>
                    <p className="m-0 mt-1 truncate text-sm font-bold text-slate-900">
                      {user?.email || "Chưa có"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-4">
                  <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
                    <User size={18} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-black uppercase text-slate-500">
                      Mã giảng viên
                    </span>
                    <p className="m-0 mt-1 text-sm font-bold text-slate-900">
                      {teacher?.teacherCode || "Chưa có"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-4">
                  <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-violet-100 text-violet-700">
                    <GraduationCap size={18} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-black uppercase text-slate-500">
                      Khoa
                    </span>
                    <p className="m-0 mt-1 text-sm font-bold text-slate-900">
                      {teacher?.department || "Chưa có"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-4">
                  <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-700">
                    <Briefcase size={18} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-black uppercase text-slate-500">
                      Chức vụ
                    </span>
                    <p className="m-0 mt-1 text-sm font-bold text-slate-900">
                      {teacher?.title || "Giảng viên"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="m-0 flex items-center gap-2 text-lg font-black">
                  <FileText size={20} className="text-emerald-600" />
                  Đề tài đang hướng dẫn
                </h2>
              </div>

              {isLoading ? (
                <div className="grid h-40 place-items-center px-6 py-8 text-center font-bold text-slate-500">
                  Đang tải thông tin...
                </div>
              ) : topics.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {topics.slice(0, 5).map((topic) => (
                    <div
                      className="flex items-start gap-4 p-4"
                      key={topic._id || topic.id}
                    >
                      <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
                        <BookOpen size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex min-h-6 items-center rounded-full bg-blue-100 px-2.5 text-xs font-black text-blue-700">
                            {topic.topicCode}
                          </span>
                        </div>
                        <h3 className="m-0 mt-1 text-sm font-bold text-slate-900">
                          {topic.topicName}
                        </h3>
                        {topic.studentId && (
                          <p className="m-0 mt-1 text-xs text-slate-500">
                            SV: {fullName(topic.studentId.userId)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid h-40 place-items-center px-6 py-8 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="grid size-16 place-items-center rounded-xl bg-slate-100 text-slate-400">
                      <FileText size={28} />
                    </div>
                    <div>
                      <p className="m-0 font-bold text-slate-600">
                        Chưa có đề tài nào
                      </p>
                      <p className="m-0 mt-1 text-sm text-slate-500">
                        Đang chờ sinh viên đăng ký
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>

          <aside className="grid h-fit gap-4">
            <div className="overflow-hidden rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-sm">
              <div className="border-b border-emerald-200 px-4 py-3">
                <h3 className="m-0 flex items-center gap-2 text-sm font-black text-emerald-900">
                  <TrendingUp size={16} />
                  Thống kê hướng dẫn
                </h3>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-700">
                      Tổng đề tài
                    </span>
                    <span className="text-2xl font-black text-emerald-700">
                      {topics.length}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-600"
                      style={{ width: topics.length > 0 ? "100%" : "0%" }}
                    />
                  </div>
                </div>
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
                    <span className="text-slate-600">Đã có sinh viên</span>
                    <strong className="text-slate-900">
                      {topics.filter((t) => t.studentId).length}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
                    <span className="text-slate-600">Chưa có sinh viên</span>
                    <strong className="text-slate-900">
                      {topics.filter((t) => !t.studentId).length}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-blue-700">
                <Clock size={18} />
                <strong className="text-sm font-black">Hoạt động gần đây</strong>
              </div>
              {topics.length > 0 ? (
                <div className="text-sm leading-6 text-slate-600">
                  <p className="m-0">
                    Đang hướng dẫn <strong>{topics.length}</strong> đề tài
                  </p>
                  <p className="m-0 mt-1 text-xs text-slate-500">
                    Cập nhật: {formatDate(topics[0]?.updatedAt)}
                  </p>
                </div>
              ) : (
                <p className="m-0 text-sm italic text-slate-500">
                  Chưa có hoạt động nào
                </p>
              )}
            </div>

            <div className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-2 text-violet-700">
                <Calendar size={16} />
                <strong className="text-xs font-black uppercase">Học kỳ hiện tại</strong>
              </div>
              <p className="m-0 text-lg font-black text-slate-900">
                2026 - 2027
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
