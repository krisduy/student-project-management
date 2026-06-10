const express = require("express");
const TopicController = require("../controllers/topics.controller");
const TopicService = require("../services/topics.service");
const { authenticate, authorizeAdmin, authorizeRoles } = require("../middlewares/auth.middleware");

const topicService = new TopicService();
const topicController = new TopicController(topicService);
const router = express.Router();

router.get(
  "/available",
  authenticate,
  authorizeRoles("student", "admin"),
  async (req, res, next) => {
    try {
      await topicController.getAvailableTopics(req, res);
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/my-supervising",
  authenticate,
  authorizeRoles("teacher"),
  async (req, res, next) => {
    try {
      await topicController.getTeacherTopics(req, res);
    } catch (error) {
      next(error);
    }
  },
);

router.get(
  "/my-registration",
  authenticate,
  authorizeRoles("student"),
  async (req, res, next) => {
    try {
      await topicController.getStudentTopic(req, res);
    } catch (error) {
      next(error);
    }
  },
);

router.post(
  "/:id/register",
  authenticate,
  authorizeRoles("student"),
  async (req, res, next) => {
    try {
      await topicController.registerTopic(req, res);
    } catch (error) {
      next(error);
    }
  },
);

router.use(authenticate, authorizeAdmin);

router.get("/", async (req, res, next) => {
  try {
    await topicController.getTopics(req, res);
  } catch (error) {
    next(error);
  }
});

router.post("/", async (req, res, next) => {
  try {
    await topicController.createTopic(req, res);
  } catch (error) {
    next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    await topicController.updateTopic(req, res);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    await topicController.deleteTopic(req, res);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
