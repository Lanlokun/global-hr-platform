const express = require("express");
const router = express.Router();

const {
  getAllCandidates,
  getCandidateById,
} = require("../controllers/candidateManagementController");

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.get("/", auth, role("employer"), getAllCandidates);
router.get("/:id", auth, role("employer"), getCandidateById);

module.exports = router;