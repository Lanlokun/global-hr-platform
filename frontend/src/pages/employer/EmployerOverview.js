import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";

function EmployerOverview() {
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [companiesRes, jobsRes, applicationsRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/api/companies`),
          axios.get(`${process.env.REACT_APP_API_URL}/api/jobs`),
          axios.get(`${process.env.REACT_APP_API_URL}/api/applications`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }),
        ]);

        setCompanies(companiesRes.data);
        setJobs(jobsRes.data);
        setApplications(applicationsRes.data);
      } catch (error) {
        console.error(error);
      }
    };

    loadData();
  }, []);

  return (
    <DashboardLayout
      title="Employer Overview"
      subtitle="Monitor your workforce setup and hiring activity."
    >

      <div className="dashboard-grid">
        <div className="dashboard-stat">
          <span>Total Companies</span>
          <strong>{companies.length}</strong>
        </div>
        <div className="dashboard-stat">
          <span>Total Jobs</span>
          <strong>{jobs.length}</strong>
        </div>
        <div className="dashboard-stat">
          <span>Applications</span>
          <strong>{applications.length}</strong>
        </div>
      </div>

      <Card
      >
        <p style={{ color: "#64748b", marginBottom: 0 }}>
          Use the left sidebar to manage companies, jobs, and applications separately.
        </p>
      </Card>
    </DashboardLayout>
  );
}

export default EmployerOverview;