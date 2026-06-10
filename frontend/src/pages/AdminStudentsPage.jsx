import { useEffect, useMemo, useState } from "react";
import { Edit3, Filter, Plus, Search, Trash2, X } from "lucide-react";
import AdminSidebar from "../components/AdminSidebar.jsx";
import {
  createUser,
  deleteUser,
  listStudents,
  updateStudent,
  updateUser,
} from "../lib/api.js";

const classes = [
  "CNTT21A",
  "CNTT21B",
  "HTTT21A",
  "HTTT21B",
  "KTPM21A",
  "KTPM21B",
];
const majors = [
  "Công nghệ thông tin",
  "Hệ thống thông tin",
  "Kỹ thuật phần mềm",
  "Trí tuệ nhân tạo",
  "An toàn thông tin",
];

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  class: "CNTT21A",
  major: "Công nghệ thông tin",
};

function getId(record) {
  return record?._id || record?.id || "";
}

function fullName(user) {
  return (
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    "Sinh viên"
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

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [query, setQuery] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const filteredStudents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return students.filter((student) => {
      const user = student.userId;
      const matchesClass = !classFilter || student.class === classFilter;
      const matchesQuery =
        !normalizedQuery ||
        fullName(user).toLowerCase().includes(normalizedQuery) ||
        user?.email?.toLowerCase().includes(normalizedQuery) ||
        student.major?.toLowerCase().includes(normalizedQuery);

      return matchesClass && matchesQuery;
    });
  }, [classFilter, query, students]);

  const counts = useMemo(() => {
    return students.reduce(
      (acc, student) => {
        acc.total += 1;
        acc.classes.add(student.class);
        acc.majors.add(student.major);
        return acc;
      },
      { total: 0, classes: new Set(), majors: new Set() },
    );
  }, [students]);

  async function loadStudents() {
    setIsLoading(true);
    setError("");

    try {
      setStudents(await listStudents());
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
    loadStudents();
  }, []);

  function openCreateModal() {
    setEditingStudent(null);
    setForm(emptyForm);
    setError("");
    setNotice("");
    setIsModalOpen(true);
  }

  function openEditModal(student) {
    const user = student.userId || {};
    setEditingStudent(student);
    setForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      password: "",
      class: student.class || "CNTT21A",
      major: student.major || "Công nghệ thông tin",
    });
    setError("");
    setNotice("");
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingStudent(null);
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

    try {
      if (editingStudent) {
        await updateUser(getId(editingStudent.userId), {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          role: "student",
        });
        await updateStudent(getId(editingStudent), {
          userId: getId(editingStudent.userId),
          class: form.class,
          major: form.major,
        });
        setNotice("Đã cập nhật sinh viên.");
      } else {
        await createUser({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          password: form.password,
          role: "student",
          student: {
            class: form.class,
            major: form.major,
          },
        });
        setNotice("Đã tạo sinh viên.");
      }

      closeModal();
      await loadStudents();
    } catch (err) {
      setError(err.status === 409 ? "Email này đã tồn tại." : err.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(student) {
    const user = student.userId;
    if (!window.confirm(`Xóa sinh viên ${fullName(user)}?`)) return;

    setError("");
    setNotice("");

    try {
      await deleteUser(getId(user));
      setNotice("Đã xóa sinh viên.");
      await loadStudents();
    } catch (err) {
      setError(err.message || "Không thể xóa sinh viên.");
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
              Quản lý sinh viên
            </h1>
            <p className="m-0 mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Tạo tài khoản sinh viên và cập nhật hồ sơ lớp, ngành.
            </p>
          </div>
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 font-black text-white hover:bg-blue-700 disabled:opacity-60"
            type="button"
            onClick={openCreateModal}
          >
            <Plus size={18} />
            <span>Tạo sinh viên</span>
          </button>
        </header>

        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
          {[
            ["Tổng sinh viên", counts.total],
            ["Số lớp", counts.classes.size],
            ["Số ngành", counts.majors.size],
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
                placeholder="Tìm theo tên, email hoặc ngành"
              />
            </label>
            <label className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-500 md:min-w-48">
              <Filter size={18} />
              <select
                className="min-w-0 flex-1 bg-transparent text-slate-950 outline-none"
                value={classFilter}
                onChange={(event) => setClassFilter(event.target.value)}
              >
                <option value="">Tất cả lớp</option>
                {classes.map((item) => (
                  <option value={item} key={item}>
                    {item}
                  </option>
                ))}
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
            <table className="w-full min-w-[900px] border-collapse">
              <thead>
                <tr className="bg-slate-50 text-left text-[11px] font-black uppercase text-slate-500">
                  <th className="border-b border-slate-200 px-4 py-3">
                    Sinh viên
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3">Lớp</th>
                  <th className="border-b border-slate-200 px-4 py-3">Ngành</th>
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
                      colSpan="5"
                      className="h-36 px-4 py-6 text-center font-bold text-slate-500"
                    >
                      Đang tải danh sách sinh viên...
                    </td>
                  </tr>
                ) : filteredStudents.length ? (
                  filteredStudents.map((student) => (
                    <tr
                      className="border-b border-slate-200 last:border-b-0"
                      key={getId(student)}
                    >
                      <td className="px-4 py-3">
                        <strong className="block text-sm">
                          {fullName(student.userId)}
                        </strong>
                        <span className="mt-1 block text-xs text-slate-500">
                          {student.userId?.email}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-slate-700">
                        {student.class}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {student.major}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {formatDate(student.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-950"
                            type="button"
                            onClick={() => openEditModal(student)}
                            aria-label="Sửa sinh viên"
                            title="Sửa sinh viên"
                          >
                            <Edit3 size={17} />
                          </button>
                          <button
                            className="grid size-8 place-items-center rounded-lg text-red-600 hover:bg-red-50"
                            type="button"
                            onClick={() => handleDelete(student)}
                            aria-label="Xóa sinh viên"
                            title="Xóa sinh viên"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="h-36 px-4 py-6 text-center font-bold text-slate-500"
                    >
                      Không có sinh viên phù hợp.
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
            className="max-h-[calc(100vh-40px)] w-full max-w-xl overflow-auto rounded-lg border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-950/20"
            onSubmit={handleSubmit}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="m-0 text-xs font-black uppercase text-blue-600">
                  {editingStudent ? "Cập nhật" : "Tạo mới"}
                </p>
                <h2 className="m-0 mt-1 text-2xl font-black">
                  {editingStudent ? "Sửa sinh viên" : "Tạo sinh viên"}
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

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Họ">
                <input
                  className={inputClass()}
                  value={form.firstName}
                  onChange={(event) =>
                    updateField("firstName", event.target.value)
                  }
                  required
                />
              </Field>
              <Field label="Tên">
                <input
                  className={inputClass()}
                  value={form.lastName}
                  onChange={(event) =>
                    updateField("lastName", event.target.value)
                  }
                  required
                />
              </Field>
            </div>

            <div className="mt-4 grid gap-4">
              <Field label="Email">
                <input
                  className={inputClass()}
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  required
                />
              </Field>

              {!editingStudent ? (
                <Field label="Mật khẩu">
                  <input
                    className={inputClass()}
                    type="password"
                    value={form.password}
                    onChange={(event) =>
                      updateField("password", event.target.value)
                    }
                    minLength={6}
                    required
                  />
                </Field>
              ) : null}
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Field label="Lớp">
                <select
                  className={inputClass()}
                  value={form.class}
                  onChange={(event) => updateField("class", event.target.value)}
                  required
                >
                  {classes.map((item) => (
                    <option value={item} key={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Ngành">
                <select
                  className={inputClass()}
                  value={form.major}
                  onChange={(event) => updateField("major", event.target.value)}
                  required
                >
                  {majors.map((item) => (
                    <option value={item} key={item}>
                      {item}
                    </option>
                  ))}
                </select>
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
                {isSaving ? "Đang lưu..." : "Lưu sinh viên"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  );
}
