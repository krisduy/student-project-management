import { useEffect, useMemo, useState } from "react";
import { Edit3, Filter, Plus, Search, Trash2, X } from "lucide-react";
import AdminSidebar from "../components/AdminSidebar.jsx";
import {
  createUser,
  deleteUser,
  listTeachers,
  updateTeacher,
  updateUser,
} from "../lib/api.js";

const degrees = ["Thạc sĩ", "Tiến sĩ", "Phó giáo sư", "Giáo sư"];

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  degree: "Thạc sĩ",
};

function getId(record) {
  return record?._id || record?.id || "";
}

function fullName(user) {
  return (
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.email ||
    "Giảng viên"
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

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [query, setQuery] = useState("");
  const [degreeFilter, setDegreeFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const filteredTeachers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return teachers.filter((teacher) => {
      const user = teacher.userId;
      const matchesDegree = !degreeFilter || teacher.degree === degreeFilter;
      const matchesQuery =
        !normalizedQuery ||
        fullName(user).toLowerCase().includes(normalizedQuery) ||
        user?.email?.toLowerCase().includes(normalizedQuery) ||
        teacher.degree?.toLowerCase().includes(normalizedQuery);

      return matchesDegree && matchesQuery;
    });
  }, [degreeFilter, query, teachers]);

  const counts = useMemo(() => {
    return teachers.reduce(
      (acc, teacher) => {
        acc.total += 1;
        acc.degrees.add(teacher.degree);
        if (teacher.degree?.includes("Tiến sĩ")) acc.doctors += 1;
        return acc;
      },
      { total: 0, degrees: new Set(), doctors: 0 },
    );
  }, [teachers]);

  async function loadTeachers() {
    setIsLoading(true);
    setError("");

    try {
      setTeachers(await listTeachers());
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
    loadTeachers();
  }, []);

  function openCreateModal() {
    setEditingTeacher(null);
    setForm(emptyForm);
    setError("");
    setNotice("");
    setIsModalOpen(true);
  }

  function openEditModal(teacher) {
    const user = teacher.userId || {};
    setEditingTeacher(teacher);
    setForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      password: "",
      degree: teacher.degree || "Thạc sĩ",
    });
    setError("");
    setNotice("");
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingTeacher(null);
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
      if (editingTeacher) {
        await updateUser(getId(editingTeacher.userId), {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          role: "teacher",
        });
        await updateTeacher(getId(editingTeacher), {
          userId: getId(editingTeacher.userId),
          degree: form.degree,
        });
        setNotice("Đã cập nhật giảng viên.");
      } else {
        await createUser({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          password: form.password,
          role: "teacher",
          teacher: {
            degree: form.degree,
          },
        });
        setNotice("Đã tạo giảng viên.");
      }

      closeModal();
      await loadTeachers();
    } catch (err) {
      setError(err.status === 409 ? "Email này đã tồn tại." : err.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(teacher) {
    const user = teacher.userId;
    if (!window.confirm(`Xóa giảng viên ${fullName(user)}?`)) return;

    setError("");
    setNotice("");

    try {
      await deleteUser(getId(user));
      setNotice("Đã xóa giảng viên.");
      await loadTeachers();
    } catch (err) {
      setError(err.message || "Không thể xóa giảng viên.");
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
              Quản lý giảng viên
            </h1>
            <p className="m-0 mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Tạo tài khoản giảng viên và cập nhật hồ sơ học vị.
            </p>
          </div>
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 font-black text-white hover:bg-blue-700 disabled:opacity-60"
            type="button"
            onClick={openCreateModal}
          >
            <Plus size={18} />
            <span>Tạo giảng viên</span>
          </button>
        </header>

        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-3">
          {[
            ["Tổng giảng viên", counts.total],
            ["Số học vị", counts.degrees.size],
            ["Tiến sĩ", counts.doctors],
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
                placeholder="Tìm theo tên, email hoặc học vị"
              />
            </label>
            <label className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-500 md:min-w-48">
              <Filter size={18} />
              <select
                className="min-w-0 flex-1 bg-transparent text-slate-950 outline-none"
                value={degreeFilter}
                onChange={(event) => setDegreeFilter(event.target.value)}
              >
                <option value="">Tất cả học vị</option>
                {degrees.map((item) => (
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
            <table className="w-full min-w-[820px] border-collapse">
              <thead>
                <tr className="bg-slate-50 text-left text-[11px] font-black uppercase text-slate-500">
                  <th className="border-b border-slate-200 px-4 py-3">
                    Giảng viên
                  </th>
                  <th className="border-b border-slate-200 px-4 py-3">
                    Học vị
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
                      colSpan="4"
                      className="h-36 px-4 py-6 text-center font-bold text-slate-500"
                    >
                      Đang tải danh sách giảng viên...
                    </td>
                  </tr>
                ) : filteredTeachers.length ? (
                  filteredTeachers.map((teacher) => (
                    <tr
                      className="border-b border-slate-200 last:border-b-0"
                      key={getId(teacher)}
                    >
                      <td className="px-4 py-3">
                        <strong className="block text-sm">
                          {fullName(teacher.userId)}
                        </strong>
                        <span className="mt-1 block text-xs text-slate-500">
                          {teacher.userId?.email}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex min-h-7 items-center rounded-full bg-blue-100 px-3 text-xs font-black text-blue-700">
                          {teacher.degree}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {formatDate(teacher.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-950"
                            type="button"
                            onClick={() => openEditModal(teacher)}
                            aria-label="Sửa giảng viên"
                            title="Sửa giảng viên"
                          >
                            <Edit3 size={17} />
                          </button>
                          <button
                            className="grid size-8 place-items-center rounded-lg text-red-600 hover:bg-red-50"
                            type="button"
                            onClick={() => handleDelete(teacher)}
                            aria-label="Xóa giảng viên"
                            title="Xóa giảng viên"
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
                      colSpan="4"
                      className="h-36 px-4 py-6 text-center font-bold text-slate-500"
                    >
                      Không có giảng viên phù hợp.
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
                  {editingTeacher ? "Cập nhật" : "Tạo mới"}
                </p>
                <h2 className="m-0 mt-1 text-2xl font-black">
                  {editingTeacher ? "Sửa giảng viên" : "Tạo giảng viên"}
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

              {!editingTeacher ? (
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

              <Field label="Học vị">
                <select
                  className={inputClass()}
                  value={form.degree}
                  onChange={(event) =>
                    updateField("degree", event.target.value)
                  }
                  required
                >
                  {degrees.map((item) => (
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
                {isSaving ? "Đang lưu..." : "Lưu giảng viên"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  );
}
