import { useEffect, useState } from "react";
import {
  AlertCircle,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Lock,
  Star,
  X,
} from "lucide-react";
import StudentSidebar from "../components/StudentSidebar.jsx";
import { getMyDefenseScore, getMyTopicRegistration, getMyProgress } from "../lib/api.js";

function fullName(user) {
  return [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.email || "—";
}

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  }).format(new Date(value));
}

function formatDateTime(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  }).format(new Date(value));
}

function ScoreBar({ label, value, max = 10, color, bg }) {
  const pct = Math.min(100, ((value ?? 0) / max) * 100);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-600">{label}</span>
        <span className="text-sm font-bold" style={{ color }}>{value != null ? value.toFixed(1) : "—"}</span>
      </div>
      <div className="h-3 rounded-full overflow-hidden" style={{ background: bg }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <main className="admin-shell">
      <StudentSidebar />
      <section className="admin-content">
        <div className="animate-pulse space-y-6">
          <div className="h-6 w-40 bg-slate-200 rounded" />
          <div className="rounded-3xl bg-white h-48 animate-pulse" />
          <div className="rounded-3xl bg-white h-80 animate-pulse" />
        </div>
      </section>
    </main>
  );
}

export default function StudentDefenseScorePage() {
  const [myTopic, setMyTopic] = useState(null);
  const [progress, setProgress] = useState(null);
  const [score, setScore] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadData() {
    setIsLoading(true);
    try {
      const [topicResult, progressResult, scoreResult] = await Promise.allSettled([
        getMyTopicRegistration(),
        getMyProgress(),
        getMyDefenseScore(),
      ]);
      if (topicResult.status === "fulfilled") setMyTopic(topicResult.value.topic);
      if (progressResult.status === "fulfilled") setProgress(progressResult.value);
      if (scoreResult.status === "fulfilled") setScore(scoreResult.value);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  if (isLoading) return <LoadingSkeleton />;

  const isComplete = progress?.completedStages?.includes("complete");
  const hasScore = score?.processScore != null;

  return (
    <main className="admin-shell">
      <StudentSidebar />
      <section className="admin-content">

        {/* Page Header */}
        <div className="page-header">
          <div className="page-header-decoration" />
          <div className="page-header-decoration-2" />
          <h1>Điểm bảo vệ <span className="highlight">Đồ án</span></h1>
          <p>Kết quả bảo vệ đồ án tốt nghiệp</p>
        </div>

        {/* Topic info */}
        {myTopic && (
          <div className="mb-6 flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
            <div className="grid size-10 place-items-center rounded-xl bg-indigo-100 text-indigo-600 shrink-0">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Đề tài của bạn</p>
              <p className="font-bold text-slate-800 text-sm">{myTopic.topicName}</p>
            </div>
            <span className="ml-auto font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">{myTopic.topicCode}</span>
          </div>
        )}

        {/* 3 Status states */}
        {!myTopic && (
          <div className="rounded-3xl bg-white shadow-lg border border-slate-100 p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={28} className="text-slate-400" />
            </div>
            <p className="font-bold text-slate-600 text-base">Bạn chưa đăng ký đề tài</p>
            <p className="text-sm text-slate-400 mt-1">Hãy đăng ký đề tài để thực hiện đồ án</p>
          </div>
        )}

        {myTopic && !isComplete && (
          <div className="rounded-3xl bg-white shadow-lg border border-slate-100 p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
              <Clock size={28} className="text-amber-500" />
            </div>
            <p className="font-bold text-slate-600 text-base">Chưa đủ điều kiện chấm điểm</p>
            <p className="text-sm text-slate-400 mt-1">Hãy hoàn thành giai đoạn 5 (Hoàn thành đồ án) để được chấm điểm bảo vệ.</p>
          </div>
        )}

        {myTopic && isComplete && !hasScore && (
          <div className="rounded-3xl bg-white shadow-lg border border-slate-100 p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <Award size={28} className="text-blue-500" />
            </div>
            <p className="font-bold text-slate-600 text-base">Đang chờ chấm điểm</p>
            <p className="text-sm text-slate-400 mt-1 mb-4">Đồ án của bạn đã hoàn thành. Giảng viên đang chấm điểm bảo vệ, vui lòng chờ kết quả.</p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-sm font-semibold">
              <Clock size={16} />
              Điểm sẽ được công bố sau buổi bảo vệ
            </div>
          </div>
        )}

        {/* Score Card — only when has score */}
        {myTopic && isComplete && hasScore && (
          <div className="space-y-6">
            {/* Score Hero */}
            <div className="relative rounded-3xl overflow-hidden shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700" />
              <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.06) 0%, transparent 40%)' }} />
              <div className="absolute bottom-0 right-0 w-64 h-64 rounded-full bg-white/5 translate-x-16 translate-y-16" />
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-10 translate-x-10" />

              <div className="relative p-8 pt-10">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      {score.isLocked ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-bold border border-emerald-400/30">
                          <Lock size={12} />
                          Đã có kết quả
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-bold border border-blue-400/30">
                          <Clock size={12} />
                          Đang chờ công bố
                        </span>
                      )}
                    </div>
                    <h2 className="text-slate-200 text-sm font-medium mt-2">Kết quả bảo vệ đồ án</h2>
                    <p className="text-white text-xs mt-1">
                      Ngày chấm: <strong>{formatDate(score.defenseDate)}</strong>
                      {score.enteredBy ? ` · Nhập bởi ${fullName(score.enteredBy)}` : ""}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-6xl font-black text-white leading-none">{score.finalScore?.toFixed(1) ?? "—"}</p>
                    <p className="text-white/60 text-sm mt-1">trên 10 điểm</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Score breakdown */}
            <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
              {/* Left: bars */}
              <div className="rounded-3xl bg-white shadow-lg border border-slate-100 overflow-hidden p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                  <Award size={18} className="text-indigo-600" />
                  Chi tiết điểm
                </h3>
                <div className="space-y-5">
                  <ScoreBar label="Điểm quá trình" value={score.processScore} color="#6366f1" bg="#eef2ff" />
                  <ScoreBar label="Điểm báo cáo" value={score.reportScore} color="#8b5cf6" bg="#f5f3ff" />
                  <ScoreBar label="Điểm phản biện" value={score.rebuttalScore} color="#f59e0b" bg="#fffbeb" />
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-slate-700">Điểm tổng kết</span>
                    <span className="text-3xl font-black text-indigo-600">{score.finalScore?.toFixed(1) ?? "—"}</span>
                  </div>
                </div>
              </div>

              {/* Right: comment + info */}
              <aside className="space-y-5">
                {/* Comment */}
                <div className="rounded-3xl bg-white shadow-lg border border-slate-100 overflow-hidden">
                  <div className="px-5 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
                    <h3 className="text-base font-bold text-amber-800 flex items-center gap-2">
                      <Star size={16} />
                      Nhận xét của giảng viên
                    </h3>
                  </div>
                  <div className="p-5">
                    {score.teacherComment ? (
                      <div className="text-sm text-slate-700 leading-relaxed italic border-l-4 border-amber-300 pl-4">
                        "{score.teacherComment}"
                      </div>
                    ) : (
                      <p className="text-sm italic text-slate-400">Giảng viên chưa có nhận xét.</p>
                    )}
                  </div>
                </div>

                {/* Defense info */}
                <div className="rounded-3xl bg-white shadow-lg border border-slate-100 overflow-hidden">
                  <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-700 flex items-center gap-2">
                      <Calendar size={16} className="text-slate-500" />
                      Thông tin bảo vệ
                    </h3>
                  </div>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 font-medium">Ngày chấm</span>
                      <span className="font-bold text-slate-800">{formatDate(score.defenseDate)}</span>
                    </div>
                    {score.teacherId && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 font-medium">GV chấm</span>
                        <span className="font-bold text-slate-800">{fullName(score.teacherId.userId)}</span>
                      </div>
                    )}
                    {score.topicId && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500 font-medium">Đề tài</span>
                        <span className="font-bold text-indigo-600 font-mono text-xs">{score.topicId.topicCode}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 font-medium">Trạng thái</span>
                      {score.isLocked ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                          <Lock size={10} />
                          Đã khóa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                          <Clock size={10} />
                          Chờ công bố
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tips */}
                <div className="rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 p-5 text-white shadow-lg">
                  <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
                    <Star size={12} />
                    Lưu ý
                  </h3>
                  <ul className="space-y-2 text-indigo-100 text-xs">
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 shrink-0">•</span>
                      <span>Điểm được tính trung bình cộng của 3 thành phần</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 shrink-0">•</span>
                      <span>Điểm đã khóa, không thể thay đổi</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-0.5 shrink-0">•</span>
                      <span>Liên hệ phòng đào tạo nếu có thắc mắc</span>
                    </li>
                  </ul>
                </div>
              </aside>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
