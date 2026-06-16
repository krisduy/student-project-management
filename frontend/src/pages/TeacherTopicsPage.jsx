import { useEffect, useMemo, useState } from "react";
import { BookCheck, GraduationCap, Search, User } from "lucide-react";
import TeacherSidebar from "../components/TeacherSidebar.jsx";
import { getMySupervisingTopics } from "../lib/api.js";

function fullName(user) {
  return (
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    "N/A"
  );
}

function formatDate(value) {
  if (!value) return "--";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export default function TeacherTopicsPage() {
  const [topics, setTopics] = useState([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const filteredTopics = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return topics;

    return topics.filter((topic) => {
      const studentName = fullName(topic.studentId?.userId).toLowerCase();
      return (
        topic.topicCode?.toLowerCase().includes(normalizedQuery) ||
        topic.topicName?.toLowerCase().includes(normalizedQuery) ||
        studentName.includes(normalizedQuery)
      );
    });
  }, [query, topics]);

  async function loadData() {
    setIsLoading(true);
    setError("");
    try {
      const data = await getMySupervisingTopics();
      setTopics(data);
    } catch (err) {
      setError(err.message || "Không thể tải danh sách đề tài.");
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
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="m-0 text-xs font-black uppercase text-blue-600">
              Giảng viên
            </p>
            <h1 className="m-0 mt-1 text-3xl font-black leading-tight">
              Đề tài đang hướng dẫn
            </h1>
            <p className="m-0 mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Danh sách đề tài bạn đang hướng dẫn và thông tin sinh viên thực
              hiện.
            </p>
          </div>
          <label className="flex min-h-11 w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-slate-500 sm:max-w-sm">
            <Search size={18} />
            <input
              className="min-w-0 flex-1 bg-transparent text-slate-950 outline-none"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm mã, tên đề tài hoặc sinh viên"
            />
          </label>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
            {error}
          </div>
        ) : null}

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <h2 className="m-0 text-lg font-black">
              Đề tài ({filteredTopics.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="grid h-40 place-items-center px-4 py-6 text-center font-bold text-slate-500">
              Đang tải danh sách đề tài...
            </div>
          ) : filteredTopics.length ? (
            <div className="divide-y divide-slate-200">
              {filteredTopics.map((topic) => {
                const student = topic.studentId;
                return (
                  <article
                    className="grid gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_240px_160px] xl:items-center"
                    key={topic._id || topic.id}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex min-h-7 items-center rounded-full bg-blue-100 px-3 text-xs font-black text-blue-700">
                          Đã giao
                        </span>
                        <strong className="text-sm text-slate-500">
                          {topic.topicCode}
                        </strong>
                      </div>
                      <h3 className="m-0 mt-2 text-lg font-black leading-snug">
                        {topic.topicName}
                      </h3>
                    </div>

                    <div className="min-w-0">
                      <span className="text-xs font-black uppercase text-slate-500">
                        Sinh viên
                      </span>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="grid size-8 shrink-0 place-items-center rounded bg-slate-200 text-xs font-black text-slate-600">
                          <User size={14} />
                        </div>
                        <div className="min-w-0">
                          <strong className="block truncate text-sm">
                            {student ? fullName(student.userId) : "—"}
                          </strong>
                          {student?.class ? (
                            <span className="block truncate text-xs text-slate-500">
                              {student.class}
                              {student.major ? ` · ${student.major}` : ""}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-slate-500">
                      <span className="text-xs font-black uppercase text-slate-500">
                        Ngày tạo
                      </span>
                      <p className="m-0 mt-1">
                        {formatDate(topic.createdAt)}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="grid h-40 place-items-center px-4 py-6 text-center font-bold text-slate-500">
              <div className="flex flex-col items-center gap-2">
                <BookCheck size={32} className="text-slate-300" />
                <span>Chưa có đề tài nào được giao cho bạn.</span>
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
