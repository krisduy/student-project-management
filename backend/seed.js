const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const MONGODB_URI = "mongodb://127.0.0.1:27017/student_project_management";

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
}, { timestamps: true });

const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
  studentCode: { type: String, required: true },
  class: { type: String, required: true },
  major: { type: String, required: true },
}, { timestamps: true });

const teacherSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
  teacherCode: { type: String, required: true },
  degree: String,
  department: String,
  title: String,
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
const Student = mongoose.model("Student", studentSchema);
const Teacher = mongoose.model("Teacher", teacherSchema);

async function seed() {
  console.log("🔄 Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  
  console.log("🗑️  Clearing existing data...");
  await Promise.all([
    User.deleteMany({}),
    Student.deleteMany({}),
    Teacher.deleteMany({}),
  ]);
  
  console.log("📝 Creating users...");
  const password = await bcrypt.hash("Test@123", 10);
  
  const admin = await User.create({
    firstName: "Admin",
    lastName: "FBU",
    email: "admin@fbu.edu.vn",
    password,
    role: "admin",
  });
  
  const students = await Promise.all([
    User.create({
      firstName: "Nguyễn",
      lastName: "Hoàng Long",
      email: "long@fbu.edu.vn",
      password,
      role: "student",
    }),
    User.create({
      firstName: "Lê",
      lastName: "Văn Luyện",
      email: "luyen@fbu.edu.vn",
      password,
      role: "student",
    }),
    User.create({
      firstName: "Đỗ",
      lastName: "Mai Anh",
      email: "maianh@fbu.edu.vn",
      password,
      role: "student",
    }),
  ]);
  
  await Student.create([
    { userId: students[0]._id, studentCode: "SV001", class: "CNTT21A", major: "Công nghệ thông tin" },
    { userId: students[1]._id, studentCode: "SV002", class: "CNTT21A", major: "Công nghệ thông tin" },
    { userId: students[2]._id, studentCode: "SV003", class: "HTTT21A", major: "Hệ thống thông tin" },
  ]);
  
  const teacher = await User.create({
    firstName: "TS. Trần",
    lastName: "Văn Minh",
    email: "minh@fbu.edu.vn",
    password,
    role: "teacher",
  });
  
  await Teacher.create({
    userId: teacher._id,
    teacherCode: "GV001",
    degree: "Tiến sĩ",
    department: "Công nghệ thông tin",
    title: "Giảng viên",
  });
  
  console.log("✅ Seed completed!");
  console.log(`   - 1 admin: admin@fbu.edu.vn / Test@123`);
  console.log(`   - 3 students: long@fbu.edu.vn, luyen@fbu.edu.vn, maianh@fbu.edu.vn / Test@123`);
  console.log(`   - 1 teacher: minh@fbu.edu.vn / Test@123`);
  
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
