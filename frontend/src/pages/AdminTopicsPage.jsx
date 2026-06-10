import { useEffect, useMemo, useState } from "react";
import {
  Edit3,
  Filter,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import AdminSidebar from "../components/AdminSidebar.jsx";
import {
  createTopic,
  deleteTopic,
  listTopics,
  updateTopic,
} from "../lib/api.js";

const emptyForm = {
  topicCode: "",
  topicName: "",
};

function fullName(user) {
  return (
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    "Người dùng"
  );
}

function getId(record) {
  return record?._id || record?.id || "";
}

function formatDate(value) {
  if (!value) return "--";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function studentText(student) {
  if (!student) return "Chưa có sinh viên";
  return fullName(student.userId);
}

function teacherText(teacher) {
  if (!teacher) return "Chưa có giảng viên";
  return fullName(teacher.userId);
}

function Field({ label, children }) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-700">
      <span>{label}</span>
      {children}
    </label>
  );
}

function inputClass(extra = "") {
  return `min-h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-950 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 ${extra}`;
}

export default function AdminTopicsPage() {
  const [topics, setTopics] = useState([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const filteredTopics = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return topics.filter((topic) => {
      const hasStudent = Boolean(topic.studentId);
      const matchesStatus =
        !statusFilter ||
        (statusFilter === "available" && !hasStudent) ||
        (statusFilter === "assigned" && hasStudent);
      const matchesQuery =
        !normalizedQuery ||
        topic.topicCode?.toLowerCase().includes(normalizedQuery) ||
        topic.topicName?.toLowerCase().includes(normalizedQuery) ||
        studentText(topic.studentId).toLowerCase().includes(normalizedQuery) ||
        teacherText(topic.teacherId).toLowerCase().includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [query, statusFilter, topics]);

  const counts = useMemo(() => {
    return topics.reduce(
      (acc, topic) => {
        acc.total += 1;
        if (topic.studentId) acc.assigned += 1;
        else acc.available += 1;
        if (topic.teacherId) acc.supervised += 1;
        return acc;
      },
      { total: 0, available: 0, assigned: 0, supervised: 0 },
    );
  }, [topics]);

  async function loadData() {
    setIsLoading(true);
    setError("");

    try {
      setTopics(await listTopics());
    } catch (err) {
      setError(
        err.status === 403
          ? "Tài khoản hiện tại không có quyền admin."
          : err.message,
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openCreateModal() {
    setEditingTopic(null);
    setForm(emptyForm);
    setError("");
    setNotice("");
    setIsModalOpen(true);
  }

  function openEditModal(topic) {
    setEditingTopic(topic);
    setForm({
      topicCode: topic.topicCode || "",
      topicName: topic.topicName || "",
    });
    setError("");
    setNotice("");
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingTopic(null);
    setForm(emptyForm);
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setNotice("");

    const payload = {
      topicCode: form.topicCode.trim(),
      topicName: form.topicName.trim(),
    };

    try {
      if (editingTopic) {
        await updateTopic(getId(editingTopic), payload);
        setNotice("Đã cập nhật đề tài.");
      } else {
        await createTopic(payload);
        setNotice("Đã tạo đề tài.");
      }

      closeModal();
      await loadData();
    } catch (err) {
      if (err.status === 409) {
        setError("Mã đề tài hoặc sinh viên đã được sử dụng.");
      } else {
        setError(err.message || "Không thể lưu đề tài.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(topic) {
    if (!window.confirm(`Xóa đề tài ${topic.topicCode}?`)) return;

    setError("");
    setNotice("");

    try {
      await deleteTopic(getId(topic));
      setNotice("Đã xóa đề tài.");
      await loadData();
    } catch (err) {
      setError(err.message || "Không thể xóa đề tài.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950 lg:grid lg:grid-cols-[276px_minmax(0,1fr)]">
      <AdminSidebar />

      <section className="min-w-0 p-5 lg:p-7">
        <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="m-0 text-xs font-black uppercase text-blue-600">
              Admin
            </p>
            <h1 className="m-0 mt-1 text-3xl font-black leading-tight">
              Quản lý đề tài
            </h1>
            <p className="m-0 mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Tạo và cập nhật danh mục đề tài. Sinh viên sẽ đăng ký đề tài và
              chọn giảng viên hướng dẫn ở luồng riêng.
            </p>
          </div>
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 font-black text-white hover:bg-blue-700 disabled:opacity-60"
            type="button"
            onClick={openCreateModal}
          >
            <Plus size={18} />
            <span>Tạo đề tài</span>
          </button>
        </header>

        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ["Tổng đề tài", counts.total],
            ["Còn trống", counts.available],
            ["Đã có sinh viên", counts.assigned],
            ["Có GVHD", counts.supervised],
          ].map(([label, value]) => (
            <div
              className="grid min-h-24 content-center gap-2 rounded-lg border border-slate-200 bg-white p-4"
              key={label}
            >
              <span className="text-sm font-bold text-slate-500">{label}</span>
              <strong className="text-3xl leading-none">{value}</strong>
            </div>
          ))}
        </div>

        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
            <label className="flex min-h-11 w-full items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-500 md:max-w-md">
              <Search size={18} />
              <input
                className="min-w-0 flex-1 bg-transparent text-slate-950 outline-none"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm theo mã, tên, sinh viên, giảng viên"
              />
            </label>
            <label className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-500 md:min-w-48">
              <Filter size={18} />
              <select
                className="min-w-0 flex-1 bg-transparent text-slate-950 outline-none"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="available">Còn trống</option>
                <option value="assigned">Đã có sinh viên</option>
              </select>
            </label>
          </div>

          {notice ? (
            <div className="mx-4 mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
              {notice}
            </div>
          ) : null}
          {error ? (
            <div className="mx-4 mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
              {error}
            </div>
          ) : null}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] border-collapse">
              <thead>
                <tr className="bg-slate-50 text-left text-[11px] font-black uppercase text-slate-500">
                  <th className="border-b border-slate-200 px-4 py-3">
                    Đề tài
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3">
                    Trạng thái
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3">
                    Sinh viên
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3">
                    GVHD
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3">
                    Ngày tạo
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="h-36 px-4 py-6 text-center font-bold text-slate-500"
                    >
                      Đang tải danh sách đề tài...
                    </td>
                  </tr>
                ) : filteredTopics.length ? (
                  filteredTopics.map((topic) => {
                    const isAssigned = Boolean(topic.studentId);
                    return (
                      <tr
                        className="border-b border-slate-200 last:border-b-0"
                        key={getId(topic)}
                      >
                        <td className="px-4 py-3">
                          <strong className="block text-sm">
                            {topic.topicCode}
                          </strong>
                          <span className="mt-1 block max-w-md text-sm leading-6 text-slate-600">
                            {topic.topicName}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex min-h-7 items-center rounded-full px-3 text-xs font-black ${
                              isAssigned
                                ? "bg-blue-100 text-blue-700"
                                : "bg-emerald-100 text-emerald-700"
                            }`}
                          >
                            {isAssigned ? "Đã có sinh viên" : "Còn trống"}
                          </span>
                        </td>
                        <td className="max-w-56 px-4 py-3 text-sm leading-6 text-slate-600">
                          {studentText(topic.studentId)}
                        </td>
                        <td className="max-w-56 px-4 py-3 text-sm leading-6 text-slate-600">
                          {teacherText(topic.teacherId)}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {formatDate(topic.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-950"
                              type="button"
                              onClick={() => openEditModal(topic)}
                              aria-label="Sửa đề tài"
                              title="Sửa đề tài"
                            >
                              <Edit3 size={17} />
                            </button>
                            <button
                              className="grid size-8 place-items-center rounded-lg text-red-600 hover:bg-red-50"
                              type="button"
                              onClick={() => handleDelete(topic)}
                              aria-label="Xóa đề tài"
                              title="Xóa đề tài"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="h-36 px-4 py-6 text-center font-bold text-slate-500"
                    >
                      Không có đề tài phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>

      {isModalOpen ? (
        <div
          className="fixed inset-0 z-20 grid place-items-center bg-slate-950/45 p-5"
          role="presentation"
        >
          <form
            className="max-h-[calc(100vh-40px)] w-full max-w-2xl overflow-auto rounded-lg border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-950/20"
            onSubmit={handleSubmit}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="m-0 text-xs font-black uppercase text-blue-600">
                  {editingTopic ? "Cập nhật" : "Tạo mới"}
                </p>
                <h2 className="m-0 mt-1 text-2xl font-black">
                  {editingTopic ? "Sửa đề tài" : "Tạo đề tài"}
                </h2>
              </div>
              <button
                className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-950"
                type="button"
                onClick={closeModal}
                aria-label="Đóng"
                title="Đóng"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-[0.7fr_1.3fr]">
              <Field label="Mã đề tài">
                <input
                  className={inputClass()}
                  value={form.topicCode}
                  onChange={(event) =>
                    updateField("topicCode", event.target.value)
                  }
                  required
                />
              </Field>
              <Field label="Tên đề tài">
                <input
                  className={inputClass()}
                  value={form.topicName}
                  onChange={(event) =>
                    updateField("topicName", event.target.value)
                  }
                  required
                />
              </Field>
            </div>

            {error ? (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
                {error}
              </div>
            ) : null}

            <div className="mt-6 grid gap-3 sm:grid-cols-[0.7fr_1.3fr]">
              <button
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 font-black text-slate-700 hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                onClick={closeModal}
                disabled={isSaving}
              >
                Hủy
              </button>
              <button
                className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-4 font-black text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={isSaving}
              >
                {isSaving ? "Đang lưu..." : "Lưu đề tài"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  );
}
