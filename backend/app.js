require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const connectDB = require("./src/configs/db");
const authRoutes = require("./src/routes/auth.route");
const userRoutes = require("./src/routes/users.route");
const studentRoutes = require("./src/routes/students.route");
const teacherRoutes = require("./src/routes/teachers.route");
const topicRoutes = require("./src/routes/topics.route");
const progressRoutes = require("./src/routes/progress.route");
const dashboardRoutes = require("./src/routes/dashboard.route");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
  }),
);
app.use(express.json({ limit: "5mb" }));
app.use((req, res, next) => {
  const start = Date.now();
  const bodyForLog = req.body?.avatar
    ? { ...req.body, avatar: `[base64:${req.body.avatar.length} chars]` }
    : req.body;
  console.log(`[REQUEST] ${req.method} ${req.url} - Body:`, JSON.stringify(bodyForLog));
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[RESPONSE] ${req.method} ${req.url} - Status: ${res.statusCode} (${duration}ms)`);
  });
  next();
});
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/progresses", progressRoutes);
app.use("/api/dashboard", dashboardRoutes);

function healthCheck(req, res) {
  const mongoConnected = mongoose.connection.readyState === 1;
  const status = mongoConnected ? 200 : 503;

  res.status(status).json({
    ok: mongoConnected,
    service: "backend",
    mongo: mongoConnected ? "connected" : "disconnected",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
}

app.get("/health", healthCheck);
app.get("/api/health", healthCheck);

app.get("/api", (req, res) => {
  res.json({ ok: true, message: "Backend API is running" });
});

app.get("/api/test", (req, res) => {
  res.json({ test: "ok" });
});

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Backend listening on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start backend:", error);
  process.exit(1);
});
