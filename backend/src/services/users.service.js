const User = require("../models/user.model");
const Student = require("../models/student.model");
const Teacher = require("../models/teacher.model");
const bcrypt = require("bcrypt");

function toPublicUser(user) {
  if (!user) return null;

  return {
    id: user._id.toString(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function normalizeProfile(profile) {
  if (!profile) return null;

  return {
    id: profile._id.toString(),
    class: profile.class,
    major: profile.major,
    degree: profile.degree,
  };
}

class UserService {
  async getUsers() {
    const users = await User.find().sort({ createdAt: -1 }).lean();
    const userIds = users.map((user) => user._id);
    const [students, teachers] = await Promise.all([
      Student.find({ userId: { $in: userIds } }).lean(),
      Teacher.find({ userId: { $in: userIds } }).lean(),
    ]);
    const studentsByUserId = new Map(students.map((student) => [student.userId.toString(), student]));
    const teachersByUserId = new Map(teachers.map((teacher) => [teacher.userId.toString(), teacher]));

    return users.map((user) => {
      const publicUser = toPublicUser(user);
      const key = user._id.toString();
      publicUser.profile = normalizeProfile(studentsByUserId.get(key) || teachersByUserId.get(key));
      return publicUser;
    });
  }

  async createUser(userDto) {
    const existingUser = await User.findOne({ email: userDto.email.toLowerCase().trim() });
    if (existingUser) {
      const error = new Error("Email already exists");
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(userDto.password, 10);

    const user = new User({
      firstName: userDto.firstName.trim(),
      lastName: userDto.lastName.trim(),
      email: userDto.email.toLowerCase().trim(),
      password: hashedPassword,
      role: userDto.role,
    });

    const savedUser = await user.save();

    try {
      if (userDto.role === "student") {
        await Student.create({
          userId: savedUser._id,
          studentCode: `SV${savedUser._id.toString().slice(-8).toUpperCase()}`,
          class: userDto.student?.class,
          major: userDto.student?.major,
        });
      }

      if (userDto.role === "teacher") {
        await Teacher.create({
          userId: savedUser._id,
          teacherCode: `GV${savedUser._id.toString().slice(-8).toUpperCase()}`,
          degree: userDto.teacher?.degree,
        });
      }
    } catch (error) {
      await User.findByIdAndDelete(savedUser._id);
      throw error;
    }

    const createdUser = await User.findById(savedUser._id).lean();
    const student = await Student.findOne({ userId: savedUser._id }).lean();
    const teacher = await Teacher.findOne({ userId: savedUser._id }).lean();
    
    const result = toPublicUser(createdUser);
    if (student) result.profile = normalizeProfile(student);
    if (teacher) result.profile = normalizeProfile(teacher);
    
    return result;
  }

  async updateUser(id, userDto) {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        firstName: userDto.firstName.trim(),
        lastName: userDto.lastName.trim(),
        email: userDto.email.toLowerCase().trim(),
        role: userDto.role,
      },
      { new: true },
    ).lean();

    return toPublicUser(updatedUser);
  }

  async deleteUser(id) {
    await Promise.all([
      Student.findOneAndDelete({ userId: id }),
      Teacher.findOneAndDelete({ userId: id }),
    ]);
    const deletedUser = await User.findByIdAndDelete(id).lean();
    return toPublicUser(deletedUser);
  }

  async updateAvatar(id, avatar) {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { avatar },
      { new: true },
    );
    return updatedUser ? updatedUser.toPublicJSON() : null;
  }
}

module.exports = UserService;
