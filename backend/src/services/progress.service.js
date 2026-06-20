const { Progress, STAGE_PERCENTAGES } = require("../models/progress.model");
const Topic = require("../models/topic.model");

class ProgressService {
  async getProgressesByTeacher(teacherId) {
    const topics = await Topic.find({ teacherId }).select("_id");
    const topicIds = topics.map((topic) => topic._id);

    return Progress.find({ topicId: { $in: topicIds } })
      .populate({
        path: "topicId",
        populate: { path: "studentId" },
      })
      .lean();
  }

  async getProgressesByStudent(studentId) {
    return Progress.find({ studentId })
      .populate("topicId")
      .lean();
  }

  async getProgressByStudentId(studentId) {
    return Progress.findOne({ studentId })
      .populate("topicId")
      .lean();
  }

  async getProgressByTopicId(topicId) {
    return Progress.findOne({ topicId })
      .populate({
        path: "topicId",
        populate: [
          { path: "studentId", populate: "userId" },
          { path: "teacherId", populate: "userId" },
        ],
      })
      .lean();
  }

  async getStudentProgressByTeacher(teacherId) {
    const topics = await Topic.find({ teacherId }).select("_id studentId");
    const topicIds = topics.map((topic) => topic._id);

    const progresses = await Progress.find({ topicId: { $in: topicIds } })
      .populate({
        path: "topicId",
        populate: [
          { path: "studentId", populate: "userId" },
          { path: "teacherId", populate: "userId" },
        ],
      })
      .lean();

    return progresses.map((p) => {
      const topic = p.topicId;
      const student = topic?.studentId;
      const user = student?.userId;
      return {
        _id: p._id,
        percentage: p.percentage,
        currentStage: p.currentStage,
        completedStages: p.completedStages,
        stageDetails: p.stageDetails,
        teacherComment: p.teacherComment,
        updatedAt: p.updatedAt,
        student: {
          _id: student?._id,
          studentCode: student?.studentCode,
          userId: user?._id,
          firstName: user?.firstName,
          lastName: user?.lastName,
          fullName: [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "N/A",
        },
        topic: {
          _id: topic?._id,
          topicCode: topic?.topicCode,
          topicName: topic?.topicName,
        },
      };
    });
  }

  async createProgress(progressDto) {
    const progressData = {
      topicId: progressDto.topicId,
      studentId: progressDto.studentId,
      currentStage: progressDto.currentStage || "",
      completedStages: progressDto.completedStages || [],
      percentage: STAGE_PERCENTAGES[progressDto.currentStage] || 0,
    };

    if (progressDto.teacherComment) {
      progressData.teacherComment = progressDto.teacherComment;
    }

    const progress = new Progress(progressData);
    return progress.save();
  }

  async updateStudentStage(progressId, stage, notes = "") {
    const progress = await Progress.findById(progressId);
    if (!progress) throw new Error("Không tìm thấy tiến độ");

    const STAGE_ORDER = ["register", "analysis", "development", "report", "complete"];
    const currentIndex = STAGE_ORDER.indexOf(progress.currentStage);
    const newIndex = STAGE_ORDER.indexOf(stage);

    if (!progress.completedStages.includes(stage)) {
      if (newIndex > currentIndex) {
        for (let i = currentIndex; i <= newIndex; i++) {
          if (!progress.completedStages.includes(STAGE_ORDER[i])) {
            progress.completedStages.push(STAGE_ORDER[i]);
          }
        }
      } else {
        progress.completedStages = progress.completedStages.filter((s) => STAGE_ORDER.indexOf(s) < newIndex);
      }
    }

    progress.currentStage = stage;
    progress.percentage = STAGE_PERCENTAGES[stage] || 0;

    if (notes) {
      progress.stageDetails = progress.stageDetails || new Map();
      progress.stageDetails.set(stage, {
        completedAt: new Date(),
        notes,
      });
    }

    return progress.save();
  }

  async updateProgress(progressId, progressDto) {
    const updateData = {};

    if (progressDto.milestone !== undefined) {
      updateData.currentStage = progressDto.milestone;
      updateData.percentage = STAGE_PERCENTAGES[progressDto.milestone] || 0;
      updateData.updatedByTeacher = true;
    }

    if (progressDto.teacherComment !== undefined) {
      updateData.teacherComment = progressDto.teacherComment;
      updateData.updatedByTeacher = true;
    }

    return Progress.findByIdAndUpdate(
      progressId,
      updateData,
      { new: true },
    ).lean();
  }
}

module.exports = ProgressService;
