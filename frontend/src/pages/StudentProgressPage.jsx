import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  Loader,
  Milestone,
  Target,
  TrendingUp,
  BookOpen,
  Code,
  FileText,
  Flag,
  ChevronRight,
  Save,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import StudentSidebar from "../components/StudentSidebar.jsx";
import { getMyTopicRegistration, getMyProgress, updateMyStage } from "../lib/api.js";

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
  {
    key: "register",
    label: "Đăng ký đề tài",
    icon: BookOpen,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-600",
    description: "Hoàn thành đăng ký đề tài và được phân công giảng viên hướng dẫn",
  },
  {
    key: "analysis",
    label: "Phân tích yêu cầu",
    icon: Target,
    color: "from-indigo-500 to-purple-500",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
    textColor: "text-indigo-600",
    description: "Phân tích yêu cầu đề tài, viết đề cương và lập kế hoạch thực hiện",
  },
  {
    key: "development",
    label: "Thiết kế và lập trình",
    icon: Code,
    color: "from-violet-500 to-fuchsia-500",
    bgColor: "bg-violet-50",
    borderColor: "border-violet-200",
    textColor: "text-violet-600",
    description: "Thiết kế hệ thống, lập trình và kiểm thử các chức năng",
  },
  {
    key: "report",
    label: "Hoàn thiện báo cáo",
    icon: FileText,
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    textColor: "text-amber-600",
    description: "Viết báo cáo, chuẩn bị tài liệu và hướng dẫn sử dụng",
  },
  {
    key: "complete",
    label: "Hoàn thành",
    icon: Flag,
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    textColor: "text-emerald-600",
    description: "Hoàn thành đồ án, nộp báo cáo và bảo vệ",
  },
];

const STAGE_ORDER = ["register", "analysis", "development", "report", "complete"];
const PERCENTAGES = { register: 20, analysis: 40, development: 70, report: 90, complete: 100 };

function getStageIndex(stage) {
  return STAGE_ORDER.indexOf(stage);
}

function ProgressBar({ percentage, showLabel = true, size = "default" }) {
  const color = percentage === 100
    ? "bg-gradient-to-r from-emerald-500 to-teal-500"
    : percentage >= 70
    ? "bg-gradient-to-r from-violet-500 to-purple-500"
    : percentage >= 40
    ? "bg-gradient-to-r from-indigo-500 to-blue-500"
    : "bg-gradient-to-r from-slate-400 to-slate-500";

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-600">Tiến độ tổng thể</span>
          <span className={`text-lg font-bold ${percentage === 100 ? "text-emerald-600" : percentage >= 50 ? "text-indigo-600" : "text-slate-600"}`}>
            {percentage}%
          </span>
        </div>
      )}
      <div className={`w-full bg-slate-200 rounded-full ${size === "small" ? "h-2" : "h-3"} overflow-hidden`}>
        <div
          className={`${color} ${size === "small" ? "h-2" : "h-3"} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function StageCard({ stage, isCompleted, isCurrent, isNext, onClick, disabled }) {
  const Icon = stage.icon;
  const isClickable = isNext && !disabled;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isClickable}
      className={`
        relative flex items-start gap-4 p-4 rounded-xl border-2 transition-all duration-300 w-full text-left
        ${stage.borderColor}
        ${stage.bgColor}
        ${isClickable ? "cursor-pointer hover:shadow-lg hover:scale-[1.02] hover:-translate-y-1" : "cursor-default opacity-80"}
        ${isCurrent ? "ring-4 ring-offset-2 ring-indigo-300 shadow-lg" : ""}
        ${isCompleted ? "opacity-90" : ""}
      `}
    >
      <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${stage.color} shadow-lg`}>
        <Icon size={24} className="text-white" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h3 className={`font-bold text-base ${isCompleted ? "text-slate-700" : "text-slate-800"}`}>
            {stage.label}
          </h3>
          {isCompleted && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-xs font-bold">
              <CheckCircle2 size={12} /> Hoàn thành
            </span>
          )}
          {isCurrent && !isCompleted && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500 text-white text-xs font-bold animate-pulse">
              <Clock size={12} /> Đang thực hiện
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500 leading-relaxed">{stage.description}</p>

        {isClickable && (
          <div className="mt-3 flex items-center gap-2 text-indigo-600">
            <ChevronRight size={16} />
            <span className="text-sm font-semibold">Click để cập nhật tiến độ</span>
          </div>
        )}
      </div>

      <div className="shrink-0">
        {isCompleted ? (
          <CheckCircle2 size={28} className="text-emerald-500" />
        ) : isCurrent ? (
          <div className="w-7 h-7 rounded-full border-2 border-indigo-400 bg-indigo-50 flex items-center justify-center">
            <Clock size={14} className="text-indigo-500 animate-pulse" />
          </div>
        ) : (
          <Circle size={28} className="text-slate-300" />
        )}
      </div>
    </button>
  );
}

function StageModal({ stage, isOpen, onClose, onSave, isSaving }) {
  const [notes, setNotes] = useState("");

  if (!isOpen || !stage) return null;

  const Icon = stage.icon;

  function handleSubmit(e) {
    e.preventDefault();
    onSave(stage.key, notes);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className={`p-6 bg-gradient-to-r ${stage.color} text-white`}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
              <Icon size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Cập nhật giai đoạn</h2>
              <p className="text-white/90 font-medium">{stage.label}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="flex items-start gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
            <AlertCircle size={20} className="text-indigo-500 mt-0.5 shrink-0" />
            <p className="text-sm text-indigo-700 leading-relaxed">
              Bạn đang đánh dấu giai đoạn <strong>"{stage.label}"</strong> là hoàn thành. Hệ thống sẽ tự động cập nhật tiến độ đồ án của bạn.
            </p>
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-slate-600">
              Ghi chú <span className="text-slate-400 font-normal">(không bắt buộc)</span>
            </label>
            <textarea
              className="form-input min-h-24 resize-y py-3 leading-relaxed"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Nhập ghi chú về tiến độ giai đoạn này..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSaving}>
              <span>Hủy</span>
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? (
                <Loader size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              <span>{isSaving ? "Đang lưu..." : "Xác nhận hoàn thành"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <main className="admin-shell">
      <StudentSidebar />
      <section className="admin-content">
        <div className="page-header animate-pulse">
          <div className="h-4 w-20 bg-slate-200 rounded mb-2"></div>
          <div className="h-8 w-64 bg-slate-200 rounded mb-2"></div>
          <div className="h-4 w-96 bg-slate-200 rounded"></div>
        </div>
        <div className="space-y-4">
          <div className="h-32 bg-slate-100 rounded-xl animate-pulse"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </section>
    </main>
  );
}

function NotRegisteredState() {
  return (
    <main className="admin-shell">
      <StudentSidebar />
      <section className="admin-content">
        <div className="page-header">
          <p className="eyebrow">Sinh viên</p>
          <h1>Theo dõi tiến độ</h1>
        </div>
        <div className="main-panel p-8 mb-5 text-center bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center">
              <Milestone size={32} className="text-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-amber-700">Bạn chưa đăng ký đề tài</h2>
              <p className="text-amber-600 mt-1 max-w-md">Vui lòng đăng ký đề tài để bắt đầu theo dõi tiến độ thực hiện đồ án của mình.</p>
            </div>
            <a
              href="/student/topics"
              className="btn btn-primary mt-2"
            >
              <BookOpen size={18} />
              <span>Đăng ký đề tài</span>
            </a>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 mb-5">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Milestone size={20} className="text-indigo-500" />
            Quy trình thực hiện đồ án
          </h3>
          <p className="text-sm text-slate-500 mb-5">Dưới đây là các giai đoạn bạn cần hoàn thành trong suốt quá trình thực hiện đồ án tốt nghiệp:</p>
          <div className="space-y-3">
            {STAGES.map((stage, idx) => {
              const Icon = stage.icon;
              return (
                <div
                  key={stage.key}
                  className={`flex items-start gap-4 p-4 rounded-xl border-2 border-dashed ${stage.borderColor} bg-slate-50 opacity-70`}
                >
                  <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${stage.color} shadow-lg`}>
                    <Icon size={20} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-slate-400">Giai đoạn {idx + 1}</span>
                    </div>
                    <h4 className="font-bold text-slate-600">{stage.label}</h4>
                    <p className="text-sm text-slate-400 mt-1">{stage.description}</p>
                  </div>
                  <div className="shrink-0">
                    <Circle size={24} className="text-slate-300" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

export default function StudentProgressPage() {
  const [myTopic, setMyTopic] = useState(null);
  const [progress, setProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);

  async function loadData() {
    setIsLoading(true);
    setError("");
    try {
      const [topicData, progressData] = await Promise.all([
        getMyTopicRegistration(),
        getMyProgress(),
      ]);
      setMyTopic(topicData.topic || null);

      if (progressData && progressData._id) {
        setProgress(progressData);
      } else if (topicData.topic) {
        setProgress(null);
      }
    } catch (err) {
      if (err.status !== 404) {
        setError(err.message || "Không thể tải dữ liệu.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const completedStageSet = useMemo(() => {
    return new Set(progress?.completedStages || []);
  }, [progress?.completedStages]);

  async function handleSaveStage(stageKey, notes) {
    if (!progress?._id) return;
    setIsSaving(true);
    setError("");
    try {
      const updated = await updateMyStage(progress._id, { stage: stageKey, notes });
      setProgress(updated);
      setNotice(`Đã cập nhật giai đoạn "${STAGES.find((s) => s.key === stageKey)?.label}" thành công!`);
      setSelectedStage(null);

      setTimeout(() => setNotice(""), 3000);
    } catch (err) {
      setError(err.message || "Không thể cập nhật tiến độ.");
    } finally {
      setIsSaving(false);
    }
  }

  function getNextStage() {
    const current = progress?.currentStage || "";
    const idx = getStageIndex(current);
    if (idx >= STAGE_ORDER.length - 1) return null;
    if (current === "") return "register";
    return STAGE_ORDER[idx + 1];
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!myTopic) {
    return <NotRegisteredState />;
  }

  const nextStage = getNextStage();
  const percentage = progress?.percentage || (progress ? 0 : 0);

  return (
    <main className="admin-shell">
      <StudentSidebar />
      <section className="admin-content">
        <div className="page-header flex items-center justify-between">
          <div>
            <p className="eyebrow">Sinh viên</p>
            <h1>Theo dõi tiến độ</h1>
            <p>Cập nhật và theo dõi tiến độ thực hiện đồ án của bạn.</p>
          </div>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={loadData}
          >
            <RefreshCw size={16} />
            <span>Làm mới</span>
          </button>
        </div>

        {notice && <div className="notice notice-success mb-5 animate-in fade-in slide-in-from-top-2">{notice}</div>}
        {error && <div className="notice notice-error mb-5">{error}</div>}

        <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            <div className="main-panel p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                  <TrendingUp size={20} />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-slate-900">Tiến độ đồ án</h2>
                  <p className="text-sm text-slate-500">
                    {progress ? `Cập nhật lần cuối: ${formatDate(progress.updatedAt)}` : "Chưa có dữ liệu"}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`text-3xl font-bold ${percentage === 100 ? "text-emerald-600" : percentage >= 50 ? "text-indigo-600" : "text-slate-600"}`}>
                    {percentage}%
                  </span>
                </div>
              </div>
              <ProgressBar percentage={percentage} />
            </div>

            <div className="space-y-3">
              {STAGES.map((stage) => {
                const isCompleted = completedStageSet.has(stage.key);
                const isCurrent = progress?.currentStage === stage.key;
                const isNext = stage.key === nextStage;

                return (
                  <StageCard
                    key={stage.key}
                    stage={stage}
                    isCompleted={isCompleted}
                    isCurrent={isCurrent}
                    isNext={isNext}
                    onClick={() => setSelectedStage(stage)}
                    disabled={!progress}
                  />
                );
              })}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="main-panel p-5">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Milestone size={18} className="text-indigo-500" />
                Thông tin đề tài
              </h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-slate-50">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Mã đề tài</span>
                  <p className="font-bold text-slate-900">{myTopic.topicCode}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Tên đề tài</span>
                  <p className="font-semibold text-slate-800 leading-tight">{myTopic.topicName}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50">
                  <span className="text-xs font-semibold text-slate-500 uppercase">Giảng viên</span>
                  <p className="font-semibold text-slate-800">
                    {myTopic.teacherId?.userId ? fullName(myTopic.teacherId.userId) : "Chưa phân công"}
                  </p>
                </div>
              </div>
            </div>

            <div className="main-panel p-5">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Target size={18} className="text-violet-500" />
                Mốc tiến độ
              </h3>
              <div className="space-y-3">
                {STAGES.map((stage, idx) => {
                  const isCompleted = completedStageSet.has(stage.key);
                  const stagePercentage = PERCENTAGES[stage.key];
                  return (
                    <div key={stage.key} className="flex items-center gap-3">
                      <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${isCompleted ? "bg-emerald-500" : "bg-slate-200"}`}>
                        {isCompleted ? (
                          <CheckCircle2 size={14} className="text-white" />
                        ) : (
                          <span className="text-xs font-bold text-slate-500">{idx + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium truncate ${isCompleted ? "text-slate-700" : "text-slate-400"}`}>
                            {stage.label}
                          </span>
                          <span className={`text-xs font-semibold ml-2 ${isCompleted ? "text-emerald-600" : "text-slate-400"}`}>
                            {stagePercentage}%
                          </span>
                        </div>
                        <div className="mt-1 w-full bg-slate-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-500 ${isCompleted ? "bg-emerald-500" : "bg-slate-300"}`}
                            style={{ width: isCompleted ? "100%" : "0%" }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-indigo-500 mt-0.5 shrink-0" />
                <div className="text-sm leading-relaxed text-indigo-700">
                  <strong className="font-semibold">Hướng dẫn:</strong> Click vào giai đoạn tiếp theo để cập nhật tiến độ. Hệ thống sẽ tự động tính phần trăm hoàn thành.
                </div>
              </div>
            </div>

            {progress?.teacherComment && (
              <div className="p-4 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                  <Target size={16} />
                  Nhận xét từ giảng viên
                </h4>
                <p className="text-sm text-amber-700 leading-relaxed">{progress.teacherComment}</p>
              </div>
            )}
          </aside>
        </div>

        <StageModal
          stage={selectedStage}
          isOpen={Boolean(selectedStage)}
          onClose={() => setSelectedStage(null)}
          onSave={handleSaveStage}
          isSaving={isSaving}
        />
      </section>
    </main>
  );
}
