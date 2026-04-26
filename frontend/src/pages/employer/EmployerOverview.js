import { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";

function EmployerOverview() {
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };

  const fetchData = useCallback(async () => {
    try {
      const [companyRes, jobsRes, applicantsRes] = await Promise.all([
        api.get("/api/employer/company", authHeaders),
        api.get("/api/employer/jobs", authHeaders),
        api.get("/api/employer/applicants", authHeaders),
      ]);

      setCompany(companyRes.data.company);
      setJobs(jobsRes.data);
      setApplicants(applicantsRes.data);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to load employer overview");
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <DashboardLayout
      title="Employer Overview"
      subtitle="Your company hiring workspace."
    >
      <PageHeader
        title="Company Workspace"
        subtitle="Manage your company profile, jobs, applicants, and talent discovery."
        action={<Badge variant="success">{company ? "Company linked" : "Setup needed"}</Badge>}
      />

      <div className="dashboard-grid">
        <div className="dashboard-stat">
          <span>My Company</span>
          <strong>{company ? company.name : "Not set"}</strong>
        </div>
        <div className="dashboard-stat">
          <span>My Jobs</span>
          <strong>{jobs.length}</strong>
        </div>
        <div className="dashboard-stat">
          <span>Applicants</span>
          <strong>{applicants.length}</strong>
        </div>
      </div>

      <Card
        title="Workspace Summary"
        subtitle="This company-facing area is scoped only to your organization."
      >
        <p style={{ color: "#64748b", marginBottom: 0 }}>
          Use My Company to manage your organization profile, Jobs to publish roles,
          Applicants to review candidates who applied to your jobs, and Talent Directory
          to browse the wider marketplace.
        </p>
      </Card>
    </DashboardLayout>
  );
}

export default EmployerOverview;