const mongoose = require("mongoose");

const PROGRESS_STAGES = [
  { key: "register", label: "Đăng ký đề tài", order: 1 },
  { key: "analysis", label: "Phân tích yêu cầu", order: 2 },
  { key: "development", label: "Thiết kế và lập trình", order: 3 },
  { key: "report", label: "Hoàn thiện báo cáo", order: 4 },
  { key: "complete", label: "Hoàn thành", order: 5 },
];

const STAGE_PERCENTAGES = {
  register: 20,
  analysis: 40,
  development: 70,
  report: 90,
  complete: 100,
};

const progressSchema = new mongoose.Schema(
  {
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    currentStage: {
      type: String,
      enum: ["register", "analysis", "development", "report", "complete", ""],
      default: "",
    },
    completedStages: [{
      type: String,
      enum: ["register", "analysis", "development", "report", "complete"],
    }],
    stageDetails: {
      type: Map,
      of: {
        completedAt: Date,
        notes: String,
      },
      default: {},
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    teacherComment: {
      type: String,
    },
    updatedByTeacher: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending_teacher_approval", "approved", "needs_revision", ""],
      default: "",
    },
    reviewHistory: [{
      action: {
        type: String,
        enum: ["submitted", "approved", "rejected", "resubmitted"],
        required: true
      },
      stage: {
        type: String,
        enum: ["register", "analysis", "development", "report", "complete"],
        required: true
      },
      teacherComment: String,
      reviewedAt: Date,
      reviewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teacher"
      }
    }],
    eligibleForDefense: {
      type: Boolean,
      default: false
    },
    defenseEligibleAt: Date
  },
  {
    timestamps: true,
  },
);

progressSchema.methods.calculatePercentage = function() {
  if (this.currentStage === "complete" || this.completedStages.includes("complete")) {
    return 100;
  }
  return STAGE_PERCENTAGES[this.currentStage] || 0;
};

progressSchema.pre("save", function() {
  this.percentage = this.calculatePercentage();
  
  // Auto-set eligibleForDefense when stage 5 is approved
  if (this.currentStage === "complete" && this.status === "approved") {
    this.eligibleForDefense = true;
    this.defenseEligibleAt = this.defenseEligibleAt || new Date();
  }
});

const Progress = mongoose.model("Progress", progressSchema);

module.exports = { Progress, PROGRESS_STAGES, STAGE_PERCENTAGES };
