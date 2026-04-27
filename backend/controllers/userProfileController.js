const db = require("../config/db");

exports.getMyProfile = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT
        id,
        name,
        email,
        role,
        phone,
        country,
        city,
        address,
        date_of_birth,
        gender,
        profile_image,
        professional_title,
        years_of_experience,
        professional_summary,
        skills,
        languages,
        experience,
        education,
        certifications,
        desired_job_title,
        preferred_employment_type,
        preferred_work_mode,
        expected_salary,
        salary_currency,
        notice_period,
        availability,
        work_authorization,
        willing_to_relocate,
        linkedin_url,
        github_url,
        portfolio_url,
        resume_url,
        created_at,
        updated_at
      FROM users
      WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];

    res.json({
      ...user,
      experience: user.experience || [],
      education: user.education || [],
      certifications: user.certifications || [],
      willing_to_relocate: Boolean(user.willing_to_relocate),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateMyProfile = async (req, res) => {
  try {
    const allowedFields = {
      name: "name",
      email: "email",
      phone: "phone",
      country: "country",
      city: "city",
      address: "address",
      date_of_birth: "date_of_birth",
      gender: "gender",
      profile_image: "profile_image",
      professional_title: "professional_title",
      years_of_experience: "years_of_experience",
      professional_summary: "professional_summary",
      skills: "skills",
      languages: "languages",
      experience: "experience",
      education: "education",
      certifications: "certifications",
      desired_job_title: "desired_job_title",
      preferred_employment_type: "preferred_employment_type",
      preferred_work_mode: "preferred_work_mode",
      expected_salary: "expected_salary",
      salary_currency: "salary_currency",
      notice_period: "notice_period",
      availability: "availability",
      work_authorization: "work_authorization",
      willing_to_relocate: "willing_to_relocate",
      linkedin_url: "linkedin_url",
      github_url: "github_url",
      portfolio_url: "portfolio_url",
      resume_url: "resume_url",
    };

    const updates = [];
    const values = [];
    let index = 1;

    for (const [key, column] of Object.entries(allowedFields)) {
      if (req.body[key] !== undefined) {
        let value = req.body[key];

        if (["experience", "education", "certifications"].includes(key)) {
          value = JSON.stringify(Array.isArray(value) ? value : []);
          updates.push(`${column} = $${index}::jsonb`);
        } else if (key === "years_of_experience") {
          value = value === "" || value === null ? null : Number(value);
          updates.push(`${column} = $${index}`);
        } else if (key === "expected_salary") {
          value = value === "" || value === null ? null : Number(value);
          updates.push(`${column} = $${index}`);
        } else {
          updates.push(`${column} = $${index}`);
        }

        values.push(value);
        index++;
      }
    }

    updates.push(`updated_at = NOW()`);

    values.push(req.user.id);

    const query = `
      UPDATE users
      SET ${updates.join(", ")}
      WHERE id = $${index}
      RETURNING
        id,
        name,
        email,
        role,
        phone,
        country,
        city,
        address,
        date_of_birth,
        gender,
        profile_image,
        professional_title,
        years_of_experience,
        professional_summary,
        skills,
        languages,
        experience,
        education,
        certifications,
        desired_job_title,
        preferred_employment_type,
        preferred_work_mode,
        expected_salary,
        salary_currency,
        notice_period,
        availability,
        work_authorization,
        willing_to_relocate,
        linkedin_url,
        github_url,
        portfolio_url,
        resume_url,
        created_at,
        updated_at
    `;
    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];

    res.json({
      ...user,
      experience: user.experience || [],
      education: user.education || [],
      certifications: user.certifications || [],
      willing_to_relocate: Boolean(user.willing_to_relocate),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};