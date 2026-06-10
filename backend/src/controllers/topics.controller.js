const CreateTopicDto = require("../dtos/topics/create-topic.dto");
const UpdateTopicDto = require("../dtos/topics/update-topic.dto");

class TopicController {
  constructor(topicService) {
    this.topicService = topicService;
  }

  async getTopics(req, res) {
    try {
      const topics = await this.topicService.getTopics();
      res.json(topics);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createTopic(req, res) {
    try {
      const newTopic = await this.topicService.createTopic(
        new CreateTopicDto(
          req.body.topicCode,
          req.body.topicName,
          req.body.studentId,
          req.body.teacherId,
        ),
      );

      res.status(201).json(newTopic);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateTopic(req, res) {
    try {
      const updatedTopic = await this.topicService.updateTopic(
        req.params.id,
        new UpdateTopicDto(
          req.body.topicCode,
          req.body.topicName,
          req.body.studentId,
          req.body.teacherId,
        ),
      );

      if (!updatedTopic) {
        return res.status(404).json({ error: "Topic not found" });
      }

      res.json(updatedTopic);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteTopic(req, res) {
    try {
      const deletedTopic = await this.topicService.deleteTopic(req.params.id);

      if (!deletedTopic) {
        return res.status(404).json({ error: "Topic not found" });
      }

      res.json(deletedTopic);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async getAvailableTopics(req, res) {
    try {
      const topics = await this.topicService.getAvailableTopics(req.query.q || "");
      res.json(topics);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async registerTopic(req, res) {
    try {
      const topic = await this.topicService.registerTopic(
        req.params.id,
        req.user.id,
        req.body.teacherId,
      );

      res.json(topic);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async getStudentTopic(req, res) {
    try {
      const topic = await this.topicService.getStudentTopic(req.user.id);
      res.json({ topic });
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async getTeacherTopics(req, res) {
    try {
      const topics = await this.topicService.getTeacherTopics(req.user.id);
      res.json(topics);
    } catch (error) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
}

module.exports = TopicController;
