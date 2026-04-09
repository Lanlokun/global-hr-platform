const db = require("../config/db");

exports.getMyProfile = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, name, email, role, country, professional_title, skills
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateMyProfile = async (req, res) => {
  const { name, email, country, professional_title, skills } = req.body;

  try {
    const result = await db.query(
      `UPDATE users
       SET name = $1,
           email = $2,
           country = $3,
           professional_title = $4,
           skills = $5
       WHERE id = $6
       RETURNING id, name, email, role, country, professional_title, skills`,
      [name, email, country, professional_title, skills, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};