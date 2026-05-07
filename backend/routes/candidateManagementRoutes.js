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

router.get("/candidates/:id/evaluation", auth, role("admin"), getCandidateEvaluation);
router.post("/candidates/:id/evaluation", auth, role("admin"), saveCandidateEvaluation);

module.exports = router;