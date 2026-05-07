const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const crypto = require("crypto");
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
} = require("../services/emailService");


exports.signup = async (req, res) => {
  const { name, email, password, role, country } = req.body;

  try {
    if (!["candidate", "employer"].includes(role)) {
      return res.status(400).json({ error: "Invalid signup role" });
    }

    const existing = await db.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const result = await db.query(
      `
      INSERT INTO users (
        name,
        email,
        password,
        role,
        country,
        is_email_verified,
        email_verification_token,
        email_verification_expires
      )
      VALUES ($1, $2, $3, $4, $5, false, $6, NOW() + INTERVAL '24 hours')
      RETURNING id, name, email, role, country, company_id, professional_title, skills
      `,
      [name, email, hashedPassword, role, country, verificationToken]
    );

    const user = result.rows[0];

    try {
      await sendVerificationEmail({
        to: user.email,
        name: user.name,
        token: verificationToken,
      });
    } catch (emailError) {
      console.error("Verification email failed:", emailError);
    }

    res.json({
      message: "Account created. Please check your email to verify your account.",
      user,
    });
  } catch (err) {
    console.error("SIGNUP error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query(
      `SELECT id, name, email, password, role, country, company_id, professional_title, skills
       FROM users
       WHERE email = $1`,
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(400).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        company_id: user.company_id || null,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        country: user.country,
        company_id: user.company_id,
        professional_title: user.professional_title,
        skills: user.skills,
      },
    });
  } catch (err) {
    console.error("LOGIN error:", err);
    res.status(500).json({ error: err.message });
  }
};


const createToken = () => crypto.randomBytes(32).toString("hex");

exports.verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    if (!token) {
      return res.status(400).json({ error: "Verification token is required" });
    }

    const result = await db.query(
      `
      UPDATE users
      SET 
        is_email_verified = true,
        email_verification_token = NULL,
        email_verification_expires = NULL
      WHERE email_verification_token = $1
        AND email_verification_expires > NOW()
      RETURNING id, name, email, role
      `,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired verification link" });
    }

    res.json({
      message: "Email verified successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Verify email error:", error);
    res.status(500).json({ error: "Failed to verify email" });
  }
};

exports.resendVerificationEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const userResult = await db.query(
      "SELECT id, name, email, is_email_verified FROM users WHERE email = $1",
      [email]
    );

    const user = userResult.rows[0];

    if (!user) {
      return res.json({ message: "If this email exists, a verification email has been sent" });
    }

    if (user.is_email_verified) {
      return res.json({ message: "Email is already verified" });
    }

    const token = createToken();

    await db.query(
      `
      UPDATE users
      SET email_verification_token = $1,
          email_verification_expires = NOW() + INTERVAL '24 hours'
      WHERE id = $2
      `,
      [token, user.id]
    );

    await sendVerificationEmail({
      to: user.email,
      name: user.name,
      token,
    });

    res.json({ message: "Verification email resent successfully" });
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({ error: "Failed to resend verification email" });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const userResult = await db.query(
      "SELECT id, name, email FROM users WHERE email = $1",
      [email]
    );

    const user = userResult.rows[0];

    if (!user) {
      return res.json({
        message: "If this email exists, a reset link has been sent",
      });
    }

    const token = createToken();

    await db.query(
      `
      UPDATE users
      SET password_reset_token = $1,
          password_reset_expires = NOW() + INTERVAL '1 hour'
      WHERE id = $2
      `,
      [token, user.id]
    );

    await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      token,
    });

    res.json({
      message: "Password reset link sent",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Failed to send reset email" });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    if (!token || !password) {
      return res.status(400).json({ error: "Token and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const userResult = await db.query(
      `
      SELECT id
      FROM users
      WHERE password_reset_token = $1
        AND password_reset_expires > NOW()
      `,
      [token]
    );

    const user = userResult.rows[0];

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset link" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `
      UPDATE users
      SET password = $1,
          password_reset_token = NULL,
          password_reset_expires = NULL
      WHERE id = $2
      `,
      [hashedPassword, user.id]
    );

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
};