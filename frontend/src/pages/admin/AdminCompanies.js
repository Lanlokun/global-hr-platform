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

function AdminCompanies() {
  const token = localStorage.getItem("token");
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/admin/companies`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCompanies(Array.isArray(res.data) ? res.data : []);
      } catch (error) {
        console.error("Failed to fetch companies:", error);
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [token]);

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      const matchesSearch =
        !search ||
        company.name?.toLowerCase().includes(search.toLowerCase()) ||
        company.industry?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus = statusFilter === "all" || 
        (statusFilter === "active" && !company.is_deleted) ||
        (statusFilter === "inactive" && company.is_deleted);

      return matchesSearch && matchesStatus;
    });
  }, [companies, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: companies.length,
      active: companies.filter((c) => !c.is_deleted).length,
      inactive: companies.filter((c) => c.is_deleted).length,
      withJobs: companies.filter((c) => c.job_count > 0).length,
      totalJobs: companies.reduce((sum, c) => sum + (c.job_count || 0), 0),
    };
  }, [companies]);

  const getIndustryBadgeVariant = (industry) => {
    const industries = {
      "Technology": "default",
      "Finance": "success",
      "Healthcare": "warning",
      "Education": "info",
      "Manufacturing": "danger",
    };
    return industries[industry] || "secondary";
  };

  const getStatusBadgeVariant = (company) => {
    return company.is_deleted ? "danger" : "success";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <DashboardLayout title="Company Management" subtitle="Loading companies...">
        <Card>
          <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
            Loading company data...
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Company Management"
      subtitle="Manage all registered companies and their activities."
    >
      <div style={pageGridStyle}>
        <Card title="Total Companies" subtitle="All registered companies">
          <div style={{ fontSize: "32px", fontWeight: 800, color: "#0f172a" }}>
            {stats.total}
          </div>
        </Card>
        <Card title="Active" subtitle="Currently active companies">
          <div style={{ fontSize: "32px", fontWeight: 800, color: "#16a34a" }}>
            {stats.active}
          </div>
        </Card>
        <Card title="With Jobs" subtitle="Companies with posted jobs">
          <div style={{ fontSize: "32px", fontWeight: 800, color: "#2563eb" }}>
            {stats.withJobs}
          </div>
        </Card>
        <Card title="Total Jobs" subtitle="All posted jobs across companies">
          <div style={{ fontSize: "32px", fontWeight: 800, color: "#7c3aed" }}>
            {stats.totalJobs}
          </div>
        </Card>
      </div>

      <Card title="Company Directory" subtitle="Search and filter all registered companies.">
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "2fr 1fr", 
          gap: "12px", 
          marginBottom: "20px" 
        }}>
          <Input
            placeholder="Search by company name or industry..."
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
        </div>

        <div style={tableStyle}>
          <div style={tableHeaderStyle}>
            <span>Company</span>
            <span>Industry</span>
            <span>Location</span>
            <span>Jobs</span>
            <span>Actions</span>
          </div>
          
          <div>
            {filteredCompanies.length === 0 ? (
              <div style={{ 
                textAlign: "center", 
                padding: "40px", 
                color: "#64748b",
                gridColumn: "1 / -1"
              }}>
                No companies found matching your criteria.
              </div>
            ) : (
              filteredCompanies.map((company) => (
                <div key={company.id} style={rowStyle}>
                  <div style={cellStyle}>
                    <div style={{ fontWeight: 600, marginBottom: "4px" }}>
                      {company.name || "Unknown Company"}
                    </div>
                    <div style={{ fontSize: "13px", color: "#64748b" }}>
                      {company.description ? 
                        (company.description.length > 60 ? 
                          company.description.substring(0, 60) + "..." : 
                          company.description
                        ) : "No description"
                      }
                    </div>
                  </div>
                  
                  <div>
                    <Badge variant={getIndustryBadgeVariant(company.industry)}>
                      {company.industry || "Other"}
                    </Badge>
                  </div>
                  
                  <div style={cellStyle}>
                    {company.country || "Not specified"}
                  </div>
                  
                  <div style={cellStyle}>
                    <div style={{ fontWeight: 600 }}>
                      {company.job_count || 0}
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>
                      jobs posted
                    </div>
                  </div>
                  
                  <div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <Badge variant={getStatusBadgeVariant(company)}>
                        {company.is_deleted ? "Inactive" : "Active"}
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

export default AdminCompanies;