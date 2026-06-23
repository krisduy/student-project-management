const DefenseScoreService = require("../services/defenseScore.service");

const defenseScoreService = new DefenseScoreService();

class DefenseScoreController {
  async getEligibleTopics(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const result = await defenseScoreService.getEligibleTopics(
        req.query,
        page,
        limit,
      );

      return res.json(result);
    } catch (error) {
      console.error("getEligibleTopics error:", error);

      return res.status(error.status || 500).json({
        message: error.message,
      });
    }
  }

  async getScoresByTopicId(req, res) {
    try {
      const result = await defenseScoreService.getScoresByTopicId(
        req.params.topicId,
      );

      return res.json(result || {});
    } catch (error) {
      return res.status(error.status || 500).json({
        message: error.message,
      });
    }
  }

  async upsertScore(req, res) {
    try {
      const { topicId, studentId, teacherId, ...payload } = req.body;
      const userId = req.user.id;

      const result = await defenseScoreService.upsertScore(
        topicId,
        studentId,
        teacherId,
        payload,
        userId,
      );

      return res.json(result);
    } catch (error) {
      return res.status(error.status || 500).json({
        message: error.message,
      });
    }
  }

  async lockScore(req, res) {
    try {
      const result = await defenseScoreService.lockScore(req.params.topicId);

      return res.json(result);
    } catch (error) {
      return res.status(error.status || 500).json({
        message: error.message,
      });
    }
  }

  async unlockScore(req, res) {
    try {
      const result = await defenseScoreService.unlockScore(req.params.topicId);

      return res.json(result);
    } catch (error) {
      return res.status(error.status || 500).json({
        message: error.message,
      });
    }
  }

  async getMyScore(req, res) {
    try {
      const result = await defenseScoreService.getMyScore(req.user.id);

      return res.json(result || { hasScore: false });
    } catch (error) {
      return res.status(error.status || 500).json({
        message: error.message,
      });
    }
  }
}

module.exports = DefenseScoreController;
