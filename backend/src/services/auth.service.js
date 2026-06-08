const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const DEFAULT_JWT_EXPIRES_IN = "7d";

class AuthService {
  getJwtSecret() {
    return process.env.JWT_SECRET || "student-project-management-secret";
  }

  signToken(user) {
    return jwt.sign(
      {
        sub: user._id.toString(),
        email: user.email,
        role: user.role,
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

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    return {
      token: this.signToken(user),
      user: user.toPublicJSON(),
    };
  }

  async getCurrentUser(userId) {
    return User.findById(userId).lean();
  }
}

module.exports = AuthService;
