const CreateProgressDto = require("../dtos/progress/create-progress.dto");
const UpdateProgressDto = require("../dtos/progress/update-progress.dto");

class ProgressController {
  constructor(progressService) {
    this.progressService = progressService;
  }

  async getProgressesByTeacher(req, res) {
    try {
      const { teacherId } = req.params;
      const progresses =
        await this.progressService.getProgressesByTeacher(teacherId);

      if (!progresses || progresses.length === 0) {
        return res
          .status(404)
          .json({ error: "No progresses found for this teacher" });
      }

      res.json(progresses);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createProgress(req, res) {
    try {
      const newProgress = await this.progressService.createProgress(
        new CreateProgressDto(
          req.body.topicId,
          req.body.milestone,
          req.body.teacherComment,
        ),
      );

      res.status(201).json(newProgress);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateProgress(req, res) {
    try {
      const progresses = await this.progressService.updateProgress(
        req.params,
        new UpdateProgressDto(req.body.milestone, req.body.teacherComment),
      );

      res.json(progresses);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = ProgressController;
