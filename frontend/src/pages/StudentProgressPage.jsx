import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  Loader,
  BookOpen,
  Code,
  FileText,
  Flag,
  AlertCircle,
  RefreshCw,
  Zap,
  BookMarked,
  Target,
  Star,
  MessageSquare,
  Play,
  ChevronRight,
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
    borderColor: "border-blue-200",
    bgGradient: "from-blue-50 to-cyan-50",
    description: "Hoàn thành đăng ký đề tài và được phân công giảng viên hướng dẫn",
  },
  {
    key: "analysis",
    label: "Phân tích yêu cầu",
    icon: Target,
    color: "from-indigo-500 to-violet-500",
    borderColor: "border-indigo-200",
    bgGradient: "from-indigo-50 to-violet-50",
    description: "Phân tích yêu cầu đề tài, viết đề cương và lập kế hoạch thực hiện",
  },
  {
    key: "development",
    label: "Thiết kế & lập trình",
    icon: Code,
    color: "from-violet-500 to-purple-500",
    borderColor: "border-violet-200",
    bgGradient: "from-violet-50 to-purple-50",
    description: "Thiết kế hệ thống, lập trình và kiểm thử các chức năng chính",
  },
  {
    key: "report",
    label: "Hoàn thiện báo cáo",
    icon: FileText,
    color: "from-amber-500 to-orange-500",
    borderColor: "border-amber-200",
    bgGradient: "from-amber-50 to-orange-50",
    description: "Viết báo cáo, chuẩn bị tài liệu và hướng dẫn sử dụng",
  },
  {
    key: "complete",
    label: "Hoàn thành",
    icon: Flag,
    color: "from-emerald-500 to-teal-500",
    borderColor: "border-emerald-200",
    bgGradient: "from-emerald-50 to-teal-50",
    description: "Hoàn thành đồ án, nộp báo cáo và bảo vệ đồ án",
  },
];

const STAGE_ORDER = ["register", "analysis", "development", "report", "complete"];
const PERCENTAGES = { register: 20, analysis: 40, development: 70, report: 90, complete: 100 };

function getStageIndex(stage) {
  return STAGE_ORDER.indexOf(stage);
}

function RadialProgress({ percentage, size = 160, strokeWidth = 16 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  const color =
    percentage === 100
      ? "#10b981"
      : percentage >= 70
      ? "#8b5cf6"
      : percentage >= 40
      ? "#6366f1"
      : "#cbd5e1";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-slate-800 leading-none">{percentage}%</span>
        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Hoàn thành</span>
      </div>
    </div>
  );
}

function StepConnector({ isCompleted }) {
  return (
    <div className="absolute left-[22px] top-full w-0.5 h-5 z-0">
      <div className={`w-full h-full rounded-full transition-colors duration-500 ${isCompleted ? "bg-emerald-400" : "bg-slate-200"}`} />
    </div>
  );
}

function StageCard({ stage, isCompleted, isCurrent, isNext, onClick, disabled, index }) {
  const Icon = stage.icon;
  const isClickable = isNext && !disabled;
  const stagePct = PERCENTAGES[stage.key];

  return (
    <div className="relative flex items-start gap-0">
      {/* Step indicator */}
      <div className="flex flex-col items-center">
        <div
          className={`
            relative z-10 w-11 h-11 rounded-2xl flex items-center justify-center border-4 transition-all duration-500 shadow-md
            ${isCompleted ? "bg-emerald-500 border-emerald-200 shadow-emerald-200" :
              isCurrent ? "bg-indigo-500 border-indigo-200 shadow-indigo-200 animate-pulse" :
              "bg-white border-slate-200"}
          `}
        >
          {isCompleted ? (
            <CheckCircle2 size={22} className="text-white" />
          ) : (
            <Icon size={18} className={isCurrent ? "text-white" : "text-slate-400"} />
          )}
        </div>
        {index < STAGE_ORDER.length - 1 && (
          <div
            className={`w-0.5 flex-1 min-h-8 transition-colors duration-500 rounded-full my-1 ${
              isCompleted ? "bg-emerald-300" : "bg-slate-200"
            }`}
          />
        )}
      </div>

      {/* Content card */}
      <div
        onClick={isClickable ? onClick : undefined}
        className={`
          ml-4 flex-1 mb-4 p-5 rounded-2xl border-2 transition-all duration-300
          ${stage.borderColor}
          ${isClickable ? "bg-gradient-to-r " + stage.bgGradient + " cursor-pointer hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.99]" :
            isCompleted ? "bg-gradient-to-r " + stage.bgGradient : "bg-white"}
          ${isCurrent && !isCompleted ? "ring-2 ring-offset-1 ring-indigo-400 shadow-lg shadow-indigo-100" : ""}
          ${!isClickable && !isCompleted && !isCurrent ? "opacity-90" : ""}
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className={`font-black text-lg ${isCompleted ? "text-emerald-800" : isCurrent ? "text-slate-900" : "text-slate-600"}`}>
                {stage.label}
              </h3>
              {isCompleted && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-xs font-bold">
                  <CheckCircle2 size={10} /> Hoàn thành
                </span>
              )}
              {isCurrent && !isCompleted && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500 text-white text-xs font-bold animate-pulse">
                  <Clock size={10} /> Đang thực hiện
                </span>
              )}
            </div>
            <p className={`text-sm leading-relaxed ${isCompleted ? "text-slate-600" : isCurrent ? "text-slate-500" : "text-slate-400"}`}>{stage.description}</p>
          </div>

          <div className="ml-4 shrink-0 text-right">
            <div className={`text-2xl font-black ${isCompleted ? "text-emerald-600" : isCurrent ? "text-indigo-600" : "text-slate-300"}`}>
              {stagePct}%
            </div>
            {isClickable && (
              <button
                onClick={onClick}
                className="mt-1 flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Cập nhật <ChevronRight size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Progress bar for completed */}
        {isCompleted && (
          <div className="mt-3 w-full bg-emerald-100 rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full w-full transition-all duration-700" />
          </div>
        )}
      </div>
    </div>
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
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className={`p-6 bg-gradient-to-br ${stage.color} text-white relative overflow-hidden`}>
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/10 rounded-full" />
          <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-white/5 rounded-full" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-13 h-13 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <Icon size={26} />
            </div>
            <div>
              <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-0.5">Cập nhật tiến độ</p>
              <h2 className="text-xl font-black">{stage.label}</h2>
              <p className="text-white/80 text-sm font-medium mt-0.5">+{PERCENTAGES[stage.key]}% hoàn thành</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0 mt-0.5">
              <Zap size={16} className="text-indigo-600" />
            </div>
            <p className="text-sm text-indigo-700 leading-relaxed">
              Bạn sắp hoàn thành giai đoạn <strong>"{stage.label}"</strong>. Hệ thống sẽ tự động cập nhật tiến độ đồ án.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 flex items-center gap-2">
              <FileText size={14} />
              Ghi chú giai đoạn
              <span className="text-xs text-slate-400 font-normal">(tuỳ chọn)</span>
            </label>
            <textarea
              className="form-input min-h-20 resize-y py-3 text-sm"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Mô tả ngắn gì bạn đã làm trong giai đoạn này..."
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" className="flex-1 btn btn-secondary" onClick={onClose} disabled={isSaving}>
              Đóng
            </button>
            <button
              type="submit"
              className={`flex-1 btn text-white shadow-lg ${isSaving ? "bg-slate-400 cursor-not-allowed" : "bg-gradient-to-r " + stage.color}`}
              disabled={isSaving}
            >
              {isSaving ? (
                <><Loader size={16} className="animate-spin" /> Đang lưu...</>
              ) : (
                <><CheckCircle2 size={16} /> Xác nhận</>
              )}
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
      <section className="admin-content space-y-5 p-6">
        <div className="h-40 rounded-3xl bg-slate-100 animate-pulse" />
        <div className="flex gap-6">
          <div className="flex-1 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-2xl bg-slate-100 animate-pulse shrink-0" />
                <div className="flex-1 h-20 bg-slate-100 rounded-2xl animate-pulse" />
              </div>
            ))}
          </div>
          <div className="w-72 space-y-4">
            <div className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
            <div className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
          </div>
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
        <div className="rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-8 mb-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-white/5 rounded-full" />
          <div className="absolute top-4 right-4 w-32 h-32 border border-white/10 rounded-full" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                <Zap size={20} className="text-yellow-300" />
              </div>
              <span className="text-sm font-semibold text-white/80">Tiến độ đồ án</span>
            </div>
            <h1 className="text-4xl font-black mb-2">Theo dõi tiến độ</h1>
            <p className="text-white/80 max-w-lg">Cập nhật và theo dõi tiến độ thực hiện đồ án tốt nghiệp của bạn.</p>
          </div>
        </div>

        <div className="main-panel p-8 text-center bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl mb-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <BookMarked size={32} className="text-amber-500" />
          </div>
          <h2 className="text-xl font-black text-amber-700 mb-2">Bạn chưa đăng ký đề tài</h2>
          <p className="text-amber-600 mb-5 max-w-md mx-auto">Hãy đăng ký đề tài để bắt đầu theo dõi tiến độ thực hiện đồ án của mình.</p>
          <a href="/student/topics" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-blue-200 transition-all hover:-translate-y-0.5">
            <BookMarked size={18} /> Đăng ký đề tài ngay
          </a>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-black text-slate-800 mb-5 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-100"><Star size={16} className="text-indigo-600" /></div>
            Lộ trình đồ án tốt nghiệp
          </h3>
          <div className="grid gap-3">
            {STAGES.map((stage, idx) => {
              const Icon = stage.icon;
              return (
                <div key={stage.key} className={`flex items-center gap-4 p-4 rounded-xl border-2 border-dashed ${stage.borderColor} bg-white opacity-60`}>
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-400">{idx + 1}</div>
                  <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${stage.color}`}>
                    <Icon size={18} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-500 text-sm">{stage.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{stage.description}</p>
                  </div>
                  <span className="text-sm font-bold text-slate-400">{PERCENTAGES[stage.key]}%</span>
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
      setTimeout(() => setNotice(""), 4000);
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

  if (isLoading) return <LoadingSkeleton />;
  if (!myTopic) return <NotRegisteredState />;

  const nextStage = getNextStage();
  const percentage = progress?.percentage ?? 0;
  const completedCount = completedStageSet.size;
  const currentStageData = STAGES.find((s) => s.key === progress?.currentStage);
  const CurrentIcon = currentStageData?.icon || BookOpen;
  const hasProgress = progress && progress._id;

  return (
    <main className="admin-shell">
      <StudentSidebar />
      <section className="admin-content">

        {/* Top Banner with Radial */}
        <div className="rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-6 mb-5 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-white/5 rounded-full" />
          <div className="absolute top-4 right-4 w-24 h-24 border border-white/10 rounded-full" />
          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-xl bg-white/20 backdrop-blur-sm">
                  <Zap size={16} className="text-yellow-300" />
                </div>
                <span className="text-xs font-extrabold text-white/80 uppercase tracking-widest">Tiến độ đồ án</span>
              </div>
              <h1 className="text-3xl font-black mb-1">Theo dõi tiến độ</h1>
              <p className="text-white/70 text-sm max-w-sm font-medium">
                {hasProgress
                  ? `Cập nhật lần cuối: ${formatDate(progress.updatedAt)}`
                  : "Chưa có báo cáo tiến độ nào"}
              </p>

              {!hasProgress && (
                <button
                  onClick={() => setSelectedStage(STAGES[0])}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm text-white text-sm font-bold hover:bg-white/30 transition-all"
                >
                  <Play size={14} />
                  Cập nhật giai đoạn đầu tiên
                </button>
              )}
            </div>
            <div className="shrink-0">
              <RadialProgress percentage={percentage} size={150} strokeWidth={14} />
            </div>
          </div>
        </div>

        {/* Notice / Error */}
        {notice && (
          <div className="mb-4 flex items-center gap-3 px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 animate-in fade-in slide-in-from-top-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0">
              <CheckCircle2 size={16} className="text-white" />
            </div>
            <p className="text-sm font-extrabold text-emerald-800">{notice}</p>
          </div>
        )}
        {error && (
          <div className="mb-4 flex items-center gap-3 px-5 py-3 rounded-2xl bg-red-50 border-2 border-red-200">
            <div className="w-8 h-8 rounded-xl bg-red-500 flex items-center justify-center shrink-0">
              <AlertCircle size={16} className="text-white" />
            </div>
            <p className="text-sm font-extrabold text-red-800">{error}</p>
          </div>
        )}

        {/* Main Grid */}
        <div className="flex gap-5">
          {/* Left: Timeline */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-100"><CurrentIcon size={16} className="text-indigo-600" /></div>
                Các giai đoạn thực hiện
              </h2>
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-500 hover:border-slate-300 hover:text-slate-700 transition-all"
                onClick={loadData}
              >
                <RefreshCw size={12} /> Làm mới
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              {STAGES.map((stage, idx) => (
                <StageCard
                  key={stage.key}
                  stage={stage}
                  index={idx}
                  isCompleted={completedStageSet.has(stage.key)}
                  isCurrent={progress?.currentStage === stage.key}
                  isNext={stage.key === nextStage}
                  onClick={() => setSelectedStage(stage)}
                  disabled={!progress}
                />
              ))}
            </div>

            {progress?.teacherComment && (
              <div className="mt-4 p-4 rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
                <h4 className="font-extrabold text-amber-900 mb-2 flex items-center gap-2 text-sm">
                  <div className="p-1 rounded-lg bg-amber-200/50"><MessageSquare size={14} /></div>
                  Nhận xét từ giảng viên
                </h4>
                <p className="text-sm font-medium text-amber-800 leading-relaxed">{progress.teacherComment}</p>
              </div>
            )}
          </div>

          {/* Right: Info Cards */}
          <aside className="w-80 shrink-0 space-y-4">

            {/* Topic Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <h3 className="font-extrabold text-slate-900 mb-4 flex items-center gap-2 text-sm">
                <div className="p-1.5 rounded-lg bg-violet-100"><BookMarked size={14} className="text-violet-600" /></div>
                Thông tin đề tài
              </h3>
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Mã đề tài</span>
                  <p className="font-black text-slate-900 text-base mt-0.5">{myTopic.topicCode}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Tên đề tài</span>
                  <p className="font-extrabold text-slate-800 text-sm leading-snug mt-0.5">{myTopic.topicName}</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/50">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Giảng viên</span>
                  <p className="font-extrabold text-sm mt-0.5">
                    {myTopic.teacherId?.userId ? (
                      fullName(myTopic.teacherId.userId)
                    ) : (
                      <span className="text-red-500 font-semibold">Chưa phân công</span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <h3 className="font-extrabold text-slate-900 mb-4 flex items-center gap-2 text-sm">
                <div className="p-1.5 rounded-lg bg-emerald-100"><Star size={14} className="text-emerald-600" /></div>
                Thống kê
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 text-center">
                  <p className="text-2xl font-black text-blue-700">{completedCount}</p>
                  <p className="text-xs font-bold text-blue-600 mt-0.5">Đã hoàn thành</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 text-center">
                  <p className="text-2xl font-black text-violet-700">{percentage}%</p>
                  <p className="text-xs font-bold text-violet-600 mt-0.5">Tiến độ</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 text-center">
                  <p className="text-2xl font-black text-amber-700">{STAGE_ORDER.length - completedCount}</p>
                  <p className="text-xs font-bold text-amber-600 mt-0.5">Còn lại</p>
                </div>
                <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 text-center">
                  <p className="text-2xl font-black text-emerald-700">{progress?.teacherComment ? "1" : "0"}</p>
                  <p className="text-xs font-bold text-emerald-600 mt-0.5">Phản hồi</p>
                </div>
              </div>
            </div>

            {/* Guide Card */}
            <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-5 text-white relative overflow-hidden">
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-white/20"><Zap size={14} /></div>
                  <span className="font-extrabold text-sm">Hướng dẫn</span>
                </div>
                <p className="text-white/90 text-sm leading-relaxed font-medium">
                  Click vào giai đoạn tiếp theo để cập nhật tiến độ. Hệ thống tự động tính % hoàn thành.
                </p>
              </div>
            </div>
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
