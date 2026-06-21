const DefenseScoreService = require("../services/defenseScore.service");

const defenseScoreService = new DefenseScoreService();

class DefenseScoreController {
  async getEligibleTopics(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const result = await defenseScoreService.getEligibleTopics(req.query, page, limit);
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }

  async getScoresByTopicId(req, res) {
    try {
      const result = await defenseScoreService.getScoresByTopicId(req.params.topicId);
      res.json(result || {});
    } catch (error) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }

  async upsertScore(req, res) {
    try {
      const { topicId, studentId, teacherId, ...payload } = req.body;
      const userId = req.user.id;
      const result = await defenseScoreService.upsertScore(topicId, studentId, teacherId, payload, userId);
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }

  async lockScore(req, res) {
    try {
      const result = await defenseScoreService.lockScore(req.params.topicId);
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }

  async unlockScore(req, res) {
    try {
      const result = await defenseScoreService.unlockScore(req.params.topicId);
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }

  async getMyScore(req, res) {
    try {
      const result = await defenseScoreService.getMyScore(req.user.id);
      res.json(result || { hasScore: false });
    } catch (error) {
      res.status(error.status || 500).json({ message: error.message });
    }
  }
}

module.exports = DefenseScoreController;
