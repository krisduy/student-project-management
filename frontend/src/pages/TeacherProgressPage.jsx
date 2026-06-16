import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle,
  Circle,
  Clock,
  Loader,
  MessageSquareText,
  Milestone,
  Pencil,
  Plus,
  Telescope,
  X,
} from "lucide-react";
import TeacherSidebar from "../components/TeacherSidebar.jsx";
import {
  createProgress,
  getMySupervisingTopics,
  getProgressesByTeacher,
  updateProgress,
} from "../lib/api.js";
import { getSession } from "../lib/session.js";

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
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function inputClass(extra = "") {
  return `min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 ${extra}`;
}

function labelClass() {
  return "text-sm font-bold text-slate-700";
}

const milestoneOptions = [
  { value: "Nộp đề cương", label: "Nộp đề cương" },
  { value: "Báo cáo giữa kỳ", label: "Báo cáo giữa kỳ" },
  { value: "Báo cáo cuối kỳ", label: "Báo cáo cuối kỳ" },
  { value: "Hoàn thành", label: "Hoàn thành" },
];

function ProgressForm({
  topics,
  initialData,
  onSave,
  onCancel,
  isSaving,
}) {
  const [topicId, setTopicId] = useState(initialData?.topicId?._id || initialData?.topicId || "");
  const [milestone, setMilestone] = useState(initialData?.milestone || "");
  const [comment, setComment] = useState(initialData?.teacherComment || "");
  const isEditing = Boolean(initialData?._id);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!topicId || !milestone) return;
    await onSave({ topicId, milestone, teacherComment: comment }, initialData?._id);
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <label className={labelClass()}>Đề tài</label>
        {isEditing ? (
          <input
            className={inputClass("bg-slate-100")}
            value={
              topics.find(
                (t) =>
                  (t._id || t.id) ===
                  (initialData?.topicId?._id || initialData?.topicId),
              )?.topicName || ""
            }
            disabled
          />
        ) : (
          <select
            className={inputClass("bg-white")}
            value={topicId}
            onChange={(e) => setTopicId(e.target.value)}
          >
            <option value="">Chọn đề tài</option>
            {topics.map((topic) => (
              <option value={topic._id || topic.id} key={topic._id || topic.id}>
                {topic.topicCode} — {topic.topicName}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid gap-2">
        <label className={labelClass()}>Mốc tiến độ</label>
        <select
          className={inputClass("bg-white")}
          value={milestone}
          onChange={(e) => setMilestone(e.target.value)}
        >
          <option value="">Chọn mốc</option>
          {milestoneOptions.map((opt) => (
            <option value={opt.value} key={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <label className={labelClass()}>Nhận xét</label>
        <textarea
          className={inputClass("min-h-24 resize-y py-3 leading-6")}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Nhập nhận xét về tiến độ..."
        />
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 font-black text-slate-600 hover:bg-slate-50"
          type="button"
          onClick={onCancel}
          disabled={isSaving}
        >
          <X size={17} />
          <span>Hủy</span>
        </button>
        <button
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 font-black text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={isSaving || !topicId || !milestone}
        >
          {isSaving ? (
            <Loader size={17} className="animate-spin" />
          ) : (
            <CheckCircle size={17} />
          )}
          <span>{isSaving ? "Đang lưu..." : isEditing ? "Cập nhật" : "Thêm mới"}</span>
        </button>
      </div>
    </form>
  );
}

export default function TeacherProgressPage() {
  const session = getSession();
  const teacherId = session?.user?.teacherId;

  const [topics, setTopics] = useState([]);
  const [progresses, setProgresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProgress, setEditingProgress] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("");

  const filteredProgresses = useMemo(() => {
    if (!selectedTopic) return progresses;
    return progresses.filter((p) => {
      const pid = p.topicId?._id || p.topicId;
      return pid === selectedTopic;
    });
  }, [progresses, selectedTopic]);

  const groupedProgresses = useMemo(() => {
    const map = {};
    for (const p of filteredProgresses) {
      const tid = p.topicId?._id || p.topicId;
      if (!map[tid]) {
        const topic = topics.find(
          (t) => (t._id || t.id) === tid,
        );
        map[tid] = { topic, entries: [] };
      }
      map[tid].entries.push(p);
    }
    return Object.values(map);
  }, [filteredProgresses, topics]);

  async function loadData() {
    if (!teacherId) return;
    setIsLoading(true);
    setError("");

    try {
      const [topicList, progressList] = await Promise.all([
        getMySupervisingTopics(),
        getProgressesByTeacher(teacherId),
      ]);
      setTopics(topicList);
      setProgresses(progressList);
    } catch (err) {
      if (err.status !== 404) {
        setError(err.message || "Không thể tải dữ liệu.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [teacherId]);

  async function handleSave(data, progressId) {
    setIsSaving(true);
    setError("");
    setNotice("");

    try {
      if (progressId) {
        const updated = await updateProgress(progressId, {
          milestone: data.milestone,
          teacherComment: data.teacherComment,
        });
        setProgresses((current) =>
          current.map((p) =>
            (p._id || p.id) === progressId ? updated : p,
          ),
        );
        setNotice("Cập nhật tiến độ thành công.");
      } else {
        const created = await createProgress(data);
        setProgresses((current) => [...current, created]);
        setNotice("Thêm tiến độ thành công.");
      }
      setShowForm(false);
      setEditingProgress(null);
    } catch (err) {
      setError(err.message || "Không thể lưu dữ liệu.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleEdit(progress) {
    setEditingProgress(progress);
    setShowForm(true);
  }

  function openCreateForm() {
    setEditingProgress(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingProgress(null);
  }

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
              Theo dõi tiến độ
            </h1>
            <p className="m-0 mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Quản lý và cập nhật tiến độ thực hiện đề tài của sinh viên.
            </p>
          </div>
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 font-black text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            onClick={openCreateForm}
            disabled={!topics.length}
          >
            <Plus size={17} />
            <span>Thêm tiến độ</span>
          </button>
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

        {showForm ? (
          <section className="mb-5 rounded-lg border border-slate-200 bg-white p-5">
            <h2 className="m-0 mb-4 text-lg font-black">
              {editingProgress ? "Cập nhật tiến độ" : "Thêm tiến độ mới"}
            </h2>
            <ProgressForm
              topics={topics}
              initialData={editingProgress}
              onSave={handleSave}
              onCancel={closeForm}
              isSaving={isSaving}
            />
          </section>
        ) : null}

        {topics.length > 0 && !showForm ? (
          <div className="mb-4">
            <label className="flex min-h-11 w-full max-w-xs items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-slate-500">
              <Telescope size={18} />
              <select
                className="min-w-0 flex-1 bg-transparent text-slate-950 outline-none"
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
              >
                <option value="">Tất cả đề tài</option>
                {topics.map((topic) => (
                  <option
                    value={topic._id || topic.id}
                    key={topic._id || topic.id}
                  >
                    {topic.topicCode} — {topic.topicName}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : null}

        {isLoading ? (
          <div className="grid h-40 place-items-center rounded-lg border border-slate-200 bg-white text-center font-bold text-slate-500">
            Đang tải dữ liệu...
          </div>
        ) : groupedProgresses.length ? (
          <div className="grid gap-4">
            {groupedProgresses.map(({ topic, entries }) => (
              <section
                className="overflow-hidden rounded-lg border border-slate-200 bg-white"
                key={topic?._id || topic?.id || "unknown"}
              >
                <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
                  <div className="grid size-10 place-items-center rounded-lg bg-blue-100 text-blue-700">
                    <Milestone size={20} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="m-0 text-lg font-black">
                      {topic?.topicCode || "Đề tài"}
                    </h2>
                    <p className="m-0 truncate text-sm text-slate-500">
                      {topic?.topicName}
                      {topic?.studentId?.userId
                        ? ` — ${fullName(topic.studentId.userId)}`
                        : ""}
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-slate-100">
                  {entries.map((entry) => (
                    <div
                      className="grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:items-start"
                      key={entry._id || entry.id}
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {entry.milestone === "Hoàn thành" ? (
                            <span className="inline-flex min-h-7 items-center gap-1.5 rounded-full bg-emerald-100 px-3 text-xs font-black text-emerald-700">
                              <CheckCircle size={13} />
                              {entry.milestone}
                            </span>
                          ) : (
                            <span className="inline-flex min-h-7 items-center gap-1.5 rounded-full bg-amber-100 px-3 text-xs font-black text-amber-700">
                              <Clock size={13} />
                              {entry.milestone || "Chưa có mốc"}
                            </span>
                          )}
                          <span className="text-xs text-slate-400">
                            {formatDate(entry.createdAt)}
                          </span>
                        </div>
                        {entry.teacherComment ? (
                          <div className="mt-3 flex items-start gap-2 text-sm leading-6 text-slate-600">
                            <MessageSquareText
                              size={15}
                              className="mt-1 shrink-0 text-slate-400"
                            />
                            <span>{entry.teacherComment}</span>
                          </div>
                        ) : (
                          <p className="m-0 mt-3 text-sm italic text-slate-400">
                            Chưa có nhận xét.
                          </p>
                        )}
                      </div>
                      <button
                        className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 text-sm font-black text-slate-600 hover:bg-slate-50"
                        type="button"
                        onClick={() => handleEdit(entry)}
                      >
                        <Pencil size={14} />
                        <span>Sửa</span>
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="grid h-40 place-items-center rounded-lg border border-slate-200 bg-white text-center font-bold text-slate-500">
            <div className="flex flex-col items-center gap-2">
              <Telescope size={32} className="text-slate-300" />
              <span>
                {progresses.length === 0
                  ? "Chưa có tiến độ nào. Hãy thêm tiến độ mới."
                  : "Không có tiến độ phù hợp."}
              </span>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
