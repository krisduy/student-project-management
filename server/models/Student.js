const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    class: { type: String, default: "" },
    gpa: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "warning", "suspended"], default: "active" },
    projectId: { type: String, default: null },
    avatar: { type: String, default: "" },
    phone: { type: String, default: "" },
    dob: { type: String, default: "" },
    address: { type: String, default: "" },
    gender: { type: String, default: "" },
    major: { type: String, default: "" },
    mode: { type: String, default: "" },
    credits: { type: Number, default: 0 },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", studentSchema);
