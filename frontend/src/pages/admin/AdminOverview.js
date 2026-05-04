import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { useLanguage } from "../../context/LanguageContext";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";

function AdminOverview() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [stats, setStats] = useState({
    users: 0,
    companies: 0,
    jobs: 0,
    applications: 0,
    candidates: 0,
  });

  const [notifications, setNotifications] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setLoading(true);

        const [statsRes, notificationsRes, activityRes, analyticsRes] =
          await Promise.all([
            api.get("/api/admin/stats"),
            api.get("/api/notifications"),
            api.get("/api/admin/activity"),
            api.get("/api/admin/analytics"),
          ]);

        setAnalytics(analyticsRes.data || []);

        setStats({
          users: statsRes.data.users || 0,
          companies: statsRes.data.companies || 0,
          jobs: statsRes.data.jobs || 0,
          applications: statsRes.data.applications || 0,
          candidates: statsRes.data.candidates || 0,
        });

        setNotifications(notificationsRes.data || []);
        setActivity(activityRes.data || []);
      } catch (error) {
        console.error("Failed to fetch admin dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const navigationItems = [
    {
      title: t("adminOverview.navigation.users.title"),
      subtitle: t("adminOverview.navigation.users.subtitle"),
      count: stats.users,
      path: "/admin/users",
      color: "#dc2626",
    },
    {
      title: t("adminOverview.navigation.companies.title"),
      subtitle: t("adminOverview.navigation.companies.subtitle"),
      count: stats.companies,
      path: "/admin/companies",
      color: "#2563eb",
    },
    {
      title: t("adminOverview.navigation.jobs.title"),
      subtitle: t("adminOverview.navigation.jobs.subtitle"),
      count: stats.jobs,
      path: "/admin/jobs",
      color: "#7c3aed",
    },
    {
      title: t("adminOverview.navigation.applications.title"),
      subtitle: t("adminOverview.navigation.applications.subtitle"),
      count: stats.applications,
      path: "/admin/applications",
      color: "#059669",
    },
    {
      title: t("adminOverview.navigation.candidates.title"),
      subtitle: t("adminOverview.navigation.candidates.subtitle"),
      count: stats.candidates,
      path: "/admin/candidates",
      color: "#ea580c",
    },
  ];

  const recentActivity = useMemo(() => {
    return activity.slice(0, 8).map((item) => ({
      type: item.type || "info",
      action: item.action,
      detail: item.detail,
      time: item.created_at
        ? new Date(item.created_at).toLocaleString()
        : t("adminOverview.activity.recent"),
    }));
  }, [activity, t]);

  const getActivityColor = (type) => {
    switch (type) {
      case "user":
        return "#dc2626";
      case "company":
        return "#2563eb";
      case "job":
        return "#7c3aed";
      case "application":
        return "#059669";
      case "success":
        return "#059669";
      case "warning":
        return "#f59e0b";
      case "danger":
        return "#dc2626";
      default:
        return "#2563eb";
    }
  };

  return (
    <DashboardLayout
      title={t("adminOverview.title")}
      subtitle={t("adminOverview.subtitle")}
    >
      <div style={pageGridStyle}>
        <Card
          title={t("adminOverview.stats.totalUsers")}
          subtitle={t("adminOverview.stats.totalUsersSub")}
        >
          <StatValue value={loading ? "..." : stats.users} color="#0f172a" />
        </Card>

        <Card
          title={t("adminOverview.stats.companies")}
          subtitle={t("adminOverview.stats.companiesSub")}
        >
          <StatValue value={loading ? "..." : stats.companies} color="#2563eb" />
        </Card>

        <Card
          title={t("adminOverview.stats.jobs")}
          subtitle={t("adminOverview.stats.jobsSub")}
        >
          <StatValue value={loading ? "..." : stats.jobs} color="#7c3aed" />
        </Card>

        <Card
          title={t("adminOverview.stats.applications")}
          subtitle={t("adminOverview.stats.applicationsSub")}
        >
          <StatValue
            value={loading ? "..." : stats.applications}
            color="#059669"
          />
        </Card>

        <Card
          title={t("adminOverview.stats.candidates")}
          subtitle={t("adminOverview.stats.candidatesSub")}
        >
          <StatValue
            value={loading ? "..." : stats.candidates}
            color="#ea580c"
          />
        </Card>
      </div>

      <Card
        title={t("adminOverview.navigation.title")}
        subtitle={t("adminOverview.navigation.subtitle")}
      >
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
              <div style={navCardHeaderStyle}>
                <div>
                  <h3 style={navCardTitleStyle}>{item.title}</h3>
                  <p style={navCardSubtitleStyle}>{item.subtitle}</p>
                </div>

                <Badge variant="default">{item.count}</Badge>
              </div>

              <Button variant="secondary" style={{ marginTop: "8px" }}>
                {t("adminOverview.navigation.manage").replace(
                  "{{item}}",
                  item.title
                )}
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <div style={bottomGridStyle}>
        <div style={analyticsGridStyle}>
          <Card
            title={t("adminOverview.analytics.growthTitle")}
            subtitle={t("adminOverview.analytics.growthSubtitle")}
          >
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={analytics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" strokeWidth={3} />
                  <Line type="monotone" dataKey="jobs" strokeWidth={3} />
                  <Line
                    type="monotone"
                    dataKey="applications"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card
            title={t("adminOverview.analytics.trendsTitle")}
            subtitle={t("adminOverview.analytics.trendsSubtitle")}
          >
            <div style={{ width: "100%", height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={analytics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="companies" />
                  <Bar dataKey="jobs" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <Card
          title={t("adminOverview.activity.title")}
          subtitle={t("adminOverview.activity.subtitle")}
        >
          {recentActivity.length === 0 ? (
            <p style={{ color: "#64748b", margin: 0 }}>
              {t("adminOverview.activity.empty")}
            </p>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {recentActivity.map((item, index) => (
                <div key={index} style={activityItemStyle}>
                  <div
                    style={{
                      ...activityIconStyle,
                      backgroundColor: `${getActivityColor(item.type)}20`,
                      color: getActivityColor(item.type),
                    }}
                  >
                    {item.action?.charAt(0)?.toUpperCase() || "A"}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={activityActionStyle}>{item.action}</div>
                    <div style={activityDetailStyle}>{item.detail}</div>
                  </div>

                  <div style={activityTimeStyle}>{item.time}</div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card
          title={t("adminOverview.health.title")}
          subtitle={t("adminOverview.health.subtitle")}
        >
          <div style={{ display: "grid", gap: "16px" }}>
            <HealthRow
              label={t("adminOverview.health.api")}
              value={t("adminOverview.health.operational")}
              success
            />
            <HealthRow
              label={t("adminOverview.health.database")}
              value={t("adminOverview.health.connected")}
              success
            />
            <HealthRow
              label={t("adminOverview.health.notifications")}
              value={notifications.length}
            />
            <HealthRow
              label={t("adminOverview.health.activityFeed")}
              value={activity.length}
            />
            <HealthRow
              label={t("adminOverview.health.uptime")}
              value="99.9%"
            />
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function StatValue({ value, color }) {
  return (
    <div
      style={{
        fontSize: "32px",
        fontWeight: 800,
        color,
      }}
    >
      {value}
    </div>
  );
}

function HealthRow({ label, value, success = false }) {
  return (
    <div style={healthRowStyle}>
      <span style={{ fontSize: "14px", color: "#64748b" }}>{label}</span>

      {success ? (
        <Badge variant="success">{value}</Badge>
      ) : (
        <span style={{ fontSize: "13px", color: "#0f172a", fontWeight: 700 }}>
          {value}
        </span>
      )}
    </div>
  );
}

const pageGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "20px",
  marginBottom: "24px",
};

const navigationGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "20px",
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

const navCardHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "12px",
};

const navCardTitleStyle = {
  margin: 0,
  fontSize: "18px",
  fontWeight: 700,
  color: "#0f172a",
};

const navCardSubtitleStyle = {
  margin: "4px 0 0",
  fontSize: "14px",
  color: "#64748b",
};

const bottomGridStyle = {
  display: "grid",
  gridTemplateColumns: "2fr 1fr",
  gap: "20px",
  marginTop: "24px",
};

const analyticsGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "20px",
};

const activityItemStyle = {
  display: "flex",
  gap: "12px",
  padding: "12px",
  border: "1px solid #f1f5f9",
  borderRadius: "12px",
  alignItems: "center",
};

const activityIconStyle = {
  width: "34px",
  height: "34px",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "14px",
  fontWeight: 800,
};

const activityActionStyle = {
  fontWeight: 700,
  fontSize: "14px",
  color: "#0f172a",
};

const activityDetailStyle = {
  fontSize: "13px",
  color: "#64748b",
};

const activityTimeStyle = {
  fontSize: "12px",
  color: "#94a3b8",
};

const healthRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
};

export default AdminOverview;