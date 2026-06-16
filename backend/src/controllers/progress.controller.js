class ProgressController {
  constructor(progressService) {
    this.progressService = progressService;
  }

  async getProgressesByTeacher(req, res) {
    try {
      const { teacherId } = req.params;
      const progresses =
        await this.progressService.getProgressesByTeacher(teacherId);

      if (!progresses || progresses.length === 0) {
        return res
          .status(404)
          .json({ error: "No progresses found for this teacher" });
      }

      res.json(progresses);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = ProgressController;
