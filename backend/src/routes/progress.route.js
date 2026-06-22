const express = require("express");
const ProgressController = require("../controllers/progress.controller");
const ProgressService = require("../services/progress.service");
const {
  authenticate,
  authorizeRoles,
} = require("../middlewares/auth.middleware");

const progressService = new ProgressService();
const progressController = new ProgressController(progressService);
const router = express.Router();

router.use(authenticate);

router.get("/me", async (req, res, next) => {
  try {
    await progressController.getMyProgress(req, res);
  } catch (error) {
    next(error);
  }
});

router.get("/teacher/students", authorizeRoles("teacher", "admin"), async (req, res, next) => {
  try {
    await progressController.getStudentProgressByTeacher(req, res);
  } catch (error) {
    next(error);
  }
});

router.get("/topic/:topicId", authorizeRoles("teacher", "admin"), async (req, res, next) => {
  try {
    await progressController.getProgressByTopicId(req, res);
  } catch (error) {
    next(error);
  }
});

router.get("/teacher/:teacherId", authorizeRoles("teacher", "admin"), async (req, res, next) => {
  try {
    await progressController.getProgressesByTeacher(req, res);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    await progressController.createProgress(req, res);
  } catch (error) {
    next(error);
  }
});

router.put("/stage/:progressId", async (req, res, next) => {
  try {
    await progressController.updateStudentStage(req, res);
  } catch (error) {
    next(error);
  }
});

// Teacher approval endpoints
router.put("/:progressId/approve", authorizeRoles("teacher"), async (req, res, next) => {
  try {
    await progressController.approveStage(req, res);
  } catch (error) {
    next(error);
  }
});

router.put("/:progressId/reject", authorizeRoles("teacher"), async (req, res, next) => {
  try {
    await progressController.rejectStage(req, res);
  } catch (error) {
    next(error);
  }
});

// Student resubmission endpoint
router.put("/:progressId/resubmit", async (req, res, next) => {
  try {
    await progressController.resubmitStage(req, res);
  } catch (error) {
    next(error);
  }
});

router.put("/:progressId", authorizeRoles("teacher", "admin"), async (req, res, next) => {
  try {
    await progressController.updateProgress(req, res);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
