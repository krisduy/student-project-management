const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Teacher = require("../models/teacher.model");
const Student = require("../models/student.model");

const DEFAULT_JWT_EXPIRES_IN = "7d";

class AuthService {
  getJwtSecret() {
    return process.env.JWT_SECRET || "student-project-management-secret";
  }

  async signToken(user) {
    let teacherId = null;
    let studentId = null;

    if (user.role === "teacher") {
      const teacher = await Teacher.findOne({ userId: user._id });
      teacherId = teacher ? teacher._id.toString() : null;
    } else if (user.role === "student") {
      const student = await Student.findOne({ userId: user._id });
      studentId = student ? student._id.toString() : null;
    }

    return jwt.sign(
      {
        sub: user._id.toString(),
        email: user.email,
        role: user.role,
        teacherId,
        studentId,
      },
      this.getJwtSecret(),
      {
        expiresIn: process.env.JWT_EXPIRES_IN || DEFAULT_JWT_EXPIRES_IN,
      },
    );
  }

  async login(loginDto) {
    const email = loginDto.email.toLowerCase().trim();
    const user = await User.findOne({ email });

    if (!user) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    return {
      token: await this.signToken(user),
      user: user.toPublicJSON(),
    };
  }

  async getCurrentUser(userId) {
    return User.findById(userId).lean();
  }
}

module.exports = AuthService;
