const pool = require("../config/db");

/*
|--------------------------------------------------------------------------
| Recruiter Overview
|--------------------------------------------------------------------------
*/

const getRecruiterByUserId = async (userId) => {
  const result = await pool.query(
    `
    SELECT id
    FROM recruiters
    WHERE user_id = $1
    `,
    [userId]
  );

  return result.rows[0];
};

const getRecruiterOverview = async (req, res) => {
  try {
    const assignedTalentResult = await pool.query(`
      SELECT COUNT(*) 
      FROM users
      WHERE role = 'candidate'
    `);

    const evaluatedTalentResult = await pool.query(`
      SELECT COUNT(*)
      FROM candidate_evaluations
    `);

    const openJobsResult = await pool.query(`
      SELECT COUNT(*)
      FROM jobs
      WHERE status = 'active'
    `);

    const recommendationsResult = await pool.query(`
      SELECT COUNT(*)
      FROM applications
    `);

    res.json({
      assignedTalent: Number(assignedTalentResult.rows[0].count),
      evaluatedTalent: Number(evaluatedTalentResult.rows[0].count),
      openJobs: Number(openJobsResult.rows[0].count),
      recommendations: Number(recommendationsResult.rows[0].count),
    });
  } catch (err) {
    console.error("Failed to load recruiter overview:", err);
    res.status(500).json({
      error: "Failed to load recruiter overview",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Recruiter Talent
|--------------------------------------------------------------------------
*/

const getRecruiterTalent = async (req, res) => {
  try {
    const recruiter = await getRecruiterByUserId(req.user.id);

    if (!recruiter) {
      return res.status(404).json({ error: "Recruiter profile not found" });
    }

    const result = await pool.query(
      `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.country,
        u.city,
        u.phone,
        u.professional_title,
        u.desired_job_title,
        u.professional_summary,
        u.years_of_experience,
        u.skills,
        u.languages,
        u.education,
        u.experience,
        u.certifications,
        u.profile_image,
        u.availability,
        u.preferred_work_mode,
        u.preferred_employment_type,
        u.expected_salary,
        u.salary_currency,
        u.work_authorization,
        u.willing_to_relocate,
        u.created_at,
        rta.status AS assignment_status,
        rta.source AS assignment_source,
        rta.notes AS recruiter_notes
      FROM recruiter_talent_assignments rta
      JOIN users u ON u.id = rta.candidate_id
      WHERE rta.recruiter_id = $1
      ORDER BY rta.created_at DESC
      `,
      [recruiter.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Failed to load recruiter talent:", err);
    res.status(500).json({ error: "Failed to load recruiter talent" });
  }
};

const createTalent = async (req, res) => {
  const client = await pool.connect();

  try {
    const recruiter = await getRecruiterByUserId(req.user.id);

    if (!recruiter) {
      return res.status(404).json({ error: "Recruiter profile not found" });
    }

    const {
      name,
      email,
      phone,
      country,
      city,
      professional_title,
      desired_job_title,
      professional_summary,
      years_of_experience,
      skills,
      languages,
      availability,
      preferred_work_mode,
      preferred_employment_type,
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    await client.query("BEGIN");

    const userResult = await client.query(
      `
      INSERT INTO users (
        name,
        email,
        phone,
        country,
        city,
        role,
        professional_title,
        desired_job_title,
        professional_summary,
        years_of_experience,
        skills,
        languages,
        availability,
        preferred_work_mode,
        preferred_employment_type,
        profile_image,
        is_email_verified
      )
      VALUES (
        $1,$2,$3,$4,$5,'candidate',$6,$7,$8,$9,$10,$11,$12,$13,$14,
        '/images/avatar.jpg',
        true
      )
      RETURNING *
      `,
      [
        name,
        email,
        phone || null,
        country || null,
        city || null,
        professional_title || null,
        desired_job_title || null,
        professional_summary || null,
        Number(years_of_experience || 0),
        skills || null,
        languages || null,
        availability || null,
        preferred_work_mode || null,
        preferred_employment_type || null,
      ]
    );

    const candidate = userResult.rows[0];

    await client.query(
      `
      INSERT INTO recruiter_talent_assignments (
        recruiter_id,
        candidate_id,
        source,
        status
      )
      VALUES ($1, $2, 'manual', 'assigned')
      ON CONFLICT (recruiter_id, candidate_id)
      DO NOTHING
      `,
      [recruiter.id, candidate.id]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Talent created and assigned successfully",
      talent: candidate,
    });
  } catch (err) {
    await client.query("ROLLBACK");

    console.error("Failed to create talent:", err);

    if (err.code === "23505") {
      return res.status(409).json({ error: "Candidate email already exists" });
    }

    res.status(500).json({ error: "Failed to create talent" });
  } finally {
    client.release();
  }
};

const bulkCreateTalent = async (req, res) => {
  const client = await pool.connect();

  try {
    const recruiter = await getRecruiterByUserId(req.user.id);

    if (!recruiter) {
      return res.status(404).json({ error: "Recruiter profile not found" });
    }

    const { talents = [] } = req.body;

    if (!Array.isArray(talents) || talents.length === 0) {
      return res.status(400).json({ error: "Talent list is required" });
    }

    await client.query("BEGIN");

    const created = [];
    const skipped = [];

    for (const item of talents) {
      if (!item.name || !item.email) {
        skipped.push({ ...item, reason: "Missing name or email" });
        continue;
      }

      const existing = await client.query(
        `SELECT id FROM users WHERE email = $1`,
        [item.email]
      );

      let candidateId;

      if (existing.rows.length > 0) {
        candidateId = existing.rows[0].id;
        skipped.push({ ...item, reason: "Email already existed, assigned only" });
      } else {
        const result = await client.query(
          `
          INSERT INTO users (
            name,
            email,
            phone,
            country,
            city,
            role,
            professional_title,
            desired_job_title,
            years_of_experience,
            skills,
            profile_image,
            is_email_verified
          )
          VALUES ($1,$2,$3,$4,$5,'candidate',$6,$7,$8,$9,'/images/avatar.jpg',true)
          RETURNING id, name, email
          `,
          [
            item.name,
            item.email,
            item.phone || null,
            item.country || null,
            item.city || null,
            item.professional_title || null,
            item.desired_job_title || null,
            Number(item.years_of_experience || 0),
            item.skills || null,
          ]
        );

        candidateId = result.rows[0].id;
        created.push(result.rows[0]);
      }

      await client.query(
        `
        INSERT INTO recruiter_talent_assignments (
          recruiter_id,
          candidate_id,
          source,
          status
        )
        VALUES ($1, $2, 'bulk', 'assigned')
        ON CONFLICT (recruiter_id, candidate_id)
        DO NOTHING
        `,
        [recruiter.id, candidateId]
      );
    }

    await client.query("COMMIT");

    res.json({
      message: "Bulk talent import completed",
      created,
      skipped,
      createdCount: created.length,
      skippedCount: skipped.length,
    });
  } catch (err) {
    await client.query("ROLLBACK");

    console.error("Failed to bulk create talent:", err);
    res.status(500).json({ error: "Failed to bulk create talent" });
  } finally {
    client.release();
  }
};
/*
|--------------------------------------------------------------------------
| Recruiter Jobs
|--------------------------------------------------------------------------
*/

const getRecruiterJobs = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        jobs.*,
        companies.name AS company_name,
        companies.logo AS company_logo,
        employer.id AS employer_id,
        COUNT(applications.id) AS application_count
      FROM jobs
      LEFT JOIN companies 
        ON companies.id = jobs.company_id
      LEFT JOIN users employer
        ON employer.company_id = companies.id
        AND employer.role = 'employer'
      LEFT JOIN applications
        ON applications.job_id = jobs.id
      GROUP BY jobs.id, companies.name, companies.logo, employer.id
      ORDER BY jobs.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Failed to load recruiter jobs:", err);
    res.status(500).json({
      error: "Failed to load recruiter jobs",
    });
  }
};


const getJobTalentMatches = async (req, res) => {
  try {
    const { id } = req.params;

    const jobResult = await pool.query(
      `
      SELECT *
      FROM jobs
      WHERE id = $1
      `,
      [id]
    );

    if (jobResult.rows.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }

    const job = jobResult.rows[0];

    const candidatesResult = await pool.query(`
      SELECT
        id,
        name,
        email,
        country,
        city,
        phone,
        profile_image,
        professional_title,
        desired_job_title,
        professional_summary,
        skills,
        languages,
        years_of_experience,
        preferred_work_mode,
        preferred_employment_type,
        expected_salary,
        salary_currency,
        availability,
        work_authorization,
        willing_to_relocate
      FROM users
      WHERE role = 'candidate'
      ORDER BY created_at DESC
    `);

    const jobSkills = parseSkills(job.required_skills || job.skills);
    const jobTitle = `${job.title || ""}`.toLowerCase();
    const jobLocation = `${job.location || ""}`.toLowerCase();
    const jobWorkMode = `${job.work_mode || ""}`.toLowerCase();

    const matches = candidatesResult.rows.map((candidate) => {
      const candidateSkills = parseSkills(candidate.skills);

      const skillOverlap = candidateSkills.filter((skill) =>
        jobSkills.includes(skill)
      );

      let matchScore = 0;

      if (jobSkills.length > 0) {
        matchScore += Math.round((skillOverlap.length / jobSkills.length) * 45);
      }

      const candidateTitle = `${candidate.professional_title || ""} ${
        candidate.desired_job_title || ""
      }`.toLowerCase();

      if (
        candidateTitle &&
        jobTitle &&
        jobTitle
          .split(" ")
          .some((word) => word.length > 2 && candidateTitle.includes(word))
      ) {
        matchScore += 20;
      }

      const candidateLocation = `${candidate.city || ""} ${
        candidate.country || ""
      }`.toLowerCase();

      if (
        jobLocation &&
        candidateLocation &&
        jobLocation
          .split(" ")
          .some((word) => word.length > 2 && candidateLocation.includes(word))
      ) {
        matchScore += 15;
      }

      if (
        jobWorkMode &&
        candidate.preferred_work_mode &&
        jobWorkMode === String(candidate.preferred_work_mode).toLowerCase()
      ) {
        matchScore += 10;
      }

      if (candidate.years_of_experience) {
        matchScore += 10;
      }

      return {
        ...candidate,
        match_score: Math.min(matchScore, 100),
        matched_skills: skillOverlap,
      };
    });

    matches.sort((a, b) => b.match_score - a.match_score);

    res.json({
      job,
      matches,
    });
  } catch (err) {
    console.error("Failed to match talent:", err);
    res.status(500).json({
      error: "Failed to match talent",
    });
  }
};

const recommendCandidateForJob = async (req, res) => {
  try {
    const { candidate_id, job_id, notes, match_score } = req.body;

    if (!candidate_id || !job_id) {
      return res.status(400).json({
        error: "candidate_id and job_id are required",
      });
    }

    const recruiter = await getRecruiterByUserId(req.user.id);

    if (!recruiter) {
      return res.status(404).json({
        error: "Recruiter profile not found",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO recruiter_recommendations (
        recruiter_id,
        candidate_id,
        job_id,
        notes,
        match_score
      )
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (candidate_id, job_id, recruiter_id)
      DO UPDATE SET
        notes = EXCLUDED.notes,
        match_score = EXCLUDED.match_score,
        status = 'recommended',
        created_at = CURRENT_TIMESTAMP
      RETURNING *
      `,
      [
        recruiter.id,
        candidate_id,
        job_id,
        notes || null,
        Number(match_score || 0),
      ]
    );

    res.json({
      success: true,
      recommendation: result.rows[0],
      message: "Candidate recommended successfully",
    });
  } catch (err) {
    console.error("Failed to recommend candidate:", err);
    res.status(500).json({
      error: "Failed to recommend candidate",
    });
  }
};

const parseSkills = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map((skill) => String(skill).trim().toLowerCase());
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) {
        return parsed.map((skill) => String(skill).trim().toLowerCase());
      }
    } catch {
      return value
        .split(",")
        .map((skill) => skill.trim().toLowerCase())
        .filter(Boolean);
    }
  }

  return [];
};

/*
|--------------------------------------------------------------------------
| Recruiter Recommendations
|--------------------------------------------------------------------------
*/

const getRecruiterRecommendations = async (req, res) => {
  try {
    const recruiter = await getRecruiterByUserId(req.user.id);

    if (!recruiter) {
      return res.status(404).json({
        error: "Recruiter profile not found",
      });
    }

    const result = await pool.query(
      `
      SELECT
        rr.id,
        rr.recruiter_id,
        rr.candidate_id,
        rr.job_id,
        rr.status,
        rr.notes,
        rr.match_score,
        rr.employer_viewed,
        rr.recruiter_response_time_hours,
        rr.created_at,

        candidate.name AS candidate_name,
        candidate.email AS candidate_email,
        candidate.profile_image AS candidate_image,
        candidate.professional_title,
        candidate.desired_job_title,
        candidate.country,
        candidate.city,
        candidate.skills,
        candidate.years_of_experience,

        jobs.title AS job_title,
        jobs.location AS job_location,
        jobs.work_mode,
        jobs.employment_type,
        jobs.status AS job_status,

        companies.name AS company_name,
        companies.logo AS company_logo,

        employer.id AS employer_id,
        employer.name AS employer_name,
        employer.email AS employer_email

      FROM recruiter_recommendations rr
      LEFT JOIN users candidate
        ON candidate.id = rr.candidate_id
      LEFT JOIN jobs
        ON jobs.id = rr.job_id
      LEFT JOIN companies
        ON companies.id = jobs.company_id
      LEFT JOIN users employer
        ON employer.company_id = companies.id
        AND employer.role = 'employer'
      WHERE rr.recruiter_id = $1
      ORDER BY rr.created_at DESC
      `,
      [recruiter.id]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Failed to load recruiter recommendations:", err);
    res.status(500).json({
      error: "Failed to load recruiter recommendations",
    });
  }
};
/*
|--------------------------------------------------------------------------
| Recruiter Settings
|--------------------------------------------------------------------------
*/

const getRecruiterSettings = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        u.id AS user_id,
        u.name,
        u.email,
        u.phone,
        u.country,
        u.city,
        u.profile_image,

        r.id AS recruiter_id,
        r.professional_title,
        r.recruiter_bio,
        r.preferred_industries,
        r.preferred_countries,
        r.preferred_job_types,
        r.preferred_work_mode,
        r.seniority_focus,
        r.specialization_skills,
        r.default_candidate_message,
        r.default_employer_message,
        r.auto_signature,
        r.availability_status,
        r.notify_candidate_assigned,
        r.notify_employer_replies,
        r.notify_recommendation_reviewed,
        r.notify_candidate_messages,
        r.notify_job_match_alerts,
        r.notify_weekly_summary,
        r.default_recommendation_note,
        r.auto_include_ai_notes,
        r.auto_notify_employer,
        r.follow_up_days
      FROM users u
      LEFT JOIN recruiters r
        ON r.user_id = u.id
      WHERE u.id = $1
        AND u.role = 'recruiter'
      `,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Recruiter not found",
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Failed to load recruiter settings:", err);
    res.status(500).json({
      error: "Failed to load recruiter settings",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Assign Talent
|--------------------------------------------------------------------------
*/

const assignTalent = async (req, res) => {
  try {
    const { candidate_id, recruiter_notes } = req.body;

    await pool.query(
      `
      INSERT INTO candidate_evaluations (
        candidate_id,
        evaluator_id,
        notes
      )
      VALUES ($1, $2, $3)
      `,
      [candidate_id, req.user.id, recruiter_notes]
    );

    res.json({
      success: true,
      message: "Talent assigned successfully",
    });
  } catch (err) {
    console.error("Failed to assign talent:", err);

    res.status(500).json({
      error: "Failed to assign talent",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Evaluate Talent
|--------------------------------------------------------------------------
*/

const evaluateTalent = async (req, res) => {
  try {
    const {
      candidate_id,
      score,
      notes,
      recommendation,
    } = req.body;

    await pool.query(
      `
      INSERT INTO candidate_evaluations (
        candidate_id,
        evaluator_id,
        score,
        notes,
        recommendation
      )
      VALUES ($1, $2, $3, $4, $5)
      `,
      [
        candidate_id,
        req.user.id,
        score,
        notes,
        recommendation,
      ]
    );

    res.json({
      success: true,
      message: "Talent evaluated successfully",
    });
  } catch (err) {
    console.error("Failed to evaluate talent:", err);

    res.status(500).json({
      error: "Failed to evaluate talent",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Send Message
|--------------------------------------------------------------------------
*/

const sendMessage = async (req, res) => {
  try {
    const {
      receiver_id,
      message,
    } = req.body;

    await pool.query(
      `
      INSERT INTO messages (
        sender_id,
        receiver_id,
        message
      )
      VALUES ($1, $2, $3)
      `,
      [
        req.user.id,
        receiver_id,
        message,
      ]
    );

    res.json({
      success: true,
      message: "Message sent successfully",
    });
  } catch (err) {
    console.error("Failed to send message:", err);

    res.status(500).json({
      error: "Failed to send message",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Create Job
|--------------------------------------------------------------------------
*/

const createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      location,
      salary_range,
      employment_type,
      work_mode,
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO jobs (
        title,
        description,
        location,
        salary_range,
        employment_type,
        work_mode,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'active')
      RETURNING *
      `,
      [
        title,
        description,
        location,
        salary_range,
        employment_type,
        work_mode,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Failed to create job:", err);

    res.status(500).json({
      error: "Failed to create job",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Update Job
|--------------------------------------------------------------------------
*/

const updateJob = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      location,
      salary_range,
      employment_type,
      work_mode,
      status,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE jobs
      SET
        title = $1,
        description = $2,
        location = $3,
        salary_range = $4,
        employment_type = $5,
        work_mode = $6,
        status = $7
      WHERE id = $8
      RETURNING *
      `,
      [
        title,
        description,
        location,
        salary_range,
        employment_type,
        work_mode,
        status,
        id,
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Failed to update job:", err);

    res.status(500).json({
      error: "Failed to update job",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Delete Job
|--------------------------------------------------------------------------
*/

const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `
      DELETE FROM jobs
      WHERE id = $1
      `,
      [id]
    );

    res.json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (err) {
    console.error("Failed to delete job:", err);

    res.status(500).json({
      error: "Failed to delete job",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Update Settings
|--------------------------------------------------------------------------
*/

const updateSettings = async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const {
      name,
      phone,
      country,
      city,
      profile_image,

      professional_title,
      recruiter_bio,
      preferred_industries,
      preferred_countries,
      preferred_job_types,
      preferred_work_mode,
      seniority_focus,
      specialization_skills,
      default_candidate_message,
      default_employer_message,
      auto_signature,
      availability_status,
      notify_candidate_assigned,
      notify_employer_replies,
      notify_recommendation_reviewed,
      notify_candidate_messages,
      notify_job_match_alerts,
      notify_weekly_summary,
      default_recommendation_note,
      auto_include_ai_notes,
      auto_notify_employer,
      follow_up_days,
    } = req.body;

    await client.query(
      `
      UPDATE users
      SET
        name = $1,
        phone = $2,
        country = $3,
        city = $4,
        profile_image = $5
      WHERE id = $6
        AND role = 'recruiter'
      `,
      [name, phone, country, city, profile_image, req.user.id]
    );

    const recruiterResult = await client.query(
      `
      INSERT INTO recruiters (
        user_id,
        professional_title,
        recruiter_bio,
        preferred_industries,
        preferred_countries,
        preferred_job_types,
        preferred_work_mode,
        seniority_focus,
        specialization_skills,
        default_candidate_message,
        default_employer_message,
        auto_signature,
        availability_status,
        notify_candidate_assigned,
        notify_employer_replies,
        notify_recommendation_reviewed,
        notify_candidate_messages,
        notify_job_match_alerts,
        notify_weekly_summary,
        default_recommendation_note,
        auto_include_ai_notes,
        auto_notify_employer,
        follow_up_days,
        updated_at
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14, $15, $16, $17,
        $18, $19, $20, $21, $22, $23, CURRENT_TIMESTAMP
      )
      ON CONFLICT (user_id)
      DO UPDATE SET
        professional_title = EXCLUDED.professional_title,
        recruiter_bio = EXCLUDED.recruiter_bio,
        preferred_industries = EXCLUDED.preferred_industries,
        preferred_countries = EXCLUDED.preferred_countries,
        preferred_job_types = EXCLUDED.preferred_job_types,
        preferred_work_mode = EXCLUDED.preferred_work_mode,
        seniority_focus = EXCLUDED.seniority_focus,
        specialization_skills = EXCLUDED.specialization_skills,
        default_candidate_message = EXCLUDED.default_candidate_message,
        default_employer_message = EXCLUDED.default_employer_message,
        auto_signature = EXCLUDED.auto_signature,
        availability_status = EXCLUDED.availability_status,
        notify_candidate_assigned = EXCLUDED.notify_candidate_assigned,
        notify_employer_replies = EXCLUDED.notify_employer_replies,
        notify_recommendation_reviewed = EXCLUDED.notify_recommendation_reviewed,
        notify_candidate_messages = EXCLUDED.notify_candidate_messages,
        notify_job_match_alerts = EXCLUDED.notify_job_match_alerts,
        notify_weekly_summary = EXCLUDED.notify_weekly_summary,
        default_recommendation_note = EXCLUDED.default_recommendation_note,
        auto_include_ai_notes = EXCLUDED.auto_include_ai_notes,
        auto_notify_employer = EXCLUDED.auto_notify_employer,
        follow_up_days = EXCLUDED.follow_up_days,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
      `,
      [
        req.user.id,
        professional_title,
        recruiter_bio,
        preferred_industries,
        preferred_countries,
        preferred_job_types,
        preferred_work_mode,
        seniority_focus,
        specialization_skills,
        default_candidate_message,
        default_employer_message,
        auto_signature,
        availability_status,
        notify_candidate_assigned,
        notify_employer_replies,
        notify_recommendation_reviewed,
        notify_candidate_messages,
        notify_job_match_alerts,
        notify_weekly_summary,
        default_recommendation_note,
        auto_include_ai_notes,
        auto_notify_employer,
        Number(follow_up_days || 3),
      ]
    );

    const userResult = await client.query(
      `
      SELECT
        id AS user_id,
        name,
        email,
        phone,
        country,
        city,
        profile_image
      FROM users
      WHERE id = $1
      `,
      [req.user.id]
    );

    await client.query("COMMIT");

    res.json({
      ...userResult.rows[0],
      ...recruiterResult.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");

    console.error("Failed to update settings:", err);
    res.status(500).json({
      error: "Failed to update settings",
    });
  } finally {
    client.release();
  }
};

/*
|--------------------------------------------------------------------------
| Update Talent
|--------------------------------------------------------------------------
*/

const updateTalent = async (req, res) => {
  try {
    const { id } = req.params;

    const allowedFields = [
      "name",
      "phone",
      "country",
      "city",
      "professional_title",
      "desired_job_title",
      "professional_summary",
      "years_of_experience",
      "skills",
      "languages",
      "availability",
      "preferred_work_mode",
      "preferred_employment_type",
      "expected_salary",
      "salary_currency",
      "work_authorization",
      "willing_to_relocate",
    ];

    const updates = [];
    const values = [];

    allowedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        values.push(req.body[field]);
        updates.push(`${field} = $${values.length}`);
      }
    });

    if (updates.length === 0) {
      return res.status(400).json({ error: "No valid fields provided" });
    }

    values.push(id);

    const result = await pool.query(
      `
      UPDATE users
      SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${values.length}
      AND role = 'candidate'
      RETURNING *
      `,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Talent not found" });
    }

    res.json({
      message: "Talent updated successfully",
      talent: result.rows[0],
    });
  } catch (err) {
    console.error("Failed to update talent:", err);
    res.status(500).json({ error: "Failed to update talent" });
  }
};

/*
|--------------------------------------------------------------------------
| Delete Talent
|--------------------------------------------------------------------------
*/

const deleteTalent = async (req, res) => {
  try {
    const recruiter = await getRecruiterByUserId(req.user.id);

    if (!recruiter) {
      return res.status(404).json({ error: "Recruiter profile not found" });
    }

    const { id } = req.params;

    await pool.query(
      `
      DELETE FROM recruiter_talent_assignments
      WHERE recruiter_id = $1
      AND candidate_id = $2
      `,
      [recruiter.id, id]
    );

    res.json({
      success: true,
      message: "Talent removed from your workspace",
    });
  } catch (err) {
    console.error("Failed to remove talent:", err);
    res.status(500).json({ error: "Failed to remove talent" });
  }
};


module.exports = {
  getRecruiterOverview,
  getRecruiterTalent,
  getRecruiterJobs,
  getRecruiterRecommendations,
  getRecruiterSettings,
  assignTalent,
  evaluateTalent,
  sendMessage,
  createJob,
  updateJob,
  deleteJob,
  updateSettings,
  updateTalent,
  deleteTalent,
  getJobTalentMatches,
  recommendCandidateForJob,
  createTalent,
  bulkCreateTalent,
};