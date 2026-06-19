import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  ShieldCheck,
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
      {/* ── Brand panel ── */}
      <section className="auth-brand-panel" aria-label="Tổng quan hệ thống FBU">
        <div className="brand-lockup">
          <div className="brand-mark">
            <GraduationCap size={24} strokeWidth={2.2} />
          </div>
          <div>
            <p className="brand-name">FBU</p>
            <p className="brand-caption">Hệ thống quản lý đồ án</p>
          </div>
        </div>

        <div className="brand-copy">
          <p className="eyebrow">Quản lý đồ án tốt nghiệp</p>
          <h1>Quản lý đề tài, đăng ký và hướng dẫn trong một hệ thống.</h1>
          <p>
            Nền tảng hỗ trợ quản trị viên, giảng viên và sinh viên xử lý quy
            trình đồ án theo đúng vai trò.
          </p>
        </div>

        <div className="feature-stack">
          <div className="feature-row">
            <CheckCircle2 size={17} />
            <span>Quản trị viên cấp tài khoản và nhập danh sách đề tài</span>
          </div>
          <div className="feature-row">
            <BookOpenCheck size={17} />
            <span>Sinh viên tìm kiếm đề tài còn trống và đăng ký</span>
          </div>
          <div className="feature-row">
            <ShieldCheck size={17} />
            <span>Giảng viên theo dõi danh sách đề tài đang hướng dẫn</span>
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

      {/* ── Form panel ── */}
      <section className="auth-form-panel" aria-label="Biểu mẫu đăng nhập">
        <form className="login-card" onSubmit={handleSubmit}>
          <div className="login-heading">
            <p className="eyebrow">Đăng nhập</p>
            <h2>Chào mừng trở lại</h2>
            <p>Nhập email và mật khẩu do quản trị viên cấp.</p>
          </div>

          <label className="field">
            <span>Email</span>
            <div className="input-frame">
              <Mail size={17} />
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
              <Lock size={17} />
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
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
            <ArrowRight size={17} />
          </button>

          <p className="login-note">
            Hệ thống tự chuyển đến đúng trang làm việc theo vai trò tài khoản.
          </p>
        </form>

        <p className="auth-footer">© 2026 FBU · Hệ thống quản lý đồ án</p>
      </section>
    </main>
  );
}
