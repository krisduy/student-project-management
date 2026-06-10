import { getToken } from "./session.js";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

export async function apiFetch(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error("Không thể kết nối đến máy chủ backend.");
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(data?.error || data?.message || `HTTP ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export function login(email, password) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function getMe() {
  return apiFetch("/auth/me");
}

export function listUsers() {
  return apiFetch("/users");
}

export function createUser(payload) {
  return apiFetch("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateUser(id, payload) {
  return apiFetch(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteUser(id) {
  return apiFetch(`/users/${id}`, {
    method: "DELETE",
  });
}

export function listTopics() {
  return apiFetch("/topics");
}

export function createTopic(payload) {
  return apiFetch("/topics", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateTopic(id, payload) {
  return apiFetch(`/topics/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteTopic(id) {
  return apiFetch(`/topics/${id}`, {
    method: "DELETE",
  });
}

export function listStudents() {
  return apiFetch("/students");
}

export function updateStudent(id, payload) {
  return apiFetch(`/students/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function listTeachers() {
  return apiFetch("/teachers");
}

export function updateTeacher(id, payload) {
  return apiFetch(`/teachers/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function listAvailableTopics(query = "") {
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query.trim());
  const suffix = params.toString() ? `?${params.toString()}` : "";
  return apiFetch(`/topics/available${suffix}`);
}

export function getMyTopicRegistration() {
  return apiFetch("/topics/my-registration");
}

export function registerTopic(topicId, teacherId) {
  return apiFetch(`/topics/${topicId}/register`, {
    method: "POST",
    body: JSON.stringify({ teacherId }),
  });
}

export function listTeacherOptions() {
  return apiFetch("/teachers/options");
}
