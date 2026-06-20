import { useEffect, useMemo, useState } from "react";
import {
  Edit3,
  Filter,
  Plus,
  Search,
  Trash2,
  ClipboardList,
  BookOpen,
  Users,
  CheckCircle,
  X,
} from "lucide-react";
import AdminSidebar from "../components/AdminSidebar.jsx";
import { createTopic, deleteTopic, listTopics, updateTopic } from "../lib/api.js";

const emptyForm = { topicCode: "", topicName: "" };

function fullName(user) {
  return [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "Người dùng";
}

function getId(record) {
  return record?._id || record?.id || "";
}

function formatDate(value) {
  if (!value) return "--";
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(value));
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
    <label className="form-field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function inputClass(extra = "") {
  return `form-input ${extra}`;
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
      const matchesStatus = !statusFilter || (statusFilter === "available" && !hasStudent) || (statusFilter === "assigned" && hasStudent);
      const matchesQuery = !normalizedQuery || topic.topicCode?.toLowerCase().includes(normalizedQuery) || topic.topicName?.toLowerCase().includes(normalizedQuery) || studentText(topic.studentId).toLowerCase().includes(normalizedQuery) || teacherText(topic.teacherId).toLowerCase().includes(normalizedQuery);
      return matchesStatus && matchesQuery;
    });
  }, [query, statusFilter, topics]);

  const counts = useMemo(() => {
    return topics.reduce((acc, topic) => {
      acc.total += 1;
      if (topic.studentId) acc.assigned += 1;
      else acc.available += 1;
      if (topic.teacherId) acc.supervised += 1;
      return acc;
    }, { total: 0, available: 0, assigned: 0, supervised: 0 });
  }, [topics]);

  async function loadData() {
    setIsLoading(true);
    setError("");
    try {
      setTopics(await listTopics());
    } catch (err) {
      setError(err.status === 403 ? "Tài khoản hiện tại không có quyền admin." : err.message);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  function openCreateModal() {
    setEditingTopic(null);
    setForm(emptyForm);
    setError("");
    setNotice("");
    setIsModalOpen(true);
  }

  function openEditModal(topic) {
    setEditingTopic(topic);
    setForm({ topicCode: topic.topicCode || "", topicName: topic.topicName || "" });
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
    const payload = { topicCode: form.topicCode.trim(), topicName: form.topicName.trim() };
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
      if (err.status === 409) setError("Mã đề tài hoặc sinh viên đã được sử dụng.");
      else setError(err.message || "Không thể lưu đề tài.");
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
    <main className="admin-shell">
      <AdminSidebar />
      <section className="admin-content">
        <header className="page-header">
          <p className="eyebrow">Admin</p>
          <h1>Quản lý đề tài</h1>
          <p>Tạo và cập nhật danh mục đề tài. Sinh viên sẽ đăng ký đề tài và chọn giảng viên hướng dẫn ở luồng riêng.</p>
        </header>

        <div className="stats-grid">
          {[
            ["Tổng đề tài", counts.total, ClipboardList],
            ["Còn trống", counts.available, BookOpen],
            ["Đã có sinh viên", counts.assigned, Users],
            ["Có GVHD", counts.supervised, CheckCircle],
          ].map(([label, value, Icon]) => (
            <div className="stat-card" key={label}>
              <div className="stat-icon"><Icon size={20} /></div>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>

        <div className="main-panel">
          <div className="panel-header">
            <h2>Danh sách đề tài</h2>
            <button className="create-btn" type="button" onClick={openCreateModal}>
              <Plus size={18} />
              <span>Tạo đề tài</span>
            </button>
          </div>

          <div className="search-bar">
            <div className="search-input">
              <Search size={20} />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm theo mã, tên, sinh viên, giảng viên"
              />
            </div>
            <div className="filter-select">
              <Filter size={20} />
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="">Tất cả trạng thái</option>
                <option value="available">Còn trống</option>
                <option value="assigned">Đã có sinh viên</option>
              </select>
            </div>
          </div>

          {notice ? <div className="notice notice-success">{notice}</div> : null}
          {error ? <div className="notice notice-error">{error}</div> : null}

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Đề tài</th>
                  <th>Trạng thái</th>
                  <th>Sinh viên</th>
                  <th>GVHD</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="empty-state"><span>Đang tải danh sách đề tài...</span></td>
                  </tr>
                ) : filteredTopics.length ? (
                  filteredTopics.map((topic) => {
                    const isAssigned = Boolean(topic.studentId);
                    return (
                      <tr key={getId(topic)}>
                        <td>
                          <strong className="block text-sm font-semibold">{topic.topicCode}</strong>
                          <span className="block text-sm text-slate-600 mt-1">{topic.topicName}</span>
                        </td>
                        <td>
                          <span className={`role-badge ${isAssigned ? "badge-assigned" : "badge-available"}`}>
                            {isAssigned ? "Đã có sinh viên" : "Còn trống"}
                          </span>
                        </td>
                        <td className="text-sm text-slate-600">{studentText(topic.studentId)}</td>
                        <td className="text-sm text-slate-600">{teacherText(topic.teacherId)}</td>
                        <td className="text-sm text-slate-600">{formatDate(topic.createdAt)}</td>
                        <td>
                          <div className="action-buttons">
                            <button className="action-btn" type="button" onClick={() => openEditModal(topic)} title="Sửa đề tài">
                              <Edit3 size={17} />
                            </button>
                            <button className="action-btn danger" type="button" onClick={() => handleDelete(topic)} title="Xóa đề tài">
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="empty-state"><span>Không có đề tài phù hợp.</span></td>
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
                <p className="eyebrow">{editingTopic ? "Cập nhật" : "Tạo mới"}</p>
                <h2>{editingTopic ? "Sửa đề tài" : "Tạo đề tài"}</h2>
              </div>
              <button className="modal-close" type="button" onClick={closeModal}><X size={18} /></button>
            </div>

            <div className="form-grid form-grid-2">
              <Field label="Mã đề tài">
                <input className={inputClass()} value={form.topicCode} onChange={(e) => updateField("topicCode", e.target.value)} required />
              </Field>
              <Field label="Tên đề tài">
                <input className={inputClass()} value={form.topicName} onChange={(e) => updateField("topicName", e.target.value)} required />
              </Field>
            </div>

            {error && <div className="notice notice-error" style={{ marginTop: '20px' }}>{error}</div>}

            <div className="modal-actions">
              <button className="btn btn-secondary" type="button" onClick={closeModal} disabled={isSaving}>Hủy</button>
              <button className="btn btn-primary" type="submit" disabled={isSaving}>{isSaving ? "Đang lưu..." : "Lưu đề tài"}</button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  );
}
