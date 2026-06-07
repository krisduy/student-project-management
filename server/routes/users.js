const express = require("express");
const User = require("../models/User");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate, authorize("admin"));

function getInitials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

async function nextProfileId(prefix, Model) {
  const docs = await Model.find({ id: new RegExp(`^${prefix}`) }).select("id");
  const nums = docs.map((d) => parseInt(d.id.replace(prefix, ""), 10)).filter((n) => !isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return prefix + String(next).padStart(3, "0");
}

router.get("/", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ ok: true, users: users.map((u) => u.toPublicJSON()) });
  } catch (err) {
    res.status(500).json({ ok: false, message: "Không thể tải danh sách tài khoản." });
  }
});

router.post("/", async (req, res) => {
  try {
    const { email, password, role, name, avatar, studentId, teacherId, class: studentClass, dept, expertise } = req.body;

    if (!email || !password || !role || !name) {
      return res.status(400).json({ ok: false, message: "Thiếu email, mật khẩu, vai trò hoặc họ tên." });
    }

    if (!["teacher", "student"].includes(role)) {
      return res.status(400).json({ ok: false, message: "Chỉ được tạo tài khoản Giảng viên hoặc Sinh viên." });
    }

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) {
      return res.status(409).json({ ok: false, message: "Email đã tồn tại trong hệ thống." });
    }

    let linkedStudentId = studentId || null;
    let linkedTeacherId = teacherId || null;

    if (role === "student") {
      if (linkedStudentId) {
        const st = await Student.findOne({ id: linkedStudentId });
        if (!st) return res.status(400).json({ ok: false, message: "Mã sinh viên không tồn tại." });
      } else {
        linkedStudentId = await nextProfileId("SV", Student);
        await Student.create({
          id: linkedStudentId,
          name,
          email: email.toLowerCase().trim(),
          class: studentClass || "CNTT21A",
          gpa: 0,
          status: "active",
          projectId: null,
        });
      }
    }

    if (role === "teacher") {
      if (linkedTeacherId) {
        const tc = await Teacher.findOne({ id: linkedTeacherId });
        if (!tc) return res.status(400).json({ ok: false, message: "Mã giảng viên không tồn tại." });
      } else {
        linkedTeacherId = await nextProfileId("GV", Teacher);
        await Teacher.create({
          id: linkedTeacherId,
          name,
          email: email.toLowerCase().trim(),
          dept: dept || "CNTT",
          expertise: expertise || "",
          projects: 0,
        });
      }
    }

    const user = await User.create({
      email: email.toLowerCase().trim(),
      password,
      role,
      name,
      avatar: avatar || getInitials(name),
      studentId: linkedStudentId,
      teacherId: linkedTeacherId,
    });

    res.status(201).json({ ok: true, message: "Tài khoản đã được tạo.", user: user.toPublicJSON() });
  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ ok: false, message: err.message || "Không thể tạo tài khoản." });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ ok: false, message: "Không tìm thấy tài khoản." });
    if (user.role === "admin") {
      return res.status(403).json({ ok: false, message: "Không thể sửa tài khoản admin." });
    }

    const { name, avatar, password, disabled, studentId, teacherId } = req.body;
    if (name) user.name = name;
    if (avatar !== undefined) user.avatar = avatar;
    if (password) user.password = password;
    if (disabled !== undefined) user.disabled = disabled;
    if (studentId !== undefined) user.studentId = studentId;
    if (teacherId !== undefined) user.teacherId = teacherId;

    await user.save();
    res.json({ ok: true, message: "Đã cập nhật tài khoản.", user: user.toPublicJSON() });
  } catch (err) {
    res.status(500).json({ ok: false, message: "Không thể cập nhật tài khoản." });
  }
});

router.patch("/:id/toggle-lock", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ ok: false, message: "Không tìm thấy tài khoản." });
    if (user.role === "admin") {
      return res.status(403).json({ ok: false, message: "Không thể khóa tài khoản admin." });
    }
    user.disabled = !user.disabled;
    await user.save();
    res.json({
      ok: true,
      message: user.disabled ? "Đã khóa tài khoản." : "Đã mở khóa tài khoản.",
      user: user.toPublicJSON(),
    });
  } catch (err) {
    res.status(500).json({ ok: false, message: "Không thể thay đổi trạng thái." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ ok: false, message: "Không tìm thấy tài khoản." });
    if (user.role === "admin") {
      return res.status(403).json({ ok: false, message: "Không thể xóa tài khoản admin." });
    }
    await user.deleteOne();
    res.json({ ok: true, message: "Đã xóa tài khoản." });
  } catch (err) {
    res.status(500).json({ ok: false, message: "Không thể xóa tài khoản." });
  }
});

module.exports = router;
