import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";

const pageGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "20px",
  marginBottom: "24px",
};

const navigationGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "20px",
  marginBottom: "24px",
};

const navCardStyle = {
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  padding: "20px",
  background: "#ffffff",
  cursor: "pointer",
  transition: "all 0.2s ease",
  display: "grid",
  gap: "12px",
};

const navCardHoverStyle = {
  ...navCardStyle,
  borderColor: "#3b82f6",
  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.15)",
};

function AdminOverview() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    users: 0,
    companies: 0,
    jobs: 0,
    applications: 0,
    candidates: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [usersRes, companiesRes, jobsRes, applicationsRes, candidatesRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/api/admin/users/stats`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/api/admin/companies/stats`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/api/admin/jobs/stats`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/api/admin/applications/stats`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/api/admin/candidates/stats`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
        ]);

        setStats({
          users: usersRes.data.total || 0,
          companies: companiesRes.data.total || 0,
          jobs: jobsRes.data.total || 0,
          applications: applicationsRes.data.total || 0,
          candidates: candidatesRes.data.total || 0,
        });
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
        // Set default values if API calls fail
        setStats({
          users: 0,
          companies: 0,
          jobs: 0,
          applications: 0,
          candidates: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  const navigationItems = [
    {
      title: "User Management",
      subtitle: "Manage platform users and access levels",
      icon: "Users",
      count: stats.users,
      path: "/admin/users",
      color: "#dc2626",
    },
    {
      title: "Company Management",
      subtitle: "Oversee registered companies and activities",
      icon: "Building",
      count: stats.companies,
      path: "/admin/companies",
      color: "#2563eb",
    },
    {
      title: "Job Management",
      subtitle: "Monitor all posted jobs and listings",
      icon: "Briefcase",
      count: stats.jobs,
      path: "/admin/jobs",
      color: "#7c3aed",
    },
    {
      title: "Application Tracking",
      subtitle: "Track job applications and hiring pipeline",
      icon: "FileText",
      count: stats.applications,
      path: "/admin/applications",
      color: "#059669",
    },
    {
      title: "Candidate Directory",
      subtitle: "Manage candidate profiles and activities",
      icon: "UserCircle",
      count: stats.candidates,
      path: "/admin/candidates",
      color: "#ea580c",
    },
  ];

  const recentActivity = useMemo(() => {
    return [
      { type: "user", action: "New user registration", time: "2 hours ago", detail: "John Doe - Software Engineer" },
      { type: "company", action: "New company registered", time: "4 hours ago", detail: "Tech Solutions Inc." },
      { type: "job", action: "New job posted", time: "6 hours ago", detail: "Frontend Developer at TechCorp" },
      { type: "application", action: "Application submitted", time: "8 hours ago", detail: "Senior Developer position" },
    ];
  }, []);

  const getActivityIcon = (type) => {
    switch (type) {
      case "user": return "User";
      case "company": return "Building";
      case "job": return "Briefcase";
      case "application": return "FileText";
      default: return "Circle";
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case "user": return "#dc2626";
      case "company": return "#2563eb";
      case "job": return "#7c3aed";
      case "application": return "#059669";
      default: return "#64748b";
    }
  };

  return (
    <DashboardLayout
      title="Admin Dashboard"
      subtitle="Platform overview and administrative controls."
    >
      <div style={pageGridStyle}>
        <Card title="Total Users" subtitle="All registered accounts">
          <div style={{ fontSize: "32px", fontWeight: 800, color: "#0f172a" }}>
            {loading ? "..." : stats.users}
          </div>
        </Card>
        <Card title="Companies" subtitle="Registered organizations">
          <div style={{ fontSize: "32px", fontWeight: 800, color: "#2563eb" }}>
            {loading ? "..." : stats.companies}
          </div>
        </Card>
        <Card title="Active Jobs" subtitle="Posted opportunities">
          <div style={{ fontSize: "32px", fontWeight: 800, color: "#7c3aed" }}>
            {loading ? "..." : stats.jobs}
          </div>
        </Card>
        <Card title="Applications" subtitle="Job submissions">
          <div style={{ fontSize: "32px", fontWeight: 800, color: "#059669" }}>
            {loading ? "..." : stats.applications}
          </div>
        </Card>
      </div>

      <Card title="Admin Navigation" subtitle="Quick access to administrative tools.">
        <div style={navigationGridStyle}>
          {navigationItems.map((item) => (
            <div
              key={item.path}
              style={navCardStyle}
              onClick={() => navigate(item.path)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = item.color;
                e.currentTarget.style.boxShadow = `0 4px 12px ${item.color}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>
                    {item.title}
                  </h3>
                  <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#64748b" }}>
                    {item.subtitle}
                  </p>
                </div>
                <Badge variant="default" style={{ backgroundColor: `${item.color}20`, color: item.color }}>
                  {item.count}
                </Badge>
              </div>
              <Button variant="secondary" style={{ marginTop: "8px" }}>
                Manage {item.title.split(" ")[0]}
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "20px" }}>
        <Card title="Recent Platform Activity" subtitle="Latest actions across the platform.">
          <div style={{ display: "grid", gap: "12px" }}>
            {recentActivity.map((activity, index) => (
              <div key={index} style={{ 
                display: "flex", 
                gap: "12px", 
                padding: "12px", 
                border: "1px solid #f1f5f9", 
                borderRadius: "12px",
                alignItems: "center"
              }}>
                <div style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  backgroundColor: `${getActivityColor(activity.type)}20`,
                  color: getActivityColor(activity.type),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "14px",
                  fontWeight: 600,
                }}>
                  {getActivityIcon(activity.type)[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "14px", color: "#0f172a" }}>
                    {activity.action}
                  </div>
                  <div style={{ fontSize: "13px", color: "#64748b" }}>
                    {activity.detail}
                  </div>
                </div>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                  {activity.time}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="System Health" subtitle="Platform status and metrics.">
          <div style={{ display: "grid", gap: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "14px", color: "#64748b" }}>API Status</span>
              <Badge variant="success">Operational</Badge>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "14px", color: "#64748b" }}>Database</span>
              <Badge variant="success">Connected</Badge>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "14px", color: "#64748b" }}>Last Backup</span>
              <span style={{ fontSize: "13px", color: "#0f172a" }}>2 hours ago</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "14px", color: "#64748b" }}>Uptime</span>
              <span style={{ fontSize: "13px", color: "#0f172a" }}>99.9%</span>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

export default AdminOverview;