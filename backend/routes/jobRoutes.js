const express = require("express");
const router = express.Router();

const {
  getMyJobs,
  createMyJob,
  updateMyJob,
  deleteMyJob
} = require("../controllers/jobController");

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.get("/", getMyJobs);
router.post("/", auth, role("employer"), createMyJob);
router.put("/:id", auth, role("employer"), updateMyJob);
router.delete("/:id", auth, role("employer"), deleteMyJob);

module.exports = router;