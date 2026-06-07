const mongoose = require("mongoose");

const gradeSchema = new mongoose.Schema(
  {
    projectId: { type: String, required: true, unique: true },
    teacherId: { type: String, required: true },
    process: { type: Number, default: 0 },
    report: { type: Number, default: 0 },
    defense: { type: Number, default: 0 },
    final: { type: Number, default: 0 },
    note: { type: String, default: "" },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "approved" },
    adminNote: { type: String, default: "" },
    approvedBy: { type: String, default: "" },
    approvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Grade", gradeSchema);
