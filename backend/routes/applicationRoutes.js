const express = require("express");
const router = express.Router();

const {
  getApplications,
  createApplication,
  updateApplicationStatus,
  deleteMyApplication
} = require("../controllers/applicationController");

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.get("/", auth, getApplications);
router.post("/", auth, role("candidate"), createApplication);
router.patch("/:id/status", auth, role("employer"), updateApplicationStatus);
router.delete("/:id", auth, role("candidate"), deleteMyApplication);

module.exports = router;