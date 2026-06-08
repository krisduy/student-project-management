const express = require("express");
const TeacherController = require("../controllers/teachers.controller");
const TeacherService = require("../services/teachers.service");

const teacherService = new TeacherService();
const teacherController = new TeacherController(teacherService);
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    await teacherController.getTeachers(req, res);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    await teacherController.createTeacher(req, res);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    await teacherController.updateTeacher(req, res);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await teacherController.deleteTeacher(req, res);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
