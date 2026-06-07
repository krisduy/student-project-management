const express = require("express");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Project = require("../models/Project");
const Grade = require("../models/Grade");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate);

router.get("/bootstrap", async (req, res) => {
  try {
    const { role, studentId, teacherId } = req.user;
    let students, teachers, projects, grades;

    if (role === "admin") {
      [students, teachers, projects, grades] = await Promise.all([
        Student.find().lean(),
        Teacher.find().lean(),
        Project.find().lean(),
        Grade.find().lean(),
      ]);
    } else if (role === "teacher") {
      projects = await Project.find({ teacherId }).lean();
      const projIds = projects.map((p) => p.id);
      students = await Student.find({ projectId: { $in: projIds } }).lean();
      teachers = await Teacher.find({ id: teacherId }).lean();
      grades = await Grade.find({ projectId: { $in: projIds } }).lean();
    } else if (role === "student") {
      students = await Student.find({ id: studentId }).lean();
      const myProjectId = students[0]?.projectId;
      projects = myProjectId ? await Project.find({ id: myProjectId }).lean() : [];
      teachers = await Teacher.find().lean();
      grades = myProjectId ? await Grade.find({ projectId: myProjectId, status: "approved" }).lean() : [];
    } else {
      return res.status(403).json({ ok: false, message: "Vai trò không hợp lệ." });
    }

    res.json({
      ok: true,
      students: students.map(stripMongo),
      teachers: teachers.map(stripMongo),
      projects: projects.map(stripMongo),
      grades: grades.map(stripMongo),
      categories: ["Web", "Mobile", "AI/ML", "IoT", "Cybersecurity", "Database", "Desktop", "Khác"],
      classes: ["CNTT21A", "CNTT21B", "HTTT21A", "HTTT21B", "KTPM21A", "KTPM21B"],
      departments: ["CNTT", "HTTT", "KTPM"],
    });
  } catch (err) {
    console.error("Bootstrap error:", err);
    res.status(500).json({ ok: false, message: "Không thể tải dữ liệu." });
  }
});

router.put("/sync", async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ ok: false, message: "Chỉ admin mới được đồng bộ toàn bộ dữ liệu." });
  }
  try {
    const { students, teachers, projects, grades } = req.body;
    if (students) {
      await Student.deleteMany({});
      await Student.insertMany(students);
    }
    if (teachers) {
      await Teacher.deleteMany({});
      await Teacher.insertMany(teachers);
    }
    if (projects) {
      await Project.deleteMany({});
      await Project.insertMany(projects);
    }
    if (grades) {
      await Grade.deleteMany({});
      await Grade.insertMany(grades);
    }
    res.json({ ok: true, message: "Đã lưu dữ liệu vào MongoDB." });
  } catch (err) {
    console.error("Sync error:", err);
    res.status(500).json({ ok: false, message: "Không thể lưu dữ liệu." });
  }
});

router.patch("/project/:id", authenticate, async (req, res) => {
  try {
    const project = await Project.findOne({ id: req.params.id });
    if (!project) return res.status(404).json({ ok: false, message: "Không tìm thấy đồ án." });

    if (req.user.role === "teacher" && project.teacherId !== req.user.teacherId) {
      return res.status(403).json({ ok: false, message: "Không có quyền sửa đồ án này." });
    }
    if (req.user.role === "student") {
      const st = await Student.findOne({ id: req.user.studentId });
      if (!st || st.projectId !== project.id) {
        return res.status(403).json({ ok: false, message: "Không có quyền sửa đồ án này." });
      }
    }

    Object.assign(project, req.body);
    await project.save();
    res.json({ ok: true, project: stripMongo(project.toObject()) });
  } catch (err) {
    res.status(500).json({ ok: false, message: "Không thể cập nhật đồ án." });
  }
});

router.put("/grade/:projectId", authenticate, async (req, res) => {
  try {
    if (!["admin", "teacher"].includes(req.user.role)) {
      return res.status(403).json({ ok: false, message: "Không có quyền chấm điểm." });
    }
    const project = await Project.findOne({ id: req.params.projectId });
    if (!project) return res.status(404).json({ ok: false, message: "Không tìm thấy đồ án." });
    if (req.user.role === "teacher" && project.teacherId !== req.user.teacherId) {
      return res.status(403).json({ ok: false, message: "Không có quyền chấm đồ án này." });
    }

    const body = {
      process: req.body.process,
      report: req.body.report,
      defense: req.body.defense,
      final: req.body.final,
      note: req.body.note || "",
      projectId: req.params.projectId,
      teacherId: project.teacherId,
    };
    if (req.user.role === "teacher") {
      Object.assign(body, { status: "pending", adminNote: "", approvedBy: "", approvedAt: null });
    } else if (req.user.role === "admin") {
      Object.assign(body, { status: "approved", approvedBy: req.user.email || "admin", approvedAt: new Date() });
    }

    const grade = await Grade.findOneAndUpdate(
      { projectId: req.params.projectId },
      body,
      { upsert: true, new: true }
    );

    if (grade.status === "approved" && grade.final !== undefined) {
      project.score = req.body.final;
      if (req.body.final >= 5) project.status = "completed";
      else project.status = "failed";
      await project.save();
    }

    res.json({ ok: true, grade: stripMongo(grade.toObject()) });
  } catch (err) {
    res.status(500).json({ ok: false, message: "Không thể lưu điểm." });
  }
});

router.patch("/student/profile", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ ok: false, message: "Chỉ sinh viên mới được cập nhật hồ sơ cá nhân." });
    }
    const student = await Student.findOne({ id: req.user.studentId });
    if (!student) return res.status(404).json({ ok: false, message: "Không tìm thấy sinh viên." });

    const allowed = ["name", "class", "gpa", "status", "avatar", "phone", "dob", "address", "gender", "major", "mode", "credits", "note"];
    for (const key of allowed) {
      if (req.body[key] !== undefined) student[key] = req.body[key];
    }
    await student.save();
    res.json({ ok: true, student: stripMongo(student.toObject()) });
  } catch (err) {
    res.status(500).json({ ok: false, message: "Không thể cập nhật hồ sơ sinh viên." });
  }
});

router.patch("/grade/:projectId/approve", authenticate, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ ok: false, message: "Chỉ admin mới được duyệt điểm." });
  }
  try {
    const project = await Project.findOne({ id: req.params.projectId });
    const grade = await Grade.findOne({ projectId: req.params.projectId });
    if (!project || !grade) return res.status(404).json({ ok: false, message: "Không tìm thấy điểm cần duyệt." });

    grade.status = "approved";
    grade.adminNote = req.body.adminNote || "";
    grade.approvedBy = req.user.email || "admin";
    grade.approvedAt = new Date();
    await grade.save();

    project.score = grade.final;
    project.status = grade.final >= 5 ? "completed" : "failed";
    await project.save();

    res.json({ ok: true, grade: stripMongo(grade.toObject()), project: stripMongo(project.toObject()) });
  } catch (err) {
    res.status(500).json({ ok: false, message: "Không thể duyệt điểm." });
  }
});

router.patch("/grade/:projectId/reject", authenticate, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ ok: false, message: "Chỉ admin mới được từ chối điểm." });
  }
  try {
    const grade = await Grade.findOneAndUpdate(
      { projectId: req.params.projectId },
      { status: "rejected", adminNote: req.body.adminNote || "Cần giáo viên kiểm tra lại.", approvedBy: "", approvedAt: null },
      { new: true }
    );
    if (!grade) return res.status(404).json({ ok: false, message: "Không tìm thấy điểm cần xử lý." });
    res.json({ ok: true, grade: stripMongo(grade.toObject()) });
  } catch (err) {
    res.status(500).json({ ok: false, message: "Không thể từ chối điểm." });
  }
});

function stripMongo(doc) {
  const { _id, __v, createdAt, updatedAt, ...rest } = doc;
  return rest;
}

module.exports = router;
