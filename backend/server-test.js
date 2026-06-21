require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./src/models/user.model");
const Teacher = require("./src/models/teacher.model");
const Student = require("./src/models/student.model");

const app = express();
app.use(express.json());

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "student-project-management-secret";

async function login(email, password) {
  console.log('[LOGIN] email:', email);
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  console.log('[LOGIN] user found:', user ? user.email : 'null');
  
  if (!user) throw new Error("Invalid email or password");
  
  const isValid = await bcrypt.compare(password, user.password);
  console.log('[LOGIN] password valid:', isValid);
  
  if (!isValid) throw new Error("Invalid email or password");
  
  const userJson = user.toPublicJSON();
  return {
    token: jwt.sign(
      { sub: user._id.toString(), email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    ),
    user: userJson
  };
}

app.post("/api/auth/login", async (req, res) => {
  try {
    console.log('[SERVER] /api/auth/login called');
    console.log('[SERVER] body:', JSON.stringify(req.body));
    const result = await login(req.body.email, req.body.password);
    console.log('[SERVER] login success');
    res.json(result);
  } catch (error) {
    console.log('[SERVER] login error:', error.message);
    res.status(401).json({ error: error.message });
  }
});

async function start() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/student_project_management");
  console.log('[SERVER] MongoDB connected');
  app.listen(PORT, () => {
    console.log(`[SERVER] Listening on port ${PORT}`);
  });
}

start();
