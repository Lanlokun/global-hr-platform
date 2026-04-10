import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import DashboardLayout from "../layouts/DashboardLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import PageHeader from "../components/ui/PageHeader";

function CandidateDashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");
  const [jobs, setJobs] = useState([]);

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/jobs`);
      setJobs(res.data);
    } catch {
      toast.error("Failed to load jobs");
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const applyToJob = async (jobId) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/applications`,
        {
          job_id: jobId,
          user_id: user.id,
          cover_letter: "I am interested in this opportunity.",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Application submitted");
    } catch (error) {
      toast.error(error.response?.data?.error || "Application failed");
    }
  };

  return (
    <DashboardLayout
      title="Candidate Dashboard"
      subtitle="Explore roles, apply faster, and manage your job journey."
    >
      <PageHeader
        title="Opportunities"
        subtitle="Browse current roles and take the next step in your career."
        action={<Badge variant="default">Profile ready</Badge>}
      />

      <div className="dashboard-grid">
        <div className="dashboard-stat">
          <span>Available Jobs</span>
          <strong>{jobs.length}</strong>
        </div>
        <div className="dashboard-stat">
          <span>Application Status</span>
          <strong>Live</strong>
        </div>
        <div className="dashboard-stat">
          <span>Candidate Mode</span>
          <strong>Active</strong>
        </div>
      </div>

      <Card
        title="Available Jobs"
        subtitle="Review open positions and apply directly from your workspace."
      >
        {jobs.length === 0 ? (
          <p style={{ color: "#64748b", marginBottom: 0 }}>No jobs available.</p>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {jobs.map((job) => (
              <div
                key={job.id}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "18px",
                  padding: "18px",
                  background: "#fff",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start" }}>
                  <div>
                    <h4 style={{ marginTop: 0, marginBottom: "8px" }}>{job.title}</h4>
                    <p style={{ margin: "0 0 6px", color: "#475569" }}>Company: {job.company_name}</p>
                    <p style={{ margin: "0 0 6px", color: "#475569" }}>Location: {job.location}</p>
                    <p style={{ margin: 0, color: "#475569" }}>Salary: {job.salary_range}</p>
                  </div>
                  <Badge variant="success">Open</Badge>
                </div>

                <div style={{ height: 16 }} />
                <Button onClick={() => applyToJob(job.id)}>Apply now</Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}

export default CandidateDashboard;