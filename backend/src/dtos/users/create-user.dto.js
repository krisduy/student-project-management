class CreateUserDto {
  constructor(firstName, lastName, email, password, role, student, teacher) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.password = password;
    this.role = role;
    this.student = student;
    this.teacher = teacher;
  }
}

module.exports = CreateUserDto;
