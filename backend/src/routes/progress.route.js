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

router.use(authenticate, authorizeRoles("teacher", "admin"));

router.get("/teacher/:teacherId", async (req, res, next) => {
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

router.put("/:progressId", async (req, res, next) => {
  try {
    await progressController.updateProgress(req, res);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
