import { useEffect, useMemo, useState } from "react";
import {
  Edit3,
  Filter,
  Plus,
  Search,
  Trash2,
  Users,
  Shield,
  GraduationCap,
  X,
} from "lucide-react";
import AdminSidebar from "../components/AdminSidebar.jsx";
import { createUser, deleteUser, listUsers, updateUser } from "../lib/api.js";
import { getSession, setSession } from "../lib/session.js";
import { AvatarDisplay } from "../components/AvatarDisplay.jsx";

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
  admin: { label: "Admin", badge: "badge-admin" },
  teacher: { label: "Giảng viên", badge: "badge-teacher" },
  student: { label: "Sinh viên", badge: "badge-student" },
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
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
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

function AdminAvatar({ user }) {
  return <AvatarDisplay user={user} size="sm" />;
}

function Field({ label, children }) {
  return (
    <label className="form-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function inputClass(extra = "") {
  return `form-input ${extra}`;
}

function StatCard({ label, value, Icon }) {
  return (
    <div className="stat-card">
      <div className="stat-icon"><Icon size={20} /></div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function AdminUsersPage() {
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
      const matchesQuery = !normalizedQuery || fullName(user).toLowerCase().includes(normalizedQuery) || user.email.toLowerCase().includes(normalizedQuery);
      return matchesRole && matchesQuery;
    });
  }, [query, roleFilter, users]);

  const counts = useMemo(() => {
    return users.reduce((acc, user) => {
      acc.total += 1;
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, { total: 0, admin: 0, teacher: 0, student: 0 });
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

  useEffect(() => { loadUsers(); }, []);

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
          profilePayload.student = { class: form.studentClass, major: form.studentMajor };
        }
        if (form.role === "teacher") {
          profilePayload.teacher = { degree: form.teacherDegree };
        }
        const createdUser = await createUser({ ...payload, ...profilePayload, password: form.password });
        if (createdUser?.id && currentUser?.id && createdUser.id === currentUser.id) {
          const nextSession = { ...getSession(), user: createdUser };
          setSession(nextSession);
        }
        setNotice("Đã tạo tài khoản.");
      }
      closeModal();
      await loadUsers();
    } catch (err) {
      if (err.status === 409) setError("Email này đã tồn tại.");
      else setError(err.message || "Không thể lưu tài khoản.");
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
    <main className="admin-shell">
      <AdminSidebar />
      <section className="admin-content">
        <header className="page-header">
          <p className="eyebrow">Admin</p>
          <h1>Quản lý người dùng</h1>
          <p>Tạo tài khoản đăng nhập và hồ sơ liên kết cho admin, giảng viên và sinh viên.</p>
        </header>

        <div className="stats-grid">
          <StatCard label="Tổng tài khoản" value={counts.total} Icon={Users} />
          <StatCard label="Admin" value={counts.admin} Icon={Shield} />
          <StatCard label="Giảng viên" value={counts.teacher} Icon={GraduationCap} />
          <StatCard label="Sinh viên" value={counts.student} Icon={Users} />
        </div>

        <div className="main-panel">
          <div className="panel-header">
            <h2>Danh sách tài khoản</h2>
            <button className="create-btn" type="button" onClick={openCreateModal}>
              <Plus size={18} />
              <span>Tạo tài khoản</span>
            </button>
          </div>

          <div className="search-bar">
            <div className="search-input">
              <Search size={20} />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm theo tên hoặc email"
              />
            </div>
            <div className="filter-select">
              <Filter size={20} />
              <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
                <option value="">Tất cả vai trò</option>
                <option value="admin">Admin</option>
                <option value="teacher">Giảng viên</option>
                <option value="student">Sinh viên</option>
              </select>
            </div>
          </div>

          {notice ? <div className="notice notice-success">{notice}</div> : null}
          {error ? <div className="notice notice-error">{error}</div> : null}

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Người dùng</th>
                  <th>Vai trò</th>
                  <th>Hồ sơ</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      <span>Đang tải danh sách tài khoản...</span>
                    </td>
                  </tr>
                ) : filteredUsers.length ? (
                  filteredUsers.map((user) => {
                    const meta = roleMeta[user.role] || { label: user.role, badge: "badge-student" };
                    return (
                      <tr key={user.id}>
                        <td>
                          <div className="user-cell">
                            <AdminAvatar user={user} />
                            <div>
                              <strong>{fullName(user)}</strong>
                              <span>{user.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`role-badge ${meta.badge}`}>{meta.label}</span>
                        </td>
                        <td className="text-sm text-slate-600">{profileText(user)}</td>
                        <td className="text-sm text-slate-600">{formatDate(user.createdAt)}</td>
                        <td>
                          <div className="action-buttons">
                            <button className="action-btn" type="button" onClick={() => openEditModal(user)} title="Sửa tài khoản">
                              <Edit3 size={17} />
                            </button>
                            <button className="action-btn danger" type="button" onClick={() => handleDelete(user)} title="Xóa tài khoản">
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      <span>Không có tài khoản phù hợp.</span>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {isModalOpen ? (
        <div className="modal-backdrop" role="presentation">
          <form className="modal-content" onSubmit={handleSubmit}>
            <div className="modal-header">
              <div>
                <p className="eyebrow">{editingUser ? "Cập nhật" : "Tạo mới"}</p>
                <h2>{editingUser ? "Sửa tài khoản" : "Tạo tài khoản"}</h2>
              </div>
              <button className="modal-close" type="button" onClick={closeModal}><X size={18} /></button>
            </div>

            <div className="form-grid form-grid-2">
              <Field label="Họ">
                <input className={inputClass()} value={form.firstName} onChange={(e) => updateField("firstName", e.target.value)} required />
              </Field>
              <Field label="Tên">
                <input className={inputClass()} value={form.lastName} onChange={(e) => updateField("lastName", e.target.value)} required />
              </Field>
            </div>

            <div className="form-grid" style={{ marginTop: '20px' }}>
              <Field label="Email">
                <input className={inputClass()} type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} required />
              </Field>
              {!editingUser && (
                <Field label="Mật khẩu">
                  <input className={inputClass()} type="password" value={form.password} onChange={(e) => updateField("password", e.target.value)} minLength={6} required />
                </Field>
              )}
              <Field label="Vai trò">
                <select className={inputClass()} value={form.role} onChange={(e) => updateField("role", e.target.value)} required disabled={Boolean(editingUser)}>
                  <option value="student">Sinh viên</option>
                  <option value="teacher">Giảng viên</option>
                  <option value="admin">Admin</option>
                </select>
              </Field>
            </div>

            {!editingUser && form.role === "student" && (
              <div className="form-section">
                <p className="form-section-title">Thông tin sinh viên</p>
                <div className="form-grid form-grid-2">
                  <Field label="Lớp">
                    <select className={inputClass("bg-white")} value={form.studentClass} onChange={(e) => updateField("studentClass", e.target.value)} required>
                      {classes.map((item) => <option value={item} key={item}>{item}</option>)}
                    </select>
                  </Field>
                  <Field label="Ngành">
                    <select className={inputClass("bg-white")} value={form.studentMajor} onChange={(e) => updateField("studentMajor", e.target.value)} required>
                      {majors.map((item) => <option value={item} key={item}>{item}</option>)}
                    </select>
                  </Field>
                </div>
              </div>
            )}

            {!editingUser && form.role === "teacher" && (
              <div className="form-section">
                <p className="form-section-title">Thông tin giảng viên</p>
                <Field label="Học vị">
                  <select className={inputClass("bg-white")} value={form.teacherDegree} onChange={(e) => updateField("teacherDegree", e.target.value)} required>
                    {degrees.map((item) => <option value={item} key={item}>{item}</option>)}
                  </select>
                </Field>
              </div>
            )}

            {error && <div className="notice notice-error" style={{ margin: '16px 0 0' }}>{error}</div>}

            <div className="modal-actions">
              <button className="btn btn-secondary" type="button" onClick={closeModal} disabled={isSaving}>Hủy</button>
              <button className="btn btn-primary" type="submit" disabled={isSaving}>{isSaving ? "Đang lưu..." : "Lưu tài khoản"}</button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  );
}
