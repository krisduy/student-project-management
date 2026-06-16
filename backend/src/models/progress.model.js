const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
    },
    milestone: {
      type: String,
    },
    teacherComment: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const Progress = mongoose.model("Progress", progressSchema);

module.exports = Progress;
