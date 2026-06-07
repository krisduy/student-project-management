require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const connectDB = require("./src/configs/db");
const userRoutes = require("./src/routes/users.route");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api/users", userRoutes);

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
