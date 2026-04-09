import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Input from "../../components/ui/Input";

function EmployerCandidateDetail() {
  const token = localStorage.getItem("token");
  const { id } = useParams();
  const [candidate, setCandidate] = useState(null);
  const [applications, setApplications] = useState([]);

  const fetchCandidate = useCallback(async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/candidates/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCandidate(res.data.candidate);
      setApplications(res.data.applications);
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
        `http://localhost:5000/api/applications/${applicationId}/status`,
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
    return "warning";
  };

  return (
    <DashboardLayout
      title="Candidate Detail"
      subtitle="View candidate profile and manage their pipeline progress."
    >
      <div 
        className="candidate-detail-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(320px, 380px) minmax(0, 1fr)",
          gap: "18px",
          alignItems: "start",
        }}
      >
        <Card title={candidate?.name || "Candidate"} subtitle="Core candidate information.">
          <div
            style={{
              display: "grid",
              gap: "14px",
            }}
          >
            <div>
              <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "4px" }}>
                Name
              </div>
              <div style={{ fontWeight: 600, color: "#0f172a" }}>
                {candidate?.name || "N/A"}
              </div>
            </div>

            <div>
              <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "4px" }}>
                Email
              </div>
              <div
                style={{
                  fontWeight: 500,
                  color: "#0f172a",
                  wordBreak: "break-word",
                }}
              >
                {candidate?.email || "N/A"}
              </div>
            </div>

            <div>
              <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "4px" }}>
                Country
              </div>
              <div>{candidate?.country || "N/A"}</div>
            </div>

            <div>
              <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "4px" }}>
                Professional Title
              </div>
              <div>{candidate?.professional_title || "N/A"}</div>
            </div>

            <div>
              <div style={{ fontSize: "13px", color: "#64748b", marginBottom: "4px" }}>
                Skills
              </div>
              <div
                style={{
                  color: "#0f172a",
                  lineHeight: 1.7,
                  wordBreak: "break-word",
                }}
              >
                {candidate?.skills || "N/A"}
              </div>
            </div>
          </div>
        </Card>

        <Card
          title="Application History"
          subtitle="All jobs this candidate has applied to."
        >
          {applications.length === 0 ? (
            <p style={{ color: "#64748b", marginBottom: 0 }}>
              This candidate has not submitted any applications yet.
            </p>
          ) : (
            <div
              className="ui-table-wrap"
              style={{
                width: "100%",
                overflowX: "auto",
              }}
            >
              <table
                className="ui-table"
                style={{
                  minWidth: "760px",
                  width: "100%",
                }}
              >
                <thead>
                  <tr>
                    <th style={{ width: "180px" }}>Job</th>
                    <th style={{ width: "160px" }}>Company</th>
                    <th>Cover Letter</th>
                    <th style={{ width: "120px" }}>Status</th>
                    <th style={{ width: "180px" }}>Update</th>
                  </tr>
                </thead>

                <tbody>
                  {applications.map((application) => (
                    <tr key={application.id}>
                      <td>{application.job_title || "Unknown job"}</td>

                      <td>{application.company_name || "Unknown company"}</td>

                      <td style={{ maxWidth: "280px" }}>
                        <div
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={application.cover_letter || "No cover letter"}
                        >
                          {application.cover_letter || "No cover letter"}
                        </div>
                      </td>

                      <td>
                        <Badge variant={statusVariant(application.status)}>
                          {application.status || "pending"}
                        </Badge>
                      </td>

                      <td>
                        <Input
                          as="select"
                          value={application.status || "pending"}
                          onChange={(e) => updateStatus(application.id, e.target.value)}
                          options={[
                            { value: "pending", label: "Pending" },
                            { value: "reviewed", label: "Reviewed" },
                            { value: "shortlisted", label: "Shortlisted" },
                            { value: "rejected", label: "Rejected" },
                          ]}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default EmployerCandidateDetail;