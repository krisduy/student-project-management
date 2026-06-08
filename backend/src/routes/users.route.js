const express = require("express");
const UserController = require("../controllers/users.controller");
const UserService = require("../services/users.service");
const { authenticate, authorizeAdmin } = require("../middlewares/auth.middleware");

const userService = new UserService();
const userController = new UserController(userService);
const router = express.Router();

router.use(authenticate, authorizeAdmin);

router.get("/", async (req, res, next) => {
  try {
    await userController.getUsers(req, res);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    await userController.createUser(req, res);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    await userController.updateUser(req, res);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await userController.deleteUser(req, res);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
