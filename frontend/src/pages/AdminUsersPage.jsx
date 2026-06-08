import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Edit3,
  Filter,
  GraduationCap,
  LogOut,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { createUser, deleteUser, listUsers, updateUser } from "../lib/api.js";
import { clearSession, getSession } from "../lib/session.js";

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  role: "student",
  studentClass: "CNTT21A",
  studentMajor: "Công nghệ thông tin",
  teacherDegree: "Thạc sĩ",
};

const roleMeta = {
  admin: {
    label: "Admin",
    badge: "bg-red-100 text-red-700",
  },
  teacher: {
    label: "Giảng viên",
    badge: "bg-blue-100 text-blue-700",
  },
  student: {
    label: "Sinh viên",
    badge: "bg-emerald-100 text-emerald-700",
  },
};

const classes = ["CNTT21A", "CNTT21B", "HTTT21A", "HTTT21B", "KTPM21A", "KTPM21B"];
const majors = ["Công nghệ thông tin", "Hệ thống thông tin", "Kỹ thuật phần mềm", "Trí tuệ nhân tạo", "An toàn thông tin"];
const degrees = ["Thạc sĩ", "Tiến sĩ", "Phó giáo sư", "Giáo sư"];

function fullName(user) {
  return [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "Người dùng";
}

function initials(user) {
  return [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "U";
}

function formatDate(value) {
  if (!value) return "--";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function profileText(user) {
  if (user.role === "student") {
    return [user.profile?.class, user.profile?.major].filter(Boolean).join(" - ") || "Chưa có hồ sơ sinh viên";
  }

  if (user.role === "teacher") {
    return user.profile?.degree || "Chưa có hồ sơ giảng viên";
  }

  return "--";
}

function Avatar({ user }) {
  return (
    <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-blue-600 to-emerald-600 text-xs font-black text-white">
      {initials(user)}
    </div>
  );
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

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const session = getSession();
  const currentUser = session?.user;
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [isSaving, setIsSaving] = useState(false);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return users.filter((user) => {
      const matchesRole = !roleFilter || user.role === roleFilter;
      const matchesQuery =
        !normalizedQuery ||
        fullName(user).toLowerCase().includes(normalizedQuery) ||
        user.email.toLowerCase().includes(normalizedQuery);

      return matchesRole && matchesQuery;
    });
  }, [query, roleFilter, users]);

  const counts = useMemo(() => {
    return users.reduce(
      (acc, user) => {
        acc.total += 1;
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      },
      { total: 0, admin: 0, teacher: 0, student: 0 },
    );
  }, [users]);

  async function loadUsers() {
    setIsLoading(true);
    setError("");

    try {
      setUsers(await listUsers());
    } catch (err) {
      setError(err.status === 403 ? "Tài khoản hiện tại không có quyền admin." : err.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function handleLogout() {
    clearSession();
    navigate("/login", { replace: true });
  }

  function openCreateModal() {
    setEditingUser(null);
    setForm(emptyForm);
    setError("");
    setNotice("");
    setIsModalOpen(true);
  }

  function openEditModal(user) {
    setEditingUser(user);
    setForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      password: "",
      role: user.role,
      studentClass: user.profile?.class || "CNTT21A",
      studentMajor: user.profile?.major || "Công nghệ thông tin",
      teacherDegree: user.profile?.degree || "Thạc sĩ",
    });
    setError("");
    setNotice("");
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setEditingUser(null);
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
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      role: form.role,
    };

    try {
      if (editingUser) {
        await updateUser(editingUser.id, payload);
        setNotice("Đã cập nhật tài khoản.");
      } else {
        const profilePayload = {};
        if (form.role === "student") {
          profilePayload.student = {
            class: form.studentClass,
            major: form.studentMajor,
          };
        }
        if (form.role === "teacher") {
          profilePayload.teacher = {
            degree: form.teacherDegree,
          };
        }

        await createUser({ ...payload, ...profilePayload, password: form.password });
        setNotice("Đã tạo tài khoản.");
      }

      closeModal();
      await loadUsers();
    } catch (err) {
      if (err.status === 409) {
        setError("Email này đã tồn tại.");
      } else {
        setError(err.message || "Không thể lưu tài khoản.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(user) {
    if (user.id === currentUser?.id) {
      setError("Không thể xóa tài khoản đang đăng nhập.");
      return;
    }

    if (!window.confirm(`Xóa tài khoản ${user.email}?`)) return;

    setError("");
    setNotice("");

    try {
      await deleteUser(user.id);
      setNotice("Đã xóa tài khoản.");
      await loadUsers();
    } catch (err) {
      setError(err.message || "Không thể xóa tài khoản.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950 lg:grid lg:grid-cols-[276px_minmax(0,1fr)]">
      <aside className="flex min-h-full flex-col gap-6 border-b border-slate-200 bg-white p-5 lg:min-h-screen lg:border-b-0 lg:border-r lg:p-6">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-5">
          <div className="grid size-12 place-items-center rounded-lg bg-gradient-to-br from-blue-600 to-emerald-600 text-white shadow-lg shadow-blue-200">
            <GraduationCap size={24} strokeWidth={2.4} />
          </div>
          <div>
            <p className="m-0 text-2xl font-black">FBU</p>
            <p className="m-0 text-xs text-slate-500">Project System</p>
          </div>
        </div>

        <nav className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
          <button className="flex min-h-11 items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 px-3 text-left font-black text-blue-700" type="button">
            <UserCog size={18} />
            <span>Tài khoản</span>
          </button>
          <button className="flex min-h-11 cursor-not-allowed items-center gap-3 rounded-lg border border-transparent px-3 text-left font-black text-slate-400" type="button" disabled>
            <Users size={18} />
            <span>Sinh viên</span>
          </button>
          <button className="flex min-h-11 cursor-not-allowed items-center gap-3 rounded-lg border border-transparent px-3 text-left font-black text-slate-400" type="button" disabled>
            <ShieldCheck size={18} />
            <span>Giảng viên</span>
          </button>
        </nav>

        <div className="mt-auto grid grid-cols-[40px_minmax(0,1fr)_34px] items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <Avatar user={currentUser} />
          <div className="min-w-0">
            <strong className="block truncate text-sm">{fullName(currentUser)}</strong>
            <span className="block truncate text-xs text-slate-500">Quản trị viên</span>
          </div>
          <button className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-950" type="button" onClick={handleLogout} aria-label="Đăng xuất" title="Đăng xuất">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <section className="min-w-0 p-5 lg:p-7">
        <header className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="m-0 text-xs font-black uppercase text-blue-600">Admin</p>
            <h1 className="m-0 mt-1 text-3xl font-black leading-tight">Quản lý người dùng</h1>
            <p className="m-0 mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Tạo tài khoản đăng nhập và hồ sơ liên kết cho admin, giảng viên và sinh viên.
            </p>
          </div>
          <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 font-black text-white hover:bg-blue-700 disabled:opacity-60" type="button" onClick={openCreateModal}>
            <Plus size={18} />
            <span>Tạo tài khoản</span>
          </button>
        </header>

        <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ["Tổng tài khoản", counts.total],
            ["Admin", counts.admin],
            ["Giảng viên", counts.teacher],
            ["Sinh viên", counts.student],
          ].map(([label, value]) => (
            <div className="grid min-h-24 content-center gap-2 rounded-lg border border-slate-200 bg-white p-4" key={label}>
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
                placeholder="Tìm theo tên hoặc email"
              />
            </label>
            <label className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-500 md:min-w-48">
              <Filter size={18} />
              <select className="min-w-0 flex-1 bg-transparent text-slate-950 outline-none" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
                <option value="">Tất cả vai trò</option>
                <option value="admin">Admin</option>
                <option value="teacher">Giảng viên</option>
                <option value="student">Sinh viên</option>
              </select>
            </label>
          </div>

          {notice ? <div className="mx-4 mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">{notice}</div> : null}
          {error ? <div className="mx-4 mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</div> : null}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse">
              <thead>
                <tr className="bg-slate-50 text-left text-[11px] font-black uppercase text-slate-500">
                  <th className="border-b border-slate-200 px-4 py-3">Người dùng</th>
                  <th className="border-b border-slate-200 px-4 py-3">Vai trò</th>
                  <th className="border-b border-slate-200 px-4 py-3">Hồ sơ</th>
                  <th className="border-b border-slate-200 px-4 py-3">Ngày tạo</th>
                  <th className="border-b border-slate-200 px-4 py-3">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="h-36 px-4 py-6 text-center font-bold text-slate-500">Đang tải danh sách tài khoản...</td>
                  </tr>
                ) : filteredUsers.length ? (
                  filteredUsers.map((user) => {
                    const meta = roleMeta[user.role] || { label: user.role, badge: "bg-slate-200 text-slate-700" };
                    return (
                      <tr className="border-b border-slate-200 last:border-b-0" key={user.id}>
                        <td className="px-4 py-3">
                          <div className="grid min-w-0 grid-cols-[40px_minmax(0,1fr)] items-center gap-3">
                            <Avatar user={user} />
                            <div className="min-w-0">
                              <strong className="block truncate text-sm">{fullName(user)}</strong>
                              <span className="block truncate text-xs text-slate-500">{user.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex min-h-7 items-center rounded-full px-3 text-xs font-black ${meta.badge}`}>{meta.label}</span>
                        </td>
                        <td className="max-w-64 px-4 py-3 text-sm leading-6 text-slate-600">{profileText(user)}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{formatDate(user.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-950" type="button" onClick={() => openEditModal(user)} aria-label="Sửa tài khoản" title="Sửa tài khoản">
                              <Edit3 size={17} />
                            </button>
                            <button className="grid size-8 place-items-center rounded-lg text-red-600 hover:bg-red-50" type="button" onClick={() => handleDelete(user)} aria-label="Xóa tài khoản" title="Xóa tài khoản">
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="h-36 px-4 py-6 text-center font-bold text-slate-500">Không có tài khoản phù hợp.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </section>

      {isModalOpen ? (
        <div className="fixed inset-0 z-20 grid place-items-center bg-slate-950/45 p-5" role="presentation">
          <form className="max-h-[calc(100vh-40px)] w-full max-w-xl overflow-auto rounded-lg border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-950/20" onSubmit={handleSubmit}>
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="m-0 text-xs font-black uppercase text-blue-600">{editingUser ? "Cập nhật" : "Tạo mới"}</p>
                <h2 className="m-0 mt-1 text-2xl font-black">{editingUser ? "Sửa tài khoản" : "Tạo tài khoản"}</h2>
              </div>
              <button className="grid size-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-950" type="button" onClick={closeModal} aria-label="Đóng" title="Đóng">
                <X size={18} />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Họ">
                <input className={inputClass()} value={form.firstName} onChange={(event) => updateField("firstName", event.target.value)} required />
              </Field>
              <Field label="Tên">
                <input className={inputClass()} value={form.lastName} onChange={(event) => updateField("lastName", event.target.value)} required />
              </Field>
            </div>

            <div className="mt-4 grid gap-4">
              <Field label="Email">
                <input className={inputClass()} type="email" value={form.email} onChange={(event) => updateField("email", event.target.value)} required />
              </Field>

              {!editingUser ? (
                <Field label="Mật khẩu">
                  <input className={inputClass()} type="password" value={form.password} onChange={(event) => updateField("password", event.target.value)} minLength={6} required />
                </Field>
              ) : null}

              <Field label="Vai trò">
                <select className={inputClass()} value={form.role} onChange={(event) => updateField("role", event.target.value)} required disabled={Boolean(editingUser)}>
                  <option value="student">Sinh viên</option>
                  <option value="teacher">Giảng viên</option>
                  <option value="admin">Admin</option>
                </select>
              </Field>
            </div>

            {!editingUser && form.role === "student" ? (
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="m-0 mb-3 text-xs font-black uppercase text-blue-600">Thông tin sinh viên</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Lớp">
                    <select className={inputClass("bg-white")} value={form.studentClass} onChange={(event) => updateField("studentClass", event.target.value)} required>
                      {classes.map((item) => <option value={item} key={item}>{item}</option>)}
                    </select>
                  </Field>
                  <Field label="Ngành">
                    <select className={inputClass("bg-white")} value={form.studentMajor} onChange={(event) => updateField("studentMajor", event.target.value)} required>
                      {majors.map((item) => <option value={item} key={item}>{item}</option>)}
                    </select>
                  </Field>
                </div>
              </div>
            ) : null}

            {!editingUser && form.role === "teacher" ? (
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="m-0 mb-3 text-xs font-black uppercase text-blue-600">Thông tin giảng viên</p>
                <Field label="Học vị">
                  <select className={inputClass("bg-white")} value={form.teacherDegree} onChange={(event) => updateField("teacherDegree", event.target.value)} required>
                    {degrees.map((item) => <option value={item} key={item}>{item}</option>)}
                  </select>
                </Field>
              </div>
            ) : null}

            {error ? <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">{error}</div> : null}

            <div className="mt-6 grid gap-3 sm:grid-cols-[0.7fr_1.3fr]">
              <button className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 font-black text-slate-700 hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-60" type="button" onClick={closeModal} disabled={isSaving}>Hủy</button>
              <button className="inline-flex min-h-11 items-center justify-center rounded-lg bg-blue-600 px-4 font-black text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isSaving}>
                {isSaving ? "Đang lưu..." : "Lưu tài khoản"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  );
}
