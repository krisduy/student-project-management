const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    degree: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

const Teacher = mongoose.model("Teacher", teacherSchema);

module.exports = Teacher;
