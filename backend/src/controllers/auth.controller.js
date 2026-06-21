const LoginDto = require("../dtos/auth/login.dto");
const Student = require("../models/student.model");

class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  async login(req, res) {
    try {
      const result = await this.authService.login(
        new LoginDto(req.body.email, req.body.password),
      );

      res.json(result);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async me(req, res) {
    try {
      const user = await this.authService.getCurrentUser(req.user.id);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { password, ...publicUser } = user;
      res.json(publicUser);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateAvatar(req, res) {
    try {
      const { avatar } = req.body;

      if (avatar && typeof avatar !== "string") {
        return res.status(400).json({ error: "Avatar must be a string" });
      }

      const user = await this.authService.updateCurrentUserAvatar(req.user.id, avatar || null);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateProfile(req, res) {
    try {
      const user = await this.authService.updateCurrentUserProfile(req.user.id, req.body || {});

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(user);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async getStudentOptions(req, res) {
    try {
      const classes = await Student.distinct("class");
      const majors = await Student.distinct("major");
      res.json({
        classes: classes.filter(Boolean).sort(),
        majors: majors.filter(Boolean).sort(),
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = AuthController;
