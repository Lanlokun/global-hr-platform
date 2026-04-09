import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import DashboardLayout from "../layouts/DashboardLayout";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import PageHeader from "../components/ui/PageHeader";

function EmployerDashboard() {
  const token = localStorage.getItem("token");
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [companyForm, setCompanyForm] = useState({
    name: "",
    industry: "",
    country: "",
  });

  const [jobForm, setJobForm] = useState({
    company_id: "",
    title: "",
    description: "",
    location: "",
    salary_range: "",
    remote: true,
  });

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchCompanies = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/companies");
      setCompanies(res.data);
    } catch {
      toast.error("Failed to load companies");
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/jobs");
      setJobs(res.data);
    } catch {
      toast.error("Failed to load jobs");
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchJobs();
  }, []);

  const createCompany = async () => {
    try {
      await axios.post("http://localhost:5000/api/companies", companyForm, authHeaders);
      toast.success("Company created");
      setCompanyForm({ name: "", industry: "", country: "" });
      fetchCompanies();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create company");
    }
  };

  const createJob = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/jobs",
        { ...jobForm, company_id: Number(jobForm.company_id) },
        authHeaders
      );
      toast.success("Job created");
      setJobForm({
        company_id: "",
        title: "",
        description: "",
        location: "",
        salary_range: "",
        remote: true,
      });
      fetchJobs();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create job");
    }
  };

  return (
    <DashboardLayout
      title="Employer Dashboard"
      subtitle="Manage companies, publish roles, and track hiring activity."
    >
      <PageHeader
        title="Workforce Overview"
        subtitle="Create structure for your hiring operations and keep everything in one premium workspace."
        action={<Badge variant="success">Live workspace</Badge>}
      />

      <div className="dashboard-grid">
        <div className="dashboard-stat">
          <span>Total Companies</span>
          <strong>{companies.length}</strong>
        </div>
        <div className="dashboard-stat">
          <span>Open Jobs</span>
          <strong>{jobs.length}</strong>
        </div>
        <div className="dashboard-stat">
          <span>Workspace Status</span>
          <strong>Active</strong>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px", marginBottom: "24px" }}>
        <Card
          title="Create Company"
          subtitle="Set up a company profile before publishing new roles."
        >
          <Input
            label="Company name"
            placeholder="Global HR Inc"
            value={companyForm.name}
            onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
          />
          <div style={{ height: 14 }} />
          <Input
            label="Industry"
            placeholder="HR Tech"
            value={companyForm.industry}
            onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })}
          />
          <div style={{ height: 14 }} />
          <Input
            label="Country"
            placeholder="Japan"
            value={companyForm.country}
            onChange={(e) => setCompanyForm({ ...companyForm, country: e.target.value })}
          />
          <div style={{ height: 16 }} />
          <Button onClick={createCompany} fullWidth>
            Create Company
          </Button>
        </Card>

        <Card
          title="Create Job"
          subtitle="Publish a role and make it visible to qualified candidates."
        >
          <Input
            label="Company"
            as="select"
            value={jobForm.company_id}
            onChange={(e) => setJobForm({ ...jobForm, company_id: e.target.value })}
            options={[
              { value: "", label: "Select company" },
              ...companies.map((company) => ({
                value: company.id,
                label: company.name,
              })),
            ]}
          />
          <div style={{ height: 14 }} />
          <Input
            label="Job title"
            placeholder="Backend Developer"
            value={jobForm.title}
            onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
          />
          <div style={{ height: 14 }} />
          <Input
            label="Description"
            as="textarea"
            rows={5}
            placeholder="Describe the role and responsibilities"
            value={jobForm.description}
            onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
          />
          <div style={{ height: 14 }} />
          <Input
            label="Location"
            placeholder="Remote"
            value={jobForm.location}
            onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
          />
          <div style={{ height: 14 }} />
          <Input
            label="Salary range"
            placeholder="$3000 - $5000"
            value={jobForm.salary_range}
            onChange={(e) => setJobForm({ ...jobForm, salary_range: e.target.value })}
          />
          <div style={{ height: 14 }} />
          <label className="auth-checkbox">
            <input
              type="checkbox"
              checked={jobForm.remote}
              onChange={(e) => setJobForm({ ...jobForm, remote: e.target.checked })}
            />
            Remote role
          </label>
          <div style={{ height: 16 }} />
          <Button onClick={createJob} fullWidth>
            Publish Job
          </Button>
        </Card>
      </div>

      <Card
        title="Recent Jobs"
        subtitle="A quick view of the latest roles in your workspace."
      >
        {jobs.length === 0 ? (
          <p style={{ color: "#64748b", marginBottom: 0 }}>No jobs yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "12px" }}>
            {jobs.map((job) => (
              <div
                key={job.id}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "16px",
                  padding: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "14px",
                }}
              >
                <div>
                  <strong style={{ display: "block", marginBottom: "6px" }}>{job.title}</strong>
                  <span style={{ color: "#64748b", fontSize: "14px" }}>
                    {job.company_name} • {job.location}
                  </span>
                </div>
                <Badge>{job.salary_range || "Open"}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </DashboardLayout>
  );
}

export default EmployerDashboard;