const mongoose = require("mongoose");

const defenseScoreSchema = new mongoose.Schema(
  {
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
      unique: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      default: null,
    },
    processScore: {
      type: Number,
      min: 0,
      max: 10,
      default: null,
    },
    reportScore: {
      type: Number,
      min: 0,
      max: 10,
      default: null,
    },
    rebuttalScore: {
      type: Number,
      min: 0,
      max: 10,
      default: null,
    },
    finalScore: {
      type: Number,
      min: 0,
      max: 10,
      default: null,
    },
    teacherComment: {
      type: String,
      default: "",
    },
    defenseDate: {
      type: Date,
      default: null,
    },
    isLocked: {
      type: Boolean,
      default: false,
    },
    enteredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

defenseScoreSchema.methods.calculateFinalScore = function () {
  const p = this.processScore ?? 0;
  const r = this.reportScore ?? 0;
  const rb = this.rebuttalScore ?? 0;
  const total = p + r + rb;
  const final = parseFloat((total / 3).toFixed(2));
  return final;
};

defenseScoreSchema.pre("save", function (next) {
  if (
    this.processScore != null ||
    this.reportScore != null ||
    this.rebuttalScore != null
  ) {
    this.finalScore = this.calculateFinalScore();
  }
  next();
});

defenseScoreSchema.index({ topicId: 1 }, { unique: true });
defenseScoreSchema.index({ studentId: 1 });

const DefenseScore = mongoose.model("DefenseScore", defenseScoreSchema);

module.exports = DefenseScore;
