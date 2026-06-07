const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    students: [{ type: String }],
    teacherId: { type: String, required: true },
    category: { type: String, default: "Web" },
    status: { type: String, enum: ["completed", "in-progress", "pending", "failed"], default: "pending" },
    score: { type: Number, default: null },
    startDate: { type: String, default: "" },
    deadline: { type: String, default: "" },
    desc: { type: String, default: "" },
    submitted: { type: Boolean, default: false },
    submissionLink: { type: String, default: "" },
    submissionNote: { type: String, default: "" },
    submittedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
