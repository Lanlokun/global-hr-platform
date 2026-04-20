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
  gridTemplateColumns: "1.5fr 1.2fr 1.2fr 1fr 1.2fr",
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
  gridTemplateColumns: "1.5fr 1.2fr 1.2fr 1f 1.2fr",
  gap: "12px",
  padding: "16px",
  borderBottom: "1px solid #f1f5f9",
  alignItems: "center",
};

const cellStyle = {
  fontSize: "14px",
  color: "#0f172a",
};

function AdminApplications() {
  const token = localStorage.getItem("token");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/applications`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setApplications(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Failed to fetch applications:", error);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [token]);

  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const matchesSearch =
        !search ||
        application.job_title?.toLowerCase().includes(search.toLowerCase()) ||
        application.candidate_name?.toLowerCase().includes(search.toLowerCase()) ||
        application.company_name?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "all" || application.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: applications.length,
      pending: applications.filter((a) => a.status === "pending").length,
      reviewed: applications.filter((a) => a.status === "reviewed").length,
      shortlisted: applications.filter((a) => a.status === "shortlisted").length,
      rejected: applications.filter((a) => a.status === "rejected").length,
      interview: applications.filter((a) => a.status === "interview").length,
      hired: applications.filter((a) => a.status === "hired").length,
    };
  }, [applications]);

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "shortlisted": return "success";
      case "reviewed": return "default";
      case "rejected": return "danger";
      case "interview": return "warning";
      case "hired": return "success";
      case "pending":
      default: return "warning";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <DashboardLayout title="Application Management" subtitle="Loading applications...">
        <Card>
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
            Loading application data...
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Application Management"
      subtitle="Monitor all job applications across the platform."
    >
      <div style={pageGridStyle}>
        <Card title="Total Applications" subtitle="All submitted applications">
          <div style={{ fontSize: "32px", fontWeight: 800, color: "#0f172a" }}>
            {stats.total}
          </div>
        </Card>
        <Card title="Pending" subtitle="Awaiting review">
          <div style={{ fontSize: "32px", fontWeight: 800, color: "#f59e0b" }}>
            {stats.pending}
          </div>
        </Card>
        <Card title="Shortlisted" subtitle="Candidates in consideration">
          <div style={{ fontSize: "32px", fontWeight: 800, color: "#10b981" }}>
            {stats.shortlisted}
          </div>
        </Card>
        <Card title="Hired" subtitle="Successful placements">
          <div style={{ fontSize: "32px", fontWeight: 800, color: "#6366f1" }}>
            {stats.hired}
          </div>
        </Card>
      </div>

      <Card title="Application Pipeline" subtitle="Track and filter all applications.">
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "2fr 1fr", 
          gap: "12px", 
          marginBottom: "20px" 
        }}>
          <Input
            placeholder="Search by job, candidate, or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Input
            as="select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: "all", label: "All Status" },
              { value: "pending", label: "Pending" },
              { value: "reviewed", label: "Reviewed" },
              { value: "shortlisted", label: "Shortlisted" },
              { value: "interview", label: "Interview" },
              { value: "hired", label: "Hired" },
              { value: "rejected", label: "Rejected" },
            ]}
          />
        </div>

        <div style={tableStyle}>
          <div style={tableHeaderStyle}>
            <span>Application</span>
            <span>Candidate</span>
            <span>Company</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          
          <div>
            {filteredApplications.length === 0 ? (
              <div style={{ 
                textAlign: "center", 
                padding: "40px", 
                color: "#64748b",
                gridColumn: "1 / -1"
              }}>
                No applications found matching your criteria.
              </div>
            ) : (
              filteredApplications.map((application) => (
                <div key={application.id} style={rowStyle}>
                  <div style={cellStyle}>
                    <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                      {application.job_title || "Unknown Job"}
                    </div>
                    <div style={{ fontSize: "13px", color: "#64748b" }}>
                      Applied {formatDate(application.created_at)}
                    </div>
                  </div>
                  
                  <div style={cellStyle}>
                    <div style={{ fontWeight: 600 }}>
                      {application.candidate_name || "Unknown Candidate"}
                    </div>
                    <div style={{ fontSize: "13px", color: "#64748b" }}>
                      {application.candidate_email || "Email not available"}
                    </div>
                  </div>
                  
                  <div style={cellStyle}>
                    <div style={{ fontWeight: 600 }}>
                      {application.company_name || "Unknown Company"}
                    </div>
                    <div style={{ fontSize: "13px", color: "#64748b" }}>
                      {application.location || "Location not specified"}
                    </div>
                  </div>
                  
                  <div>
                    <Badge variant={getStatusBadgeVariant(application.status)}>
                      {application.status || "pending"}
                    </Badge>
                  </div>
                  
                  <div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
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

export default AdminApplications;