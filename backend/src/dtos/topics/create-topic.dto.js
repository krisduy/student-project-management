class CreateTopicDto {
  constructor(topicCode, topicName, studentId, teacherId) {
    this.topicCode = topicCode;
    this.topicName = topicName;
    this.studentId = studentId || null;
    this.teacherId = teacherId || null;
  }
}

module.exports = CreateTopicDto;
