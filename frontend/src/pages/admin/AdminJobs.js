import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

const pageGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "20px",
  marginBottom: "24px",
};

const tableStyle = {
  width: "100%",
  overflowX: "auto",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  background: "#ffffff",
};

const tableHeaderStyle = {
  display: "grid",
  gridTemplateColumns: "2fr 1.5fr 1.2fr 1fr 1.2fr",
  gap: "12px",
  padding: "16px",
  background: "#f8fafc",
  borderBottom: "1px solid #e2e8f0",
  fontSize: "12px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  color: "#64748b",
};

const rowStyle = {
  display: "grid",
  gridTemplateColumns: "2fr 1.5fr 1.2fr 1fr 1.2fr",
  gap: "12px",
  padding: "16px",
  borderBottom: "1px solid #f1f5f9",
  alignItems: "center",
};

const cellStyle = {
  fontSize: "14px",
  color: "#0f172a",
};

function AdminJobs() {
  const token = localStorage.getItem("token");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/jobs`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setJobs(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Failed to fetch jobs:", error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [token]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        !search ||
        job.title?.toLowerCase().includes(search.toLowerCase()) ||
        job.company_name?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "active" && !job.is_deleted) ||
        (statusFilter === "inactive" && job.is_deleted);

      const matchesType = typeFilter === "all" || job.employment_type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [jobs, search, statusFilter, typeFilter]);

  const stats = useMemo(() => {
    return {
      total: jobs.length,
      active: jobs.filter((j) => !j.is_deleted).length,
      inactive: jobs.filter((j) => j.is_deleted).length,
      withApplications: jobs.filter((j) => j.application_count > 0).length,
      totalApplications: jobs.reduce((sum, j) => sum + (j.application_count || 0), 0),
    };
  }, [jobs]);

  const getTypeBadgeVariant = (type) => {
    const types = {
      "Full-time": "success",
      "Part-time": "warning",
      "Contract": "default",
      "Internship": "info",
      "Remote": "primary",
    };
    return types[type] || "secondary";
  };

  const getStatusBadgeVariant = (job) => {
    return job.is_deleted ? "danger" : "success";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <DashboardLayout title="Job Management" subtitle="Loading jobs...">
        <Card>
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
            Loading job data...
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Job Management"
      subtitle="Manage all posted jobs and their application activity."
    >
      <div style={pageGridStyle}>
        <Card title="Total Jobs" subtitle="All posted jobs">
          <div style={{ fontSize: "32px", fontWeight: 800, color: "#0f172a" }}>
            {stats.total}
          </div>
        </Card>
        <Card title="Active" subtitle="Currently active jobs">
          <div style={{ fontSize: "32px", fontWeight: 800, color: "#16a34a" }}>
            {stats.active}
          </div>
        </Card>
        <Card title="With Applications" subtitle="Jobs receiving applications">
          <div style={{ fontSize: "32px", fontWeight: 800, color: "#2563eb" }}>
            {stats.withApplications}
          </div>
        </Card>
        <Card title="Total Applications" subtitle="All job applications">
          <div style={{ fontSize: "32px", fontWeight: 800, color: "#7c3aed" }}>
            {stats.totalApplications}
          </div>
        </Card>
      </div>

      <Card title="Job Directory" subtitle="Search and filter all posted jobs.">
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "2fr 1fr 1fr", 
          gap: "12px", 
          marginBottom: "20px" 
        }}>
          <Input
            placeholder="Search by job title or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Input
            as="select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: "all", label: "All Status" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
          />
          <Input
            as="select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            options={[
              { value: "all", label: "All Types" },
              { value: "Full-time", label: "Full-time" },
              { value: "Part-time", label: "Part-time" },
              { value: "Contract", label: "Contract" },
              { value: "Internship", label: "Internship" },
              { value: "Remote", label: "Remote" },
            ]}
          />
        </div>

        <div style={tableStyle}>
          <div style={tableHeaderStyle}>
            <span>Job</span>
            <span>Company</span>
            <span>Type</span>
            <span>Applications</span>
            <span>Actions</span>
          </div>
          
          <div>
            {filteredJobs.length === 0 ? (
              <div style={{ 
                textAlign: "center", 
                padding: "40px", 
                color: "#64748b",
                gridColumn: "1 / -1"
              }}>
                No jobs found matching your criteria.
              </div>
            ) : (
              filteredJobs.map((job) => (
                <div key={job.id} style={rowStyle}>
                  <div style={cellStyle}>
                    <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                      {job.title || "Untitled Job"}
                    </div>
                    <div style={{ fontSize: "13px", color: "#64748b" }}>
                      {job.location || "Location not specified"}
                    </div>
                    <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                      Posted {formatDate(job.created_at)}
                    </div>
                  </div>
                  
                  <div style={cellStyle}>
                    <div style={{ fontWeight: 600 }}>
                      {job.company_name || "Unknown Company"}
                    </div>
                    <div style={{ fontSize: "13px", color: "#64748b" }}>
                      {job.industry || "Industry not specified"}
                    </div>
                  </div>
                  
                  <div>
                    <Badge variant={getTypeBadgeVariant(job.employment_type)}>
                      {job.employment_type || "Not specified"}
                    </Badge>
                  </div>
                  
                  <div style={cellStyle}>
                    <div style={{ fontWeight: 600 }}>
                      {job.application_count || 0}
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>
                      applications
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <Badge variant={getStatusBadgeVariant(job)}>
                        {job.is_deleted ? "Inactive" : "Active"}
                      </Badge>
                      <Button variant="secondary" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>
    </DashboardLayout>
  );
}

export default AdminJobs;