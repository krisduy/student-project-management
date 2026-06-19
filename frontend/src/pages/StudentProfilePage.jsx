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
      <StudentSidebar />

      <section className="min-w-0 p-5 lg:p-7">
        <div className="mb-5">
          <p className="m-0 text-xs font-black uppercase text-blue-600">
            Sinh viên
          </p>
          <h1 className="m-0 mt-1 text-3xl font-black leading-tight">
            Hồ sơ cá nhân
          </h1>
          <p className="m-0 mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Thông tin cá nhân và đề tài đang thực hiện
          </p>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-5">
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-white">
                <div className="flex items-start gap-4">
                  <div className="grid size-20 shrink-0 place-items-center rounded-xl bg-white/20 backdrop-blur-sm">
                    <GraduationCap size={36} strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="m-0 text-2xl font-black">{fullName(user)}</h2>
                    <p className="m-0 mt-1 text-sm font-bold opacity-90">
                      Sinh viên
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
                      Mã sinh viên
                    </span>
                    <p className="m-0 mt-1 text-sm font-bold text-slate-900">
                      {student?.studentCode || "Chưa có"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-4">
                  <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-violet-100 text-violet-700">
                    <BookOpen size={18} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-black uppercase text-slate-500">
                      Lớp
                    </span>
                    <p className="m-0 mt-1 text-sm font-bold text-slate-900">
                      {student?.class || "Chưa có"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-4">
                  <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-700">
                    <GraduationCap size={18} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-black uppercase text-slate-500">
                      Chuyên ngành
                    </span>
                    <p className="m-0 mt-1 text-sm font-bold text-slate-900">
                      {student?.major || "Chưa có"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-4">
                <h2 className="m-0 flex items-center gap-2 text-lg font-black">
                  <FileText size={20} className="text-blue-600" />
                  Đề tài đang thực hiện
                </h2>
              </div>

              {isLoading ? (
                <div className="grid h-40 place-items-center px-6 py-8 text-center font-bold text-slate-500">
                  Đang tải thông tin...
                </div>
              ) : myTopic ? (
                <div className="p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="inline-flex min-h-7 items-center gap-1.5 rounded-full bg-emerald-100 px-3 text-xs font-black text-emerald-700">
                      <CheckCircle2 size={14} />
                      Đã đăng ký
                    </span>
                    <span className="text-sm font-bold text-slate-500">
                      {myTopic.topicCode}
                    </span>
                  </div>

                  <h3 className="m-0 text-xl font-black text-slate-900">
                    {myTopic.topicName}
                  </h3>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <div className="mb-2 flex items-center gap-2 text-slate-500">
                        <User size={16} />
                        <span className="text-xs font-black uppercase">
                          Giảng viên hướng dẫn
                        </span>
                      </div>
                      <strong className="text-sm text-slate-900">
                        {myTopic.teacherId
                          ? fullName(myTopic.teacherId.userId)
                          : "Chưa có"}
                      </strong>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <div className="mb-2 flex items-center gap-2 text-slate-500">
                        <Calendar size={16} />
                        <span className="text-xs font-black uppercase">
                          Ngày đăng ký
                        </span>
                      </div>
                      <strong className="text-sm text-slate-900">
                        {formatDate(myTopic.updatedAt)}
                      </strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid h-40 place-items-center px-6 py-8 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="grid size-16 place-items-center rounded-xl bg-slate-100 text-slate-400">
                      <FileText size={28} />
                    </div>
                    <div>
                      <p className="m-0 font-bold text-slate-600">
                        Chưa đăng ký đề tài
                      </p>
                      <p className="m-0 mt-1 text-sm text-slate-500">
                        Hãy chọn một đề tài để bắt đầu
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>

          <aside className="grid h-fit gap-4">
            <div className="overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm">
              <div className="border-b border-blue-200 px-4 py-3">
                <h3 className="m-0 flex items-center gap-2 text-sm font-black text-blue-900">
                  <TrendingUp size={16} />
                  Tiến độ học tập
                </h3>
              </div>
              <div className="p-4">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700">
                    Đề tài đã đăng ký
                  </span>
                  <span className="text-lg font-black text-blue-700">
                    {myTopic ? "1/1" : "0/1"}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600"
                    style={{ width: myTopic ? "100%" : "0%" }}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-emerald-700">
                <Clock size={18} />
                <strong className="text-sm font-black">Hoạt động gần đây</strong>
              </div>
              {myTopic ? (
                <div className="text-sm leading-6 text-slate-600">
                  <p className="m-0">
                    Đăng ký đề tài <strong>{myTopic.topicCode}</strong>
                  </p>
                  <p className="m-0 mt-1 text-xs text-slate-500">
                    {formatDate(myTopic.updatedAt)}
                  </p>
                </div>
              ) : (
                <p className="m-0 text-sm italic text-slate-500">
                  Chưa có hoạt động nào
                </p>
              )}
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
