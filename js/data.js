// =============================================
// data.js – Dữ liệu dùng chung (MongoDB qua API)
// =============================================

const FBU = {
  students: [],
  teachers: [],
  projects: [],
  grades: [],

  categories: ["Web", "Mobile", "AI/ML", "IoT", "Cybersecurity", "Database", "Desktop", "Khác"],
  classes: ["CNTT21A", "CNTT21B", "HTTT21A", "HTTT21B", "KTPM21A", "KTPM21B"],
  departments: ["CNTT", "HTTT", "KTPM"],

  getStudent(id) {
    return this.students.find((s) => s.id === id);
  },
  getTeacher(id) {
    return this.teachers.find((t) => t.id === id);
  },
  getProject(id) {
    return this.projects.find((p) => p.id === id);
  },
  getGrade(pid) {
    return this.grades.find((g) => g.projectId === pid);
  },
  getApprovedGrade(pid) {
    const grade = this.getGrade(pid);
    return grade && (grade.status === "approved" || !grade.status) ? grade : null;
  },
  gradeApprovalLabel: {
    pending: { label: "Chờ admin duyệt", cls: "tag-yellow" },
    approved: { label: "Đã duyệt", cls: "tag-green" },
    rejected: { label: "Bị trả lại", cls: "tag-red" },
  },

  statusLabel: {
    completed: { label: "Hoàn Thành", cls: "tag-green" },
    "in-progress": { label: "Đang Thực Hiện", cls: "tag-blue" },
    pending: { label: "Chờ Duyệt", cls: "tag-yellow" },
    failed: { label: "Không Đạt", cls: "tag-red" },
  },
  studentStatusLabel: {
    active: { label: "Hoạt Động", cls: "tag-green" },
    warning: { label: "Cảnh Báo", cls: "tag-yellow" },
    suspended: { label: "Đình Chỉ", cls: "tag-red" },
  },

  nextId(prefix, arr, field = "id") {
    const nums = arr.map((x) => parseInt(x[field].replace(prefix, ""), 10)).filter((n) => !isNaN(n));
    return prefix + String(Math.max(0, ...nums) + 1).padStart(3, "0");
  },

  _loadPromise: null,
  _loaded: false,

  ensureLoaded() {
    if (!this._loadPromise) this._loadPromise = this._doLoad();
    return this._loadPromise;
  },

  async _doLoad() {
    if (this._loaded) return;

    const token = typeof getAuthToken === "function" ? getAuthToken() : null;
    if (token && typeof API !== "undefined") {
      try {
        const data = await API.bootstrap();
        this.students = data.students || [];
        this.teachers = data.teachers || [];
        this.projects = data.projects || [];
        this.grades = data.grades || [];
        if (data.categories) this.categories = data.categories;
        if (data.classes) this.classes = data.classes;
        if (data.departments) this.departments = data.departments;
        this._loaded = true;
        return;
      } catch (err) {
        console.warn("Không tải được dữ liệu từ MongoDB, dùng bộ nhớ cục bộ:", err.message);
      }
    }

    this.loadLocal();
    this._loaded = true;
  },

  loadLocal() {
    try {
      const d = JSON.parse(localStorage.getItem("fbu_data"));
      if (d) {
        if (d.students) this.students = d.students;
        if (d.teachers) this.teachers = d.teachers;
        if (d.projects) this.projects = d.projects;
        if (d.grades) this.grades = d.grades;
      }
    } catch (e) {}
  },

  save() {
    try {
      localStorage.setItem(
        "fbu_data",
        JSON.stringify({
          students: this.students,
          teachers: this.teachers,
          projects: this.projects,
          grades: this.grades,
        })
      );
    } catch (e) {}

    const session = typeof getSessionData === "function" ? getSessionData() : null;
    if (session?.role === "admin" && typeof API !== "undefined" && getAuthToken()) {
      API.syncData({
        students: this.students,
        teachers: this.teachers,
        projects: this.projects,
        grades: this.grades,
      }).catch((err) => console.warn("Sync MongoDB:", err.message));
    }
  },

  saveProject(project) {
    this.save();
    if (typeof API !== "undefined" && getAuthToken()) {
      API.updateProject(project.id, project).catch((err) => console.warn("Save project:", err.message));
    }
  },

  saveGradeRecord(grade, project) {
    this.save();
    if (typeof API !== "undefined" && getAuthToken()) {
      API.saveGrade(grade.projectId, grade).catch((err) => console.warn("Save grade:", err.message));
    }
  },

  approveGradeRecord(projectId, adminNote = "") {
    const grade = this.getGrade(projectId);
    const project = this.getProject(projectId);
    if (grade) {
      grade.status = "approved";
      grade.adminNote = adminNote;
      grade.approvedAt = new Date().toISOString();
      if (project) {
        project.score = grade.final;
        project.status = grade.final >= 5 ? "completed" : "failed";
      }
      this.save();
    }
    if (typeof API !== "undefined" && getAuthToken()) {
      return API.approveGrade(projectId, { adminNote }).catch((err) => console.warn("Approve grade:", err.message));
    }
    return Promise.resolve();
  },

  rejectGradeRecord(projectId, adminNote = "Cần giáo viên kiểm tra lại.") {
    const grade = this.getGrade(projectId);
    if (grade) {
      grade.status = "rejected";
      grade.adminNote = adminNote;
      grade.approvedAt = null;
      this.save();
    }
    if (typeof API !== "undefined" && getAuthToken()) {
      return API.rejectGrade(projectId, { adminNote }).catch((err) => console.warn("Reject grade:", err.message));
    }
    return Promise.resolve();
  },
};

function onFbuReady(callback) {
  const run = () => FBU.ensureLoaded().then(callback);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
}
