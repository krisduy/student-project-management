class CreateProgressDto {
  constructor(topicId, milestone, teacherComment) {
    this.topicId = topicId;
    this.milestone = milestone;
    this.teacherComment = teacherComment;
  }
}

module.exports = CreateProgressDto;
