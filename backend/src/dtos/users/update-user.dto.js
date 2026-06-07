class UpdateUserDto {
  constructor(firstName, lastName, email, role) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.role = role;
  }
}

module.exports = UpdateUserDto;
