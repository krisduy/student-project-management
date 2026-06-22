import { useEffect, useMemo, useState } from "react";
import { Edit3, Filter, Plus, Search, Trash2, Users, BookOpen, GraduationCap, X } from "lucide-react";
import AdminSidebar from "../components/AdminSidebar.jsx";
import { createUser, deleteUser, listStudents, updateStudent, updateUser } from "../lib/api.js";
import { AvatarDisplay } from "../components/AvatarDisplay.jsx";

const classes = ["CNTT21A", "CNTT21B", "HTTT21A", "HTTT21B", "KTPM21A", "KTPM21B"];
const majors = ["Công nghệ thông tin", "Hệ thống thông tin", "Kỹ thuật phần mềm", "Trí tuệ nhân tạo", "An toàn thông tin"];

const emptyForm = { firstName: "", lastName: "", email: "", password: "", class: "CNTT21A", major: "Công nghệ thông tin" };

function getId(record) { return record?._id || record?.id || ""; }
function fullName(user) { return [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "Sinh viên"; }
function formatDate(value) { if (!value) return "--"; return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value)); }

function Field({ label, children }) { return <label className="form-field"><span>{label}</span>{children}</label>; }
function inputClass(extra = "") { return `form-input ${extra}`; }

function StudentAvatar({ user }) {
  return <AvatarDisplay user={user} size="sm" />;
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
      const matchesQuery = !normalizedQuery || fullName(user).toLowerCase().includes(normalizedQuery) || user?.email?.toLowerCase().includes(normalizedQuery) || student.major?.toLowerCase().includes(normalizedQuery);
      return matchesClass && matchesQuery;
    });
  }, [classFilter, query, students]);

  const counts = useMemo(() => {
    return students.reduce((acc, student) => {
      acc.total += 1;
      acc.classes.add(student.class);
      acc.majors.add(student.major);
      return acc;
    }, { total: 0, classes: new Set(), majors: new Set() });
  }, [students]);

  async function loadStudents() {
    setIsLoading(true);
    setError("");
    try { setStudents(await listStudents()); }
    catch (err) { setError(err.status === 403 ? "Tài khoản hiện tại không có quyền admin." : err.message); }
    finally { setIsLoading(false); }
  }

  useEffect(() => { loadStudents(); }, []);

  function openCreateModal() { setEditingStudent(null); setForm(emptyForm); setError(""); setNotice(""); setIsModalOpen(true); }
  function openEditModal(student) {
    const user = student.userId || {};
    setEditingStudent(student);
    setForm({ firstName: user.firstName || "", lastName: user.lastName || "", email: user.email || "", password: "", class: student.class || "CNTT21A", major: student.major || "Công nghệ thông tin" });
    setError(""); setNotice(""); setIsModalOpen(true);
  }
  function closeModal() { setIsModalOpen(false); setEditingStudent(null); setForm(emptyForm); }
  function updateField(field, value) { setForm((current) => ({ ...current, [field]: value })); }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true); setError(""); setNotice("");
    try {
      if (editingStudent) {
        await updateUser(getId(editingStudent.userId), { firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim(), role: "student" });
        await updateStudent(getId(editingStudent), { userId: getId(editingStudent.userId), class: form.class, major: form.major });
        setNotice("Đã cập nhật sinh viên.");
      } else {
        await createUser({ firstName: form.firstName.trim(), lastName: form.lastName.trim(), email: form.email.trim(), password: form.password, role: "student", student: { class: form.class, major: form.major } });
        setNotice("Đã tạo sinh viên.");
      }
      closeModal(); await loadStudents();
    } catch (err) { setError(err.status === 409 ? "Email này đã tồn tại." : err.message); }
    finally { setIsSaving(false); }
  }

  async function handleDelete(student) {
    const user = student.userId;
    if (!window.confirm(`Xóa sinh viên ${fullName(user)}?`)) return;
    setError(""); setNotice("");
    try { await deleteUser(getId(user)); setNotice("Đã xóa sinh viên."); await loadStudents(); }
    catch (err) { setError(err.message || "Không thể xóa sinh viên."); }
  }

  return (
    <main className="admin-shell">
      <AdminSidebar />
      <section className="admin-content">
        <header className="page-header">
          <p className="eyebrow">Admin</p>
          <h1>Quản lý sinh viên</h1>
          <p>Tạo tài khoản sinh viên và cập nhật hồ sơ lớp, ngành.</p>
        </header>

        <div className="stats-grid">
          {[["Tổng sinh viên", counts.total, Users], ["Số lớp", counts.classes.size, BookOpen], ["Số ngành", counts.majors.size, GraduationCap]].map(([label, value, Icon]) => (
            <div className="stat-card" key={label}>
              <div className="stat-icon"><Icon size={20} /></div>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>

        <div className="main-panel">
          <div className="panel-header">
            <h2>Danh sách sinh viên</h2>
            <button className="create-btn" type="button" onClick={openCreateModal}><Plus size={18} /><span>Tạo sinh viên</span></button>
          </div>

          <div className="search-bar">
            <div className="search-input">
              <Search size={20} />
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm theo tên, email hoặc ngành" />
            </div>
            <div className="filter-select">
              <Filter size={20} />
              <select value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
                <option value="">Tất cả lớp</option>
                {classes.map((item) => <option value={item} key={item}>{item}</option>)}
              </select>
            </div>
          </div>

          {notice ? <div className="notice notice-success">{notice}</div> : null}
          {error ? <div className="notice notice-error">{error}</div> : null}

          <div className="table-container">
            <table className="data-table">
              <thead><tr><th>Sinh viên</th><th>Lớp</th><th>Ngành</th><th>Ngày tạo</th><th>Thao tác</th></tr></thead>
              <tbody>
                {isLoading ? <tr><td colSpan="5" className="empty-state"><span>Đang tải danh sách sinh viên...</span></td></tr>
                : filteredStudents.length ? filteredStudents.map((student) => (
                  <tr key={getId(student)}>
                    <td><div className="user-cell"><StudentAvatar user={student.userId} /><div><strong>{fullName(student.userId)}</strong><span>{student.userId?.email}</span></div></div></td>
                    <td className="text-sm font-semibold text-slate-700">{student.class}</td>
                    <td className="text-sm text-slate-600">{student.major}</td>
                    <td className="text-sm text-slate-600">{formatDate(student.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn" type="button" onClick={() => openEditModal(student)} title="Sửa sinh viên"><Edit3 size={17} /></button>
                        <button className="action-btn danger" type="button" onClick={() => handleDelete(student)} title="Xóa sinh viên"><Trash2 size={17} /></button>
                      </div>
                    </td>
                  </tr>
                )) : <tr><td colSpan="5" className="empty-state"><span>Không có sinh viên phù hợp.</span></td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {isModalOpen ? (
        <div className="modal-backdrop" role="presentation">
          <form className="modal-content" onSubmit={handleSubmit}>
            <div className="modal-header">
              <div><p className="eyebrow">{editingStudent ? "Cập nhật" : "Tạo mới"}</p><h2>{editingStudent ? "Sửa sinh viên" : "Tạo sinh viên"}</h2></div>
              <button className="modal-close" type="button" onClick={closeModal}><X size={18} /></button>
            </div>
            <div className="form-grid form-grid-2">
              <Field label="Họ"><input className={inputClass()} value={form.firstName} onChange={(e) => updateField("firstName", e.target.value)} required /></Field>
              <Field label="Tên"><input className={inputClass()} value={form.lastName} onChange={(e) => updateField("lastName", e.target.value)} required /></Field>
            </div>
            <div className="form-grid" style={{ marginTop: '20px' }}>
              <Field label="Email"><input className={inputClass()} type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} required /></Field>
              {!editingStudent && <Field label="Mật khẩu"><input className={inputClass()} type="password" value={form.password} onChange={(e) => updateField("password", e.target.value)} minLength={6} required /></Field>}
            </div>
            <div className="form-grid form-grid-2" style={{ marginTop: '20px' }}>
              <Field label="Lớp">
                <select className={inputClass()} value={form.class} onChange={(e) => updateField("class", e.target.value)} required>
                  {classes.map((item) => <option value={item} key={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="Ngành">
                <select className={inputClass()} value={form.major} onChange={(e) => updateField("major", e.target.value)} required>
                  {majors.map((item) => <option value={item} key={item}>{item}</option>)}
                </select>
              </Field>
            </div>
            {error && <div className="notice notice-error" style={{ marginTop: '16px' }}>{error}</div>}
            <div className="modal-actions">
              <button className="btn btn-secondary" type="button" onClick={closeModal} disabled={isSaving}>Hủy</button>
              <button className="btn btn-primary" type="submit" disabled={isSaving}>{isSaving ? "Đang lưu..." : "Lưu sinh viên"}</button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  );
}
