const Teacher = require("../models/teacher.model");

class TeacherService {
  async getTeachers() {
    return Teacher.find().populate("userId").lean();
  }

  async getTeacherOptions() {
    return Teacher.find().populate("userId").lean();
  }

  async getTeacherById(id) {
    return Teacher.findById(id).populate("userId").lean();
  }

  async createTeacher(teacherDto) {
    const teacher = new Teacher({
      userId: teacherDto.userId,
      teacherCode: `GV${teacherDto.userId.toString().slice(-8).toUpperCase()}`,
      degree: teacherDto.degree,
    });

    return teacher.save();
  }

  async updateTeacher(id, teacherDto) {
    return Teacher.findByIdAndUpdate(
      id,
      {
        userId: teacherDto.userId,
        degree: teacherDto.degree,
      },
      { new: true },
    )
      .populate("userId")
      .lean();
  }

  async deleteTeacher(id) {
    return Teacher.findByIdAndDelete(id).populate("userId").lean();
  }
}

module.exports = TeacherService;
