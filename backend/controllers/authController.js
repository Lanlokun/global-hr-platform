const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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

    const result = await db.query(
      `INSERT INTO users (name, email, password, role, country)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role, country, company_id, professional_title, skills`,
      [name, email, hashedPassword, role, country]
    );

    res.json(result.rows[0]);
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