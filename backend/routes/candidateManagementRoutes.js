const express = require("express");
const router = express.Router();

const {
  getAllCandidates,
  getCandidateById,
} = require("../controllers/candidateManagementController");

const {
  getCandidateEvaluation,
  saveCandidateEvaluation,
} = require("../controllers/candidateEvaluationController");

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.get("/", auth, role("employer"), getAllCandidates);
router.get("/:id", auth, role("employer"), getCandidateById);

router.get("/:id/evaluation", auth, role("employer"), getCandidateEvaluation);
router.post("/:id/evaluation", auth, role("employer"), saveCandidateEvaluation);

module.exports = router;