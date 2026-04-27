const db = require("../config/db");

exports.getMyJobs = async (req, res) => {
  try {
    const result = await db.query(
      `
      SELECT 
        j.*,
        COUNT(a.id)::int AS application_count
      FROM jobs j
      LEFT JOIN applications a ON a.job_id = j.id
      WHERE j.company_id = $1
      GROUP BY j.id
      ORDER BY j.created_at DESC
      `,
      [req.user.company_id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createMyJob = async (req, res) => {
  const {
    title,
    description,
    location,
    employment_type,
    experience_level,
    required_skills,
    salary_range,
    salary_min,
    salary_max,
    currency,
    remote,
    expires_at,
    status,
    work_mode,
    department,
    benefits,
    application_instructions,
  } = req.body;

  try {
    const companyId = req.user.company_id;

    if (!companyId) {
      return res.status(400).json({ error: "Employer is not linked to a company" });
    }

    const result = await db.query(
      `
      INSERT INTO jobs (
        company_id,
        title,
        description,
        location,
        employment_type,
        experience_level,
        required_skills,
        salary_range,
        salary_min,
        salary_max,
        currency,
        remote,
        expires_at,
        status,
        work_mode,
        department,
        benefits,
        application_instructions
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14, $15, $16, $17, $18
      )
      RETURNING *
      `,
      [
        companyId,
        title,
        description,
        location,
        employment_type || "Full-time",
        experience_level || "Mid-level",
        required_skills,
        salary_range,
        salary_min || null,
        salary_max || null,
        currency || "USD",
        remote ?? true,
        expires_at || null,
        status || "active",
        work_mode || "Remote",
        department,
        benefits,
        application_instructions,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateMyJob = async (req, res) => {
  const { id } = req.params;

  const {
    title,
    description,
    location,
    employment_type,
    experience_level,
    required_skills,
    salary_range,
    salary_min,
    salary_max,
    currency,
    remote,
    expires_at,
    status,
    work_mode,
    department,
    benefits,
    application_instructions,
  } = req.body;

  try {
    const companyId = req.user.company_id;

    const result = await db.query(
      `
      UPDATE jobs
      SET title = $1,
          description = $2,
          location = $3,
          employment_type = $4,
          experience_level = $5,
          required_skills = $6,
          salary_range = $7,
          salary_min = $8,
          salary_max = $9,
          currency = $10,
          remote = $11,
          expires_at = $12,
          status = $13,
          work_mode = $14,
          department = $15,
          benefits = $16,
          application_instructions = $17,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $18
        AND company_id = $19
      RETURNING *
      `,
      [
        title,
        description,
        location,
        employment_type || "Full-time",
        experience_level || "Mid-level",
        required_skills,
        salary_range,
        salary_min || null,
        salary_max || null,
        currency || "USD",
        remote ?? true,
        expires_at || null,
        status || "active",
        work_mode || "Remote",
        department,
        benefits,
        application_instructions,
        id,
        companyId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Job not found or not owned by your company" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteMyJob = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `
      DELETE FROM jobs
      WHERE id = $1
        AND company_id = $2
      RETURNING id
      `,
      [id, req.user.company_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Job not found or not owned by your company" });
    }

    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};