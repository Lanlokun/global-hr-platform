const express = require("express");
const router = express.Router();

const {
  getPublicJobs,
  getMyJobs,
  createMyJob,
  updateMyJob,
  deleteMyJob,
} = require("../controllers/jobController");

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// Public route for candidates and landing/country pages
router.get("/", getPublicJobs);

// Employer-only routes
router.get("/my", auth, role("employer"), getMyJobs);
router.post("/", auth, role("employer"), createMyJob);
router.put("/:id", auth, role("employer"), updateMyJob);
router.delete("/:id", auth, role("employer"), deleteMyJob);

module.exports = router;