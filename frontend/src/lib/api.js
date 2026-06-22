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

export function updateAvatar(avatar) {
  return apiFetch("/auth/me/avatar", {
    method: "PATCH",
    body: JSON.stringify({ avatar }),
  });
}

export function updateMyProfile(payload) {
  return apiFetch("/auth/me/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function getStudentOptions() {
  return apiFetch("/auth/student-options");
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

export function listStudentOptions() {
  return apiFetch("/students/options");
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

export function getMySupervisingTopics() {
  return apiFetch("/topics/my-supervising");
}

export function getProgressesByTeacher(teacherId) {
  return apiFetch(`/progresses/teacher/${teacherId}`);
}

export function getMyProgress() {
  return apiFetch("/progresses/me");
}

export function getMyNotifications() {
  return apiFetch("/progresses/me/notifications");
}

export function getStudentProgressByTeacher() {
  return apiFetch("/progresses/teacher/students");
}

export function getProgressByTopic(topicId) {
  return apiFetch(`/progresses/topic/${topicId}`);
}

export function createProgress(payload) {
  return apiFetch("/progresses", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateMyStage(progressId, payload) {
  return apiFetch(`/progresses/stage/${progressId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function approveStage(progressId, comment = "") {
  return apiFetch(`/progresses/${progressId}/approve`, {
    method: "PUT",
    body: JSON.stringify({ comment }),
  });
}

export function rejectStage(progressId, comment) {
  return apiFetch(`/progresses/${progressId}/reject`, {
    method: "PUT",
    body: JSON.stringify({ comment }),
  });
}

export function resubmitStage(progressId, notes = "") {
  return apiFetch(`/progresses/${progressId}/resubmit`, {
    method: "PUT",
    body: JSON.stringify({ notes }),
  });
}

export function updateProgress(progressId, payload) {
  return apiFetch(`/progresses/${progressId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function getDashboardStats() {
  return apiFetch("/dashboard/stats");
}

// Defense Scores
export function getEligibleDefenseTopics(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.search) searchParams.set("search", params.search);
  if (params.status) searchParams.set("status", params.status);
  if (params.page) searchParams.set("page", params.page);
  if (params.limit) searchParams.set("limit", params.limit);
  const suffix = searchParams.toString() ? `?${searchParams.toString()}` : "";
  return apiFetch(`/defense-scores/eligible-topics${suffix}`);
}

export function getDefenseScoreByTopic(topicId) {
  return apiFetch(`/defense-scores/topic/${topicId}`);
}

export function saveDefenseScore(payload) {
  return apiFetch("/defense-scores", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateDefenseScore(topicId, payload) {
  return apiFetch(`/defense-scores/topic/${topicId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function lockDefenseScore(topicId) {
  return apiFetch(`/defense-scores/topic/${topicId}/lock`, {
    method: "PATCH",
  });
}

export function unlockDefenseScore(topicId) {
  return apiFetch(`/defense-scores/topic/${topicId}/unlock`, {
    method: "PATCH",
  });
}

export function getMyDefenseScore() {
  return apiFetch("/defense-scores/my-score");
}
