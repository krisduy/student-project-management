// =============================================
// auth.js – Đăng nhập qua MongoDB API
// Tài khoản do Admin tạo – không có đăng ký công khai
// =============================================

const SESSION_KEY = "fbu_session";

function getSession() {
  return getSessionData();
}

function getSessionData() {
  try {
    return (
      JSON.parse(localStorage.getItem(SESSION_KEY)) ||
      JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null")
    );
  } catch (e) {
    return null;
  }
}

function saveSession(user, remember) {
  const payload = JSON.stringify({ ...user, loginTime: Date.now() });
  if (remember) localStorage.setItem(SESSION_KEY, payload);
  else sessionStorage.setItem(SESSION_KEY, payload);
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

async function doLogin() {
  const emailRaw = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPass").value;

  if (!emailRaw || !password) {
    showError("loginError", "Vui lòng nhập email và mật khẩu!");
    return;
  }

  showLoading("loginSpinner", "loginBtnText");

  try {
    const res = await API.login(emailRaw, password);
    const remember = document.getElementById("rememberMe")?.checked || false;
    saveSession({ ...res.user, token: res.token }, remember);

    if (typeof FBU !== "undefined") {
      FBU._loaded = false;
      FBU._loadPromise = null;
      await FBU.ensureLoaded();
    }

    hideLoading("loginSpinner", "loginBtnText", "Đăng Nhập");
    showSuccessOverlay(res.user);
  } catch (err) {
    hideLoading("loginSpinner", "loginBtnText", "Đăng Nhập");
    let msg = err.message || "Email hoặc mật khẩu không đúng!";
    if (err.status === 401) {
      msg += " (Kiểm tra email/mật khẩu; Admin mặc định sau seed: Admin@2025)";
    }
    showError("loginError", msg);
  }
}

function showForgot() {
  document.getElementById("formLogin").style.display = "none";
  document.getElementById("formForgot").style.display = "block";
}

function showLogin() {
  document.getElementById("formForgot").style.display = "none";
  document.getElementById("formLogin").style.display = "block";
}

function doForgot() {
  const email = document.getElementById("forgotEmail").value.trim();
  if (!email) return;
  setTimeout(() => {
    document.getElementById("forgotSuccess").style.display = "flex";
  }, 600);
}

function showSuccessOverlay(user) {
  document.getElementById("successTitle").textContent = "Xin chào, " + user.name + "!";
  document.getElementById("successMsg").textContent =
    "Vai trò: " + getRoleName(user.role) + " – Đang chuyển hướng...";
  document.getElementById("successOverlay").classList.add("show");

  setTimeout(() => {
    if (user.role === "student") window.location.href = "student.html";
    else if (user.role === "teacher") window.location.href = "teacher-portal.html";
    else window.location.href = "index.html";
  }, 1200);
}

function getRoleName(role) {
  return ({ admin: "Quản Trị Viên", teacher: "Giảng Viên", student: "Sinh Viên" }[role] || role);
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = "⚠ " + msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 5000);
}

function showLoading(spinnerId, textId) {
  document.getElementById(spinnerId).style.display = "inline";
  document.getElementById(textId).style.display = "none";
}

function hideLoading(spinnerId, textId, label) {
  document.getElementById(spinnerId).style.display = "none";
  const el = document.getElementById(textId);
  el.style.display = "";
  el.textContent = label;
}

function togglePass(inputId, btn) {
  const inp = document.getElementById(inputId);
  const isPass = inp.type === "password";
  inp.type = isPass ? "text" : "password";
  btn.querySelector("i").className = isPass ? "fa-regular fa-eye-slash" : "fa-regular fa-eye";
}

function resetCache() {
  localStorage.removeItem("fbu_session");
  localStorage.removeItem("fbu_data");
  sessionStorage.removeItem("fbu_session");
  if (typeof FBU !== "undefined") {
    FBU._loaded = false;
    FBU._loadPromise = null;
  }
  document.getElementById("resetCacheWrap").innerHTML =
    '<span style="color:#22c55e;font-size:12px">✓ Đã làm mới! Thử đăng nhập lại.</span>';
}

document.addEventListener("DOMContentLoaded", () => {
  const session = getSession();
  if (session?.token) {
    if (session.role === "student") window.location.href = "student.html";
    else if (session.role === "teacher") window.location.href = "teacher-portal.html";
    else window.location.href = "index.html";
  }
});
