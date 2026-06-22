import { useEffect, useMemo, useState } from "react";
import { BookCheck, BookMarked, Search, User, Users } from "lucide-react";
import TeacherSidebar from "../components/TeacherSidebar.jsx";
import { getMySupervisingTopics } from "../lib/api.js";
import { AvatarDisplay } from "../components/AvatarDisplay.jsx";

function fullName(user) { return [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "N/A"; }
function formatDate(value) { if (!value) return "--"; return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value)); }

function TopicAvatar({ user }) {
  return <AvatarDisplay user={user} size="sm" />;
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
      return topic.topicCode?.toLowerCase().includes(normalizedQuery) || topic.topicName?.toLowerCase().includes(normalizedQuery) || studentName.includes(normalizedQuery);
    });
  }, [query, topics]);

  async function loadData() {
    setIsLoading(true); setError("");
    try { setTopics(await getMySupervisingTopics()); }
    catch (err) { setError(err.message || "Không thể tải danh sách đề tài."); }
    finally { setIsLoading(false); }
  }

  useEffect(() => { loadData(); }, []);

  return (
    <main className="admin-shell">
      <TeacherSidebar />
      <section className="admin-content">
        <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-600 p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full"></div>
          <div className="absolute top-4 right-4 w-32 h-32 border border-white/10 rounded-full"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <BookMarked size={20} className="text-yellow-300" />
              <span className="text-sm font-medium text-white/80">Đề tài hướng dẫn</span>
            </div>
            <h1 className="text-4xl font-black mb-3">Đề tài đang hướng dẫn</h1>
            <p className="text-lg text-white/90 max-w-xl">Danh sách đề tài bạn đang hướng dẫn và thông tin sinh viên thực hiện.</p>
          </div>
        </div>

        <div className="search-bar">
          <div className="search-input">
            <Search size={20} />
            <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm mã, tên đề tài hoặc sinh viên" />
          </div>
        </div>

        {error && <div className="notice notice-error mb-5">{error}</div>}

        <section className="main-panel">
          <div className="p-4 border-b border-slate-100">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <BookCheck size={22} className="text-indigo-600" />
              Đề tài ({filteredTopics.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center"><span className="font-semibold text-slate-500">Đang tải danh sách đề tài...</span></div>
          ) : filteredTopics.length ? (
            <div className="divide-y divide-slate-100">
              {filteredTopics.map((topic) => {
                const student = topic.studentId;
                return (
                  <div className="topic-card" key={topic._id || topic.id}>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="role-badge badge-assigned">Đã giao</span>
                      <span className="text-xs font-semibold text-slate-500">{topic.topicCode}</span>
                    </div>
                    <h3 className="topic-name">{topic.topicName}</h3>
                    
                    <div className="flex flex-wrap gap-6 mt-4">
                      <div>
                        <span className="text-xs font-bold uppercase text-slate-500">Sinh viên</span>
                        <div className="flex items-center gap-2 mt-1">
                          <TopicAvatar user={student?.userId} />
                          <div>
                            <strong className="block text-sm font-semibold text-slate-900">{student ? fullName(student.userId) : "—"}</strong>
                            {student?.class && <span className="text-xs text-slate-500">{student.class}{student.major ? ` · ${student.major}` : ""}</span>}
                          </div>
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-bold uppercase text-slate-500">Ngày tạo</span>
                        <p className="text-sm text-slate-600 mt-1">{formatDate(topic.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="grid size-16 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                  <Users size={32} />
                </div>
                <span className="font-semibold text-slate-600">Chưa có đề tài nào được giao cho bạn.</span>
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}
