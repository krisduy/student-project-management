const express = require("express");
const User = require("../models/User");
const { signToken, authenticate } = require("../middleware/auth");

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ ok: false, message: "Vui lòng nhập email và mật khẩu." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ ok: false, message: "Email hoặc mật khẩu không đúng." });
    }
    await user.upgradePasswordHash(password);
    if (user.disabled) {
      return res.status(403).json({ ok: false, message: "Tài khoản đã bị khóa." });
    }

    const token = signToken(user);
    return res.json({ ok: true, token, user: user.toPublicJSON() });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ ok: false, message: "Lỗi server." });
  }
});

router.get("/me", authenticate, (req, res) => {
  res.json({ ok: true, user: req.user.toPublicJSON() });
});

module.exports = router;
