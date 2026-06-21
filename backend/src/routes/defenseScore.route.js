const express = require("express");
const DefenseScoreController = require("../controllers/defenseScore.controller");
const { authenticate, authorizeAdmin } = require("../middlewares/auth.middleware");

const defenseScoreController = new DefenseScoreController();
const router = express.Router();

router.use(authenticate);

router.get("/eligible-topics", authorizeAdmin, async (req, res, next) => {
  try {
    await defenseScoreController.getEligibleTopics(req, res);
  } catch (error) {
    next(error);
  }
});

router.get("/my-score", async (req, res, next) => {
  try {
    await defenseScoreController.getMyScore(req, res);
  } catch (error) {
    next(error);
  }
});

router.get("/topic/:topicId", authorizeAdmin, async (req, res, next) => {
  try {
    await defenseScoreController.getScoresByTopicId(req, res);
  } catch (error) {
    next(error);
  }
});

router.post("/", authorizeAdmin, async (req, res, next) => {
  try {
    await defenseScoreController.upsertScore(req, res);
  } catch (error) {
    next(error);
  }
});

router.put("/topic/:topicId", authorizeAdmin, async (req, res, next) => {
  try {
    await defenseScoreController.upsertScore(req, res);
  } catch (error) {
    next(error);
  }
});

router.patch("/topic/:topicId/lock", authorizeAdmin, async (req, res, next) => {
  try {
    await defenseScoreController.lockScore(req, res);
  } catch (error) {
    next(error);
  }
});

router.patch("/topic/:topicId/unlock", authorizeAdmin, async (req, res, next) => {
  try {
    await defenseScoreController.unlockScore(req, res);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
