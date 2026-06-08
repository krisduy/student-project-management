const CreateTeacherDto = require("../dtos/teachers/create-teacher.dto");
const UpdateTeacherDto = require("../dtos/teachers/update-teacher.dto");

class TeacherController {
  constructor(teacherService) {
    this.teacherService = teacherService;
  }

  async getTeachers(req, res) {
    try {
      const teachers = await this.teacherService.getTeachers();
      res.json(teachers);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createTeacher(req, res) {
    try {
      const newTeacher = await this.teacherService.createTeacher(
        new CreateTeacherDto(
          req.body.userId,
          req.body.degree,
        ),
      );

      res.status(201).json(newTeacher);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateTeacher(req, res) {
    try {
      const updatedTeacher = await this.teacherService.updateTeacher(
        req.params.id,
        new UpdateTeacherDto(
          req.body.userId,
          req.body.degree,
        ),
      );

      if (!updatedTeacher) {
        return res.status(404).json({ error: "Teacher not found" });
      }

      res.json(updatedTeacher);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteTeacher(req, res) {
    try {
      const deletedTeacher = await this.teacherService.deleteTeacher(req.params.id);

      if (!deletedTeacher) {
        return res.status(404).json({ error: "Teacher not found" });
      }

      res.json(deletedTeacher);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = TeacherController;
