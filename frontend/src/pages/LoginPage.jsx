import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  ShieldCheck,
  Users,
  GraduationCap as AcademicCap,
} from "lucide-react";
import { login } from "../lib/api.js";
import { saveSession } from "../lib/session.js";

function routeForRole(role) {
  if (role === "student") return "/student";
  if (role === "teacher") return "/teacher";
  return "/admin";
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      <section className="auth-brand-panel" aria-label="Tổng quan hệ thống FBU">
        <div className="brand-lockup">
          <div className="brand-mark">
            <GraduationCap size={30} strokeWidth={2.5} />
          </div>
          <div>
            <p className="brand-name">FBU</p>
            <p className="brand-caption">Hệ thống quản lý đồ án</p>
          </div>
        </div>

        <div className="brand-copy">
          <p className="eyebrow">Quản lý đồ án tốt nghiệp</p>
          <h1>Nền tảng quản lý đề tài thông minh và hiệu quả</h1>
          <p>
            Giải pháp toàn diện giúp quản trị viên, giảng viên và sinh viên
            quản lý quy trình đồ án một cách chuyên nghiệp và dễ dàng.
          </p>
        </div>

        <div className="feature-stack">
          <div className="feature-row">
            <div className="feature-icon">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <strong>Quản trị linh hoạt</strong>
              <span>Quản lý tài khoản và đề tài tập trung</span>
            </div>
          </div>
          <div className="feature-row">
            <div className="feature-icon">
              <BookOpenCheck size={20} />
            </div>
            <div>
              <strong>Đăng ký nhanh chóng</strong>
              <span>Tìm kiếm và đăng ký đề tài dễ dàng</span>
            </div>
          </div>
          <div className="feature-row">
            <div className="feature-icon">
              <ShieldCheck size={20} />
            </div>
            <div>
              <strong>Theo dõi tiến độ</strong>
              <span>Giám sát và hướng dẫn hiệu quả</span>
            </div>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat-pill">
            <strong>3</strong>
            <span>Vai trò</span>
          </div>
          <div className="stat-pill">
            <strong>1</strong>
            <span>Đề tài / sinh viên</span>
          </div>
          <div className="stat-pill">
            <strong>Nhiều</strong>
            <span>Đề tài / giảng viên</span>
          </div>
        </div>
      </section>

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
                <AcademicCap size={13} />
                <span>Giảng viên</span>
              </div>
              <div className="role-pill-item">
                <BookOpen size={13} />
                <span>Sinh viên</span>
              </div>
            </div>

          <label className="field">
            <span>Email</span>
            <div className="input-frame">
              <Mail size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@fbu.edu.vn"
                autoComplete="username"
                required
              />
            </div>
          </label>

          <label className="field">
            <span>Mật khẩu</span>
            <div className="input-frame">
              <Lock size={20} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          {error ? <div className="error-alert">{error}</div> : null}

          <button
            className="primary-action"
            type="submit"
            disabled={!canSubmit}
          >
            <span>{isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}</span>
            <ArrowRight size={20} />
          </button>

          <p className="login-note">
            Hệ thống sẽ tự động chuyển đến trang làm việc phù hợp với vai trò của bạn.
          </p>
        </div>
      </form>
    </section>

    <p className="auth-footer">
      © 2026 FBU · Hệ thống quản lý đồ án tốt nghiệp
    </p>
  </main>
  );
}