const Progress = require("../models/progress.model");
const Topic = require("../models/topic.model");

class ProgressService {
  async getProgressesByTeacher(teacherId) {
    const topics = await Topic.find({ teacherId }).select("_id");
    const topicIds = topics.map((topic) => topic._id);

    return Progress.find({ topicId: { $in: topicIds } })
      .populate("topicId")
      .lean();
  }

  async createProgress(progressDto) {
    const progress = new Progress({
      topicId: progressDto.topicId,
      milestone: progressDto.milestone,
      teacherComment: progressDto.teacherComment,
    });

    return progress.save();
  }

  async updateProgress(progressId, progressDto) {
    return Progress.findByIdAndUpdate(
      progressId,
      {
        milestone: progressDto.milestone,
        teacherComment: progressDto.teacherComment,
      },
      { new: true },
    ).lean();
  }
}

module.exports = ProgressService;
