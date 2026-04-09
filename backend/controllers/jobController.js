const db = require("../config/db");

exports.getJobs = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT jobs.*, companies.name AS company_name
      FROM jobs
      JOIN companies ON jobs.company_id = companies.id
      ORDER BY jobs.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createJob = async (req, res) => {
  const {
    company_id,
    title,
    description,
    location,
    salary_range,
    remote
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO jobs 
      (company_id, title, description, location, salary_range, remote)
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *`,
      [company_id, title, description, location, salary_range, remote]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateJob = async (req, res) => {
  const { id } = req.params;
  const {
    company_id,
    title,
    description,
    location,
    salary_range,
    remote
  } = req.body;

  try {
    const result = await db.query(
      `UPDATE jobs
       SET company_id = $1,
           title = $2,
           description = $3,
           location = $4,
           salary_range = $5,
           remote = $6
       WHERE id = $7
       RETURNING *`,
      [company_id, title, description, location, salary_range, remote, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteJob = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query("DELETE FROM jobs WHERE id = $1", [id]);
    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};