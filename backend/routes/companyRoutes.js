const express = require("express");
const router = express.Router();

const {
  getCompanies,
  createCompany,
  updateCompany,
  deleteCompany
} = require("../controllers/companyController");

const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.get("/", getCompanies);
router.post("/", auth, role("employer"), createCompany);
router.put("/:id", auth, role("employer"), updateCompany);
router.delete("/:id", auth, role("employer"), deleteCompany);

module.exports = router;