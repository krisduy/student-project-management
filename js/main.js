// =============================================
// main.js – Shared UI logic
// =============================================

const SESSION_KEY = "fbu_session";

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

function getRoleName(role) {
  return (
    { admin: "Quản trị viên", teacher: "Giảng Viên", student: "Sinh Viên" }[
      role
    ] || role
  );
}

function getInitials(name) {
  return name
    ? name
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";
}

function requireAuth() {
  const session = getSessionData();
  if (!session) {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

function setLoggedInUser() {
  const session = getSessionData();
  if (!session) return;
  const avatar = document.querySelector(".user-avatar");
  const userName = document.querySelector(".user-name");
  const userRole = document.querySelector(".user-role");
  if (avatar) {
    if (
      session.avatar &&
      typeof session.avatar === "string" &&
      session.avatar.startsWith("data:image/")
    ) {
      avatar.style.backgroundImage = `url(${session.avatar})`;
      avatar.style.backgroundSize = "cover";
      avatar.style.backgroundPosition = "center";
      avatar.textContent = "";
    } else {
      avatar.style.backgroundImage = "none";
      avatar.textContent = session.avatar || getInitials(session.name);
    }
  }
  if (userName) userName.textContent = session.name || "FBU User";
  if (userRole) userRole.textContent = getRoleName(session.role);
}

function logout() {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  window.location.href = "login.html";
}

function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("open");
}

// Close sidebar when clicking outside on mobile
document.addEventListener("click", (e) => {
  const sidebar = document.getElementById("sidebar");
  const toggle = document.querySelector(".menu-toggle");
  if (window.innerWidth <= 768 && sidebar.classList.contains("open")) {
    if (!sidebar.contains(e.target) && e.target !== toggle) {
      sidebar.classList.remove("open");
    }
  }
});

// Active nav link + session guard
document.addEventListener("DOMContentLoaded", async () => {
  const session = getSessionData();
  if (!session || !session.token) {
    window.location.href = "login.html";
    return;
  }

  if (typeof FBU !== "undefined") {
    try {
      await FBU.ensureLoaded();
    } catch (err) {
      console.warn("Load data:", err.message);
    }
  }

  // Phân quyền theo role
  const adminPages   = ["index.html","teachers.html","students.html","reports.html","projects.html","grading.html","accounts.html"];
  const teacherPages = [
    "teacher-portal.html",
    "teacher-students.html",
    "teacher-grading.html",
    "teacher-submissions.html",
    "teacher-profile.html",
  ];
  const studentPages = [
    "student.html",
    "student-projects.html",
    "student-grading.html",
    "student-profile.html",
  ];
  const current = location.pathname.split("/").pop() || "index.html";

  if (session.role === "student") {
    // Sinh viên chỉ được vào student.html
    if (!studentPages.includes(current)) {
      window.location.href = "student.html";
      return;
    }
  } else if (session.role === "teacher") {
    // Giảng viên chỉ được vào teacher-portal.html
    if (!teacherPages.includes(current)) {
      window.location.href = "teacher-portal.html";
      return;
    }
  } else if (session.role === "admin") {
    // Admin không được vào trang của teacher/student
    if ([...teacherPages, ...studentPages].includes(current)) {
      window.location.href = "index.html";
      return;
    }
  }

  setLoggedInUser();
  const currentPage = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-item").forEach((link) => {
    const href = link.getAttribute("href") || "";
    const linkPage = href.split("#")[0].split("?")[0];
    if (linkPage === currentPage) link.classList.add("active");
    else link.classList.remove("active");
  });
});

// Generic modal helpers (used across pages)
function openModal(id) {
  document.getElementById(id).classList.add("open");
}
function closeModal(id) {
  document.getElementById(id).classList.remove("open");
}

// Click overlay to close
document.querySelectorAll(".modal-overlay").forEach((overlay) => {
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.classList.remove("open");
  });
});

// Toast notification
function showToast(msg, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    container.style.cssText = `
      position:fixed; bottom:24px; right:24px; z-index:9999;
      display:flex; flex-direction:column; gap:10px;
    `;
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.style.cssText = `
    background:var(--bg2); border:1px solid var(--border);
    border-left: 3px solid ${type === "success" ? "var(--green)" : type === "error" ? "var(--red)" : "var(--yellow)"};
    border-radius:10px; padding:12px 18px;
    color:var(--text); font-size:13px; font-family:'DM Sans',sans-serif;
    box-shadow:0 4px 24px rgba(0,0,0,.5);
    animation: slideIn .25s ease;
    max-width:320px;
  `;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity .3s";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Inject keyframe
const style = document.createElement("style");
style.textContent = `@keyframes slideIn { from{transform:translateX(40px);opacity:0} to{transform:translateX(0);opacity:1} }`;
document.head.appendChild(style);