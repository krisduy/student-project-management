const CreateProgressDto = require("../dtos/progress/create-progress.dto");
const UpdateProgressDto = require("../dtos/progress/update-progress.dto");
const { authorizeRoles } = require("../middlewares/auth.middleware");

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
        return res.json([]);
      }

      res.json(progresses);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getMyProgress(req, res) {
    try {
      const studentId = req.user?.studentId;
      if (!studentId) {
        return res.status(400).json({ error: "Không tìm thấy thông tin sinh viên" });
      }

      const progress = await this.progressService.getProgressByStudentId(studentId);
      res.json(progress || { message: "Chưa có tiến độ" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getStudentProgressByTeacher(req, res) {
    try {
      const teacherId = req.user?.teacherId;
      if (!teacherId) {
        return res.status(400).json({ error: "Không tìm thấy thông tin giảng viên" });
      }

      const progresses = await this.progressService.getStudentProgressByTeacher(teacherId);
      res.json(progresses);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getProgressByTopicId(req, res) {
    try {
      const { topicId } = req.params;
      const progress = await this.progressService.getProgressByTopicId(topicId);

      if (!progress) {
        return res.status(404).json({ error: "Không tìm thấy tiến độ" });
      }

      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createProgress(req, res) {
    try {
      const topicId = req.body.topicId;
      let studentId = req.user?.studentId;

      if (!studentId && topicId) {
        const Topic = require("../models/topic.model");
        const topic = await Topic.findById(topicId).populate("studentId");
        if (topic?.studentId?._id) {
          studentId = topic.studentId._id;
        }
      }

      const progressData = {
        topicId,
        studentId,
        currentStage: req.body.currentStage || "",
        completedStages: req.body.completedStages || [],
        percentage: 0,
      };

      const { Progress } = require("../models/progress.model");
      const progress = new Progress(progressData);
      const saved = await progress.save();

      res.status(201).json(saved);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateStudentStage(req, res) {
    try {
      const { progressId } = req.params;
      const { stage, notes } = req.body;

      if (!stage) {
        return res.status(400).json({ error: "Vui lòng chọn giai đoạn" });
      }

      const validStages = ["register", "analysis", "development", "report", "complete"];
      if (!validStages.includes(stage)) {
        return res.status(400).json({ error: "Giai đoạn không hợp lệ" });
      }

      const updated = await this.progressService.updateStudentStage(progressId, stage, notes);
      res.json(updated);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async approveStage(req, res) {
    try {
      const { progressId } = req.params;
      const { comment } = req.body;
      const teacherId = req.user?.teacherId;

      if (!teacherId) {
        return res.status(403).json({ error: "Không có quyền thực hiện" });
      }

      const updated = await this.progressService.approveStage(progressId, teacherId, comment);
      res.json(updated);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async rejectStage(req, res) {
    try {
      const { progressId } = req.params;
      const { comment } = req.body;
      const teacherId = req.user?.teacherId;

      if (!teacherId) {
        return res.status(403).json({ error: "Không có quyền thực hiện" });
      }

      if (!comment || !comment.trim()) {
        return res.status(400).json({ error: "Vui lòng nhập nhận xét khi từ chối" });
      }

      const updated = await this.progressService.rejectStage(progressId, teacherId, comment.trim());
      res.json(updated);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async resubmitStage(req, res) {
    try {
      const { progressId } = req.params;
      const { notes } = req.body;

      const updated = await this.progressService.resubmitStage(progressId, notes);
      res.json(updated);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async updateProgress(req, res) {
    try {
      const progresses = await this.progressService.updateProgress(
        req.params.progressId,
        new UpdateProgressDto(req.body.milestone, req.body.teacherComment),
      );

      res.json(progresses);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = ProgressController;
