import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";

function CandidateOverview() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [jobsRes, applicationsRes] = await Promise.all([
          axios.get("http://localhost:5000/api/jobs"),
          axios.get("http://localhost:5000/api/applications", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        setJobs(jobsRes.data);
        setApplications(
          applicationsRes.data.filter((item) => Number(item.user_id) === Number(user.id))
        );
      } catch (error) {
        console.error(error);
      }
    };

    loadData();
  }, [token, user.id]);

  return (
    <DashboardLayout
      title="Candidate "
      subtitle="Track Overview your opportunities and application progress."
    >
      <div className="dashboard-grid">
        <div className="dashboard-stat">
          <span>Available Jobs</span>
          <strong>{jobs.length}</strong>
        </div>
        <div className="dashboard-stat">
          <span>Your Applications</span>
          <strong>{applications.length}</strong>
        </div>
        <div className="dashboard-stat">
          <span>Profile Status</span>
          <strong>Active</strong>
        </div>
      </div>

      <Card
        title="Candidate Summary"
        subtitle="Use the sidebar to browse jobs, manage applications, and update your profile."
      >
        <p style={{ color: "#64748b", marginBottom: 0 }}>
          Stay organized as you explore roles and follow your hiring journey.
        </p>
      </Card>
    </DashboardLayout>
  );
}

export default CandidateOverview;