import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Input from "../../components/ui/Input";

const pageGridStyle = {
  display: "grid",
  gridTemplateColumns: "340px minmax(0, 1fr)",
  gap: "20px",
  alignItems: "start",
};

const sideStackStyle = {
  display: "grid",
  gap: "18px",
  position: "sticky",
  top: "16px",
};

const sectionLabelStyle = {
  fontSize: "12px",
  color: "#64748b",
  marginBottom: "6px",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const valueStyle = {
  fontSize: "15px",
  color: "#0f172a",
  lineHeight: 1.6,
};

const chipWrapStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
};

const chipStyle = {
  padding: "8px 12px",
  borderRadius: "999px",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  fontSize: "13px",
  color: "#0f172a",
  fontWeight: 500,
};

const applicationCardStyle = {
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  padding: "16px",
  background: "#ffffff",
  display: "grid",
  gap: "14px",
};

const rowGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "14px",
};

function EmployerCandidateDetail() {
  const token = localStorage.getItem("token");
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [applications, setApplications] = useState([]);

  const fetchCandidate = useCallback(async () => {
    try {
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/candidates/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCandidate(res.data.candidate);
      setApplications(res.data.applications || []);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to load candidate");
    }
  }, [id, token]);

  useEffect(() => {
    fetchCandidate();
  }, [fetchCandidate]);

  const updateStatus = async (applicationId, status) => {
    try {
      await axios.patch(
        `${process.env.REACT_APP_API_URL}/api/applications/${applicationId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Application status updated");
      fetchCandidate();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update status");
    }
  };

  const statusVariant = (status) => {
    if (status === "shortlisted") return "success";
    if (status === "reviewed") return "default";
    if (status === "rejected") return "danger";
    if (status === "interview") return "warning";
    if (status === "hired") return "success";
    return "warning";
  };

  const skillChips = useMemo(() => {
    if (!candidate?.skills) return [];
    return String(candidate.skills)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [candidate]);

  return (
    <DashboardLayout
      title="Candidate Review"
      subtitle="Review candidate details and manage pipeline progress."
    >
      <div style={pageGridStyle}>
        <div style={sideStackStyle}>
          <Card
            title={candidate?.name || "Candidate"}
            subtitle="Core profile and professional snapshot."
          >
            <div style={{ display: "grid", gap: "16px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                }}
              >
                <img
                  src={
                    candidate?.profile_image ||
                    "https://via.placeholder.com/72x72.png?text=User"
                  }
                  alt={candidate?.name || "Candidate"}
                  style={{
                    width: "72px",
                    height: "72px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "1px solid #e2e8f0",
                  }}
                />
                <div>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    {candidate?.name || "N/A"}
                  </div>
                  <div style={{ color: "#64748b", fontSize: "14px" }}>
                    {candidate?.professional_title || "No title added"}
                  </div>
                </div>
              </div>

              <div>
                <div style={sectionLabelStyle}>Email</div>
                <div style={valueStyle}>{candidate?.email || "N/A"}</div>
              </div>

              <div>
                <div style={sectionLabelStyle}>Phone</div>
                <div style={valueStyle}>{candidate?.phone || "N/A"}</div>
              </div>

              <div>
                <div style={sectionLabelStyle}>Location</div>
                <div style={valueStyle}>
                  {[candidate?.city, candidate?.country].filter(Boolean).join(", ") || "N/A"}
                </div>
              </div>

              <div>
                <div style={sectionLabelStyle}>Years of Experience</div>
                <div style={valueStyle}>
                  {candidate?.years_of_experience ?? "N/A"}
                </div>
              </div>

              <div>
                <div style={sectionLabelStyle}>Professional Summary</div>
                <div style={valueStyle}>
                  {candidate?.professional_summary || "No summary added."}
                </div>
              </div>

              <div>
                <div style={sectionLabelStyle}>Skills</div>
                {skillChips.length > 0 ? (
                  <div style={chipWrapStyle}>
                    {skillChips.map((skill) => (
                      <span key={skill} style={chipStyle}>
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div style={valueStyle}>No skills added.</div>
                )}
              </div>

              <div>
                <div style={sectionLabelStyle}>Links</div>
                <div style={{ display: "grid", gap: "8px" }}>
                  {candidate?.linkedin_url && (
                    <a href={candidate.linkedin_url} target="_blank" rel="noreferrer">
                      LinkedIn
                    </a>
                  )}
                  {candidate?.github_url && (
                    <a href={candidate.github_url} target="_blank" rel="noreferrer">
                      GitHub
                    </a>
                  )}
                  {candidate?.portfolio_url && (
                    <a href={candidate.portfolio_url} target="_blank" rel="noreferrer">
                      Portfolio
                    </a>
                  )}
                  {candidate?.resume_url && (
                    <a href={candidate.resume_url} target="_blank" rel="noreferrer">
                      Resume
                    </a>
                  )}
                  {!candidate?.linkedin_url &&
                    !candidate?.github_url &&
                    !candidate?.portfolio_url &&
                    !candidate?.resume_url && (
                      <div style={valueStyle}>No links provided.</div>
                    )}
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div style={{ display: "grid", gap: "18px" }}>
          <Card
            title="Application Pipeline"
            subtitle="Track every application and move the candidate through the hiring process."
          >
            {applications.length === 0 ? (
              <p style={{ color: "#64748b", marginBottom: 0 }}>
                This candidate has not submitted any applications yet.
              </p>
            ) : (
              <div style={{ display: "grid", gap: "14px" }}>
                {applications.map((application) => (
                  <div key={application.id} style={applicationCardStyle}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                        gap: "12px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontWeight: 700,
                            color: "#0f172a",
                            fontSize: "16px",
                          }}
                        >
                          {application.job_title || "Unknown job"}
                        </div>
                        <div style={{ color: "#64748b", marginTop: "4px" }}>
                          {application.company_name || "Unknown company"}
                        </div>
                      </div>

                      <Badge variant={statusVariant(application.status)}>
                        {application.status || "pending"}
                      </Badge>
                    </div>

                    <div>
                      <div style={sectionLabelStyle}>Cover Letter</div>
                      <div style={valueStyle}>
                        {application.cover_letter || "No cover letter submitted."}
                      </div>
                    </div>

                    <div style={rowGridStyle}>
                      <Input
                        as="select"
                        label="Update Status"
                        value={application.status || "pending"}
                        onChange={(e) =>
                          updateStatus(application.id, e.target.value)
                        }
                        options={[
                          { value: "pending", label: "Pending" },
                          { value: "reviewed", label: "Reviewed" },
                          { value: "shortlisted", label: "Shortlisted" },
                          { value: "interview", label: "Interview" },
                          { value: "hired", label: "Hired" },
                          { value: "rejected", label: "Rejected" },
                        ]}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card
            title="Candidate Background"
            subtitle="Structured hiring information for deeper review."
          >
            <div style={{ display: "grid", gap: "20px" }}>
              <div>
                <div style={sectionLabelStyle}>Work Experience</div>
                {Array.isArray(candidate?.experience) && candidate.experience.length > 0 ? (
                  <div style={{ display: "grid", gap: "12px" }}>
                    {candidate.experience.map((item, index) => (
                      <div key={index} style={applicationCardStyle}>
                        <div style={{ fontWeight: 700, color: "#0f172a" }}>
                          {item.job_title || "Untitled Role"}
                        </div>
                        <div style={{ color: "#334155" }}>
                          {item.company || "Unknown Company"}
                        </div>
                        <div style={{ color: "#64748b", fontSize: "14px" }}>
                          {[item.location, item.start_date, item.end_date]
                            .filter(Boolean)
                            .join(" • ")}
                        </div>
                        <div style={valueStyle}>
                          {item.description || "No description provided."}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={valueStyle}>No work experience provided.</div>
                )}
              </div>

              <div>
                <div style={sectionLabelStyle}>Education</div>
                {Array.isArray(candidate?.education) && candidate.education.length > 0 ? (
                  <div style={{ display: "grid", gap: "12px" }}>
                    {candidate.education.map((item, index) => (
                      <div key={index} style={applicationCardStyle}>
                        <div style={{ fontWeight: 700, color: "#0f172a" }}>
                          {item.degree || "Education Record"}
                        </div>
                        <div style={{ color: "#334155" }}>
                          {item.institution || "Unknown Institution"}
                        </div>
                        <div style={{ color: "#64748b", fontSize: "14px" }}>
                          {[item.field_of_study, item.start_year, item.end_year]
                            .filter(Boolean)
                            .join(" • ")}
                        </div>
                        <div style={valueStyle}>
                          {item.description || "No additional details provided."}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={valueStyle}>No education details provided.</div>
                )}
              </div>

              <div>
                <div style={sectionLabelStyle}>Certifications</div>
                {Array.isArray(candidate?.certifications) &&
                candidate.certifications.length > 0 ? (
                  <div style={{ display: "grid", gap: "12px" }}>
                    {candidate.certifications.map((item, index) => (
                      <div key={index} style={applicationCardStyle}>
                        <div style={{ fontWeight: 700, color: "#0f172a" }}>
                          {item.name || "Certification"}
                        </div>
                        <div style={{ color: "#334155" }}>
                          {item.issuer || "Unknown Issuer"}
                        </div>
                        <div style={{ color: "#64748b", fontSize: "14px" }}>
                          {[item.issue_date, item.expiry_date]
                            .filter(Boolean)
                            .join(" • ")}
                        </div>
                        {item.credential_url ? (
                          <a
                            href={item.credential_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View Credential
                          </a>
                        ) : (
                          <div style={valueStyle}>No credential link.</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={valueStyle}>No certifications provided.</div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default EmployerCandidateDetail;