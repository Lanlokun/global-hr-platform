const express = require("express");
const router = express.Router();

const {
  getMyCompany,
  createMyCompany,
  updateMyCompany,
  getEmployerApplicants,
  getTalentDirectory,
} = require("../controllers/employerController");

const {
  getMyJobs,
  createMyJob,
  updateMyJob,
  deleteMyJob,
} = require("../controllers/jobController");


const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.get("/company", auth, role("employer"), getMyCompany);
router.post("/company", auth, role("employer"), createMyCompany);
router.put("/company", auth, role("employer"), updateMyCompany);

router.get("/jobs", auth, role("employer"), getMyJobs);
router.post("/jobs", auth, role("employer"), createMyJob);
router.put("/jobs/:id", auth, role("employer"), updateMyJob);
router.delete("/jobs/:id", auth, role("employer"), deleteMyJob);

router.get("/applicants", auth, role("employer"), getEmployerApplicants);
router.get("/talent", auth, role("employer"), getTalentDirectory);

module.exports = router;