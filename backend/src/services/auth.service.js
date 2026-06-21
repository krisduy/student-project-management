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

    const userJson = user.toPublicJSON();
    if (user.role === "teacher") {
      const teacher = await Teacher.findOne({ userId: user._id });
      if (teacher) {
        userJson.teacherId = {
          id: teacher._id.toString(),
          teacherCode: teacher.teacherCode,
          degree: teacher.degree,
          department: teacher.department,
          title: teacher.title,
        };
      }
    } else if (user.role === "student") {
      const student = await Student.findOne({ userId: user._id });
      if (student) {
        userJson.studentId = {
          id: student._id.toString(),
          studentCode: student.studentCode,
          class: student.class,
          major: student.major,
        };
      }
    }

    return {
      token: await this.signToken(user),
      user: userJson,
    };
  }

  async getCurrentUser(userId) {
    const user = await User.findById(userId).lean();
    if (!user) return null;

    const result = {
      id: user._id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    if (user.role === "teacher") {
      const teacher = await Teacher.findOne({ userId: user._id });
      if (teacher) {
        result.teacherId = {
          id: teacher._id.toString(),
          teacherCode: teacher.teacherCode,
          degree: teacher.degree,
          department: teacher.department,
          title: teacher.title,
        };
      }
    } else if (user.role === "student") {
      const student = await Student.findOne({ userId: user._id });
      if (student) {
        result.studentId = {
          id: student._id.toString(),
          studentCode: student.studentCode,
          class: student.class,
          major: student.major,
        };
      }
    }

    return result;
  }

  async updateCurrentUserAvatar(userId, avatar) {
    const user = await User.findByIdAndUpdate(
      userId,
      { avatar },
      { new: true },
    ).lean();

    if (!user) return null;

    return this.getCurrentUser(user._id);
  }

  async updateCurrentUserProfile(userId, profileDto) {
    const user = await User.findById(userId);
    if (!user) return null;

    const userUpdates = {};
    if (typeof profileDto.firstName === "string" && profileDto.firstName.trim()) {
      userUpdates.firstName = profileDto.firstName.trim();
    }
    if (typeof profileDto.lastName === "string" && profileDto.lastName.trim()) {
      userUpdates.lastName = profileDto.lastName.trim();
    }
    if (typeof profileDto.email === "string" && profileDto.email.trim()) {
      const email = profileDto.email.toLowerCase().trim();
      const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
      if (existingUser) {
        const error = new Error("Email already exists");
        error.statusCode = 409;
        throw error;
      }
      userUpdates.email = email;
    }

    if (Object.keys(userUpdates).length) {
      await User.findByIdAndUpdate(user._id, userUpdates);
    }

    if (user.role === "student") {
      const studentUpdates = {};
      if (typeof profileDto.studentCode === "string") studentUpdates.studentCode = profileDto.studentCode.trim();
      if (typeof profileDto.class === "string") studentUpdates.class = profileDto.class.trim();
      if (typeof profileDto.major === "string") studentUpdates.major = profileDto.major.trim();

      if (Object.keys(studentUpdates).length) {
        await Student.findOneAndUpdate(
          { userId: user._id },
          { $set: studentUpdates, $setOnInsert: { userId: user._id } },
          { new: true, upsert: true, runValidators: true },
        );
      }
    }

    if (user.role === "teacher") {
      const teacherUpdates = {};
      if (typeof profileDto.teacherCode === "string") teacherUpdates.teacherCode = profileDto.teacherCode.trim();
      if (typeof profileDto.degree === "string") teacherUpdates.degree = profileDto.degree.trim();
      if (typeof profileDto.department === "string") teacherUpdates.department = profileDto.department.trim();
      if (typeof profileDto.title === "string") teacherUpdates.title = profileDto.title.trim();

      if (Object.keys(teacherUpdates).length) {
        await Teacher.findOneAndUpdate(
          { userId: user._id },
          { $set: teacherUpdates, $setOnInsert: { userId: user._id } },
          { new: true, upsert: true, runValidators: true },
        );
      }
    }

    return this.getCurrentUser(user._id);
  }
}

module.exports = AuthService;
