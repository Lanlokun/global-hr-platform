const express = require("express");
const router = express.Router();

const {
  getJobs,
  createJob,
  updateJob,
  deleteJob
} = require("../controllers/jobController");

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.get("/", getJobs);
router.post("/", auth, role("employer"), createJob);
router.put("/:id", auth, role("employer"), updateJob);
router.delete("/:id", auth, role("employer"), deleteJob);

module.exports = router;