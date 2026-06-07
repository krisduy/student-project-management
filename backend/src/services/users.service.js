const User = require("../models/user.model");

class UserService {
  async getUsers() {
    return User.find().lean();
  }
}

module.exports = UserService;
