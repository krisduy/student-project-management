// =============================================
// api.js – Gọi API backend (MongoDB)
// =============================================

function resolveApiBase() {
  if (window.location.protocol === "file:") {
    return "http://localhost:3000/api";
  }
  const port = window.location.port;
  if (port === "3000" || port === "") {
    return "/api";
  }
  return `${window.location.protocol}//${window.location.hostname}:3000/api`;
}

const API_BASE = resolveApiBase();

function getAuthToken() {
  try {
    const session =
      JSON.parse(localStorage.getItem("fbu_session")) ||
      JSON.parse(sessionStorage.getItem("fbu_session") || "null");
    return session?.token || null;
  } catch {
    return null;
  }
}

async function apiFetch(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const token = getAuthToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(API_BASE + path, { ...options, headers });
  } catch {
    throw new Error(
      "Không kết nối được server. Hãy chạy npm start trong thư mục server và mở http://localhost:3000/html/login.html"
    );
  }

  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    let msg = data.message || `HTTP ${res.status}`;
    if (res.status === 405) {
      msg =
        "HTTP 405 – Sai địa chỉ server. Mở http://localhost:3000/html/login.html (chạy npm start trong thư mục server), không dùng Live Server.";
    }
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

const API = {
  login(email, password) {
    return apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  me() {
    return apiFetch("/auth/me");
  },

  bootstrap() {
    return apiFetch("/data/bootstrap");
  },

  syncData(payload) {
    return apiFetch("/data/sync", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },

  updateProject(id, body) {
    return apiFetch(`/data/project/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  updateStudentProfile(body) {
    return apiFetch("/data/student/profile", {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  saveGrade(projectId, body) {
    return apiFetch(`/data/grade/${projectId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  approveGrade(projectId, body = {}) {
    return apiFetch(`/data/grade/${projectId}/approve`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  rejectGrade(projectId, body = {}) {
    return apiFetch(`/data/grade/${projectId}/reject`, {
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  listUsers() {
    return apiFetch("/users");
  },

  createUser(body) {
    return apiFetch("/users", { method: "POST", body: JSON.stringify(body) });
  },

  updateUser(id, body) {
    return apiFetch(`/users/${id}`, { method: "PATCH", body: JSON.stringify(body) });
  },

  toggleUserLock(id) {
    return apiFetch(`/users/${id}/toggle-lock`, { method: "PATCH" });
  },

  deleteUser(id) {
    return apiFetch(`/users/${id}`, { method: "DELETE" });
  },
};
