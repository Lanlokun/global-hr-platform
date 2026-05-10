const db = require("../config/db");

// ======================
// GET ADMIN STATS
// ======================
// ======================
// GET ADMIN STATS
// ======================
// ======================
// GET ADMIN STATS
// ======================
exports.getStats = async (req, res) => {
  try {
    const [
      users,
      companies,
      jobs,
      applications,
      candidates,
      admins,
      employers,
      recruiters,
    ] = await Promise.all([
      db.query(`SELECT COUNT(*) FROM users`),
      db.query(`SELECT COUNT(*) FROM companies`),
      db.query(`SELECT COUNT(*) FROM jobs`),
      db.query(`SELECT COUNT(*) FROM applications`),
      db.query(`SELECT COUNT(*) FROM users WHERE role = 'candidate'`),
      db.query(`SELECT COUNT(*) FROM users WHERE role = 'admin'`),
      db.query(`SELECT COUNT(*) FROM users WHERE role = 'employer'`),
      db.query(`SELECT COUNT(*) FROM users WHERE role = 'recruiter'`),
    ]);

    res.json({
      users: Number(users.rows[0].count),
      companies: Number(companies.rows[0].count),
      jobs: Number(jobs.rows[0].count),
      applications: Number(applications.rows[0].count),
      candidates: Number(candidates.rows[0].count),
      admins: Number(admins.rows[0].count),
      employers: Number(employers.rows[0].count),
      recruiters: Number(recruiters.rows[0].count),
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
};
// ======================
// GET ADMIN ACTIVITY
// ======================
exports.getActivity = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM (
        -- New users
        SELECT 
          'user' AS type,
          'New user registered' AS action,
          u.name AS detail,
          u.created_at
        FROM users u

        UNION ALL

        -- New companies
        SELECT 
          'company' AS type,
          'New company registered' AS action,
          c.name AS detail,
          c.created_at
        FROM companies c

        UNION ALL

        -- New jobs
        SELECT 
          'job' AS type,
          'New job posted' AS action,
          j.title AS detail,
          j.created_at
        FROM jobs j

        UNION ALL

        -- New applications
        SELECT 
          'application' AS type,
          'Application submitted' AS action,
          j.title AS detail,
          a.created_at
        FROM applications a
        JOIN jobs j ON j.id = a.job_id
      ) activity
      ORDER BY created_at DESC
      LIMIT 20
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Admin activity error:", err);
    res.status(500).json({ error: "Failed to fetch activity" });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const result = await db.query(`
      WITH months AS (
        SELECT generate_series(
          date_trunc('month', NOW()) - INTERVAL '5 months',
          date_trunc('month', NOW()),
          INTERVAL '1 month'
        ) AS month
      )
      SELECT
        TO_CHAR(m.month, 'Mon YYYY') AS month,

        COALESCE((
          SELECT COUNT(*) FROM users u
          WHERE date_trunc('month', u.created_at) = m.month
        ), 0)::int AS users,

        COALESCE((
          SELECT COUNT(*) FROM companies c
          WHERE date_trunc('month', c.created_at) = m.month
        ), 0)::int AS companies,

        COALESCE((
          SELECT COUNT(*) FROM jobs j
          WHERE date_trunc('month', j.created_at) = m.month
        ), 0)::int AS jobs,

        COALESCE((
          SELECT COUNT(*) FROM applications a
          WHERE date_trunc('month', a.created_at) = m.month
        ), 0)::int AS applications

      FROM months m
      ORDER BY m.month ASC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Admin analytics error:", err);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};

// ======================
// GET ADMIN USERS
// ======================
exports.getUsers = async (req, res) => {
  try {
    const { search = "", role = "all", page = 1, limit = 10 } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const offset = (pageNumber - 1) * limitNumber;

    const conditions = [];
    const values = [];

    if (search.trim()) {
      values.push(`%${search.trim()}%`);
      conditions.push(
        `(name ILIKE $${values.length} OR email ILIKE $${values.length})`
      );
    }

    if (role !== "all") {
      values.push(role);
      conditions.push(`role = $${values.length}`);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const usersQuery = `
      SELECT 
        id,
        name,
        email,
        role,
        created_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${values.length + 1}
      OFFSET $${values.length + 2}
    `;

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM users
      ${whereClause}
    `;

    const usersResult = await db.query(usersQuery, [
      ...values,
      limitNumber,
      offset,
    ]);

    const countResult = await db.query(countQuery, values);
    const total = Number(countResult.rows[0].total);

    res.json({
      users: usersResult.rows,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    });
  } catch (err) {
    console.error("Admin users error:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// ======================
// UPDATE USER ROLE
// ======================
// ======================
// UPDATE USER ROLE
// ======================
exports.updateUserRole = async (req, res) => {
  const client = await db.connect();

  try {
    const { id } = req.params;
    const { role } = req.body;

    const allowedRoles = [
      "admin",
      "employer",
      "candidate",
      "recruiter",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        error: "Invalid role",
      });
    }

    await client.query("BEGIN");

    const existingUser = await client.query(
      `
      SELECT id, role
      FROM users
      WHERE id = $1
      `,
      [id]
    );

    if (existingUser.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        error: "User not found",
      });
    }

    const previousRole = existingUser.rows[0].role;

    const result = await client.query(
      `
      UPDATE users
      SET
        role = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING
        id,
        name,
        email,
        role,
        created_at,
        updated_at
      `,
      [role, id]
    );

    /*
    |--------------------------------------------------------------------------
    | Became recruiter
    |--------------------------------------------------------------------------
    */

    if (
      previousRole !== "recruiter" &&
      role === "recruiter"
    ) {
      await client.query(
        `
        INSERT INTO recruiters (
          user_id,
          created_at,
          updated_at
        )
        VALUES (
          $1,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
        ON CONFLICT (user_id)
        DO NOTHING
        `,
        [id]
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Removed recruiter role
    |--------------------------------------------------------------------------
    */

    if (
      previousRole === "recruiter" &&
      role !== "recruiter"
    ) {
      await client.query(
        `
        DELETE FROM recruiters
        WHERE user_id = $1
        `,
        [id]
      );
    }

    await client.query("COMMIT");

    res.json(result.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");

    console.error("Admin update user role error:", err);

    res.status(500).json({
      error: "Failed to update user role",
    });
  } finally {
    client.release();
  }
};

// ======================
// DELETE USER
// ======================
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (Number(req.user.id) === Number(id)) {
      return res.status(400).json({
        error: "You cannot delete your own admin account",
      });
    }

    const result = await db.query(
      `
      DELETE FROM users
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Admin delete user error:", err);
    res.status(500).json({ error: "Failed to delete user" });
  }
};

// ======================
// GET ADMIN COMPANY STATS
// ======================
exports.getCompanyStats = async (req, res) => {
  try {
    const [companies, active, pending, inactive, withJobs, totalJobs] =
      await Promise.all([
        db.query(`SELECT COUNT(*) FROM companies`),

        db.query(`
          SELECT COUNT(*)
          FROM companies
          WHERE COALESCE(status, 'pending') = 'active'
        `),

        db.query(`
          SELECT COUNT(*)
          FROM companies
          WHERE COALESCE(status, 'pending') = 'pending'
        `),

        db.query(`
          SELECT COUNT(*)
          FROM companies
          WHERE COALESCE(status, 'pending') = 'inactive'
        `),

        db.query(`
          SELECT COUNT(DISTINCT company_id)
          FROM jobs
          WHERE company_id IS NOT NULL
        `),

        db.query(`SELECT COUNT(*) FROM jobs`),
      ]);

    res.json({
      companies: Number(companies.rows[0].count),
      active: Number(active.rows[0].count),
      pending: Number(pending.rows[0].count),
      inactive: Number(inactive.rows[0].count),
      withJobs: Number(withJobs.rows[0].count),
      totalJobs: Number(totalJobs.rows[0].count),
    });
  } catch (err) {
    console.error("Admin company stats error:", err);
    res.status(500).json({ error: "Failed to fetch company stats" });
  }
};
// ======================
// GET ADMIN COMPANIES
// ======================
exports.getCompanies = async (req, res) => {
  try {
    const { search = "", status = "all", page = 1, limit = 10 } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const offset = (pageNumber - 1) * limitNumber;

    const conditions = [];
    const values = [];

    if (search.trim()) {
      values.push(`%${search.trim()}%`);
      conditions.push(`
        (
          c.name ILIKE $${values.length}
          OR c.industry ILIKE $${values.length}
          OR c.country ILIKE $${values.length}
          OR c.city ILIKE $${values.length}
        )
      `);
    }

    if (status !== "all") {
      values.push(status);
      conditions.push(`COALESCE(c.status, 'pending') = $${values.length}`);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const companiesQuery = `
      SELECT
        c.id,
        c.name,
        c.industry,
        c.country,
        c.city,
        c.website,
        c.logo,
        c.description,
        c.created_at,
        COALESCE(c.status, 'pending') AS status,
        COUNT(j.id)::int AS job_count
      FROM companies c
      LEFT JOIN jobs j ON j.company_id = c.id
      ${whereClause}
      GROUP BY c.id
      ORDER BY c.created_at DESC
      LIMIT $${values.length + 1}
      OFFSET $${values.length + 2}
    `;

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM companies c
      ${whereClause}
    `;

    const companiesResult = await db.query(companiesQuery, [
      ...values,
      limitNumber,
      offset,
    ]);

    const countResult = await db.query(countQuery, values);
    const total = Number(countResult.rows[0].total);

    res.json({
      companies: companiesResult.rows,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    });
  } catch (err) {
    console.error("Admin companies error:", err);
    res.status(500).json({ error: "Failed to fetch companies" });
  }
};

exports.updateCompanyStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    let status;


    if (action === "approve") {
      status = "active";
    } else if (action === "deactivate") {
      status = "inactive";
    } else if (action === "pending") {
      status = "pending";
    } else {
      return res.status(400).json({ error: "Invalid action" });
    }

    const result = await db.query(
      `
      UPDATE companies
      SET status = $1
      WHERE id = $2
      RETURNING id, name, status
      `,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Company not found" });
    }

    res.json({
      message: `Company status updated to ${status}`,
      company: result.rows[0],
    });
  } catch (err) {
    console.error("Update company status error:", err);
    res.status(500).json({ error: "Failed to update company status" });
  }
};

// ======================
// GET ADMIN JOB STATS
// ======================
exports.getJobStats = async (req, res) => {
  try {
    const [jobs, active, inactive, withApplications, totalApplications] =
      await Promise.all([
        db.query(`SELECT COUNT(*) FROM jobs`),

        db.query(`
          SELECT COUNT(*)
          FROM jobs
          WHERE COALESCE(status, 'active') = 'active'
        `),

        db.query(`
          SELECT COUNT(*)
          FROM jobs
          WHERE COALESCE(status, 'active') = 'inactive'
        `),

        db.query(`
          SELECT COUNT(DISTINCT job_id)
          FROM applications
          WHERE job_id IS NOT NULL
        `),

        db.query(`SELECT COUNT(*) FROM applications`),
      ]);

    res.json({
      jobs: Number(jobs.rows[0].count),
      active: Number(active.rows[0].count),
      inactive: Number(inactive.rows[0].count),
      withApplications: Number(withApplications.rows[0].count),
      totalApplications: Number(totalApplications.rows[0].count),
    });
  } catch (err) {
    console.error("Admin job stats error:", err);
    res.status(500).json({ error: "Failed to fetch job stats" });
  }
};

// ======================
// GET ADMIN JOBS
// ======================
exports.getJobs = async (req, res) => {
  try {
    const {
      search = "",
      status = "all",
      type = "all",
      page = 1,
      limit = 10,
    } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const offset = (pageNumber - 1) * limitNumber;

    const conditions = [];
    const values = [];

    if (search.trim()) {
      values.push(`%${search.trim()}%`);
      conditions.push(`
        (
          j.title ILIKE $${values.length}
          OR c.name ILIKE $${values.length}
          OR j.location ILIKE $${values.length}
        )
      `);
    }

    if (status !== "all") {
      values.push(status);
      conditions.push(`COALESCE(j.status, 'active') = $${values.length}`);
    }

    if (type !== "all") {
      values.push(type);
      conditions.push(`j.employment_type = $${values.length}`);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const jobsQuery = `
      SELECT
        j.id,
        j.title,
        j.description,
        j.location,
        j.employment_type,
        j.salary_min,
        j.salary_max,
        j.currency,
        j.created_at,
        COALESCE(j.status, 'active') AS status,
        c.id AS company_id,
        c.name AS company_name,
        c.industry,
        COUNT(a.id)::int AS application_count
      FROM jobs j
      LEFT JOIN companies c ON c.id = j.company_id
      LEFT JOIN applications a ON a.job_id = j.id
      ${whereClause}
      GROUP BY j.id, c.id
      ORDER BY j.created_at DESC
      LIMIT $${values.length + 1}
      OFFSET $${values.length + 2}
    `;

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM jobs j
      LEFT JOIN companies c ON c.id = j.company_id
      ${whereClause}
    `;

    const jobsResult = await db.query(jobsQuery, [
      ...values,
      limitNumber,
      offset,
    ]);

    const countResult = await db.query(countQuery, values);
    const total = Number(countResult.rows[0].total);

    res.json({
      jobs: jobsResult.rows,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    });
  } catch (err) {
    console.error("Admin jobs error:", err);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
};

// ======================
// UPDATE JOB STATUS
// ======================
exports.updateJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    let status;

    if (action === "activate") {
      status = "active";
    } else if (action === "deactivate") {
      status = "inactive";
    } else {
      return res.status(400).json({ error: "Invalid action" });
    }

    const result = await db.query(
      `
      UPDATE jobs
      SET status = $1
      WHERE id = $2
      RETURNING id, title, status
      `,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json({
      message: `Job status updated to ${status}`,
      job: result.rows[0],
    });
  } catch (err) {
    console.error("Update job status error:", err);
    res.status(500).json({ error: "Failed to update job status" });
  }
};

// ======================
// GET ADMIN APPLICATION STATS
// ======================
exports.getApplicationStats = async (req, res) => {
  try {
    const [
      total,
      pending,
      reviewed,
      shortlisted,
      interview,
      hired,
      rejected,
    ] = await Promise.all([
      db.query(`SELECT COUNT(*) FROM applications`),

      db.query(`
        SELECT COUNT(*)
        FROM applications
        WHERE COALESCE(status, 'pending') = 'pending'
      `),

      db.query(`
        SELECT COUNT(*)
        FROM applications
        WHERE COALESCE(status, 'pending') = 'reviewed'
      `),

      db.query(`
        SELECT COUNT(*)
        FROM applications
        WHERE COALESCE(status, 'pending') = 'shortlisted'
      `),

      db.query(`
        SELECT COUNT(*)
        FROM applications
        WHERE COALESCE(status, 'pending') = 'interview'
      `),

      db.query(`
        SELECT COUNT(*)
        FROM applications
        WHERE COALESCE(status, 'pending') = 'hired'
      `),

      db.query(`
        SELECT COUNT(*)
        FROM applications
        WHERE COALESCE(status, 'pending') = 'rejected'
      `),
    ]);

    res.json({
      total: Number(total.rows[0].count),
      pending: Number(pending.rows[0].count),
      reviewed: Number(reviewed.rows[0].count),
      shortlisted: Number(shortlisted.rows[0].count),
      interview: Number(interview.rows[0].count),
      hired: Number(hired.rows[0].count),
      rejected: Number(rejected.rows[0].count),
    });
  } catch (err) {
    console.error("Admin application stats error:", err);
    res.status(500).json({ error: "Failed to fetch application stats" });
  }
};

// ======================
// GET ADMIN APPLICATIONS
// ======================
exports.getApplications = async (req, res) => {
  try {
    const {
      search = "",
      status = "all",
      job = "",
      page = 1,
      limit = 10,
    } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const offset = (pageNumber - 1) * limitNumber;

    const conditions = [];
    const values = [];

    if (search.trim()) {
      values.push(`%${search.trim()}%`);
      conditions.push(`
        (
          j.title ILIKE $${values.length}
          OR c.name ILIKE $${values.length}
          OR u.name ILIKE $${values.length}
          OR u.email ILIKE $${values.length}
        )
      `);
    }

    if (status !== "all") {
      values.push(status);
      conditions.push(`COALESCE(a.status, 'pending') = $${values.length}`);
    }

    if (job) {
      values.push(job);
      conditions.push(`a.job_id = $${values.length}`);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const applicationsQuery = `
      SELECT
        a.id,
        a.job_id,
        a.user_id,
        COALESCE(a.status, 'pending') AS status,
        a.created_at,
        j.title AS job_title,
        j.location,
        c.id AS company_id,
        c.name AS company_name,
        u.name AS candidate_name,
        u.email AS candidate_email,
        COUNT(*) OVER()::int AS total_count
      FROM applications a
      LEFT JOIN jobs j ON j.id = a.job_id
      LEFT JOIN companies c ON c.id = j.company_id
      LEFT JOIN users u ON u.id = a.user_id
      ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT $${values.length + 1}
      OFFSET $${values.length + 2}
    `;

    const result = await db.query(applicationsQuery, [
      ...values,
      limitNumber,
      offset,
    ]);

    const total = result.rows[0]?.total_count || 0;

    res.json({
      applications: result.rows,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    });
  } catch (err) {
    console.error("Admin applications error:", err);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
};

// ======================
// UPDATE APPLICATION STATUS
// ======================
exports.updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "reviewed",
      "shortlisted",
      "interview",
      "hired",
      "rejected",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid application status" });
    }

    const result = await db.query(
      `
      UPDATE applications
      SET status = $1
      WHERE id = $2
      RETURNING id, status
      `,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json({
      message: `Application status updated to ${status}`,
      application: result.rows[0],
    });
  } catch (err) {
    console.error("Update application status error:", err);
    res.status(500).json({ error: "Failed to update application status" });
  }
};

// ======================
// GET ADMIN CANDIDATE STATS
// ======================
exports.getCandidateStats = async (req, res) => {
  try {
    const [total, withApplications, withResume, available, completeProfiles] =
      await Promise.all([
        db.query(`SELECT COUNT(*) FROM users WHERE role = 'candidate'`),

        db.query(`
          SELECT COUNT(DISTINCT user_id)
          FROM applications
          WHERE user_id IS NOT NULL
        `),

        db.query(`
          SELECT COUNT(*)
          FROM users
          WHERE role = 'candidate'
          AND resume_url IS NOT NULL
          AND resume_url <> ''
        `),

        db.query(`
          SELECT COUNT(*)
          FROM users
          WHERE role = 'candidate'
          AND availability IS NOT NULL
          AND availability <> ''
        `),

        db.query(`
          SELECT COUNT(*)
          FROM users
          WHERE role = 'candidate'
          AND name IS NOT NULL
          AND country IS NOT NULL
          AND desired_job_title IS NOT NULL
          AND professional_summary IS NOT NULL
          AND resume_url IS NOT NULL
        `),
      ]);

    res.json({
      total: Number(total.rows[0].count),
      withApplications: Number(withApplications.rows[0].count),
      withResume: Number(withResume.rows[0].count),
      available: Number(available.rows[0].count),
      completeProfiles: Number(completeProfiles.rows[0].count),
    });
  } catch (err) {
    console.error("Admin candidate stats error:", err);
    res.status(500).json({ error: "Failed to fetch candidate stats" });
  }
};

// ======================
// GET ADMIN CANDIDATES
// ======================
exports.getCandidates = async (req, res) => {
  try {
    const {
      search = "",
      country = "all",
      page = 1,
      limit = 10,
    } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const offset = (pageNumber - 1) * limitNumber;

    const conditions = [`u.role = 'candidate'`];
    const values = [];

    if (search.trim()) {
      values.push(`%${search.trim()}%`);
      conditions.push(`
        (
          u.name ILIKE $${values.length}
          OR u.email ILIKE $${values.length}
          OR u.professional_title ILIKE $${values.length}
          OR u.desired_job_title ILIKE $${values.length}
          OR u.professional_summary ILIKE $${values.length}
          OR u.skills ILIKE $${values.length}
          OR u.country ILIKE $${values.length}
          OR u.city ILIKE $${values.length}
        )
      `);
    }

    if (country !== "all") {
      values.push(country);
      conditions.push(`u.country = $${values.length}`);
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    const result = await db.query(
      `
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        u.company_id,

        u.country,
        u.phone,
        u.city,
        u.address,
        u.date_of_birth,
        u.gender,
        u.profile_image,

        u.professional_title,
        u.years_of_experience,
        u.professional_summary,
        u.skills,
        u.languages,

        u.experience,
        u.education,
        u.certifications,

        u.desired_job_title,
        u.preferred_employment_type,
        u.preferred_work_mode,
        u.expected_salary,
        u.salary_currency,
        u.notice_period,
        u.availability,
        u.work_authorization,
        u.willing_to_relocate,

        u.linkedin_url,
        u.github_url,
        u.portfolio_url,
        u.resume_url,

        u.created_at,
        u.updated_at,

        COUNT(a.id)::int AS application_count,
        COUNT(*) OVER()::int AS total_count
      FROM users u
      LEFT JOIN applications a ON a.user_id = u.id
      ${whereClause}
      GROUP BY u.id
      ORDER BY u.created_at DESC
      LIMIT $${values.length + 1}
      OFFSET $${values.length + 2}
      `,
      [...values, limitNumber, offset]
    );

    const total = result.rows[0]?.total_count || 0;

    res.json({
      candidates: result.rows,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
    });
  } catch (err) {
    console.error("Admin candidates error:", err);
    res.status(500).json({ error: "Failed to fetch candidates" });
  }
};

exports.updateCandidate = async (req, res) => {
  try {
    const { id } = req.params;

    const allowedFields = [
      "name",
      "email",
      "country",
      "phone",
      "city",
      "address",
      "date_of_birth",
      "gender",
      "profile_image",
      "professional_title",
      "years_of_experience",
      "professional_summary",
      "skills",
      "languages",
      "experience",
      "education",
      "certifications",
      "desired_job_title",
      "preferred_employment_type",
      "preferred_work_mode",
      "expected_salary",
      "salary_currency",
      "notice_period",
      "availability",
      "work_authorization",
      "willing_to_relocate",
      "linkedin_url",
      "github_url",
      "portfolio_url",
      "resume_url",
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

    const result = await db.query(
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
      return res.status(404).json({ error: "Candidate not found" });
    }

    res.json({
      message: "Candidate updated successfully",
      candidate: result.rows[0],
    });
  } catch (err) {
    console.error("Admin update candidate error:", err);
    res.status(500).json({ error: "Failed to update candidate" });
  }
};

exports.deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(`DELETE FROM applications WHERE user_id = $1`, [id]);

    const result = await db.query(
      `
      DELETE FROM users
      WHERE id = $1
      AND role = 'candidate'
      RETURNING id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    res.json({ message: "Candidate deleted successfully" });
  } catch (err) {
    console.error("Admin delete candidate error:", err);
    res.status(500).json({ error: "Failed to delete candidate" });
  }
};

const bcrypt = require("bcryptjs");

// CREATE USER
exports.createUser = async (req, res) => {
  const client = await db.connect();

  try {
    const { name, email, password, role = "candidate" } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        error: "Email, password, and role are required",
      });
    }

    const allowedRoles = [
      "admin",
      "employer",
      "candidate",
      "recruiter",
    ];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        error: "Invalid role",
      });
    }

    await client.query("BEGIN");

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await client.query(
      `
      INSERT INTO users (
        name,
        email,
        password,
        role,
        profile_image,
        is_email_verified
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        true
      )
      RETURNING id, name, email, role, created_at
      `,
      [
        name || "",
        email,
        hashedPassword,
        role,
        "/images/avatar.jpg",
      ]
    );

    const user = result.rows[0];

    /*
    |--------------------------------------------------------------------------
    | Auto create recruiter profile
    |--------------------------------------------------------------------------
    */

    if (role === "recruiter") {
      await client.query(
        `
        INSERT INTO recruiters (
          user_id,
          created_at,
          updated_at
        )
        VALUES (
          $1,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )
        `,
        [user.id]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (err) {
    await client.query("ROLLBACK");

    console.error("Admin create user error:", err);

    if (err.code === "23505") {
      return res.status(409).json({
        error: "Email already exists",
      });
    }

    res.status(500).json({
      error: "Failed to create user",
    });
  } finally {
    client.release();
  }
};

// UPDATE USER BASIC INFO
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    const allowedRoles = ["admin", "employer", "candidate", "recruiter"];

    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const result = await db.query(
      `
      UPDATE users
      SET
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        role = COALESCE($3, role),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING id, name, email, role, created_at, updated_at
      `,
      [name, email, role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      message: "User updated successfully",
      user: result.rows[0],
    });
  } catch (err) {
    console.error("Admin update user error:", err);

    if (err.code === "23505") {
      return res.status(409).json({ error: "Email already exists" });
    }

    res.status(500).json({ error: "Failed to update user" });
  }
};

// RESET USER PASSWORD
exports.resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.query(
      `
      UPDATE users
      SET password = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, name, email, role
      `,
      [hashedPassword, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Admin reset password error:", err);
    res.status(500).json({ error: "Failed to reset password" });
  }
};