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

module.exports = router;
