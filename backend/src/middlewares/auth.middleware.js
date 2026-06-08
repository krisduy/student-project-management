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
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = {
  authenticate,
};
