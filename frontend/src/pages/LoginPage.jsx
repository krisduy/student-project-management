import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import { login } from "../lib/api.js";
import { saveSession } from "../lib/session.js";

function routeForRole(role) {
  if (role === "student") return "/student";
  if (role === "teacher") return "/teacher";
  return "/admin";
}

function Orb({ color, size, top, left, right, bottom, delay }) {
  return (
    <div
      style={{
        position: "absolute",
        width: size,
        height: size,
        top,
        left,
        right,
        bottom,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        pointerEvents: "none",
        filter: "blur(60px)",
        animation: `orbFloat 20s ease-in-out ${delay}ms infinite`,
      }}
    />
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    document.body.classList.add("body-login");
    return () => document.body.classList.remove("body-login");
  }, []);

  const canSubmit = useMemo(
    () => email.trim() && password && !isSubmitting,
    [email, password, isSubmitting],
  );

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;

    setError("");
    setIsSubmitting(true);

    try {
      const result = await login(email.trim(), password);
      saveSession(
        { token: result.token, user: result.user, loginTime: Date.now() },
        remember,
      );
      navigate(routeForRole(result.user?.role), { replace: true });
    } catch (err) {
      setError(
        err.status === 401 ? "Email hoặc mật khẩu không hợp lệ." : err.message,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      {/* Animated orbs */}
      <Orb color="rgba(124, 58, 237, 0.18)" size={500} top="-10%" left="-15%" delay={0} />
      <Orb color="rgba(16, 185, 129, 0.12)" size={400} bottom="-10%" right="-10%" delay={2000} />
      <Orb color="rgba(99, 102, 241, 0.1)" size={280} top="35%" left="15%" delay={4000} />

      {/* Dot grid */}
      <div className="login-dots" />

      {/* ===== LEFT BRAND PANEL ===== */}
      <section className="auth-brand-panel" aria-label="Tổng quan hệ thống FBU">
        <div className="brand-lockup">
          <div className="brand-mark">
            <GraduationCap size={30} strokeWidth={2.5} />
            <div className="brand-mark-ring" />
          </div>
          <div>
            <p className="brand-name">FBU</p>
            <p className="brand-caption">Hệ thống quản lý đồ án</p>
          </div>
        </div>

        <div className="brand-copy">
          <div className="brand-eyebrow">
            <Sparkles size={12} />
            <span>Hệ thống năm 2026</span>
          </div>
          <h1>
            Quản lý đồ án
            <br />
            <span className="gradient-text-brand">tốt nghiệp</span>
            <br />
            chuyên nghiệp
          </h1>
          <p>
            Nền tảng thông minh kết nối giảng viên và sinh viên trong suốt
            quá trình thực hiện đồ án — từ đăng ký đề tài đến bảo vệ cuối cùng.
          </p>
        </div>

        <div className="feature-stack">
          <div className="feature-row">
            <div className="feature-icon">
              <ShieldCheck size={20} />
            </div>
            <div>
              <strong>Bảo mật cao cấp</strong>
              <span>Xác thực JWT, phân quyền chi tiết theo vai trò</span>
            </div>
          </div>
          <div className="feature-row">
            <div className="feature-icon">
              <BookOpen size={20} />
            </div>
            <div>
              <strong>Theo dõi tiến độ</strong>
              <span>5 giai đoạn rõ ràng, cập nhật real-time</span>
            </div>
          </div>
          <div className="feature-row">
            <div className="feature-icon">
              <Trophy size={20} />
            </div>
            <div>
              <strong>Chấm điểm minh bạch</strong>
              <span>Kết quả bảo vệ được lưu trữ và truy xuất dễ dàng</span>
            </div>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat-pill">
            <strong>3</strong>
            <span>Vai trò người dùng</span>
          </div>
          <div className="stat-pill">
            <strong>5</strong>
            <span>Giai đoạn tiến độ</span>
          </div>
          <div className="stat-pill">
            <strong>100%</strong>
            <span>Truy xuất điểm</span>
          </div>
        </div>
      </section>

      {/* ===== RIGHT FORM PANEL ===== */}
      <section className="auth-form-panel" aria-label="Biểu mẫu đăng nhập">
        <form className="login-card" onSubmit={handleSubmit}>
          {/* Top accent bar */}
          <div className="login-card-accent" />

          <div className="login-card-inner">
            <div className="login-heading">
              <div className="login-eyebrow-wrap">
                <span className="eyebrow">Đăng nhập hệ thống</span>
                <div className="eyebrow-dot" />
              </div>
              <h2>Chào mừng trở lại</h2>
              <p>Nhập thông tin tài khoản để truy cập workspace của bạn.</p>
            </div>

            {/* Role pills */}
            <div className="login-role-pills">
              <div className="role-pill-item">
                <Users size={13} />
                <span>Quản trị viên</span>
              </div>
              <div className="role-pill-item">
                <GraduationCap size={13} />
                <span>Giảng viên</span>
              </div>
              <div className="role-pill-item">
                <BookOpen size={13} />
                <span>Sinh viên</span>
              </div>
            </div>

            <label className="field">
              <span className="field-label-row">
                <Mail size={14} />
                <span>Địa chỉ Email</span>
              </span>
              <div className={`input-frame ${focusedField === "email" ? "input-frame--focused" : ""}`}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="email@fbu.edu.vn"
                  autoComplete="username"
                  required
                />
                {email && <CheckCircle2 size={16} className="input-check" />}
              </div>
            </label>

            <label className="field">
              <span className="field-label-row">
                <Lock size={14} />
                <span>Mật khẩu</span>
              </span>
              <div className={`input-frame ${focusedField === "password" ? "input-frame--focused" : ""}`}>
                <Lock size={18} className="input-lock-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Nhập mật khẩu"
                  autoComplete="current-password"
                  required
                />
                <button
                  className="icon-button"
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <div className="form-tools">
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <span className="support-text">
                Liên hệ quản trị viên nếu quên mật khẩu
              </span>
            </div>

            {error ? (
              <div className="error-alert" role="alert">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                  <circle cx="7" cy="7" r="6.5" stroke="currentColor" />
                  <path d="M7 4v3.5M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span>{error}</span>
              </div>
            ) : null}

            <button
              className={`primary-action ${isSubmitting ? "primary-action--loading" : ""}`}
              type="submit"
              disabled={!canSubmit}
            >
              {isSubmitting ? (
                <>
                  <div className="action-spinner" />
                  <span>Đang xác thực...</span>
                </>
              ) : (
                <>
                  <span>{isSubmitting ? "Đang đăng nhập..." : "Đăng nhập ngay"}</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            <p className="login-note">
              Hệ thống tự động chuyển đến trang phù hợp với vai trò của bạn.
            </p>
          </div>

          <div className="login-card-footer">
            <Star size={11} />
            <span>© 2026 FBU · Hệ thống quản lý đồ án tốt nghiệp</span>
            <Star size={11} />
          </div>
        </form>
      </section>
    </main>
  );
}
