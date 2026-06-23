import { useEffect, useMemo, useState } from "react";
import { Edit3, Filter, Plus, Search, Trash2, ShieldCheck, GraduationCap, Award, X } from "lucide-react";
import AdminSidebar from "../components/AdminSidebar.jsx";
import ConfirmModal from "../components/ConfirmModal.jsx";
import { createUser, deleteUser, listTeachers, updateTeacher, updateUser } from "../lib/api.js";
import { AvatarDisplay } from "../components/AvatarDisplay.jsx";

const degrees = ["Thạc sĩ", "Tiến sĩ", "Phó giáo sư", "Giáo sư"];
const emptyForm = { firstName: "", lastName: "", email: "", password: "", degree: "Thạc sĩ" };

function getId(record) { return record?._id || record?.id || ""; }
function fullName(user) { return [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "Giảng viên"; }
function formatDate(value) { if (!value) return "--"; return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value)); }

function Field({ label, children }) { return <label className="form-field"><span>{label}</span>{children}</label>; }
function inputClass(extra = "") { return `form-input ${extra}`; }

function TeacherAvatar({ user }) {
  return <AvatarDisplay user={user} size="sm" />;
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
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filteredTeachers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return teachers.filter((teacher) => {
      const user = teacher.userId;
      const matchesDegree = !degreeFilter || teacher.degree === degreeFilter;
      const matchesQuery = !normalizedQuery || fullName(user).toLowerCase().includes(normalizedQuery) || user?.email?.toLowerCase().includes(normalizedQuery) || teacher.degree?.toLowerCase().includes(normalizedQuery);
      return matchesDegree && matchesQuery;
    });
  }, [degreeFilter, query, teachers]);

  const counts = useMemo(() => {
    return teachers.reduce((acc, teacher) => {
      acc.total += 1;
      acc.degrees.add(teacher.degree);
      if (teacher.degree?.includes("Tiến sĩ")) acc.doctors += 1;
      return acc;
    }, { total: 0, degrees: new Set(), doctors: 0 });
  }, [teachers]);

  async function loadTeachers() {
    setIsLoading(true); setError("");
    try { setTeachers(await listTeachers()); }
    catch (err) { setError(err.status === 403 ? "Tài khoản hiện tại không có quyền admin." : err.message); }
    finally { setIsLoading(false); }
  }

  useEffect(() => { loadTeachers(); }, []);

  function openCreateModal() { setEditingTeacher(null); setForm(emptyForm); setError(""); setNotice(""); setIsModalOpen(true); }
  function openEditModal(teacher) {
    const user = teacher.userId || {};
    setEditingTeacher(teacher);
    setForm({ firstName: user.firstName || "", lastName: user.lastName || "", email: user.email || "", password: "", degree: teacher.degree || "Thạc sĩ" });
    setError(""); setNotice(""); setIsModalOpen(true);
  }
  function closeModal() { setIsModalOpen(false); setEditingTeacher(null); setForm(emptyForm); }
  function updateField(field, value) { setForm((current) => ({ ...current, [field]: value })); }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true); setError(""); setNotice("");
    try {
      if (editingTeacher) {
        await updateUser(getId(editingTeacher.userId), { firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim(), role: "teacher" });
        await updateTeacher(getId(editingTeacher), { userId: getId(editingTeacher.userId), degree: form.degree });
        setNotice("Đã cập nhật giảng viên.");
      } else {
        await createUser({ firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim(), password: form.password, role: "teacher", teacher: { degree: form.degree } });
        setNotice("Đã tạo giảng viên.");
      }
      closeModal(); await loadTeachers();
    } catch (err) { setError(err.status === 409 ? "Email này đã tồn tại." : err.message); }
    finally { setIsSaving(false); }
  }

  async function handleDelete(teacher) {
    setConfirmDelete(teacher);
  }

  async function confirmDeleteTeacher() {
    const user = confirmDelete?.userId;
    setError(""); setNotice("");
    try { await deleteUser(getId(user)); setNotice("Đã xóa giảng viên."); await loadTeachers(); }
    catch (err) { setError(err.message || "Không thể xóa giảng viên."); }
    finally { setConfirmDelete(null); }
  }

  return (
    <main className="admin-shell">
      <AdminSidebar />
      <section className="admin-content">
        <header className="page-header">
          <p className="eyebrow">Admin</p>
          <h1>Quản lý giảng viên</h1>
          <p>Tạo tài khoản giảng viên và cập nhật hồ sơ học vị.</p>
        </header>

        <div className="stats-grid">
          {[["Tổng giảng viên", counts.total, ShieldCheck], ["Số học vị", counts.degrees.size, Award], ["Tiến sĩ", counts.doctors, GraduationCap]].map(([label, value, Icon]) => (
            <div className="stat-card" key={label}>
              <div className="stat-icon"><Icon size={20} /></div>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>

        <div className="main-panel">
          <div className="panel-header">
            <h2>Danh sách giảng viên</h2>
            <button className="create-btn" type="button" onClick={openCreateModal}><Plus size={18} /><span>Tạo giảng viên</span></button>
          </div>

          <div className="search-bar">
            <div className="search-input">
              <Search size={20} />
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm theo tên, email hoặc học vị" />
            </div>
            <div className="filter-select">
              <Filter size={20} />
              <select value={degreeFilter} onChange={(e) => setDegreeFilter(e.target.value)}>
                <option value="">Tất cả học vị</option>
                {degrees.map((item) => <option value={item} key={item}>{item}</option>)}
              </select>
            </div>
          </div>

          {notice ? <div className="notice notice-success">{notice}</div> : null}
          {error ? <div className="notice notice-error">{error}</div> : null}

          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>Giảng viên</th><th>Học vị</th><th>Ngày tạo</th><th>Thao tác</th></tr></thead>
              <tbody>
                {isLoading ? <tr><td colSpan="4" className="empty-state"><span>Đang tải danh sách giảng viên...</span></td></tr>
                : filteredTeachers.length ? filteredTeachers.map((teacher) => (
                  <tr key={getId(teacher)}>
                    <td><div className="user-cell"><TeacherAvatar user={teacher.userId} /><div><strong>{fullName(teacher.userId)}</strong><span>{teacher.userId?.email}</span></div></div></td>
                    <td><span className="role-badge badge-teacher">{teacher.degree}</span></td>
                    <td className="text-sm text-slate-600">{formatDate(teacher.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn" type="button" onClick={() => openEditModal(teacher)} title="Sửa giảng viên"><Edit3 size={17} /></button>
                        <button className="action-btn danger" type="button" onClick={() => handleDelete(teacher)} title="Xóa giảng viên"><Trash2 size={17} /></button>
                      </div>
                    </td>
                  </tr>
                )) : <tr><td colSpan="4" className="empty-state"><span>Không có giảng viên phù hợp.</span></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {isModalOpen ? (
        <div className="modal-backdrop" role="presentation">
          <form className="modal-content" onSubmit={handleSubmit}>
            <div className="modal-header">
              <div><p className="eyebrow">{editingTeacher ? "Cập nhật" : "Tạo mới"}</p><h2>{editingTeacher ? "Sửa giảng viên" : "Tạo giảng viên"}</h2></div>
              <button className="modal-close" type="button" onClick={closeModal}><X size={18} /></button>
            </div>
            <div className="form-grid form-grid-2">
              <Field label="Họ"><input className={inputClass()} value={form.firstName} onChange={(e) => updateField("firstName", e.target.value)} required /></Field>
              <Field label="Tên"><input className={inputClass()} value={form.lastName} onChange={(e) => updateField("lastName", e.target.value)} required /></Field>
            </div>
            <div className="form-grid" style={{ marginTop: '20px' }}>
              <Field label="Email"><input className={inputClass()} type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} required /></Field>
              {!editingTeacher && <Field label="Mật khẩu"><input className={inputClass()} type="password" value={form.password} onChange={(e) => updateField("password", e.target.value)} minLength={6} required /></Field>}
              <Field label="Học vị">
                <select className={inputClass()} value={form.degree} onChange={(e) => updateField("degree", e.target.value)} required>
                  {degrees.map((item) => <option value={item} key={item}>{item}</option>)}
                </select>
              </Field>
            </div>
            {error && <div className="notice notice-error" style={{ marginTop: '16px' }}>{error}</div>}
            <div className="modal-actions">
              <button className="btn btn-secondary" type="button" onClick={closeModal} disabled={isSaving}>Hủy</button>
              <button className="btn btn-primary" type="submit" disabled={isSaving}>{isSaving ? "Đang lưu..." : "Lưu giảng viên"}</button>
            </div>
          </form>
        </div>
      ) : null}

      <ConfirmModal
        isOpen={!!confirmDelete}
        title="Xác nhận xóa"
        message={`Bạn có chắc muốn xóa giảng viên "${fullName(confirmDelete?.userId)}"? Hành động này không thể hoàn tác.`}
        onConfirm={confirmDeleteTeacher}
        onCancel={() => setConfirmDelete(null)}
        confirmText="Xóa"
        cancelText="Hủy"
        danger
      />
    </main>
  );
}
