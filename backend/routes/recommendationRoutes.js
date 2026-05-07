const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { getRecommendedCandidatesForJob } = require("../controllers/recommendationController");

router.get(
  "/jobs/:jobId/candidates",
  authMiddleware,
  getRecommendedCandidatesForJob
);

module.exports = router;