const DefenseScore = require("../models/defenseScore.model");
const Progress = require("../models/progress.model");
const Topic = require("../models/topic.model");
const Student = require("../models/student.model");
const mongoose = require("mongoose");

class DefenseScoreService {
  async getEligibleTopics(query = {}, page = 1, limit = 20) {
    const { search, status } = query;
    const skip = (page - 1) * limit;

    // Only show topics where stage 5 is approved by teacher (eligibleForDefense = true)
    const matchStage = { eligibleForDefense: true };

    let searchQuery = {};
    if (search) {
      searchQuery = {
        $or: [
          { "student.studentCode": { $regex: search, $options: "i" } },
          { "student.userId.firstName": { $regex: search, $options: "i" } },
          { "student.userId.lastName": { $regex: search, $options: "i" } },
          { "topic.topicCode": { $regex: search, $options: "i" } },
          { "topic.topicName": { $regex: search, $options: "i" } },
        ],
      };
    }

    if (status === "scored") {
      searchQuery.hasScore = true;
    } else if (status === "pending") {
      searchQuery.hasScore = false;
    }

    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: "topics",
          localField: "topicId",
          foreignField: "_id",
          as: "topic",
        },
      },
      { $unwind: { path: "$topic", preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: "students",
          localField: "studentId",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: { path: "$student", preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: "users",
          localField: "student.userId",
          foreignField: "_id",
          as: "student.userId",
        },
      },
      { $unwind: { path: "$student.userId", preserveNullAndEmptyArrays: false } },
      {
        $lookup: {
          from: "defensescores",
          localField: "topicId",
          foreignField: "topicId",
          as: "defenseScore",
        },
      },
      {
        $addFields: {
          hasScore: { $gt: [{ $size: "$defenseScore" }, 0] },
        },
      },
      { $match: searchQuery },
      {
        $project: {
          defenseScore: 0,
        },
      },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          total: [{ $count: "count" }],
        },
      },
    ];

    console.log("matchStage:", matchStage);
    console.log("pipeline:", JSON.stringify(pipeline, null, 2));

    const results = await Progress.aggregate(pipeline);

    console.log("results:", JSON.stringify(results, null, 2));

    const data = results[0]?.data || [];
    const total = results[0]?.total[0]?.count || 0;

    const withScores = await Promise.all(
      data.map(async (item) => {
        const defenseScore = await DefenseScore.findOne({ topicId: item.topic._id }).lean();
        return { ...item, defenseScore };
      })
    );

    return {
      data: withScores,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getScoresByTopicId(topicId) {
    return DefenseScore.findOne({ topicId }).populate([
      { path: "studentId", populate: { path: "userId", select: "firstName lastName email" } },
      { path: "teacherId", populate: { path: "userId", select: "firstName lastName" } },
      { path: "topicId", select: "topicCode topicName" },
      { path: "enteredBy", select: "firstName lastName" },
    ]).lean();
  }

  async upsertScore(topicId, studentId, teacherId, payload, userId) {
    const existing = await DefenseScore.findOne({ topicId });
    if (existing?.isLocked) {
      const err = new Error("Điểm đã được khóa, không thể chỉnh sửa.");
      err.status = 403;
      throw err;
    }

    const progress = await Progress.findOne({ topicId });
    if (!progress?.eligibleForDefense) {
      const err = new Error("Đồ án chưa hoàn thành giai đoạn 5 hoặc chưa được xác nhận bởi giảng viên, không thể nhập điểm.");
      err.status = 400;
      throw err;
    }

    const updateData = {};
    if (payload.processScore != null) updateData.processScore = payload.processScore;
    if (payload.reportScore != null) updateData.reportScore = payload.reportScore;
    if (payload.rebuttalScore != null) updateData.rebuttalScore = payload.rebuttalScore;
    if (payload.teacherComment !== undefined) updateData.teacherComment = payload.teacherComment;
    if (payload.defenseDate != null) updateData.defenseDate = payload.defenseDate;

    if (updateData.processScore != null || updateData.reportScore != null || updateData.rebuttalScore != null) {
      const p = updateData.processScore ?? existing?.processScore ?? 0;
      const r = updateData.reportScore ?? existing?.reportScore ?? 0;
      const rb = updateData.rebuttalScore ?? existing?.rebuttalScore ?? 0;
      updateData.finalScore = parseFloat(((p + r + rb) / 3).toFixed(2));
    }

    if (existing) {
      Object.assign(existing, updateData);
      await existing.save();
      return existing.populate([
        { path: "studentId", populate: { path: "userId", select: "firstName lastName email" } },
        { path: "teacherId", populate: { path: "userId", select: "firstName lastName" } },
        { path: "topicId", select: "topicCode topicName" },
        { path: "enteredBy", select: "firstName lastName" },
      ]);
    }

    return DefenseScore.create({
      topicId,
      studentId,
      teacherId,
      ...updateData,
      enteredBy: userId,
    }).then((doc) =>
      doc.populate([
        { path: "studentId", populate: { path: "userId", select: "firstName lastName email" } },
        { path: "teacherId", populate: { path: "userId", select: "firstName lastName" } },
        { path: "topicId", select: "topicCode topicName" },
        { path: "enteredBy", select: "firstName lastName" },
      ])
    );
  }

  async lockScore(topicId) {
    const score = await DefenseScore.findOne({ topicId });
    if (!score) {
      const err = new Error("Không tìm thấy điểm.");
      err.status = 404;
      throw err;
    }
    score.isLocked = true;
    await score.save();
    return score;
  }

  async unlockScore(topicId) {
    const score = await DefenseScore.findOne({ topicId });
    if (!score) {
      const err = new Error("Không tìm thấy điểm.");
      err.status = 404;
      throw err;
    }
    score.isLocked = false;
    await score.save();
    return score;
  }

  async getMyScore(studentId) {
    const student = await Student.findOne({ userId: studentId });
    if (!student) return null;
    const score = await DefenseScore.findOne({ studentId: student._id }).populate([
      { path: "studentId", populate: { path: "userId", select: "firstName lastName email" } },
      { path: "teacherId", populate: { path: "userId", select: "firstName lastName" } },
      { path: "topicId", select: "topicCode topicName" },
      { path: "enteredBy", select: "firstName lastName" },
    ]).lean();

    if (!score) return null;

    const progress = await Progress.findOne({ studentId: student._id }).lean();
    const isEligible = progress?.eligibleForDefense === true;

    return { ...score, isEligible };
  }
}

module.exports = DefenseScoreService;
