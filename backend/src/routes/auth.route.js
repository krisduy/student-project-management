const express = require("express");
const AuthController = require("../controllers/auth.controller");
const AuthService = require("../services/auth.service");
const { authenticate } = require("../middlewares/auth.middleware");

const authService = new AuthService();
const authController = new AuthController(authService);
const router = express.Router();

router.post("/login", async (req, res, next) => {
  try {
    await authController.login(req, res);
  } catch (error) {
    next(error);
  }
});

router.get("/me", authenticate, async (req, res, next) => {
  try {
    await authController.me(req, res);
  } catch (error) {
    next(error);
  }
});

router.patch("/me/avatar", authenticate, async (req, res, next) => {
  try {
    await authController.updateAvatar(req, res);
  } catch (error) {
    next(error);
  }
});

router.patch("/me/profile", authenticate, async (req, res, next) => {
  try {
    await authController.updateProfile(req, res);
  } catch (error) {
    next(error);
  }
});

router.get("/student-options", async (req, res, next) => {
  try {
    await authController.getStudentOptions(req, res);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
