class CreateStudentDto {
  constructor(userId, studentClass, major) {
    this.userId = userId;
    this.class = studentClass;
    this.major = major;
  }
}

module.exports = CreateStudentDto;
