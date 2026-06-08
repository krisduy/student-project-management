const express = require("express");
const StudentController = require("../controllers/students.controller");
const StudentService = require("../services/students.service");

const studentService = new StudentService();
const studentController = new StudentController(studentService);
const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    await studentController.getStudents(req, res);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    await studentController.createStudent(req, res);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    await studentController.updateStudent(req, res);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await studentController.deleteStudent(req, res);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
