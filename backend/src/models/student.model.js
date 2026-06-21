const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    studentCode: {
      type: String,
      required: true,
      trim: true,
    },
    class: {
      type: String,
      required: true,
      trim: true,
    },
    major: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

const Student = mongoose.model("Student", studentSchema);

module.exports = Student;
