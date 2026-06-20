const User = require("../models/user.model");
const Topic = require("../models/topic.model");
const Progress = require("../models/progress.model");

async function getAdminStats() {
  const [totalUsers, totalTopics, totalStudents, totalTeachers] = await Promise.all([
    User.countDocuments(),
    Topic.countDocuments(),
    User.countDocuments({ role: "student" }),
    User.countDocuments({ role: "teacher" }),
  ]);

  const registeredTopics = await Topic.countDocuments({ studentId: { $ne: null } });
  const pendingTopics = await Topic.countDocuments({ studentId: null });

  return {
    totalUsers,
    totalTopics,
    totalStudents,
    totalTeachers,
    registeredTopics,
    pendingTopics,
  };
}

async function getTeacherStats(teacherId) {
  const supervisedTopics = await Topic.find({ teacherId })
    .populate("studentId", "firstName lastName email")
    .lean();

  const topicIds = supervisedTopics.map((t) => t._id);
  const progresses = await Progress.find({ topicId: { $in: topicIds } }).lean();

  const totalProgresses = progresses.length;
  const commentedProgresses = progresses.filter((p) => p.teacherComment).length;

  return {
    supervisedTopics: supervisedTopics.length,
    totalStudents: new Set(supervisedTopics.map((t) => t.studentId?._id?.toString()).filter(Boolean)).size,
    pendingReviews: supervisedTopics.filter((t) => !t.studentId).length,
    totalProgresses,
    commentedProgresses,
    recentProgresses: progresses.slice(-5).reverse(),
  };
}

async function getStudentStats(studentId) {
  const topic = await Topic.findOne({ studentId }).lean();

  if (!topic) {
    return {
      hasTopic: false,
      topic: null,
      progresses: [],
      totalProgresses: 0,
    };
  }

  const progresses = await Progress.find({ topicId: topic._id }).lean();

  return {
    hasTopic: true,
    topic,
    progresses,
    totalProgresses: progresses.length,
    commentedProgresses: progresses.filter((p) => p.teacherComment).length,
  };
}

module.exports = {
  getAdminStats,
  getTeacherStats,
  getStudentStats,
};
