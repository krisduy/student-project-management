const { getAdminStats, getTeacherStats, getStudentStats } = require("../services/dashboard.service");

async function getDashboardStats(req, res) {
  try {
    const user = req.user;

    let stats;
    switch (user.role) {
      case "admin":
        stats = await getAdminStats();
        break;
      case "teacher":
        const teacher = await require("../models/teacher.model").findOne({ userId: user.id }).lean();
        if (!teacher) {
          return res.status(404).json({ error: "Không tìm thấy thông tin giảng viên" });
        }
        stats = await getTeacherStats(teacher._id);
        break;
      case "student":
        const student = await require("../models/student.model").findOne({ userId: user.id }).lean();
        if (!student) {
          return res.status(404).json({ error: "Không tìm thấy thông tin sinh viên" });
        }
        stats = await getStudentStats(student._id);
        break;
      default:
        return res.status(400).json({ error: "Vai trò không hợp lệ" });
    }

    res.json(stats);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: "Lỗi khi lấy dữ liệu dashboard: " + error.message });
  }
}

module.exports = {
  getDashboardStats,
};
