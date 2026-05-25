const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");

const {
  getCandidateEvaluation,
  saveCandidateEvaluation,
} = require("../controllers/candidateEvaluationController");

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  next();
};

router.get("/recruiter-stats", adminController.getRecruiterStats);
router.get("/recruiters", adminController.getRecruiters);
router.post(
  "/recruiters/:id/assign-candidates",
  adminController.assignCandidatesToRecruiter
);
router.get(
  "/recruiters/:id",
  adminController.getRecruiterDetails
);

router.patch("/recruiters/:id", adminController.updateRecruiter);

router.patch(
  "/recruiters/:id/status",
  adminController.updateRecruiterStatus
);

router.delete("/recruiters/:id", adminController.deleteRecruiter);



router.get("/stats", authMiddleware, requireAdmin, adminController.getStats);
router.get("/activity", authMiddleware, requireAdmin, adminController.getActivity);
router.get("/analytics", authMiddleware, requireAdmin, adminController.getAnalytics);

router.get("/users", authMiddleware, requireAdmin, adminController.getUsers);
router.post("/users", authMiddleware, requireAdmin, adminController.createUser);
router.patch("/users/:id", authMiddleware, requireAdmin, adminController.updateUser);
router.patch("/users/:id/role", authMiddleware, requireAdmin, adminController.updateUserRole);
router.patch("/users/:id/password", authMiddleware, requireAdmin, adminController.resetUserPassword);
router.delete("/users/:id", authMiddleware, requireAdmin, adminController.deleteUser);

router.get("/company-stats", authMiddleware, requireAdmin, adminController.getCompanyStats);
router.get("/companies", authMiddleware, requireAdmin, adminController.getCompanies);
router.patch("/companies/:id/status", authMiddleware, requireAdmin, adminController.updateCompanyStatus);

router.get("/job-stats", authMiddleware, requireAdmin, adminController.getJobStats);
router.get("/jobs", authMiddleware, requireAdmin, adminController.getJobs);
router.patch("/jobs/:id/status", authMiddleware, requireAdmin, adminController.updateJobStatus);

router.get("/application-stats", authMiddleware, requireAdmin, adminController.getApplicationStats);
router.get("/applications", authMiddleware, requireAdmin, adminController.getApplications);
router.patch("/applications/:id/status", authMiddleware, requireAdmin, adminController.updateApplicationStatus);

router.get("/candidate-stats", authMiddleware, requireAdmin, adminController.getCandidateStats);
router.get("/candidates", authMiddleware, requireAdmin, adminController.getCandidates);
router.patch("/candidates/:id", authMiddleware, requireAdmin, adminController.updateCandidate);
router.delete("/candidates/:id", authMiddleware, requireAdmin, adminController.deleteCandidate);

// Candidate evaluations
router.get(
  "/candidates/:id/evaluation",
  authMiddleware,
  requireAdmin,
  getCandidateEvaluation
);

router.post(
  "/candidates/:id/evaluation",
  authMiddleware,
  requireAdmin,
  saveCandidateEvaluation
);

module.exports = router;