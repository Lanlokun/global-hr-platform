const db = require("../config/db");

exports.getApplications = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        applications.*,
        users.name AS candidate_name,
        jobs.title AS job_title
      FROM applications
      LEFT JOIN users ON applications.user_id = users.id
      LEFT JOIN jobs ON applications.job_id = jobs.id
      ORDER BY applications.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("GET applications error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.createApplication = async (req, res) => {
  const { job_id, user_id, cover_letter } = req.body;

  try {
    const existing = await db.query(
      `SELECT id FROM applications WHERE job_id = $1 AND user_id = $2`,
      [job_id, user_id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: "You already applied to this job" });
    }

    const result = await db.query(
      `INSERT INTO applications (job_id, user_id, cover_letter)
       VALUES ($1,$2,$3)
       RETURNING *`,
      [job_id, user_id, cover_letter]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("CREATE application error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateApplicationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const result = await db.query(
      `UPDATE applications
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("UPDATE application status error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteMyApplication = async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await db.query(
      `SELECT * FROM applications WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    await db.query(`DELETE FROM applications WHERE id = $1`, [id]);

    res.json({ message: "Application withdrawn successfully" });
  } catch (err) {
    console.error("DELETE application error:", err);
    res.status(500).json({ error: err.message });
  }
};