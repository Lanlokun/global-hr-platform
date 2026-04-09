const db = require("../config/db");

exports.getUsers = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createUser = async (req, res) => {
  const { name, email, role, country } = req.body;

  try {
    const result = await db.query(
      "INSERT INTO users (name, email, role, country) VALUES ($1,$2,$3,$4) RETURNING *",
      [name, email, role, country]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};