const CreateUserDto = require("../dtos/users/create-user.dto");
const UpdateUserDto = require("../dtos/users/update-user.dto");

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

  async createUser(req, res) {
    try {
      const newUser = await this.userService.createUser(
        new CreateUserDto(
          req.body.firstName,
          req.body.lastName,
          req.body.email,
          req.body.password,
          req.body.role,
          req.body.student,
          req.body.teacher,
        ),
      );

      res.status(201).json(newUser);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async updateUser(req, res) {
    try {
      const updatedUser = await this.userService.updateUser(
        req.params.id,
        new UpdateUserDto(
          req.body.firstName,
          req.body.lastName,
          req.body.email,
          req.body.role,
        ),
      );

      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteUser(req, res) {
    try {
      const deletedUser = await this.userService.deleteUser(req.params.id);

      if (!deletedUser) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(deletedUser);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = UserController;
