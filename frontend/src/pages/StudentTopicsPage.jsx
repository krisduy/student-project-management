import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  BookOpenCheck,
  CheckCircle2,
  Search,
  Send,
  UserRoundCheck,
  Sparkles,
  X,
} from "lucide-react";
import StudentSidebar from "../components/StudentSidebar.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import {
  createProgress,
  getMyTopicRegistration,
  listAvailableTopics,
  listTeacherOptions,
  registerTopic,
} from "../lib/api.js";

function getId(record) { return record?._id || record?.id || ""; }
function fullName(user) { return [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "Người dùng"; }
function teacherText(teacher) { if (!teacher) return "Chưa chọn giảng viên"; return fullName(teacher.userId); }
function formatDate(value) { if (!value) return "--"; return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value)); }

function inputClass(extra = "") { return `form-input ${extra}`; }

export default function StudentTopicsPage() {
  const [topics, setTopics] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [myTopic, setMyTopic] = useState(null);
  const [teacherSelections, setTeacherSelections] = useState({});
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [confirmRegister, setConfirmRegister] = useState(null);

  const filteredTopics = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return topics;
    return topics.filter((topic) => topic.topicCode?.toLowerCase().includes(normalizedQuery) || topic.topicName?.toLowerCase().includes(normalizedQuery));
  }, [query, topics]);

  async function loadData() {
    setIsLoading(true); setError("");
    try {
      const [registrationResult, topicList, teacherList] = await Promise.all([
        getMyTopicRegistration(),
        listAvailableTopics(),
        listTeacherOptions(),
      ]);
      setMyTopic(registrationResult.topic);
      setTopics(topicList);
      setTeachers(teacherList);
    } catch (err) { setError(err.message || "Không thể tải dữ liệu đăng ký đề tài."); }
    finally { setIsLoading(false); }
  }

  useEffect(() => { loadData(); }, []);

  function updateTeacherSelection(topicId, teacherId) { setTeacherSelections((current) => ({ ...current, [topicId]: teacherId })); }

  async function handleRegister(topic) {
    const topicId = getId(topic);
    const teacherId = teacherSelections[topicId];
    if (!teacherId) { setError("Vui lòng chọn giảng viên hướng dẫn trước khi đăng ký."); return; }
    setConfirmRegister({ topic, topicId, teacherId });
  }

  async function confirmRegisterTopic() {
    const { topic, topicId, teacherId } = confirmRegister;
    setError(""); setNotice(""); setIsRegistering(topicId);
    try {
      const registeredTopic = await registerTopic(topicId, teacherId);

      // Tự động tạo tiến độ cho sinh viên
      const { createProgress } = await import("../lib/api.js");
      await createProgress({
        topicId,
        currentStage: "register",
        completedStages: ["register"],
        percentage: 20,
      }).catch(() => {});

      setMyTopic(registeredTopic);
      setTopics((current) => current.filter((item) => getId(item) !== topicId));
      setNotice("Đăng ký đề tài thành công. Tiến độ đã được khởi tạo!");
    } catch (err) {
      if (err.status === 409) setError("Bạn đã đăng ký đề tài hoặc đề tài này vừa có người đăng ký.");
      else setError(err.message || "Không thể đăng ký đề tài.");
    } finally { setIsRegistering(""); setConfirmRegister(null); }
  }

  return (
    <main className="admin-shell">
      <StudentSidebar />
      <section className="admin-content">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0">
            <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-8 mb-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3"></div>
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full"></div>
              <div className="absolute top-4 right-4 w-32 h-32 border border-white/10 rounded-full"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen size={20} className="text-yellow-300" />
                  <span className="text-sm font-medium text-white/80">Đăng ký đề tài</span>
                </div>
                <h1 className="text-4xl font-black mb-3">Đăng ký đề tài</h1>
                <p className="text-lg text-white/90 max-w-xl">Chọn một đề tài còn trống và giảng viên hướng dẫn để gửi đăng ký.</p>
              </div>
            </div>

            <div className="search-bar">
              <div className="search-input">
                <Search size={18} />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Tìm mã hoặc tên đề tài..."
                  disabled={Boolean(myTopic)}
                />
                {query && (
                  <button className="search-input-clear" onClick={() => setQuery("")} title="Xóa tìm kiếm" type="button">
                    <X size={12} />
                  </button>
                )}
              </div>
              {query && (
                <div className="search-count">
                  <strong>{filteredTopics.length}</strong>
                  <span> kết quả</span>
                </div>
              )}
            </div>

            {notice ? <div className="notice notice-success">{notice}</div> : null}
            {error ? <div className="notice notice-error">{error}</div> : null}

            {myTopic ? (
              <section className="main-panel">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="grid size-12 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200">
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 m-0">Bạn đã đăng ký đề tài</h2>
                      <p className="text-sm text-slate-500 m-0 mt-1">Mỗi sinh viên chỉ được đăng ký một đề tài.</p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="p-5 rounded-xl border border-slate-100 bg-gradient-to-br from-blue-50 to-indigo-50">
                      <span className="text-xs font-bold uppercase text-slate-500">Đề tài</span>
                      <strong className="block text-lg font-bold text-slate-900 mt-2">{myTopic.topicCode}</strong>
                      <p className="text-sm text-slate-600 m-0 mt-1">{myTopic.topicName}</p>
                    </div>
                    <div className="p-5 rounded-xl border border-slate-100 bg-gradient-to-br from-emerald-50 to-teal-50">
                      <span className="text-xs font-bold uppercase text-slate-500">Giảng viên hướng dẫn</span>
                      <strong className="block text-lg font-bold text-slate-900 mt-2">{teacherText(myTopic.teacherId)}</strong>
                      <p className="text-sm text-slate-500 m-0 mt-1">Đăng ký: {formatDate(myTopic.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </section>
            ) : (
              <section className="main-panel">
                <div className="p-4 border-b border-slate-100">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <BookOpenCheck size={22} className="text-indigo-600" />
                    Đề tài còn trống
                  </h2>
                </div>

                {isLoading ? (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <BookOpenCheck size={28} className="text-indigo-300" />
                    </div>
                    <p className="font-semibold text-slate-400">Đang tải danh sách đề tài...</p>
                  </div>
                ) : filteredTopics.length ? (
                  <div className="divide-y divide-slate-100">
                    {filteredTopics.map((topic) => {
                      const topicId = getId(topic);
                      return (
                        <div className="topic-card" key={topicId}>
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="role-badge badge-available">Còn trống</span>
                              <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md tracking-wide">{topic.topicCode}</span>
                            </div>
                          </div>
                          <h3 className="topic-name">{topic.topicName}</h3>
                          <div className="flex flex-wrap items-end gap-3 mt-4">
                            <div className="flex-1 min-w-48">
                              <label className="text-xs font-bold text-slate-500 mb-1.5 block">Giảng viên hướng dẫn</label>
                              <select className={inputClass("bg-white")} value={teacherSelections[topicId] || ""} onChange={(e) => updateTeacherSelection(topicId, e.target.value)}>
                                <option value="">Chọn giảng viên</option>
                                {teachers.map((teacher) => <option value={getId(teacher)} key={getId(teacher)}>{teacherText(teacher)}</option>)}
                              </select>
                            </div>
                            <button className="create-btn" type="button" onClick={() => handleRegister(topic)} disabled={isRegistering === topicId}>
                              {isRegistering === topicId ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              ) : <Send size={16} />}
                              <span>{isRegistering === topicId ? "Đang gửi..." : "Đăng ký ngay"}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                      <Search size={28} className="text-slate-300" />
                    </div>
                    <p className="font-bold text-slate-500">Không tìm thấy đề tài</p>
                    <p className="text-sm text-slate-400 mt-1">Thử thay đổi từ khóa tìm kiếm</p>
                  </div>
                )}
              </section>
            )}
          </div>

          <aside className="grid gap-4 h-fit">
            <div className="p-5 rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-sm">
              <div className="flex items-center gap-2 text-indigo-700 mb-3">
                <Sparkles size={20} />
                <strong className="font-bold">Quy trình</strong>
              </div>
              <div className="text-sm leading-relaxed text-slate-600 space-y-2">
                <p className="flex items-start gap-2"><CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Tìm đề tài còn trống.</p>
                <p className="flex items-start gap-2"><CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Chọn giảng viên hướng dẫn.</p>
                <p className="flex items-start gap-2"><CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" /> Gửi đăng ký và theo dõi.</p>
              </div>
            </div>
            <div className="p-5 rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-700 mb-3">
                <UserRoundCheck size={20} />
                <strong className="font-bold">Giới hạn</strong>
              </div>
              <p className="text-sm leading-relaxed text-slate-600 m-0">
                Một sinh viên chỉ được đăng ký một đề tài. Sau khi đăng ký, danh sách đề tài còn trống sẽ bị khóa.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <ConfirmModal
        isOpen={!!confirmRegister}
        title="Xác nhận đăng ký"
        message={`Bạn có chắc muốn đăng ký đề tài "${confirmRegister?.topic?.topicCode}"?`}
        onConfirm={confirmRegisterTopic}
        onCancel={() => setConfirmRegister(null)}
        confirmText="Đăng ký"
        cancelText="Hủy"
      />
    </main>
  );
}
