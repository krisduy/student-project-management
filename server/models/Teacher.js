const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    dept: { type: String, default: "CNTT" },
    expertise: { type: String, default: "" },
    projects: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Teacher", teacherSchema);
