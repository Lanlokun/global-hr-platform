const express = require("express");
const router = express.Router();

const { signup, login, verifyEmail, resendVerificationEmail, forgotPassword, resetPassword } = require("../controllers/authController");

router.post("/signup", signup);
router.post("/login", login);

router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;