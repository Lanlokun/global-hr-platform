const db = require("../config/db");

exports.getCompanies = async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM companies ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createCompany = async (req, res) => {
  const { name, industry, country } = req.body;

  try {
    const result = await db.query(
      "INSERT INTO companies (name, industry, country) VALUES ($1,$2,$3) RETURNING *",
      [name, industry, country]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateCompany = async (req, res) => {
  const { id } = req.params;
  const { name, industry, country } = req.body;

  try {
    const result = await db.query(
      `UPDATE companies
       SET name = $1, industry = $2, country = $3
       WHERE id = $4
       RETURNING *`,
      [name, industry, country, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Company not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCompany = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM companies WHERE id = $1", [id]);
    res.json({ message: "Company deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};