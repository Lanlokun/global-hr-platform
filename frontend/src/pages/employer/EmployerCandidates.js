import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.55)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
  zIndex: 1000,
};

const modalStyle = {
  width: "100%",
  maxWidth: "860px",
  maxHeight: "90vh",
  overflowY: "auto",
  background: "#fff",
  borderRadius: "22px",
  boxShadow: "0 25px 60px rgba(15, 23, 42, 0.22)",
  padding: "24px",
};

const modalHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "start",
  gap: "16px",
  marginBottom: "20px",
};

const scoreGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "14px",
};

const textAreaStyle = {
  width: "100%",
  minHeight: "130px",
  resize: "vertical",
  border: "1px solid #d1d5db",
  borderRadius: "12px",
  padding: "12px 14px",
  fontSize: "14px",
  outline: "none",
  fontFamily: "inherit",
};

const summaryCardStyle = (score) => ({
  borderRadius: "18px",
  padding: "18px",
  marginBottom: "18px",
  background:
    score >= 85
      ? "#dcfce7"
      : score >= 70
      ? "#dbeafe"
      : score >= 50
      ? "#fef3c7"
      : "#fee2e2",
  color:
    score >= 85
      ? "#166534"
      : score >= 70
      ? "#1d4ed8"
      : score >= 50
      ? "#92400e"
      : "#b91c1c",
});

function EmployerCandidates() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [candidates, setCandidates] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    country: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [savingEvaluation, setSavingEvaluation] = useState(false);

  const [evaluation, setEvaluation] = useState({
    technical_score: 0,
    communication_score: 0,
    problem_solving_score: 0,
    culture_fit_score: 0,
    experience_relevance_score: 0,
    confidence_score: 0,
    recommendation: "hold",
    interview_notes: "",
  });

  const pageSize = 8;

  const fetchCandidates = useCallback(async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/candidates`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCandidates(res.data);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to load candidates");
    }
  }, [token]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const filteredCandidates = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    const countryQuery = filters.country.trim().toLowerCase();

    return candidates.filter((candidate) => {
      const matchesSearch =
        !q ||
        candidate.name?.toLowerCase().includes(q) ||
        candidate.email?.toLowerCase().includes(q) ||
        candidate.professional_title?.toLowerCase().includes(q) ||
        candidate.skills?.toLowerCase().includes(q);

      const matchesCountry =
        !countryQuery ||
        candidate.country?.toLowerCase().includes(countryQuery);

      return matchesSearch && matchesCountry;
    });
  }, [candidates, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredCandidates.length / pageSize));

  const paginatedCandidates = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCandidates.slice(start, start + pageSize);
  }, [filteredCandidates, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const overallScore = useMemo(() => {
    const scores = [
      Number(evaluation.technical_score || 0),
      Number(evaluation.communication_score || 0),
      Number(evaluation.problem_solving_score || 0),
      Number(evaluation.culture_fit_score || 0),
      Number(evaluation.experience_relevance_score || 0),
      Number(evaluation.confidence_score || 0),
    ];

    return Math.round(scores.reduce((sum, item) => sum + item, 0) / scores.length);
  }, [evaluation]);

  const scoreLabel = useMemo(() => {
    if (overallScore >= 85) return "Strong Hire";
    if (overallScore >= 70) return "Proceed";
    if (overallScore >= 50) return "Hold";
    return "Reject";
  }, [overallScore]);

  const openEvaluationModal = async (candidate) => {
    setSelectedCandidate(candidate);
    setEvaluation({
      technical_score: 0,
      communication_score: 0,
      problem_solving_score: 0,
      culture_fit_score: 0,
      experience_relevance_score: 0,
      confidence_score: 0,
      recommendation: "hold",
      interview_notes: "",
    });
    setShowEvaluationModal(true);

    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/candidates/${candidate.id}/evaluation`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data?.evaluation) {
        const existing = res.data.evaluation;
        setEvaluation({
          technical_score: existing.technical_score || 0,
          communication_score: existing.communication_score || 0,
          problem_solving_score: existing.problem_solving_score || 0,
          culture_fit_score: existing.culture_fit_score || 0,
          experience_relevance_score: existing.experience_relevance_score || 0,
          confidence_score: existing.confidence_score || 0,
          recommendation: existing.recommendation || "hold",
          interview_notes: existing.interview_notes || "",
        });
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error(error.response?.data?.error || "Failed to load evaluation");
      }
    }
  };

  const closeEvaluationModal = () => {
    setShowEvaluationModal(false);
    setSelectedCandidate(null);
  };

  const updateEvaluationField = (key, value) => {
    setEvaluation((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const saveEvaluation = async () => {
    if (!selectedCandidate) return;

    try {
      setSavingEvaluation(true);

      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/candidates/${selectedCandidate.id}/evaluation`,
        {
          ...evaluation,
          overall_score: overallScore,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Evaluation saved successfully");
      closeEvaluationModal();
      fetchCandidates();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to save evaluation");
    } finally {
      setSavingEvaluation(false);
    }
  };

  return (
    <DashboardLayout
      title="Candidates"
      subtitle="Browse, review, and evaluate candidates on the platform."
    >
      <Card>
        <div
          className="ui-toolbar"
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "12px",
            alignItems: "end",
            flexWrap: "wrap",
            marginBottom: "16px",
          }}
        >
          <div style={{ flex: "1 1 360px", minWidth: "260px" }}>
            <Input
              label="Search"
              placeholder="Search by name, email, title, or skills"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          <div style={{ flex: "0 1 220px", minWidth: "180px" }}>
            <Input
              label="Country"
              placeholder="Japan, Nigeria, UK..."
              value={filters.country}
              onChange={(e) => setFilters({ ...filters, country: e.target.value })}
            />
          </div>

          {(filters.search || filters.country) && (
            <Button
              variant="secondary"
              onClick={() =>
                setFilters({
                  search: "",
                  country: "",
                })
              }
            >
              Clear
            </Button>
          )}
        </div>

        <div
          style={{
            fontSize: "14px",
            opacity: 0.8,
            marginBottom: "12px",
          }}
        >
          {filteredCandidates.length} candidate{filteredCandidates.length === 1 ? "" : "s"} found
        </div>

        <div className="ui-table-wrap">
          <table className="ui-table">
            <thead>
              <tr>
                <th style={{ width: "60px" }}>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Title</th>
                <th>Country</th>
                <th>Applications</th>
                <th style={{ width: "220px" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedCandidates.length === 0 ? (
                <tr>
                  <td colSpan="8" className="ui-table-empty">
                    No candidates found.
                  </td>
                </tr>
              ) : (
                paginatedCandidates.map((candidate, index) => {
                  const rowNumber = (currentPage - 1) * pageSize + index + 1;

                  return (
                    <tr key={candidate.id}>
                      <td>{rowNumber}</td>
                      <td>{candidate.name || "N/A"}</td>
                      <td>{candidate.email || "N/A"}</td>
                      <td>{candidate.professional_title || "Not set"}</td>
                      <td>{candidate.country || "Not set"}</td>

                      <td>
                        <Badge variant="default">
                          {candidate.application_count || 0}
                        </Badge>
                      </td>

                      <td>
                        <div
                          className="ui-table-actions"
                          style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap",
                          }}
                        >
                          <Button
                            variant="secondary"
                            onClick={() =>
                              navigate(`/dashboard/candidates/${candidate.id}`)
                            }
                          >
                            View
                          </Button>

                          <Button
                            onClick={() => openEvaluationModal(candidate)}
                          >
                            Evaluate
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            marginTop: "16px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontSize: "14px", opacity: 0.8 }}>
            Showing{" "}
            {filteredCandidates.length === 0
              ? 0
              : (currentPage - 1) * pageSize + 1}
            {" - "}
            {Math.min(currentPage * pageSize, filteredCandidates.length)} of{" "}
            {filteredCandidates.length} candidates
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <Button
              variant="secondary"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            <span
              style={{
                fontSize: "14px",
                minWidth: "90px",
                textAlign: "center",
              }}
            >
              Page {currentPage} of {totalPages}
            </span>

            <Button
              variant="secondary"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      {showEvaluationModal && selectedCandidate && (
        <div style={overlayStyle} onClick={closeEvaluationModal}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "22px",
                    color: "#0f172a",
                  }}
                >
                  Evaluate Candidate
                </h2>
                <p
                  style={{
                    margin: "6px 0 0",
                    color: "#64748b",
                    fontSize: "14px",
                  }}
                >
                  {selectedCandidate.name || "Candidate"} •{" "}
                  {selectedCandidate.professional_title || "No title"}
                </p>
              </div>

              <Button variant="secondary" onClick={closeEvaluationModal}>
                Close
              </Button>
            </div>

            <div style={summaryCardStyle(overallScore)}>
              <div style={{ fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                Overall Score
              </div>
              <div style={{ fontSize: "30px", fontWeight: 800 }}>
                {overallScore}/100
              </div>
              <div style={{ marginTop: "6px", fontWeight: 700 }}>
                {scoreLabel}
              </div>
            </div>

            <div style={scoreGridStyle}>
              <Input
                label="Technical Skills"
                type="number"
                min="0"
                max="100"
                value={evaluation.technical_score}
                onChange={(e) =>
                  updateEvaluationField("technical_score", e.target.value)
                }
              />

              <Input
                label="Communication"
                type="number"
                min="0"
                max="100"
                value={evaluation.communication_score}
                onChange={(e) =>
                  updateEvaluationField("communication_score", e.target.value)
                }
              />

              <Input
                label="Problem Solving"
                type="number"
                min="0"
                max="100"
                value={evaluation.problem_solving_score}
                onChange={(e) =>
                  updateEvaluationField("problem_solving_score", e.target.value)
                }
              />

              <Input
                label="Culture Fit"
                type="number"
                min="0"
                max="100"
                value={evaluation.culture_fit_score}
                onChange={(e) =>
                  updateEvaluationField("culture_fit_score", e.target.value)
                }
              />

              <Input
                label="Experience Relevance"
                type="number"
                min="0"
                max="100"
                value={evaluation.experience_relevance_score}
                onChange={(e) =>
                  updateEvaluationField("experience_relevance_score", e.target.value)
                }
              />

              <Input
                label="Confidence"
                type="number"
                min="0"
                max="100"
                value={evaluation.confidence_score}
                onChange={(e) =>
                  updateEvaluationField("confidence_score", e.target.value)
                }
              />

              <Input
                as="select"
                label="Recommendation"
                value={evaluation.recommendation}
                onChange={(e) =>
                  updateEvaluationField("recommendation", e.target.value)
                }
                options={[
                  { value: "reject", label: "Reject" },
                  { value: "hold", label: "Hold" },
                  { value: "proceed", label: "Proceed" },
                  { value: "strong_hire", label: "Strong Hire" },
                ]}
              />
            </div>

            <div style={{ marginTop: "16px" }}>
              <label
                style={{
                  display: "block",
                  fontWeight: 600,
                  marginBottom: "8px",
                  color: "#0f172a",
                }}
              >
                Interview Notes
              </label>
              <textarea
                style={textAreaStyle}
                value={evaluation.interview_notes}
                onChange={(e) =>
                  updateEvaluationField("interview_notes", e.target.value)
                }
                placeholder="Write interviewer notes, strengths, concerns, and final recommendation."
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              <Button variant="secondary" onClick={closeEvaluationModal}>
                Cancel
              </Button>
              <Button onClick={saveEvaluation} disabled={savingEvaluation}>
                {savingEvaluation ? "Saving..." : "Save Evaluation"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default EmployerCandidates;