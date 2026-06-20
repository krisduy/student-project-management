class CreateProgressDto {
  constructor(topicId, milestone, teacherComment, studentId) {
    this.topicId = topicId;
    this.milestone = milestone;
    this.teacherComment = teacherComment;
    this.studentId = studentId;
    this.currentStage = milestone || "";
    this.completedStages = [];
  }
}

module.exports = CreateProgressDto;
