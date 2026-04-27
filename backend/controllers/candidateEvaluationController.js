const db = require("../config/db");

const clampScore = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  return Math.max(0, Math.min(100, num));
};

exports.getCandidateEvaluation = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      `
      SELECT
        id,
        candidate_id,
        employer_id,
        technical_score,
        communication_score,
        problem_solving_score,
        culture_fit_score,
        experience_relevance_score,
        confidence_score,
        overall_score,
        recommendation,
        interview_notes,
        created_at,
        updated_at
      FROM candidate_evaluations
      WHERE candidate_id = $1 AND employer_id = $2
      LIMIT 1
      `,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Evaluation not found" });
    }

    return res.json({ evaluation: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

exports.saveCandidateEvaluation = async (req, res) => {
  const { id } = req.params;

  const technical_score = clampScore(req.body.technical_score);
  const communication_score = clampScore(req.body.communication_score);
  const problem_solving_score = clampScore(req.body.problem_solving_score);
  const culture_fit_score = clampScore(req.body.culture_fit_score);
  const experience_relevance_score = clampScore(req.body.experience_relevance_score);
  const confidence_score = clampScore(req.body.confidence_score);

  const recommendation =
    req.body.recommendation && String(req.body.recommendation).trim()
      ? String(req.body.recommendation).trim()
      : "hold";

  const interview_notes =
    req.body.interview_notes !== undefined && req.body.interview_notes !== null
      ? String(req.body.interview_notes)
      : "";

  const computedOverallScore = Math.round(
    (
      technical_score +
      communication_score +
      problem_solving_score +
      culture_fit_score +
      experience_relevance_score +
      confidence_score
    ) / 6
  );

  try {
    const candidateCheck = await db.query(
      `
      SELECT id, role
      FROM users
      WHERE id = $1
      LIMIT 1
      `,
      [id]
    );

    if (candidateCheck.rows.length === 0) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    const result = await db.query(
      `
      INSERT INTO candidate_evaluations (
        candidate_id,
        employer_id,
        technical_score,
        communication_score,
        problem_solving_score,
        culture_fit_score,
        experience_relevance_score,
        confidence_score,
        overall_score,
        recommendation,
        interview_notes,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
      ON CONFLICT (candidate_id, employer_id)
      DO UPDATE SET
        technical_score = EXCLUDED.technical_score,
        communication_score = EXCLUDED.communication_score,
        problem_solving_score = EXCLUDED.problem_solving_score,
        culture_fit_score = EXCLUDED.culture_fit_score,
        experience_relevance_score = EXCLUDED.experience_relevance_score,
        confidence_score = EXCLUDED.confidence_score,
        overall_score = EXCLUDED.overall_score,
        recommendation = EXCLUDED.recommendation,
        interview_notes = EXCLUDED.interview_notes,
        updated_at = NOW()
      RETURNING
        id,
        candidate_id,
        employer_id,
        technical_score,
        communication_score,
        problem_solving_score,
        culture_fit_score,
        experience_relevance_score,
        confidence_score,
        overall_score,
        recommendation,
        interview_notes,
        created_at,
        updated_at
      `,
      [
        id,
        req.user.id,
        technical_score,
        communication_score,
        problem_solving_score,
        culture_fit_score,
        experience_relevance_score,
        confidence_score,
        computedOverallScore,
        recommendation,
        interview_notes,
      ]
    );

    return res.json({
      message: "Evaluation saved successfully",
      evaluation: result.rows[0],
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};