require("dotenv").config();
const connectDB = require("./config/db");
const User = require("./models/User");
const Student = require("./models/Student");
const Teacher = require("./models/Teacher");
const Project = require("./models/Project");
const Grade = require("./models/Grade");

const students = [
  { id: "SV001", name: "Nguyễn Văn An", email: "an.nv@fbu.edu.vn", class: "CNTT21A", gpa: 3.5, status: "active", projectId: "DA001" },
  { id: "SV002", name: "Trần Thị Bình", email: "binh.tt@fbu.edu.vn", class: "CNTT21A", gpa: 3.8, status: "active", projectId: "DA001" },
  { id: "SV003", name: "Lê Minh Cường", email: "cuong.lm@fbu.edu.vn", class: "CNTT21B", gpa: 3.2, status: "active", projectId: "DA002" },
  { id: "SV004", name: "Phạm Thị Dung", email: "dung.pt@fbu.edu.vn", class: "CNTT21B", gpa: 3.6, status: "active", projectId: "DA002" },
  { id: "SV005", name: "Hoàng Văn Em", email: "em.hv@fbu.edu.vn", class: "HTTT21A", gpa: 2.9, status: "warning", projectId: "DA003" },
  { id: "SV006", name: "Vũ Thị Phương", email: "phuong.vt@fbu.edu.vn", class: "HTTT21A", gpa: 3.9, status: "active", projectId: "DA004" },
  { id: "SV007", name: "Đỗ Quang Hùng", email: "hung.dq@fbu.edu.vn", class: "HTTT21B", gpa: 3.1, status: "active", projectId: "DA005" },
  { id: "SV008", name: "Bùi Thị Lan", email: "lan.bt@fbu.edu.vn", class: "KTPM21A", gpa: 3.7, status: "active", projectId: "DA003" },
  { id: "SV009", name: "Ngô Thế Mạnh", email: "manh.nt@fbu.edu.vn", class: "KTPM21A", gpa: 2.6, status: "suspended", projectId: null },
  { id: "SV010", name: "Trịnh Thị Nhung", email: "nhung.tt@fbu.edu.vn", class: "KTPM21B", gpa: 3.4, status: "active", projectId: "DA006" },
  { id: "SV011", name: "Lý Văn Phúc", email: "phuc.lv@fbu.edu.vn", class: "CNTT21A", gpa: 3.0, status: "active", projectId: "DA007" },
  { id: "SV012", name: "Đinh Thị Quỳnh", email: "quynh.dt@fbu.edu.vn", class: "CNTT21B", gpa: 3.3, status: "active", projectId: "DA007" },
];

const teachers = [
  { id: "GV001", name: "PGS. TS. Nguyễn Văn Hải", email: "hai.nv@fbu.edu.vn", dept: "CNTT", expertise: "AI/ML", projects: 8 },
  { id: "GV002", name: "TS. Trần Thị Mai", email: "mai.tt@fbu.edu.vn", dept: "CNTT", expertise: "Web Development", projects: 10 },
  { id: "GV003", name: "ThS. Lê Quang Dũng", email: "dung.lq@fbu.edu.vn", dept: "HTTT", expertise: "Database", projects: 6 },
  { id: "GV004", name: "TS. Phạm Văn Bình", email: "binh.pv@fbu.edu.vn", dept: "KTPM", expertise: "Mobile Dev", projects: 9 },
  { id: "GV005", name: "ThS. Hoàng Thị Lan", email: "lan.ht@fbu.edu.vn", dept: "CNTT", expertise: "IoT / Embedded", projects: 5 },
  { id: "GV006", name: "PGS. TS. Vũ Minh Tuấn", email: "tuan.vm@fbu.edu.vn", dept: "HTTT", expertise: "Cybersecurity", projects: 7 },
];

const projects = [
  { id: "DA001", title: "Hệ thống quản lý thư viện trực tuyến", students: ["SV001", "SV002"], teacherId: "GV002", category: "Web", status: "completed", score: 8.8, startDate: "2025-02-01", deadline: "2025-06-15", desc: "Xây dựng ứng dụng quản lý thư viện với tính năng mượn/trả sách trực tuyến, tích hợp thanh toán và thông báo." },
  { id: "DA002", title: "Ứng dụng di động đặt đồ ăn FBU Eats", students: ["SV003", "SV004"], teacherId: "GV004", category: "Mobile", status: "in-progress", score: null, startDate: "2025-02-15", deadline: "2025-06-30", desc: "Ứng dụng đặt và giao đồ ăn nội bộ cho sinh viên FBU, tích hợp bản đồ và thanh toán QR." },
  { id: "DA003", title: "Chatbot hỗ trợ sinh viên bằng AI", students: ["SV005", "SV008"], teacherId: "GV001", category: "AI/ML", status: "in-progress", score: null, startDate: "2025-03-01", deadline: "2025-07-01", desc: "Xây dựng chatbot thông minh sử dụng NLP để trả lời các câu hỏi thường gặp của sinh viên FBU.", submitted: true, submissionLink: "https://github.com/fbu/chatbot-da003", submissionNote: "Bản demo chatbot v1.0 – đã tích hợp FAQ và tra cứu lịch học.", submittedAt: new Date("2025-05-20T10:30:00.000Z") },
  { id: "DA004", title: "Hệ thống IoT giám sát môi trường lớp học", students: ["SV006"], teacherId: "GV005", category: "IoT", status: "pending", score: null, startDate: "2025-03-10", deadline: "2025-07-10", desc: "Thiết kế hệ thống cảm biến và dashboard theo dõi nhiệt độ, độ ẩm, CO2 trong phòng học." },
  { id: "DA005", title: "Phân tích bảo mật ứng dụng web với ML", students: ["SV007"], teacherId: "GV006", category: "Cybersecurity", status: "in-progress", score: null, startDate: "2025-02-20", deadline: "2025-06-25", desc: "Nghiên cứu và xây dựng công cụ phát hiện tấn công SQL Injection, XSS bằng machine learning." },
  { id: "DA006", title: "Nền tảng học trực tuyến FBU Learn", students: ["SV010"], teacherId: "GV002", category: "Web", status: "in-progress", score: null, startDate: "2025-02-10", deadline: "2025-06-20", desc: "Xây dựng LMS với tính năng video bài giảng, quiz, chấm điểm tự động và chứng chỉ hoàn thành." },
  { id: "DA007", title: "Ứng dụng nhận diện khuôn mặt điểm danh", students: ["SV011", "SV012"], teacherId: "GV001", category: "AI/ML", status: "pending", score: null, startDate: "2025-03-15", deadline: "2025-07-15", desc: "Hệ thống điểm danh tự động sử dụng face recognition tích hợp camera trong phòng học." },
];

const grades = [
  { projectId: "DA001", teacherId: "GV002", process: 8.5, report: 9.0, defense: 8.8, final: 8.8, note: "Xuất sắc, sản phẩm hoàn thiện." },
];

const users = [
  { email: "admin@fbu.edu.vn", password: "Admin@2025", role: "admin", name: "Admin FBU", avatar: "AD" },
  { email: "hai.nv@fbu.edu.vn", password: "Gv@123456", role: "teacher", name: "PGS. TS. Nguyễn Văn Hải", avatar: "NH", teacherId: "GV001" },
  { email: "mai.tt@fbu.edu.vn", password: "Gv@123456", role: "teacher", name: "TS. Trần Thị Mai", avatar: "TM", teacherId: "GV002" },
  { email: "dung.lq@fbu.edu.vn", password: "Gv@123456", role: "teacher", name: "ThS. Lê Quang Dũng", avatar: "LD", teacherId: "GV003" },
  { email: "an.nv@fbu.edu.vn", password: "Sv@123456", role: "student", name: "Nguyễn Văn An", avatar: "NA", studentId: "SV001" },
  { email: "binh.tt@fbu.edu.vn", password: "Sv@123456", role: "student", name: "Trần Thị Bình", avatar: "TB", studentId: "SV002" },
  { email: "cuong.lm@fbu.edu.vn", password: "Sv@123456", role: "student", name: "Lê Minh Cường", avatar: "LC", studentId: "SV003" },
  { email: "dung.pt@fbu.edu.vn", password: "Sv@123456", role: "student", name: "Phạm Thị Dung", avatar: "PD", studentId: "SV004" },
  { email: "em.hv@fbu.edu.vn", password: "Sv@123456", role: "student", name: "Hoàng Văn Em", avatar: "HE", studentId: "SV005" },
  { email: "phuong.vt@fbu.edu.vn", password: "Sv@123456", role: "student", name: "Vũ Thị Phương", avatar: "VP", studentId: "SV006" },
  { email: "hung.dq@fbu.edu.vn", password: "Sv@123456", role: "student", name: "Đỗ Quang Hùng", avatar: "DH", studentId: "SV007" },
  { email: "lan.bt@fbu.edu.vn", password: "Sv@123456", role: "student", name: "Bùi Thị Lan", avatar: "BL", studentId: "SV008" },
  { email: "nhung.tt@fbu.edu.vn", password: "Sv@123456", role: "student", name: "Trịnh Thị Nhung", avatar: "TN", studentId: "SV010" },
  { email: "phuc.lv@fbu.edu.vn", password: "Sv@123456", role: "student", name: "Lý Văn Phúc", avatar: "LP", studentId: "SV011" },
];

async function seed() {
  await connectDB();
  console.log("Đang seed dữ liệu...");

  await Promise.all([
    User.deleteMany({}),
    Student.deleteMany({}),
    Teacher.deleteMany({}),
    Project.deleteMany({}),
    Grade.deleteMany({}),
  ]);

  await Student.insertMany(students);
  await Teacher.insertMany(teachers);
  await Project.insertMany(projects);
  await Grade.insertMany(grades);

  for (const u of users) {
    await User.create(u);
  }

  // Sửa user bị lưu mật khẩu plain text (không qua bcrypt)
  const allInDb = await User.find().select("+password email");
  for (const seed of users) {
    const doc = allInDb.find((d) => d.email === seed.email.toLowerCase());
    if (doc && doc.password && !/^\$2[aby]\$/.test(doc.password)) {
      doc.password = seed.password;
      await doc.save();
    }
  }

  console.log("Seed hoàn tất!");
  console.log("  - Users:", users.length);
  console.log("  - Students:", students.length);
  console.log("  - Teachers:", teachers.length);
  console.log("  - Projects:", projects.length);
  console.log("\nTài khoản admin: admin@fbu.edu.vn / Admin@2025");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
