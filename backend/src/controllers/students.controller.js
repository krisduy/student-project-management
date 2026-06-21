const CreateStudentDto = require("../dtos/students/create-student.dto");
const UpdateStudentDto = require("../dtos/students/update-student.dto");

class StudentController {
  constructor(studentService) {
    this.studentService = studentService;
  }

  async getStudents(req, res) {
    try {
      const students = await this.studentService.getStudents();
      res.json(students);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createStudent(req, res) {
    try {
      const newStudent = await this.studentService.createStudent(
        new CreateStudentDto(
          req.body.userId,
          req.body.class,
          req.body.major,
        ),
      );

      res.status(201).json(newStudent);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateStudent(req, res) {
    try {
      const updatedStudent = await this.studentService.updateStudent(
        req.params.id,
        new UpdateStudentDto(
          req.body.userId,
          req.body.class,
          req.body.major,
        ),
      );

      if (!updatedStudent) {
        return res.status(404).json({ error: "Student not found" });
      }

      res.json(updatedStudent);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteStudent(req, res) {
    try {
      const deletedStudent = await this.studentService.deleteStudent(req.params.id);

      if (!deletedStudent) {
        return res.status(404).json({ error: "Student not found" });
      }

      res.json(deletedStudent);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getStudentOptions(req, res) {
    try {
      const options = await this.studentService.getStudentOptions();
      res.json(options);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = StudentController;
