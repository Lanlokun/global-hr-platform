const db = require("../config/db");

exports.getMyCompany = async (req, res) => {
  try {
    const userResult = await db.query(
      `SELECT company_id FROM users WHERE id = $1`,
      [req.user.id]
    );

    const companyId = userResult.rows[0]?.company_id;

    if (!companyId) {
      return res.json({ company: null });
    }

    const companyResult = await db.query(
      `SELECT * FROM companies WHERE id = $1`,
      [companyId]
    );

    res.json({ company: companyResult.rows[0] || null });
  } catch (err) {
    console.error("GET MY COMPANY error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.createMyCompany = async (req, res) => {
  const {
    name,
    industry,
    country,
    city,
    address,
    description,
    website,
    logo,
    size,
    founded_year,
  } = req.body;

  try {
    const userResult = await db.query(
      `SELECT company_id FROM users WHERE id = $1`,
      [req.user.id]
    );

    if (userResult.rows[0]?.company_id) {
      return res.status(400).json({ error: "Employer already linked to a company" });
    }

    const companyResult = await db.query(
      `
      INSERT INTO companies (
        name,
        industry,
        country,
        city,
        address,
        description,
        website,
        logo,
        size,
        founded_year
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *
      `,
      [
        name,
        industry,
        country,
        city,
        address,
        description,
        website,
        logo,
        size,
        founded_year || null,
      ]
    );

    const company = companyResult.rows[0];

    await db.query(
      `UPDATE users SET company_id = $1 WHERE id = $2`,
      [company.id, req.user.id]
    );

    res.json(company);
  } catch (err) {
    console.error("CREATE MY COMPANY error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateMyCompany = async (req, res) => {
  const {
    name,
    industry,
    country,
    city,
    address,
    description,
    website,
    logo,
    size,
    founded_year,
  } = req.body;

  try {
    const userResult = await db.query(
      `SELECT company_id FROM users WHERE id = $1`,
      [req.user.id]
    );

    const companyId = userResult.rows[0]?.company_id;

    if (!companyId) {
      return res.status(404).json({ error: "No company linked to this employer" });
    }

    const result = await db.query(
      `
      UPDATE companies
      SET name = $1,
          industry = $2,
          country = $3,
          city = $4,
          address = $5,
          description = $6,
          website = $7,
          logo = $8,
          size = $9,
          founded_year = $10,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *
      `,
      [
        name,
        industry,
        country,
        city,
        address,
        description,
        website,
        logo,
        size,
        founded_year || null,
        companyId,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("UPDATE MY COMPANY error:", err);
    res.status(500).json({ error: err.message });
  }
};


exports.getEmployerApplicants = async (req, res) => {
  try {
    const userResult = await db.query(
      `SELECT company_id FROM users WHERE id = $1`,
      [req.user.id]
    );

    const companyId = userResult.rows[0]?.company_id;

    if (!companyId) {
      return res.status(400).json({ error: "Employer is not linked to a company" });
    }

    const result = await db.query(
      `
      SELECT 
        a.id,
        a.status,
        a.cover_letter,
        a.resume_url AS application_resume_url,
        a.created_at,

        j.id AS job_id,
        j.title AS job_title,

        u.id AS candidate_id,
        u.name AS candidate_name,
        u.email AS candidate_email,
        u.phone,
        u.country,
        u.city,
        u.address,
        u.profile_image,
        u.professional_title,
        u.years_of_experience,
        u.professional_summary,
        u.skills,
        u.languages,
        u.experience,
        u.education,
        u.certifications
      FROM applications a
      JOIN jobs j ON j.id = a.job_id
      JOIN users u ON u.id = a.user_id
      WHERE j.company_id = $1
      ORDER BY a.created_at DESC
      `,
      [companyId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("GET EMPLOYER APPLICANTS ERROR:", error);
    res.status(500).json({ error: "Failed to load applicants" });
  }
};

exports.getTalentDirectory = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT
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
       ORDER BY u.created_at DESC`
    );

    res.json(result.rows);
  } catch (err) {
    console.error("GET TALENT DIRECTORY error:", err);
    res.status(500).json({ error: err.message });
  }
};