const mongoose = require("mongoose");
require("dotenv").config();
const bcrypt = require("bcrypt");

const User = require("./src/models/user.model");
const Student = require("./src/models/student.model");
const Teacher = require("./src/models/teacher.model");
const Topic = require("./src/models/topic.model");
const { Progress } = require("./src/models/progress.model");

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function seed() {
  await mongoose.connect("mongodb://127.0.0.1:27017/student_project_management");
  console.log("Connected to MongoDB");

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Student.deleteMany({}),
    Teacher.deleteMany({}),
    Topic.deleteMany({}),
    Progress.deleteMany({}),
  ]);
  console.log("Cleared existing data");

  // Create Admin
  const admin = await User.create({
    firstName: "Quản",
    lastName: "Trị",
    email: "admin@fbu.edu.vn",
    password: await hashPassword("admin123"),
    role: "admin",
  });
  console.log("Created admin:", admin.email);

  // Create Teachers
  const teacherData = [
    { firstName: "Nguyễn", lastName: "Văn A", email: "teacher1@fbu.edu.vn", degree: "Tiến sĩ" },
    { firstName: "Trần", lastName: "Thị B", email: "teacher2@fbu.edu.vn", degree: "Thạc sĩ" },
    { firstName: "Lê", lastName: "Văn C", email: "teacher3@fbu.edu.vn", degree: "Giáo sư" },
  ];

  const teachers = [];
  for (const t of teacherData) {
    const user = await User.create({
      firstName: t.firstName,
      lastName: t.lastName,
      email: t.email,
      password: await hashPassword("teacher123"),
      role: "teacher",
    });
    const teacher = await Teacher.create({ userId: user._id, degree: t.degree });
    teachers.push(teacher);
    console.log("Created teacher:", t.email);
  }

  // Create Students
  const studentData = [
    { firstName: "Phạm", lastName: "Văn Minh", email: "student1@fbu.edu.vn", class: "CNTT2021A", major: "Công nghệ thông tin" },
    { firstName: "Hoàng", lastName: "Thị Lan", email: "student2@fbu.edu.vn", class: "CNTT2021A", major: "Công nghệ thông tin" },
    { firstName: "Đặng", lastName: "Văn Hùng", email: "student3@fbu.edu.vn", class: "CNTT2021B", major: "Công nghệ thông tin" },
    { firstName: "Bùi", lastName: "Thị Mai", email: "student4@fbu.edu.vn", class: "KTPM2021A", major: "Kỹ thuật phần mềm" },
    { firstName: "Ngô", lastName: "Văn Khoa", email: "student5@fbu.edu.vn", class: "KTPM2021A", major: "Kỹ thuật phần mềm" },
  ];

  const students = [];
  for (const s of studentData) {
    const user = await User.create({
      firstName: s.firstName,
      lastName: s.lastName,
      email: s.email,
      password: await hashPassword("student123"),
      role: "student",
    });
    const student = await Student.create({ userId: user._id, class: s.class, major: s.major });
    students.push(student);
    console.log("Created student:", s.email);
  }

  // Create Topics (first 3 registered, rest available)
  const topicData = [
    { topicCode: "DT001", topicName: "Hệ thống quản lý thư viện", registered: true },
    { topicCode: "DT002", topicName: "Ứng dụng học tiếng Anh", registered: true },
    { topicCode: "DT003", topicName: "Website bán hàng online", registered: true },
    { topicCode: "DT004", topicName: "App quản lý chi tiêu cá nhân", registered: false },
    { topicCode: "DT005", topicName: "Hệ thống đặt lịch khám bệnh", registered: false },
    { topicCode: "DT006", topicName: "Ứng dụng giao hàng nhanh", registered: false },
    { topicCode: "DT007", topicName: "Website tuyển dụng nhân sự", registered: false },
    { topicCode: "DT008", topicName: "App học lập trình cho trẻ em", registered: false },
  ];

  for (let i = 0; i < topicData.length; i++) {
    const t = topicData[i];
    const topic = await Topic.create({
      topicCode: t.topicCode,
      topicName: t.topicName,
      teacherId: teachers[i % teachers.length]._id,
      studentId: t.registered ? students[i]._id : null,
    });
    console.log("Created topic:", topic.topicCode, "-", t.registered ? "Đã đăng ký" : "Còn trống");

    // Create progress for registered topics
    if (t.registered) {
      const stages = ["register", "analysis"];
      await Progress.create({
        topicId: topic._id,
        studentId: students[i]._id,
        currentStage: stages[Math.floor(Math.random() * stages.length)],
        completedStages: ["register"],
        percentage: 20,
        stageDetails: {
          register: { completedAt: new Date(), notes: "Đã đăng ký đề tài thành công" },
        },
      });
      console.log("Created progress for topic:", topic.topicCode);
    }
  }

  console.log("\n=== SEED COMPLETE ===");
  console.log("Admin: admin@fbu.edu.vn / admin123");
  console.log("Teacher: teacher1@fbu.edu.vn / teacher123");
  console.log("Student: student1@fbu.edu.vn / student123");

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
