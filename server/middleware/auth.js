const jwt = require("jsonwebtoken");
const User = require("../models/User");

function getJwtSecret() {
  return process.env.JWT_SECRET || "fbu_dev_secret";
}

function signToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      studentId: user.studentId,
      teacherId: user.teacherId,
    },
    getJwtSecret(),
    { expiresIn: "7d" }
  );
}

async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
      return res.status(401).json({ ok: false, message: "Chưa đăng nhập." });
    }
    const payload = jwt.verify(token, getJwtSecret());
    const user = await User.findById(payload.id);
    if (!user || user.disabled) {
      return res.status(401).json({ ok: false, message: "Phiên đăng nhập không hợp lệ." });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, message: "Token hết hạn hoặc không hợp lệ." });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ ok: false, message: "Chưa đăng nhập." });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ ok: false, message: "Bạn không có quyền thực hiện thao tác này." });
    }
    next();
  };
}

module.exports = { signToken, authenticate, authorize };
