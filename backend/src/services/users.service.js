const User = require("../models/user.model");
const bcrypt = require("bcrypt");

class UserService {
  async getUsers() {
    return User.find().lean();
  }

  async createUser(userDto) {
    const hashedPassword = await bcrypt.hash(userDto.password, 10);

    const user = new User({
      firstName: userDto.firstName,
      lastName: userDto.lastName,
      email: userDto.email,
      password: hashedPassword,
      role: userDto.role,
    });

    return user.save();
  }

  async updateUser(id, userDto) {
    return User.findByIdAndUpdate(
      id,
      {
        firstName: userDto.firstName,
        lastName: userDto.lastName,
        email: userDto.email,
        role: userDto.role,
      },
      { new: true },
    ).lean();
  }

  async deleteUser(id) {
    return User.findByIdAndDelete(id).lean();
  }
}

module.exports = UserService;
