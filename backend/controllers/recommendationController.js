const db = require("../config/db");

// =======================
// HELPERS
// =======================
function normalizeText(value) {
  return String(value || "").toLowerCase().trim();
}

function parseSkills(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map((skill) => normalizeText(skill)).filter(Boolean);
  }

  return String(value)
    .split(/[,;|]/)
    .map((skill) => normalizeText(skill))
    .filter(Boolean);
}

function tokenize(value) {
  return normalizeText(value)
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function calculateSkillsScore(candidateSkills, jobSkills) {
  if (!jobSkills.length) return 0;
  if (!candidateSkills.length) return 0;

  const candidateText = candidateSkills.join(" ");
  const candidateSet = new Set(candidateSkills);

  let matched = 0;

  jobSkills.forEach((skill) => {
    const normalizedSkill = normalizeText(skill);

    if (
      candidateSet.has(normalizedSkill) ||
      candidateText.includes(normalizedSkill)
    ) {
      matched += 1;
    }
  });

  return Math.round((matched / jobSkills.length) * 100);
}

function calculateTitleScore(candidateTitle, jobTitle) {
  const candidateWords = tokenize(candidateTitle);
  const jobWords = tokenize(jobTitle);

  if (!candidateWords.length || !jobWords.length) return 0;

  const candidateSet = new Set(candidateWords);
  const matched = jobWords.filter((word) => candidateSet.has(word));

  return Math.round((matched.length / jobWords.length) * 100);
}

function calculateExperienceScore(candidateYears, jobLevel) {
  const years = Number(candidateYears || 0);
  const level = normalizeText(jobLevel);

  if (!level) return 50;

  if (level.includes("entry") || level.includes("junior")) {
    if (years <= 2) return 100;
    if (years <= 4) return 70;
    return 40;
  }

  if (level.includes("mid")) {
    if (years >= 2 && years <= 6) return 100;
    if (years > 6) return 75;
    return 45;
  }

  if (level.includes("senior") || level.includes("lead")) {
    if (years >= 5) return 100;
    if (years >= 3) return 70;
    return 35;
  }

  return 50;
}

function calculateLocationScore(candidate, job) {
  const candidateCountry = normalizeText(candidate.country);
  const candidateCity = normalizeText(candidate.city);
  const preferredWorkMode = normalizeText(candidate.preferred_work_mode);

  const jobLocation = normalizeText(job.location);
  const jobWorkMode = normalizeText(job.work_mode);

  if (job.remote === true || jobWorkMode.includes("remote")) {
    if (preferredWorkMode.includes("remote")) return 100;
    return 80;
  }

  if (jobWorkMode.includes("hybrid")) {
    if (preferredWorkMode.includes("hybrid")) return 90;
    if (preferredWorkMode.includes("remote")) return 60;
  }

  if (!jobLocation) return 40;

  if (candidateCity && jobLocation.includes(candidateCity)) return 100;
  if (candidateCountry && jobLocation.includes(candidateCountry)) return 80;

  return 20;
}

function calculateProfileCompleteness(candidate) {
  const fields = [
    candidate.name,
    candidate.email,
    candidate.country,
    candidate.city,
    candidate.professional_title,
    candidate.professional_summary,
    candidate.skills,
    candidate.years_of_experience,
    candidate.languages,
    candidate.education,
    candidate.experience,
  ];

  const completed = fields.filter(Boolean).length;
  return Math.round((completed / fields.length) * 100);
}

function calculateKeywordRelevance(candidate, job) {
  const jobText = [
    job.title,
    job.description,
    job.required_skills,
    job.department,
    job.experience_level,
  ]
    .map(normalizeText)
    .join(" ");

  const candidateText = [
    candidate.professional_title,
    candidate.professional_summary,
    candidate.skills,
    candidate.experience,
    candidate.education,
  ]
    .map((item) =>
      typeof item === "object" ? JSON.stringify(item) : normalizeText(item)
    )
    .join(" ");

  if (!jobText || !candidateText) return 0;

  const jobWords = tokenize(jobText).filter((word) => word.length > 2);
  const candidateWords = new Set(
    tokenize(candidateText).filter((word) => word.length > 2)
  );

  if (!jobWords.length) return 0;

  const uniqueJobWords = [...new Set(jobWords)];
  const matched = uniqueJobWords.filter((word) => candidateWords.has(word));

  return Math.round((matched.length / uniqueJobWords.length) * 100);
}

// =======================
// GET RECOMMENDED CANDIDATES FOR JOB
// =======================
exports.getRecommendedCandidatesForJob = async (req, res) => {
  try {
    const employerCompanyId = req.user.company_id;
    const employerId = req.user.id;
    const { jobId } = req.params;

    const jobResult = await db.query(
      `
      SELECT *
      FROM jobs
      WHERE id = $1
        AND company_id = $2
      `,
      [jobId, employerCompanyId]
    );

    if (jobResult.rows.length === 0) {
      return res.status(404).json({
        error: "Job not found or not owned by your company",
      });
    }

    const job = jobResult.rows[0];
    const jobSkills = parseSkills(job.required_skills);

    const candidatesResult = await db.query(
      `
      SELECT
        u.id,
        u.name,
        u.email,
        u.country,
        u.city,
        u.profile_image,
        u.professional_title,
        u.professional_summary,
        u.skills,
        u.languages,
        u.years_of_experience,
        u.education,
        u.experience,
        u.expected_salary,
        u.salary_currency,
        u.preferred_work_mode,
        u.preferred_employment_type,

        COALESCE(ce.overall_score, 0)::float AS evaluation_score,
        COALESCE(ce.technical_score, 0)::int AS technical_score,
        COALESCE(ce.communication_score, 0)::int AS communication_score,
        COALESCE(ce.problem_solving_score, 0)::int AS problem_solving_score,
        COALESCE(ce.culture_fit_score, 0)::int AS culture_fit_score,
        COALESCE(ce.experience_relevance_score, 0)::int AS experience_relevance_score,
        COALESCE(ce.confidence_score, 0)::int AS confidence_score,
        ce.recommendation,
        ce.interview_notes,

        CASE 
          WHEN a.id IS NOT NULL THEN true
          ELSE false
        END AS already_applied

      FROM users u

      LEFT JOIN candidate_evaluations ce 
        ON ce.candidate_id = u.id
        AND ce.employer_id = $2

      LEFT JOIN applications a
        ON a.user_id = u.id
        AND a.job_id = $1

      WHERE u.role = 'candidate'

      GROUP BY 
        u.id,
        ce.overall_score,
        ce.technical_score,
        ce.communication_score,
        ce.problem_solving_score,
        ce.culture_fit_score,
        ce.experience_relevance_score,
        ce.confidence_score,
        ce.recommendation,
        ce.interview_notes,
        a.id
      `,
      [jobId, employerId]
    );

    const recommendations = candidatesResult.rows.map((candidate) => {
      const candidateSkills = parseSkills(candidate.skills);

      const skillsScore = calculateSkillsScore(candidateSkills, jobSkills);

      const titleScore = calculateTitleScore(
        candidate.professional_title,
        job.title
      );

      const experienceScore = calculateExperienceScore(
        candidate.years_of_experience,
        job.experience_level
      );

      const locationScore = calculateLocationScore(candidate, job);

      const evaluationScore = Math.round(
        Number(candidate.evaluation_score || 0)
      );

      const profileCompletenessScore = calculateProfileCompleteness(candidate);

      const keywordRelevanceScore = calculateKeywordRelevance(candidate, job);

      const totalScore = Math.round(
        skillsScore * 0.45 +
          titleScore * 0.2 +
          experienceScore * 0.15 +
          evaluationScore * 0.15 +
          locationScore * 0.05
      );

      return {
        ...candidate,
        match_score: totalScore,
        match_breakdown: {
          skills_score: skillsScore,
          title_score: titleScore,
          experience_score: experienceScore,
          location_score: locationScore,
          evaluation_score: evaluationScore,
          profile_completeness_score: profileCompletenessScore,
          keyword_relevance_score: keywordRelevanceScore,
        },
      };
    });

    const filteredRecommendations = recommendations.filter((candidate) => {
      const breakdown = candidate.match_breakdown;

      return (
        candidate.match_score >= 35 ||
        breakdown.skills_score > 0 ||
        breakdown.title_score > 0 ||
        breakdown.keyword_relevance_score >= 15 ||
        Number(candidate.evaluation_score || 0) >= 70
      );
    });

    filteredRecommendations.sort((a, b) => {
      if (b.match_score !== a.match_score) {
        return b.match_score - a.match_score;
      }

      return (
        Number(b.evaluation_score || 0) - Number(a.evaluation_score || 0)
      );
    });

    res.json(filteredRecommendations);
  } catch (error) {
    console.error("Recommendation error:", error);
    res.status(500).json({
      error: "Failed to generate candidate recommendations",
    });
  }
};