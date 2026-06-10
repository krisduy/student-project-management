const Topic = require("../models/topic.model");
const Student = require("../models/student.model");
const Teacher = require("../models/teacher.model");

class TopicService {
  getPopulateQuery(query = Topic.find()) {
    return query
      .populate({
        path: "studentId",
        populate: { path: "userId" },
      })
      .populate({
        path: "teacherId",
        populate: { path: "userId" },
      });
  }

  async getTopics() {
    return this.getPopulateQuery(Topic.find()).lean();
  }

  async getAvailableTopics(search = "") {
    const filter = { studentId: null };
    const keyword = search.trim();

    if (keyword) {
      filter.$or = [
        { topicCode: { $regex: keyword, $options: "i" } },
        { topicName: { $regex: keyword, $options: "i" } },
      ];
    }

    return this.getPopulateQuery(Topic.find(filter)).lean();
  }

  async registerTopic(topicId, userId, teacherId) {
    if (!teacherId) {
      const error = new Error("Teacher is required");
      error.statusCode = 400;
      throw error;
    }

    const student = await Student.findOne({ userId });
    if (!student) {
      const error = new Error("Student profile not found");
      error.statusCode = 404;
      throw error;
    }

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      const error = new Error("Teacher not found");
      error.statusCode = 404;
      throw error;
    }

    const existingTopic = await Topic.findOne({ studentId: student._id });
    if (existingTopic) {
      const error = new Error("Student has already registered a topic");
      error.statusCode = 409;
      throw error;
    }

    const topic = await Topic.findById(topicId);
    if (!topic) {
      const error = new Error("Topic not found");
      error.statusCode = 404;
      throw error;
    }

    if (topic.studentId) {
      const error = new Error("Topic has already been registered");
      error.statusCode = 409;
      throw error;
    }

    topic.studentId = student._id;
    topic.teacherId = teacher._id;
    await topic.save();

    return this.getPopulateQuery(Topic.findById(topic._id)).lean();
  }

  async getStudentTopic(userId) {
    const student = await Student.findOne({ userId });
    if (!student) {
      const error = new Error("Student profile not found");
      error.statusCode = 404;
      throw error;
    }

    return this.getPopulateQuery(Topic.findOne({ studentId: student._id })).lean();
  }

  async getTeacherTopics(userId) {
    const teacher = await Teacher.findOne({ userId });
    if (!teacher) {
      const error = new Error("Teacher profile not found");
      error.statusCode = 404;
      throw error;
    }

    return this.getPopulateQuery(Topic.find({ teacherId: teacher._id })).lean();
  }

  async createTopic(topicDto) {
    const topic = new Topic({
      topicCode: topicDto.topicCode,
      topicName: topicDto.topicName,
      studentId: topicDto.studentId,
      teacherId: topicDto.teacherId,
    });

    return topic.save();
  }

  async updateTopic(id, topicDto) {
    return this.getPopulateQuery(Topic.findByIdAndUpdate(
      id,
      {
        topicCode: topicDto.topicCode,
        topicName: topicDto.topicName,
        studentId: topicDto.studentId,
        teacherId: topicDto.teacherId,
      },
      { new: true },
    )).lean();
  }

  async deleteTopic(id) {
    return this.getPopulateQuery(Topic.findByIdAndDelete(id)).lean();
  }
}

module.exports = TopicService;
