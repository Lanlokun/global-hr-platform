const db = require("../config/db");

exports.getCountryMarketData = async (req, res) => {
  const { country } = req.query;

  try {
    if (!country) {
      return res.status(400).json({ error: "Country is required" });
    }

    const companiesResult = await db.query(
      `
      SELECT 
        c.id,
        c.name,
        c.industry,
        c.country,
        c.city,
        c.description,
        c.website,
        c.logo,
        c.size,
        c.founded_year,
        COUNT(j.id)::int AS job_count
      FROM companies c
      LEFT JOIN jobs j ON j.company_id = c.id
      WHERE LOWER(c.country) = LOWER($1)
      GROUP BY c.id
      ORDER BY job_count DESC, c.created_at DESC
      `,
      [country]
    );

    const jobsResult = await db.query(
      `
      SELECT 
        j.id,
        j.title,
        j.description,
        j.location,
        j.employment_type,
        j.experience_level,
        j.required_skills,
        j.salary_range,
        j.currency,
        j.remote,
        j.work_mode,
        j.status,
        j.department,
        j.benefits,
        j.expires_at,
        c.name AS company_name,
        c.logo AS company_logo,
        c.industry AS company_industry
      FROM jobs j
      JOIN companies c ON c.id = j.company_id
      WHERE LOWER(c.country) = LOWER($1)
        AND COALESCE(j.status, 'active') = 'active'
      ORDER BY j.created_at DESC
      `,
      [country]
    );

    const candidatesResult = await db.query(
      `
      SELECT 
        id,
        name,
        email,
        country,
        city,
        professional_title,
        years_of_experience,
        professional_summary,
        skills,
        languages,
        profile_image,
        preferred_work_mode,
        preferred_employment_type,
        expected_salary,
        salary_currency,
        availability,
        willing_to_relocate
      FROM users
      WHERE role = 'candidate'
        AND LOWER(country) = LOWER($1)
      ORDER BY created_at DESC
      `,
      [country]
    );

    res.json({
      companies: companiesResult.rows,
      jobs: jobsResult.rows,
      candidates: candidatesResult.rows,
    });
  } catch (err) {
    console.error("GET COUNTRY MARKET DATA ERROR:", err);
    res.status(500).json({ error: "Failed to load country data" });
  }
};