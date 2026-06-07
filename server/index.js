require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const dataRoutes = require("./routes/data");

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, "..");

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/data", dataRoutes);

app.use("/api", (_req, res) => {
  res.status(404).json({ ok: false, message: "API không tồn tại." });
});

app.use(express.static(ROOT));

app.get("/", (_req, res) => {
  res.redirect("/html/login.html");
});

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`FBU Server: http://localhost:${PORT}`);
    console.log(`Login:      http://localhost:${PORT}/html/login.html`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
