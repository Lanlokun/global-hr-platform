const express = require("express");
const router = express.Router();

const recruiterController = require("../controllers/recruiterController");
const authMiddleware = require("../middleware/authMiddleware");

const requireRecruiter = (req, res, next) => {
  if (!req.user || req.user.role !== "recruiter") {
    return res.status(403).json({ error: "Recruiter access required" });
  }

  next();
};

router.use(authMiddleware);
router.use(requireRecruiter);

router.get("/overview", recruiterController.getRecruiterOverview);

router.get("/talent", recruiterController.getRecruiterTalent);
router.patch("/talent/:id", recruiterController.updateTalent);
router.delete("/talent/:id", recruiterController.deleteTalent);
router.post("/talent", recruiterController.createTalent);
router.post("/talent/bulk", recruiterController.bulkCreateTalent);

router.get("/jobs", recruiterController.getRecruiterJobs);
router.post("/jobs", recruiterController.createJob);
router.patch("/jobs/:id", recruiterController.updateJob);
router.delete("/jobs/:id", recruiterController.deleteJob);
router.get("/jobs/:id/matches", recruiterController.getJobTalentMatches);

router.get("/recommendations", recruiterController.getRecruiterRecommendations);
router.post("/recommendations", recruiterController.recommendCandidateForJob);

router.get("/settings", recruiterController.getRecruiterSettings);
router.patch("/settings", recruiterController.updateSettings);

router.post("/assign-talent", recruiterController.assignTalent);
router.post("/evaluate-talent", recruiterController.evaluateTalent);
router.post("/messages", recruiterController.sendMessage);

module.exports = router;