const Student = require("../models/student.model");

class StudentService {
  async getStudents() {
    return Student.find().populate("userId").lean();
  }

  async createStudent(studentDto) {
    const student = new Student({
      userId: studentDto.userId,
      class: studentDto.class,
      major: studentDto.major,
    });

    return student.save();
  }

  async updateStudent(id, studentDto) {
    return Student.findByIdAndUpdate(
      id,
      {
        userId: studentDto.userId,
        class: studentDto.class,
        major: studentDto.major,
      },
      { new: true },
    )
      .populate("userId")
      .lean();
  }

  async deleteStudent(id) {
    return Student.findByIdAndDelete(id).populate("userId").lean();
  }

  async getStudentOptions() {
    const classes = await Student.distinct("class");
    const majors = await Student.distinct("major");
    return { classes: classes.filter(Boolean).sort(), majors: majors.filter(Boolean).sort() };
  }
}

module.exports = StudentService;
