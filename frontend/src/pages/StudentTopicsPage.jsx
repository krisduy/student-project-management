import { useEffect, useMemo, useState } from "react";
import {
  BookOpenCheck,
  CheckCircle2,
  Search,
  Send,
  UserRoundCheck,
} from "lucide-react";
import StudentSidebar from "../components/StudentSidebar.jsx";
import {
  getMyTopicRegistration,
  listAvailableTopics,
  listTeacherOptions,
  registerTopic,
} from "../lib/api.js";

function getId(record) {
  return record?._id || record?.id || "";
}

function fullName(user) {
  return (
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    "Người dùng"
  );
}

function teacherText(teacher) {
  if (!teacher) return "Chưa chọn giảng viên";
  return fullName(teacher.userId);
}

function formatDate(value) {
  if (!value) return "--";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function inputClass(extra = "") {
  return `min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 ${extra}`;
}

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

  const filteredTopics = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return topics;

    return topics.filter((topic) => {
      return (
        topic.topicCode?.toLowerCase().includes(normalizedQuery) ||
        topic.topicName?.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [query, topics]);

  async function loadData() {
    setIsLoading(true);
    setError("");

    try {
      const [registrationResult, topicList, teacherList] = await Promise.all([
        getMyTopicRegistration(),
        listAvailableTopics(),
        listTeacherOptions(),
      ]);
      setMyTopic(registrationResult.topic);
      setTopics(topicList);
      setTeachers(teacherList);
    } catch (err) {
      setError(err.message || "Không thể tải dữ liệu đăng ký đề tài.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function updateTeacherSelection(topicId, teacherId) {
    setTeacherSelections((current) => ({ ...current, [topicId]: teacherId }));
  }

  async function handleRegister(topic) {
    const topicId = getId(topic);
    const teacherId = teacherSelections[topicId];

    if (!teacherId) {
      setError("Vui lòng chọn giảng viên hướng dẫn trước khi đăng ký.");
      return;
    }

    if (!window.confirm(`Đăng ký đề tài ${topic.topicCode}?`)) return;

    setError("");
    setNotice("");
    setIsRegistering(topicId);

    try {
      const registeredTopic = await registerTopic(topicId, teacherId);
      setMyTopic(registeredTopic);
      setTopics((current) => current.filter((item) => getId(item) !== topicId));
      setNotice("Đăng ký đề tài thành công.");
    } catch (err) {
      if (err.status === 409) {
        setError("Bạn đã đăng ký đề tài hoặc đề tài này vừa có người đăng ký.");
      } else {
        setError(err.message || "Không thể đăng ký đề tài.");
      }
    } finally {
      setIsRegistering("");
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950 lg:grid lg:grid-cols-[276px_minmax(0,1fr)]">
      <StudentSidebar />

      <section className="min-w-0 p-5 lg:p-7">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="m-0 text-xs font-black uppercase text-blue-600">
                Sinh viên
              </p>
              <h1 className="m-0 mt-1 text-3xl font-black leading-tight">
                Đăng ký đề tài
              </h1>
              <p className="m-0 mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Chọn một đề tài còn trống và giảng viên hướng dẫn để gửi đăng ký.
              </p>
            </div>
            <label className="flex min-h-11 w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-slate-500 sm:max-w-sm">
              <Search size={18} />
              <input
                className="min-w-0 flex-1 bg-transparent text-slate-950 outline-none"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm mã hoặc tên đề tài"
                disabled={Boolean(myTopic)}
              />
            </label>
          </div>

          {notice ? (
            <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
              {notice}
            </div>
          ) : null}
          {error ? (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
              {error}
            </div>
          ) : null}

          {myTopic ? (
            <section className="rounded-lg border border-emerald-200 bg-white p-5">
              <div className="mb-4 flex items-start gap-3">
                <div className="grid size-10 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h2 className="m-0 text-xl font-black">
                    Bạn đã đăng ký đề tài
                  </h2>
                  <p className="m-0 mt-1 text-sm leading-6 text-slate-500">
                    Mỗi sinh viên chỉ được đăng ký một đề tài.
                  </p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <span className="text-xs font-black uppercase text-slate-500">
                    Đề tài
                  </span>
                  <strong className="mt-2 block text-lg">
                    {myTopic.topicCode}
                  </strong>
                  <p className="m-0 mt-1 text-sm leading-6 text-slate-600">
                    {myTopic.topicName}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <span className="text-xs font-black uppercase text-slate-500">
                    Giảng viên hướng dẫn
                  </span>
                  <strong className="mt-2 block text-lg">
                    {teacherText(myTopic.teacherId)}
                  </strong>
                  <p className="m-0 mt-1 text-sm text-slate-500">
                    Đăng ký: {formatDate(myTopic.updatedAt)}
                  </p>
                </div>
              </div>
            </section>
          ) : (
            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-4 py-3">
                <h2 className="m-0 text-lg font-black">Đề tài còn trống</h2>
              </div>

              {isLoading ? (
                <div className="grid h-40 place-items-center px-4 py-6 text-center font-bold text-slate-500">
                  Đang tải danh sách đề tài...
                </div>
              ) : filteredTopics.length ? (
                <div className="divide-y divide-slate-200">
                  {filteredTopics.map((topic) => {
                    const topicId = getId(topic);
                    return (
                      <article
                        className="grid gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_280px_120px] xl:items-center"
                        key={topicId}
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex min-h-7 items-center rounded-full bg-emerald-100 px-3 text-xs font-black text-emerald-700">
                              Còn trống
                            </span>
                            <strong className="text-sm text-slate-500">
                              {topic.topicCode}
                            </strong>
                          </div>
                          <h3 className="m-0 mt-2 text-lg font-black leading-snug">
                            {topic.topicName}
                          </h3>
                        </div>
                        <label className="grid gap-2 text-sm font-bold text-slate-700">
                          <span>Giảng viên hướng dẫn</span>
                          <select
                            className={inputClass("bg-white")}
                            value={teacherSelections[topicId] || ""}
                            onChange={(event) =>
                              updateTeacherSelection(topicId, event.target.value)
                            }
                          >
                            <option value="">Chọn giảng viên</option>
                            {teachers.map((teacher) => (
                              <option value={getId(teacher)} key={getId(teacher)}>
                                {teacherText(teacher)}
                              </option>
                            ))}
                          </select>
                        </label>
                        <button
                          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 font-black text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                          type="button"
                          onClick={() => handleRegister(topic)}
                          disabled={isRegistering === topicId}
                        >
                          <Send size={17} />
                          <span>
                            {isRegistering === topicId ? "Đang gửi..." : "Đăng ký"}
                          </span>
                        </button>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="grid h-40 place-items-center px-4 py-6 text-center font-bold text-slate-500">
                  Không có đề tài còn trống phù hợp.
                </div>
              )}
            </section>
          )}
          </div>

          <aside className="grid h-fit gap-3">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center gap-2 text-blue-700">
                <BookOpenCheck size={19} />
                <strong>Quy trình</strong>
              </div>
              <div className="grid gap-3 text-sm leading-6 text-slate-600">
                <p className="m-0">1. Tìm đề tài còn trống.</p>
                <p className="m-0">2. Chọn giảng viên hướng dẫn.</p>
                <p className="m-0">3. Gửi đăng ký và theo dõi đề tài đã chọn.</p>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center gap-2 text-emerald-700">
                <UserRoundCheck size={19} />
                <strong>Giới hạn</strong>
              </div>
              <p className="m-0 text-sm leading-6 text-slate-600">
                Một sinh viên chỉ được đăng ký một đề tài. Sau khi đăng ký, danh
                sách đề tài còn trống sẽ bị khóa trên tài khoản này.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
