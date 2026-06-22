import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  BookOpen,
  Target,
  Code,
  FileText,
  Flag,
  TrendingUp,
  Calendar,
  Loader2,
  Inbox,
  GraduationCap,
  ChevronRight,
} from "lucide-react";
import StudentSidebar from "../components/StudentSidebar.jsx";
import { getMyTopicRegistration, getMyProgress } from "../lib/api.js";
import { AvatarDisplay } from "../components/AvatarDisplay.jsx";

const STAGE_META = {
  register: {
    key: "register",
    label: "Đăng ký đề tài",
    icon: BookOpen,
    gradient: "from-blue-500 to-cyan-500",
    bg: "bg-blue-50",
    border: "border-blue-200",
    textColor: "text-blue-600",
  },
  analysis: {
    key: "analysis",
    label: "Phân tích yêu cầu",
    icon: Target,
    gradient: "from-indigo-500 to-violet-500",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    textColor: "text-indigo-600",
  },
  development: {
    key: "development",
    label: "Thiết kế & lập trình",
    icon: Code,
    gradient: "from-violet-500 to-purple-500",
    bg: "bg-violet-50",
    border: "border-violet-200",
    textColor: "text-violet-600",
  },
  report: {
    key: "report",
    label: "Hoàn thiện báo cáo",
    icon: FileText,
    gradient: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
    border: "border-amber-200",
    textColor: "text-amber-600",
  },
  complete: {
    key: "complete",
    label: "Hoàn thành",
    icon: Flag,
    gradient: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    textColor: "text-emerald-600",
  },
};

const ACTION_CONFIG = {
  approved: {
    label: "Đã duyệt",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    textColor: "text-emerald-700",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Từ chối",
    bg: "bg-red-50",
    border: "border-red-200",
    textColor: "text-red-700",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    icon: XCircle,
  },
  submitted: {
    label: "Đã nộp",
    bg: "bg-blue-50",
    border: "border-blue-200",
    textColor: "text-blue-700",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    icon: Clock,
  },
  resubmitted: {
    label: "Gửi lại",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    textColor: "text-indigo-700",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    icon: RefreshCw,
  },
};

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

function formatRelativeTime(value) {
  if (!value) return "";
  const now = new Date();
  const date = new Date(value);
  const diff = now - date;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;
  return formatDate(value);
}

function StageBadge({ stage }) {
  const meta = STAGE_META[stage];
  if (!meta) return null;
  const Icon = meta.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${meta.bg} ${meta.border} ${meta.textColor}`}>
      <Icon size={12} />
      {meta.label}
    </span>
  );
}

function ActionBadge({ action }) {
  const cfg = ACTION_CONFIG[action] || ACTION_CONFIG.submitted;
  const Icon = cfg.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${cfg.bg} ${cfg.border} ${cfg.textColor}`}>
      <span className={`w-5 h-5 rounded-full flex items-center justify-center ${cfg.iconBg}`}>
        <Icon size={11} />
      </span>
      {cfg.label}
    </span>
  );
}

function NotificationCard({ item, isLatest }) {
  const meta = STAGE_META[item.stage] || {};
  const teacher = item.reviewerId?.userId;
  const Icon = meta.icon || Clock;

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl bg-white border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5
        ${isLatest ? "ring-2 ring-amber-400 shadow-amber-100 border-amber-200" : "border-slate-200 shadow-sm"}
      `}
    >
      {isLatest && (
        <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-bold rounded-bl-xl">
          Mới nhất
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${meta.gradient || "from-slate-400 to-slate-500"} flex items-center justify-center shadow-lg`}>
            <Icon size={22} className="text-white" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-900">{meta.label || "Giai đoạn"}</h3>
                <ActionBadge action={item.action} />
              </div>
              <span className="text-xs text-slate-400 shrink-0">{formatRelativeTime(item.reviewedAt)}</span>
            </div>

            {/* Comment */}
            {item.teacherComment && (
              <div className={`p-4 rounded-xl ${meta.bg || "bg-slate-50"} border ${meta.border || "border-slate-100"} mb-3`}>
                <div className="flex items-start gap-3">
                  <MessageSquare size={16} className={`shrink-0 mt-0.5 ${meta.textColor || "text-slate-500"}`} />
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{item.teacherComment}</p>
                </div>
              </div>
            )}

            {/* Reviewer info */}
            {teacher && (
              <div className="flex items-center gap-3 pt-3 mt-3 border-t border-slate-100">
                <AvatarDisplay user={teacher} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 truncate">{fullName(teacher)}</p>
                  <p className="text-xs text-slate-400">{meta.label || "Giảng viên hướng dẫn"}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-slate-500">{formatDate(item.reviewedAt)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CurrentStageCard({ topic, progress }) {
  const stage = progress?.currentStage || "register";
  const meta = STAGE_META[stage] || STAGE_META.register;
  const Icon = meta.icon;

  const statusConfig = {
    approved: { text: "Đã duyệt", bg: "bg-emerald-500", icon: CheckCircle2 },
    needs_revision: { text: "Cần chỉnh sửa", bg: "bg-red-500", icon: XCircle },
    pending_teacher_approval: { text: "Chờ xác nhận", bg: "bg-amber-500", icon: Clock },
    "": { text: "Đang thực hiện", bg: "bg-blue-500", icon: TrendingUp },
  };

  const status = statusConfig[progress?.status] || statusConfig[""];
  const StatusIcon = status.icon;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6 text-white shadow-2xl shadow-purple-500/20">
      {/* Decorative elements */}
      <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/10 rounded-full" />
      <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-white/5 rounded-full" />
      <div className="absolute top-4 right-20 w-8 h-8 border border-white/20 rounded-full" />

      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-xl border border-white/20">
            <Icon size={28} />
          </div>
          <div>
            <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-0.5">Giai đoạn hiện tại</p>
            <h2 className="text-2xl font-black">{meta.label}</h2>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-6">
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${status.bg} backdrop-blur-sm shadow-lg`}>
            <StatusIcon size={18} />
            <span className="text-sm font-bold">{status.text}</span>
          </div>

          {topic && (
            <div className="ml-auto text-right">
              <p className="text-white/60 text-xs">Đề tài của bạn</p>
              <p className="text-sm font-bold truncate max-w-48">{topic.topicName}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, gradient }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm border border-slate-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
      <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
        <div className={`absolute inset-0 ${gradient} rounded-full -translate-y-1/2 translate-x-1/3`} />
      </div>
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg mb-3`}>
        <Icon size={22} className="text-white" />
      </div>
      <p className="text-3xl font-black text-slate-900">{value}</p>
      <p className="text-sm text-slate-500 mt-1 font-medium">{label}</p>
    </div>
  );
}

function LatestCommentCard({ comment, stage }) {
  const meta = STAGE_META[stage] || {};
  if (!comment?.teacherComment) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-5 shadow-lg shadow-amber-100/50">
      <div className="absolute -top-8 -right-8 w-32 h-32 bg-amber-200/30 rounded-full" />
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
            <MessageSquare size={20} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Nhận xét mới nhất</p>
            <p className="text-sm text-amber-800/70">{formatRelativeTime(comment.reviewedAt)}</p>
          </div>
          <ChevronRight size={18} className="ml-auto text-amber-400" />
        </div>

        <p className="text-amber-900 font-medium leading-relaxed whitespace-pre-wrap">{comment.teacherComment}</p>

        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-amber-200">
          <GraduationCap size={14} className="text-amber-600" />
          <span className="text-xs text-amber-700 font-semibold">{meta.label || "Phản hồi từ giảng viên"}</span>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ hasTopic }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mb-6 shadow-inner">
        {hasTopic ? (
          <Inbox size={40} className="text-slate-400" />
        ) : (
          <Bell size={40} className="text-slate-400" />
        )}
      </div>
      <h3 className="text-xl font-bold text-slate-700 mb-2">
        {hasTopic ? "Chưa có thông báo nào" : "Bạn chưa có đề tài"}
      </h3>
      <p className="text-slate-500 max-w-sm leading-relaxed">
        {hasTopic
          ? "Các nhận xét và phản hồi từ giảng viên sẽ xuất hiện tại đây khi có cập nhật mới."
          : "Hãy đăng ký đề tài để bắt đầu nhận phản hồi từ giảng viên hướng dẫn."}
      </p>
    </div>
  );
}

export default function StudentNotificationsPage() {
  const [topic, setTopic] = useState(null);
  const [progress, setProgress] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError("");
      try {
        const [topicData, progressData] = await Promise.all([
          getMyTopicRegistration(),
          getMyProgress(),
        ]);
        setTopic(topicData?.topic || null);
        setProgress(progressData || null);
      } catch (err) {
        console.error("Failed to load data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const reviewHistory = useMemo(() => {
    if (!progress?.reviewHistory?.length) return [];
    return [...progress.reviewHistory].sort((a, b) => new Date(b.reviewedAt) - new Date(a.reviewedAt));
  }, [progress]);

  const stats = useMemo(() => {
    const history = reviewHistory;
    return {
      total: history.length,
      approved: history.filter((h) => h.action === "approved").length,
      rejected: history.filter((h) => h.action === "rejected").length,
      pending: history.filter((h) => h.action === "submitted" || h.action === "resubmitted").length,
    };
  }, [reviewHistory]);

  const latestComment = reviewHistory.find((h) => h.teacherComment && h.action !== "submitted");

  return (
    <main className="admin-shell">
      <StudentSidebar />
      <section className="admin-content">
        <header className="page-header">
          <p className="eyebrow">Sinh viên</p>
          <h1>Thông báo &amp; Nhận xét</h1>
          <p>Xem phản hồi và nhận xét từ giảng viên hướng dẫn về tiến độ đồ án của bạn.</p>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={40} className="animate-spin text-indigo-600" />
            <span className="ml-3 text-slate-600 font-medium">Đang tải dữ liệu...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 mb-6">
            <p className="font-medium">Lỗi: {error}</p>
          </div>
        ) : (
          <>
            {/* Current Stage Hero */}
            <CurrentStageCard topic={topic} progress={progress} />

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-6">
              <StatCard icon={Bell} label="Tổng nhận xét" value={stats.total} gradient="from-indigo-500 to-violet-500" />
              <StatCard icon={CheckCircle2} label="Đã duyệt" value={stats.approved} gradient="from-emerald-500 to-teal-500" />
              <StatCard icon={XCircle} label="Từ chối" value={stats.rejected} gradient="from-red-500 to-rose-500" />
              <StatCard icon={Clock} label="Đang chờ" value={stats.pending} gradient="from-amber-500 to-orange-500" />
            </div>

            {/* Latest Comment Highlight */}
            {latestComment && (
              <div className="mb-6">
                <LatestCommentCard comment={latestComment} stage={latestComment.stage} />
              </div>
            )}

            {/* History Section */}
            <div className="main-panel">
              <div className="panel-header">
                <h2>Lịch sử nhận xét</h2>
                <span className="text-sm text-slate-500">{reviewHistory.length} nhận xét</span>
              </div>

              {reviewHistory.length === 0 ? (
                <EmptyState hasTopic={!!topic} />
              ) : (
                <div className="space-y-4">
                  {reviewHistory.map((item, index) => (
                    <NotificationCard
                      key={`${item.stage}-${index}`}
                      item={item}
                      isLatest={index === 0 && latestComment}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
