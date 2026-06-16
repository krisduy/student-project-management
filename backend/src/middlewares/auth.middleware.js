const jwt = require("jsonwebtoken");

function getJwtSecret() {
  return process.env.JWT_SECRET || "student-project-management-secret";
}

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization token is required" });
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwt.verify(token, getJwtSecret());
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      teacherId: payload.teacherId || null,
      studentId: payload.studentId || null,
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function authorizeAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication is required" });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  next();
}

function authorizeRoles(...roles) {
  return function checkRole(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication is required" });
    }

    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: "You do not have permission to access this resource" });
    }

    next();
  };
}

module.exports = {
  authenticate,
  authorizeAdmin,
  authorizeRoles,
};
