import { useEffect, useMemo, useState } from "react";
import {
  Award,
  Calendar,
  CheckCircle2,
  Edit3,
  Eye,
  FileText,
  Lock,
  Save,
  Search,
  Unlock,
  X,
  AlertCircle,
  Clock,
} from "lucide-react";
import AdminSidebar from "../components/AdminSidebar.jsx";
import {
  getEligibleDefenseTopics,
  getDefenseScoreByTopic,
  saveDefenseScore,
  updateDefenseScore,
  lockDefenseScore,
  unlockDefenseScore,
} from "../lib/api.js";

function fullName(user) {
  return [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "—";
}

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  }).format(new Date(value));
}

function ScoreBadge({ score }) {
  if (score == null) return <span className="text-xs text-slate-400 italic">Chưa có</span>;
  const color = score >= 8 ? "text-emerald-600" : score >= 5 ? "text-amber-600" : "text-red-600";
  return <span className={`text-sm font-bold ${color}`}>{score.toFixed(1)}</span>;
}

function LoadingSkeleton() {
  return (
    <main className="admin-shell">
      <AdminSidebar />
      <section className="admin-content">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-slate-200 rounded" />
          <div className="h-4 w-96 bg-slate-200 rounded" />
          <div className="h-12 bg-slate-200 rounded" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-slate-200 rounded" />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default function AdminDefenseScoresPage() {
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [existingScore, setExistingScore] = useState(null);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [scoreError, setScoreError] = useState("");
  const [scoreSuccess, setScoreSuccess] = useState("");

  const [scoreForm, setScoreForm] = useState({
    processScore: "",
    reportScore: "",
    rebuttalScore: "",
    teacherComment: "",
    defenseDate: "",
  });

  const counts = useMemo(() => {
    return records.reduce((acc, r) => {
      acc.total += 1;
      if (r.defenseScore?.processScore != null) acc.scored += 1;
      else acc.pending += 1;
      return acc;
    }, { total: 0, scored: 0, pending: 0 });
  }, [records]);

  async function loadData() {
    setIsLoading(true);
    try {
      const result = await getEligibleDefenseTopics({
        search,
        status: statusFilter,
        page: pagination.page,
      });
      setRecords(result.data || []);
      setPagination(result.pagination || pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [search, statusFilter, pagination.page]);

  async function openScoreModal(record) {
    setSelectedRecord(record);
    setScoreError("");
    setScoreSuccess("");
    setScoreForm({
      processScore: "",
      reportScore: "",
      rebuttalScore: "",
      teacherComment: "",
      defenseDate: "",
    });

    if (record.defenseScore) {
      setExistingScore(record.defenseScore);
      setScoreForm({
        processScore: record.defenseScore.processScore ?? "",
        reportScore: record.defenseScore.reportScore ?? "",
        rebuttalScore: record.defenseScore.rebuttalScore ?? "",
        teacherComment: record.defenseScore.teacherComment ?? "",
        defenseDate: record.defenseScore.defenseDate
          ? new Date(record.defenseScore.defenseDate).toISOString().slice(0, 10)
          : "",
      });
    } else {
      setExistingScore(null);
    }

    setIsScoreModalOpen(true);
  }

  function closeScoreModal() {
    setIsScoreModalOpen(false);
    setSelectedRecord(null);
    setExistingScore(null);
    setScoreError("");
    setScoreSuccess("");
  }

  function setScoreField(field, value) {
    setScoreForm((f) => ({ ...f, [field]: value }));
  }

  function calcPreview() {
    const p = parseFloat(scoreForm.processScore) || 0;
    const r = parseFloat(scoreForm.reportScore) || 0;
    const rb = parseFloat(scoreForm.rebuttalScore) || 0;
    const cnt = [p, r, rb].filter((v) => !isNaN(v) && v > 0).length;
    if (cnt === 0) return null;
    return ((p + r + rb) / cnt).toFixed(2);
  }

  async function handleSaveScore() {
    if (existingScore?.isLocked) {
      setScoreError("Điểm đã bị khóa, không thể lưu.");
      return;
    }
    setIsSaving(true);
    setScoreError("");
    setScoreSuccess("");
    try {
      const payload = {
        topicId: selectedRecord.topic._id,
        studentId: selectedRecord.student._id,
        teacherId: selectedRecord.topic.teacherId?._id || null,
        processScore: scoreForm.processScore !== "" ? parseFloat(scoreForm.processScore) : null,
        reportScore: scoreForm.reportScore !== "" ? parseFloat(scoreForm.reportScore) : null,
        rebuttalScore: scoreForm.rebuttalScore !== "" ? parseFloat(scoreForm.rebuttalScore) : null,
        teacherComment: scoreForm.teacherComment,
        defenseDate: scoreForm.defenseDate || null,
      };

      if (existingScore) {
        await updateDefenseScore(selectedRecord.topic._id, payload);
      } else {
        await saveDefenseScore(payload);
      }

      setScoreSuccess("Lưu điểm thành công!");
      setExistingScore({ ...existingScore, ...payload });
      loadData();
    } catch (err) {
      setScoreError(err.message || "Lỗi khi lưu điểm.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLockUnlock(record) {
    try {
      if (record.defenseScore?.isLocked) {
        await unlockDefenseScore(record.topic._id);
      } else {
        await lockDefenseScore(record.topic._id);
      }
      loadData();
    } catch (err) {
      alert(err.message);
    }
  }

  const preview = calcPreview();

  return (
    <main className="admin-shell">
      <AdminSidebar />
      <section className="admin-content">

        {/* Header */}
        <div className="page-header">
          <div className="page-header-decoration" />
          <div className="page-header-decoration-2" />
          <h1>Quản lý <span className="highlight">Điểm bảo vệ</span></h1>
          <p>Nhập điểm bảo vệ đồ án cho sinh viên đã hoàn thành giai đoạn 5</p>
        </div>

        {/* Alert */}
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 mb-6">
          <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <strong>Chỉ đề tài đã hoàn thành giai đoạn 5 (Hoàn thành đồ án)</strong> mới được phép nhập điểm. Giảng viên chấm điểm bên ngoài hệ thống, Admin nhập kết quả tại đây.
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1 min-w-[240px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="form-input pl-9"
              placeholder="Tìm theo mã SV, tên, mã đề tài..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPagination((p) => ({ ...p, page: 1 })); }}
            />
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            {[
              { key: "", label: "Tất cả", count: counts.total },
              { key: "pending", label: "Chưa chấm", count: counts.pending },
              { key: "scored", label: "Đã chấm", count: counts.scored },
            ].map((tab) => (
              <button
                key={tab.key}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  statusFilter === tab.key
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
                onClick={() => { setStatusFilter(tab.key); setPagination((p) => ({ ...p, page: 1 })); }}
              >
                {tab.label}
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  statusFilter === tab.key ? "bg-indigo-100 text-indigo-600" : "bg-slate-200 text-slate-500"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <div className="rounded-2xl bg-white shadow-lg border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-50 to-violet-50 border-b border-slate-100">
                    <th className="text-left px-5 py-3.5 font-bold text-slate-600 uppercase tracking-wide text-xs">Mã đề tài</th>
                    <th className="text-left px-5 py-3.5 font-bold text-slate-600 uppercase tracking-wide text-xs">Tên đề tài</th>
                    <th className="text-left px-5 py-3.5 font-bold text-slate-600 uppercase tracking-wide text-xs">Sinh viên</th>
                    <th className="text-left px-5 py-3.5 font-bold text-slate-600 uppercase tracking-wide text-xs">Mã SV</th>
                    <th className="text-center px-5 py-3.5 font-bold text-slate-600 uppercase tracking-wide text-xs">Điểm QT</th>
                    <th className="text-center px-5 py-3.5 font-bold text-slate-600 uppercase tracking-wide text-xs">Điểm BC</th>
                    <th className="text-center px-5 py-3.5 font-bold text-slate-600 uppercase tracking-wide text-xs">Điểm PB</th>
                    <th className="text-center px-5 py-3.5 font-bold text-slate-600 uppercase tracking-wide text-xs">Tổng</th>
                    <th className="text-center px-5 py-3.5 font-bold text-slate-600 uppercase tracking-wide text-xs">Trạng thái</th>
                    <th className="text-center px-5 py-3.5 font-bold text-slate-600 uppercase tracking-wide text-xs">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-12 text-slate-400">
                        Không có đề tài nào đủ điều kiện chấm điểm.
                      </td>
                    </tr>
                  ) : records.map((record, idx) => {
                    const score = record.defenseScore;
                    const hasScore = score?.processScore != null;
                    const isLocked = score?.isLocked;
                    return (
                      <tr key={record._id || idx} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-xs font-bold text-indigo-600">{record.topic.topicCode}</td>
                        <td className="px-5 py-3.5 font-semibold text-slate-800 max-w-xs truncate">{record.topic.topicName}</td>
                        <td className="px-5 py-3.5 text-slate-700">{fullName(record.student.userId)}</td>
                        <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{record.student.studentCode}</td>
                        <td className="px-5 py-3.5 text-center"><ScoreBadge score={score?.processScore} /></td>
                        <td className="px-5 py-3.5 text-center"><ScoreBadge score={score?.reportScore} /></td>
                        <td className="px-5 py-3.5 text-center"><ScoreBadge score={score?.rebuttalScore} /></td>
                        <td className="px-5 py-3.5 text-center font-bold text-slate-800">
                          {score?.finalScore != null ? <ScoreBadge score={score.finalScore} /> : <span className="text-xs text-slate-400 italic">—</span>}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          {isLocked ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                              <Lock size={10} /> Đã khóa
                            </span>
                          ) : hasScore ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                              <Edit3 size={10} /> Đã lưu
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                              <Clock size={10} /> Chờ chấm
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              className="w-8 h-8 rounded-xl flex items-center justify-center bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-all"
                              onClick={() => openScoreModal(record)}
                              title="Nhập / Xem điểm"
                            >
                              <Award size={15} />
                            </button>
                            {hasScore && (
                              <button
                                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                                  isLocked
                                    ? "bg-amber-50 hover:bg-amber-100 text-amber-600"
                                    : "bg-emerald-50 hover:bg-emerald-100 text-emerald-600"
                                }`}
                                onClick={() => handleLockUnlock(record)}
                                title={isLocked ? "Mở khóa" : "Khóa điểm"}
                              >
                                {isLocked ? <Unlock size={15} /> : <Lock size={15} />}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
                <p className="text-sm text-slate-500">
                  Trang {pagination.page} / {pagination.totalPages} — {pagination.total} kết quả
                </p>
                <div className="flex items-center gap-2">
                  <button
                    className="btn btn-secondary text-xs px-3 py-1.5"
                    disabled={pagination.page <= 1}
                    onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                  >
                    ← Trước
                  </button>
                  <button
                    className="btn btn-secondary text-xs px-3 py-1.5"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                  >
                    Sau →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Score Modal */}
        {isScoreModalOpen && selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-t-3xl sticky top-0">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Award size={20} />
                    {existingScore ? "Sửa điểm bảo vệ" : "Nhập điểm bảo vệ"}
                  </h2>
                  <p className="text-indigo-200 text-sm mt-0.5">{selectedRecord.topic.topicName}</p>
                </div>
                <button
                  className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-all"
                  onClick={closeScoreModal}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Student info */}
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <span className="text-slate-400 font-semibold uppercase tracking-wide text-xs">Sinh viên</span>
                    <p className="font-bold text-slate-800">{fullName(selectedRecord.student.userId)}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold uppercase tracking-wide text-xs">Mã SV</span>
                    <p className="font-bold text-slate-800">{selectedRecord.student.studentCode}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold uppercase tracking-wide text-xs">Mã đề tài</span>
                    <p className="font-bold text-indigo-600">{selectedRecord.topic.topicCode}</p>
                  </div>
                </div>
              </div>

              {/* Locked notice */}
              {existingScore?.isLocked && (
                <div className="mx-6 mt-4 flex items-start gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <Lock size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-800">
                    <strong>Điểm đã bị khóa.</strong> Muốn chỉnh sửa phải mở khóa trước.
                  </p>
                </div>
              )}

              {/* Score form */}
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4">
                  <label className="form-field">
                    <span className="form-label">Điểm quá trình</span>
                    <input
                      className="form-input text-center text-lg font-bold"
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      placeholder="0 – 10"
                      value={scoreForm.processScore}
                      onChange={(e) => setScoreField("processScore", e.target.value)}
                      disabled={existingScore?.isLocked}
                      required
                    />
                    <span className="text-xs text-slate-400 mt-1">Hệ số 1</span>
                  </label>

                  <label className="form-field">
                    <span className="form-label">Điểm báo cáo</span>
                    <input
                      className="form-input text-center text-lg font-bold"
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      placeholder="0 – 10"
                      value={scoreForm.reportScore}
                      onChange={(e) => setScoreField("reportScore", e.target.value)}
                      disabled={existingScore?.isLocked}
                      required
                    />
                    <span className="text-xs text-slate-400 mt-1">Hệ số 1</span>
                  </label>

                  <label className="form-field">
                    <span className="form-label">Điểm phản biện</span>
                    <input
                      className="form-input text-center text-lg font-bold"
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      placeholder="0 – 10"
                      value={scoreForm.rebuttalScore}
                      onChange={(e) => setScoreField("rebuttalScore", e.target.value)}
                      disabled={existingScore?.isLocked}
                    />
                    <span className="text-xs text-slate-400 mt-1">Hệ số 1 (nếu có)</span>
                  </label>
                </div>

                {/* Preview total */}
                {preview && (
                  <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-600">Điểm tổng kết (tạm tính)</span>
                    <span className="text-3xl font-black text-indigo-600">{preview}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <label className="form-field">
                    <span className="form-label">Ngày chấm</span>
                    <input
                      className="form-input"
                      type="date"
                      value={scoreForm.defenseDate}
                      onChange={(e) => setScoreField("defenseDate", e.target.value)}
                      disabled={existingScore?.isLocked}
                    />
                  </label>

                  <div className="form-field">
                    <span className="form-label">Trạng thái khóa</span>
                    <div className="flex items-center gap-2 mt-2">
                      <div className={`w-3 h-3 rounded-full ${existingScore?.isLocked ? "bg-emerald-500" : "bg-slate-300"}`} />
                      <span className="text-sm font-semibold text-slate-700">
                        {existingScore?.isLocked ? "Đã khóa" : "Chưa khóa"}
                      </span>
                    </div>
                  </div>
                </div>

                <label className="form-field mt-4">
                  <span className="form-label">Nhận xét của giảng viên</span>
                  <textarea
                    className="form-input min-h-[80px]"
                    placeholder="Nhận xét về bài bảo vệ của sinh viên..."
                    value={scoreForm.teacherComment}
                    onChange={(e) => setScoreField("teacherComment", e.target.value)}
                    disabled={existingScore?.isLocked}
                  />
                </label>

                {/* Existing final score */}
                {existingScore?.finalScore != null && (
                  <div className="mt-4 p-4 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Điểm tổng kết đã lưu</p>
                      <p className="text-sm text-slate-600 mt-1">Ngày chấm: {formatDate(existingScore.defenseDate)}</p>
                    </div>
                    <span className="text-4xl font-black text-slate-700">{existingScore.finalScore.toFixed(1)}</span>
                  </div>
                )}

                {scoreError ? <div className="notice notice-error mt-4">{scoreError}</div> : null}
                {scoreSuccess ? <div className="notice notice-success mt-4">{scoreSuccess}</div> : null}

                <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                  <button className="btn btn-secondary" onClick={closeScoreModal} type="button">
                    <X size={16} />
                    <span>Đóng</span>
                  </button>
                  {!existingScore?.isLocked && (
                    <button
                      className="btn btn-primary"
                      onClick={handleSaveScore}
                      disabled={isSaving}
                      type="button"
                    >
                      {isSaving ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Save size={16} />
                      )}
                      <span>{isSaving ? "Đang lưu..." : "Lưu điểm"}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
