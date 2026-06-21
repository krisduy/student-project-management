import { useEffect, useMemo, useState } from "react";
import {
  Users,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  Loader,
  Search,
  BookOpen,
  Milestone,
  MessageSquareText,
  Save,
  X,
  Telescope,
  Filter,
} from "lucide-react";
import TeacherSidebar from "../components/TeacherSidebar.jsx";
import {
  getMySupervisingTopics,
  getStudentProgressByTeacher,
  getProgressByTopic,
  updateProgress,
} from "../lib/api.js";

function fullName(user) {
  return [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "N/A";
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

const STAGES = [
  { key: "register", label: "Đăng ký đề tài", order: 1, color: "from-blue-500 to-cyan-500", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
  { key: "analysis", label: "Phân tích yêu cầu", order: 2, color: "from-indigo-500 to-purple-500", bgColor: "bg-indigo-50", borderColor: "border-indigo-200" },
  { key: "development", label: "Thiết kế và lập trình", order: 3, color: "from-violet-500 to-fuchsia-500", bgColor: "bg-violet-50", borderColor: "border-violet-200" },
  { key: "report", label: "Hoàn thiện báo cáo", order: 4, color: "from-amber-500 to-orange-500", bgColor: "bg-amber-50", borderColor: "border-amber-200" },
  { key: "complete", label: "Hoàn thành", order: 5, color: "from-emerald-500 to-teal-500", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
];

const STAGE_ORDER = ["register", "analysis", "development", "report", "complete"];
const PERCENTAGES = { register: 20, analysis: 40, development: 70, report: 90, complete: 100 };

function ProgressBar({ percentage, size = "default" }) {
  const color = percentage === 100
    ? "from-emerald-500 to-teal-500"
    : percentage >= 70
    ? "from-violet-500 to-purple-500"
    : percentage >= 40
    ? "from-indigo-500 to-blue-500"
    : "from-slate-400 to-slate-500";

  return (
    <div className="flex items-center gap-3">
      <div className={`flex-1 bg-slate-200 rounded-full ${size === "small" ? "h-2" : "h-3"} overflow-hidden`}>
        <div
          className={`bg-gradient-to-r ${color} ${size === "small" ? "h-2" : "h-3"} rounded-full transition-all duration-700`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className={`text-sm font-bold min-w-[45px] text-right ${percentage === 100 ? "text-emerald-600" : "text-slate-600"}`}>
        {percentage}%
      </span>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="main-panel p-5">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${color} text-white shadow-lg mb-3`}>
        <Icon size={24} />
      </div>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{label}</p>
    </div>
  );
}

function StatusBadge({ percentage }) {
  if (percentage === 100) {
    return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium">
      <CheckCircle2 size={14} /> Hoàn thành
    </span>;
  }
  if (percentage > 0) {
    return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium">
      <TrendingUp size={14} /> Đang thực hiện
    </span>;
  }
  return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 text-slate-600 text-sm font-medium">
    <Clock size={14} /> Chưa bắt đầu
  </span>;
}

function StudentDetailModal({ student, isOpen, onClose, onRefresh }) {
  const [detailData, setDetailData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && student) {
      setComment(student.teacherComment || "");
      loadDetail();
    }
  }, [isOpen, student]);

  async function loadDetail() {
    if (!student?.topic?._id) return;
    setIsLoading(true);
    try {
      const data = await getProgressByTopic(student.topic._id);
      setDetailData(data);
    } catch (err) {
      console.error("Failed to load detail:", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveComment() {
    if (!student?._id) return;
    setIsSaving(true);
    try {
      await updateProgress(student._id, { teacherComment: comment });
      onRefresh();
      onClose();
    } catch (err) {
      console.error("Failed to save comment:", err);
    } finally {
      setIsSaving(false);
    }
  }

  if (!isOpen) return null;

  const completedStages = student?.completedStages || [];
  const currentStage = student?.currentStage || "";
  const percentage = student?.percentage || 0;
  const stageDetails = detailData?.stageDetails || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        <div className={`p-6 bg-gradient-to-r ${currentStage === "complete" ? "from-emerald-500 to-teal-600" : "from-indigo-500 to-purple-600"} text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center text-2xl font-bold">
                {student?.student?.firstName?.[0]}{student?.student?.lastName?.[0]}
              </div>
              <div>
                <h2 className="text-xl font-bold">{student?.student?.fullName || "N/A"}</h2>
                <p className="text-white/80">{student?.student?.studentCode || "--"}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-xl font-bold"
            >
              ×
            </button>
          </div>

          <div className="mt-4 p-4 bg-white/10 rounded-xl">
            <p className="text-sm text-white/70 mb-1">Đề tài</p>
            <p className="font-semibold">{student?.topic?.topicCode} — {student?.topic?.topicName}</p>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm text-white/80 mb-1">
                <span>Tiến độ</span>
                <span className="font-bold text-white text-lg">{percentage}%</span>
              </div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-700"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
            <StatusBadge percentage={percentage} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Timeline */}
          <div>
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Milestone size={18} className="text-indigo-500" />
              Tiến trình thực hiện
            </h3>
            <div className="relative pl-8">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
              <div className="space-y-4">
                {STAGES.map((stage, idx) => {
                  const isCompleted = completedStages.includes(stage.key);
                  const isCurrent = currentStage === stage.key;
                  const details = stageDetails[stage.key] || {};
                  const isLast = idx === STAGES.length - 1;

                  return (
                    <div key={stage.key} className="relative">
                      <div
                        className={`absolute -left-4 w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 transition-all ${
                          isCompleted
                            ? "bg-emerald-500 border-emerald-500"
                            : isCurrent
                            ? "bg-indigo-500 border-indigo-500 animate-pulse"
                            : "bg-white border-slate-300"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={16} className="text-white" />
                        ) : isCurrent ? (
                          <Clock size={14} className="text-white" />
                        ) : (
                          <span className="text-xs font-bold text-slate-400">{idx + 1}</span>
                        )}
                      </div>

                      <div className={`ml-4 p-4 rounded-xl border-2 transition-all ${
                        isCompleted ? "bg-emerald-50 border-emerald-200" :
                        isCurrent ? "bg-indigo-50 border-indigo-200" :
                        "bg-slate-50 border-slate-200"
                      }`}>
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className={`font-bold ${
                              isCompleted ? "text-emerald-700" :
                              isCurrent ? "text-indigo-700" :
                              "text-slate-500"
                            }`}>
                              {stage.label}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              {isCompleted ? (
                                <span className="text-xs font-medium text-emerald-600">Hoàn thành</span>
                              ) : isCurrent ? (
                                <span className="text-xs font-medium text-indigo-600">Đang thực hiện</span>
                              ) : (
                                <span className="text-xs font-medium text-slate-400">Chưa bắt đầu</span>
                              )}
                              <span className="text-xs text-slate-400">• {PERCENTAGES[stage.key]}%</span>
                            </div>
                          </div>
                          {details.completedAt && (
                            <span className="text-xs text-slate-400">{formatDate(details.completedAt)}</span>
                          )}
                        </div>

                        {details.notes && (
                          <div className="mt-3 flex items-start gap-2 text-sm text-slate-600 bg-white/50 p-2 rounded-lg">
                            <MessageSquareText size={14} className="mt-0.5 shrink-0 text-slate-400" />
                            <span>{details.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Comment Section */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <MessageSquareText size={18} className="text-amber-500" />
              Nhận xét của giảng viên
            </h3>
            <textarea
              className="form-input min-h-24 resize-y py-3 leading-relaxed"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Nhập nhận xét về tiến độ của sinh viên..."
            />
            <div className="flex items-center justify-end gap-3 mt-4">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={isSaving}
              >
                <X size={16} />
                <span>Hủy</span>
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveComment}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                <span>{isSaving ? "Đang lưu..." : "Lưu nhận xét"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TeacherProgressPage() {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState(null);

  async function loadData() {
    setIsLoading(true);
    setError("");
    try {
      const data = await getStudentProgressByTeacher();
      setStudents(data || []);
    } catch (err) {
      setError(err.message || "Không thể tải dữ liệu.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredStudents = useMemo(() => {
    let result = students;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.student?.fullName?.toLowerCase().includes(query) ||
          s.student?.studentCode?.toLowerCase().includes(query) ||
          s.topic?.topicCode?.toLowerCase().includes(query) ||
          s.topic?.topicName?.toLowerCase().includes(query)
      );
    }

    if (filterStatus !== "all") {
      result = result.filter((s) => {
        if (filterStatus === "completed") return s.percentage === 100;
        if (filterStatus === "inProgress") return s.percentage > 0 && s.percentage < 100;
        if (filterStatus === "notStarted") return s.percentage === 0;
        return true;
      });
    }

    return result;
  }, [students, searchQuery, filterStatus]);

  const stats = useMemo(() => {
    const total = students.length;
    const completed = students.filter((s) => s.percentage === 100).length;
    const inProgress = students.filter((s) => s.percentage > 0 && s.percentage < 100).length;
    const notStarted = students.filter((s) => s.percentage === 0).length;

    return { total, completed, inProgress, notStarted };
  }, [students]);

  if (isLoading) {
    return (
      <main className="admin-shell">
        <TeacherSidebar />
        <section className="admin-content">
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3 text-slate-500">
              <Loader size={24} className="animate-spin" />
              <span className="font-semibold">Đang tải dữ liệu...</span>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <TeacherSidebar />
      <section className="admin-content">
        <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-600 p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full"></div>
          <div className="absolute top-4 right-4 w-32 h-32 border border-white/10 rounded-full"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Telescope size={20} className="text-yellow-300" />
              <span className="text-sm font-medium text-white/80">Theo dõi tiến độ</span>
            </div>
            <h1 className="text-4xl font-black mb-3">Theo dõi tiến độ đồ án</h1>
            <p className="text-lg text-white/90 max-w-xl">Quản lý và theo dõi tiến độ thực hiện đồ án của sinh viên được phân công hướng dẫn.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon={Users} label="Tổng sinh viên" value={stats.total} color="from-indigo-500 to-purple-600" />
          <StatCard icon={CheckCircle2} label="Đã hoàn thành" value={stats.completed} color="from-emerald-500 to-teal-600" />
          <StatCard icon={TrendingUp} label="Đang thực hiện" value={stats.inProgress} color="from-violet-500 to-fuchsia-600" />
          <StatCard icon={AlertCircle} label="Chưa bắt đầu" value={stats.notStarted} color="from-amber-500 to-orange-600" />
        </div>

        {error && <div className="notice notice-error mb-5">{error}</div>}

        <div className="main-panel">
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <BookOpen size={20} className="text-indigo-500" />
                <h2 className="text-lg font-bold text-slate-800">Danh sách sinh viên</h2>
                <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 text-sm font-semibold">
                  {filteredStudents.length}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="search-input">
                  <Search size={18} />
                  <input
                    type="search"
                    placeholder="Tìm tên, mã SV, đề tài..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-slate-400" />
                  <select
                    className="form-input py-2 text-sm"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">Tất cả</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="inProgress">Đang thực hiện</option>
                    <option value="notStarted">Chưa bắt đầu</option>
                  </select>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary py-2"
                  onClick={loadData}
                >
                  <Loader size={16} />
                  <span>Làm mới</span>
                </button>
              </div>
            </div>
          </div>

          {filteredStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Sinh viên</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Đề tài</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Trạng thái</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase min-w-[180px]">Tiến độ</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Cập nhật</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr
                      key={student._id}
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                            {student.student?.firstName?.[0] || "S"}
                            {student.student?.lastName?.[0] || ""}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{student.student?.fullName || "N/A"}</p>
                            <p className="text-xs text-slate-500">{student.student?.studentCode || "--"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-800">{student.topic?.topicCode || "--"}</p>
                        <p className="text-xs text-slate-500 max-w-[200px] truncate">{student.topic?.topicName}</p>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge percentage={student.percentage || 0} />
                      </td>
                      <td className="px-4 py-3">
                        <ProgressBar percentage={student.percentage || 0} size="small" />
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-slate-500">{formatDate(student.updatedAt)}</p>
                        {student.teacherComment && (
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                            <MessageSquareText size={12} />
                            Có nhận xét
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          className="p-2 rounded-lg hover:bg-indigo-100 text-indigo-600 transition-colors"
                          onClick={() => setSelectedStudent(student)}
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <Users size={32} className="text-slate-400" />
                </div>
                <span className="font-semibold text-slate-600">
                  {searchQuery || filterStatus !== "all" ? "Không có sinh viên phù hợp." : "Chưa có sinh viên nào được phân công."}
                </span>
              </div>
            </div>
          )}
        </div>

        <StudentDetailModal
          student={selectedStudent}
          isOpen={Boolean(selectedStudent)}
          onClose={() => setSelectedStudent(null)}
          onRefresh={loadData}
        />
      </section>
    </main>
  );
}
