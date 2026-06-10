const LoginDto = require("../dtos/auth/login.dto");

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
}

module.exports = AuthController;
