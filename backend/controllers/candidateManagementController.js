const db = require("../config/db");

exports.getAllCandidates = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        u.id,
        u.name,
        u.email,
        u.country,
        u.professional_title,
        u.skills,
        COUNT(a.id) AS application_count
      FROM users u
      LEFT JOIN applications a ON u.id = a.user_id
      WHERE u.role = 'candidate'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("GET candidates error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.getCandidateById = async (req, res) => {
  const { id } = req.params;

  try {
    const candidateResult = await db.query(`
      SELECT
        id,
        name,
        email,
        country,
        professional_title,
        skills,
        role
      FROM users
      WHERE id = $1 AND role = 'candidate'
    `, [id]);

    if (candidateResult.rows.length === 0) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    const applicationsResult = await db.query(`
      SELECT
        a.id,
        a.status,
        a.cover_letter,
        a.created_at,
        j.id AS job_id,
        j.title AS job_title,
        c.name AS company_name
      FROM applications a
      LEFT JOIN jobs j ON a.job_id = j.id
      LEFT JOIN companies c ON j.company_id = c.id
      WHERE a.user_id = $1
      ORDER BY a.created_at DESC
    `, [id]);

    res.json({
      candidate: candidateResult.rows[0],
      applications: applicationsResult.rows,
    });
  } catch (err) {
    console.error("GET candidate detail error:", err);
    res.status(500).json({ error: err.message });
  }
};