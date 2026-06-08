const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema(
  {
    topicCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    topicName: {
      type: String,
      required: true,
      trim: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      default: null,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      default: null,
    },
  },
  { timestamps: true },
);

topicSchema.index(
  { studentId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      studentId: { $type: "objectId" },
    },
  },
);

const Topic = mongoose.model("Topic", topicSchema);

module.exports = Topic;
