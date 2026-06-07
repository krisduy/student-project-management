class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  async getUsers(req, res) {
    try {
      const users = await this.userService.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = UserController;
