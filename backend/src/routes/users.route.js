const express = require("express");
const UserController = require("../controllers/users.controller");
const UserService = require("../services/users.service");

const userService = new UserService();
const userController = new UserController(userService);
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    await userController.getUsers(req, res);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
