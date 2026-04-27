import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";

function EmployerOverview() {
  const token = localStorage.getItem("token");

  let user = {};
  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    user = {};
  }

  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [companiesRes, jobsRes, applicationsRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/api/companies`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/api/jobs`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          axios.get(`${process.env.REACT_APP_API_URL}/api/applications`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const companiesData = Array.isArray(companiesRes.data)
          ? companiesRes.data
          : [];
        const jobsData = Array.isArray(jobsRes.data) ? jobsRes.data : [];
        const applicationsData = Array.isArray(applicationsRes.data)
          ? applicationsRes.data
          : [];

        setCompanies(companiesData);
        setJobs(jobsData);
        setApplications(applicationsData);
      } catch (error) {
        console.error("Failed to load employer overview:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token]);

  const firstName =
    user?.first_name ||
    user?.name?.split(" ")?.[0] ||
    user?.full_name?.split(" ")?.[0] ||
    "Employer";

  const stats = useMemo(() => {
    const totalCompanies = companies.length;
    const totalJobs = jobs.length;
    const totalApplications = applications.length;

    const activeJobs = jobs.filter((job) => {
      const status = (job?.status || "").toLowerCase();
      return status === "active" || status === "open" || status === "";
    }).length;

    const shortlisted = applications.filter(
      (item) => (item.status || "").toLowerCase() === "shortlisted"
    ).length;

    const pending = applications.filter(
      (item) => (item.status || "").toLowerCase() === "pending"
    ).length;

    const reviewed = applications.filter(
      (item) => (item.status || "").toLowerCase() === "reviewed"
    ).length;

    return {
      totalCompanies,
      totalJobs,
      totalApplications,
      activeJobs,
      shortlisted,
      pending,
      reviewed,
    };
  }, [companies, jobs, applications]);

  const recentJobs = useMemo(() => {
    return [...jobs]
      .sort((a, b) => {
        const aDate = new Date(a?.created_at || a?.posted_at || 0).getTime();
        const bDate = new Date(b?.created_at || b?.posted_at || 0).getTime();
        return bDate - aDate;
      })
      .slice(0, 5);
  }, [jobs]);

  const recentApplications = useMemo(() => {
    return [...applications]
      .sort((a, b) => {
        const aDate = new Date(a?.created_at || a?.applied_at || 0).getTime();
        const bDate = new Date(b?.created_at || b?.applied_at || 0).getTime();
        return bDate - aDate;
      })
      .slice(0, 6);
  }, [applications]);

  const topRoles = useMemo(() => {
    const map = {};

    jobs.forEach((job) => {
      const title = job?.title || job?.job_title || "Untitled role";
      map[title] = (map[title] || 0) + 1;
    });

    return Object.entries(map)
      .map(([title, count]) => ({ title, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [jobs]);

  const topLocations = useMemo(() => {
    const map = {};

    jobs.forEach((job) => {
      const location =
        job?.country ||
        job?.location_country ||
        job?.location ||
        "Unspecified";
      map[location] = (map[location] || 0) + 1;
    });

    return Object.entries(map)
      .map(([location, count]) => ({ location, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [jobs]);

  const workModeMix = useMemo(() => {
    const remote = jobs.filter((job) =>
      (job?.work_mode || job?.job_type || job?.location_type || "")
        .toLowerCase()
        .includes("remote")
    ).length;

    const hybrid = jobs.filter((job) =>
      (job?.work_mode || job?.job_type || job?.location_type || "")
        .toLowerCase()
        .includes("hybrid")
    ).length;

    const onsite = jobs.filter((job) => {
      const mode = (
        job?.work_mode ||
        job?.job_type ||
        job?.location_type ||
        ""
      ).toLowerCase();

      return mode.includes("on-site") || mode.includes("onsite");
    }).length;

    const total = remote + hybrid + onsite || 1;

    return {
      remote,
      hybrid,
      onsite,
      remotePct: Math.round((remote / total) * 100),
      hybridPct: Math.round((hybrid / total) * 100),
      onsitePct: Math.round((onsite / total) * 100),
    };
  }, [jobs]);

  const applicationRate = useMemo(() => {
    if (!stats.totalJobs) return 0;
    return Math.round(stats.totalApplications / stats.totalJobs);
  }, [stats.totalApplications, stats.totalJobs]);

  const statusVariant = (status) => {
    switch ((status || "").toLowerCase()) {
      case "shortlisted":
        return "success";
      case "reviewed":
        return "default";
      case "rejected":
        return "danger";
      case "pending":
      default:
        return "warning";
    }
  };

  const formatDate = (value) => {
    if (!value) return "Not available";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not available";

    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <DashboardLayout
      title="Employer Overview"
      subtitle="Track hiring performance, job activity, and applicant flow across your organization."
    >
      <div style={styles.page}>
        <Card>
          <div style={styles.hero}>
            <div style={styles.heroContent}>
              <span style={styles.eyebrow}>Hiring dashboard</span>
              <h2 style={styles.heroTitle}>Welcome back, {firstName}</h2>
              <p style={styles.heroSubtitle}>
                Monitor your hiring pipeline, understand where demand is growing,
                and keep your open roles moving with the right candidates.
              </p>

              <div style={styles.heroTags}>
                <Badge variant="default">
                  {loading ? "..." : `${stats.totalCompanies} companies`}
                </Badge>
                <Badge variant="success">
                  {loading ? "..." : `${stats.activeJobs} active jobs`}
                </Badge>
                <Badge variant="warning">
                  {loading ? "..." : `${stats.totalApplications} applications`}
                </Badge>
              </div>
            </div>

            <div style={styles.heroPanel}>
              <div style={styles.heroPanelCard}>
                <span style={styles.heroPanelLabel}>Avg applications per job</span>
                <strong style={styles.heroPanelValue}>
                  {loading ? "..." : applicationRate}
                </strong>
                <p style={styles.heroPanelText}>
                  A quick signal of how efficiently your openings are attracting talent.
                </p>
              </div>
            </div>
          </div>
        </Card>

        <div style={styles.metricsGrid}>
          <MetricCard
            title="Companies"
            value={loading ? "..." : stats.totalCompanies}
            subtitle="Organizations currently managed"
          />
          <MetricCard
            title="Total Jobs"
            value={loading ? "..." : stats.totalJobs}
            subtitle="Published roles across the platform"
          />
          <MetricCard
            title="Active Jobs"
            value={loading ? "..." : stats.activeJobs}
            subtitle="Roles currently open to candidates"
          />
          <MetricCard
            title="Applications"
            value={loading ? "..." : stats.totalApplications}
            subtitle="Candidate submissions received"
          />
        </div>

        <div style={styles.mainGrid}>
          <Card
            title="Hiring Funnel"
            subtitle="Track movement from incoming applications to shortlisted candidates"
          >
            {loading ? (
              <EmptyMessage text="Loading hiring funnel..." />
            ) : (
              <div style={styles.funnelList}>
                <ProgressRow
                  label="Pending"
                  value={stats.pending}
                  max={Math.max(stats.totalApplications, 1)}
                />
                <ProgressRow
                  label="Reviewed"
                  value={stats.reviewed}
                  max={Math.max(stats.totalApplications, 1)}
                />
                <ProgressRow
                  label="Shortlisted"
                  value={stats.shortlisted}
                  max={Math.max(stats.totalApplications, 1)}
                />
              </div>
            )}
          </Card>

          <Card
            title="Work Mode Mix"
            subtitle="See how your hiring demand is distributed"
          >
            {loading ? (
              <EmptyMessage text="Loading work mode distribution..." />
            ) : (
              <div style={styles.funnelList}>
                <ProgressRow
                  label={`Remote · ${workModeMix.remotePct}%`}
                  value={workModeMix.remote}
                  max={Math.max(stats.totalJobs, 1)}
                />
                <ProgressRow
                  label={`Hybrid · ${workModeMix.hybridPct}%`}
                  value={workModeMix.hybrid}
                  max={Math.max(stats.totalJobs, 1)}
                />
                <ProgressRow
                  label={`On-site · ${workModeMix.onsitePct}%`}
                  value={workModeMix.onsite}
                  max={Math.max(stats.totalJobs, 1)}
                />
              </div>
            )}
          </Card>
        </div>

        <div style={styles.mainGrid}>
          <Card
            title="Most Active Hiring Roles"
            subtitle="The roles receiving the most hiring attention across your jobs"
          >
            {loading ? (
              <EmptyMessage text="Loading role activity..." />
            ) : topRoles.length === 0 ? (
              <EmptyMessage text="No role data available yet." />
            ) : (
              <div style={styles.listStack}>
                {topRoles.map((item) => (
                  <InsightRow
                    key={item.title}
                    title={item.title}
                    value={`${item.count} openings`}
                    meta="Published role volume"
                  />
                ))}
              </div>
            )}
          </Card>

          <Card
            title="Top Hiring Locations"
            subtitle="Regions where your hiring activity is strongest"
          >
            {loading ? (
              <EmptyMessage text="Loading hiring locations..." />
            ) : topLocations.length === 0 ? (
              <EmptyMessage text="No location data available yet." />
            ) : (
              <div style={styles.listStack}>
                {topLocations.map((item) => (
                  <InsightRow
                    key={item.location}
                    title={item.location}
                    value={`${item.count} jobs`}
                    meta="Current regional job demand"
                  />
                ))}
              </div>
            )}
          </Card>
        </div>

        <div style={styles.mainGrid}>
          <Card
            title="Newest Jobs"
            subtitle="Recently published roles that need close tracking"
          >
            {loading ? (
              <EmptyMessage text="Loading recent jobs..." />
            ) : recentJobs.length === 0 ? (
              <EmptyMessage text="No jobs published yet." />
            ) : (
              <div style={styles.listStack}>
                {recentJobs.map((job) => (
                  <div key={job.id} style={styles.infoCard}>
                    <div style={styles.infoCardTop}>
                      <div>
                        <h4 style={styles.infoTitle}>
                          {job.title || job.job_title || "Untitled role"}
                        </h4>
                        <p style={styles.infoMeta}>
                          {job.company_name || job.company || "Unknown company"}
                        </p>
                      </div>

                      <Badge variant="default">
                        {job.status || "active"}
                      </Badge>
                    </div>

                    <div style={styles.metaRow}>
                      <span style={styles.metaPill}>
                        {job.country ||
                          job.location_country ||
                          job.location ||
                          "Location not specified"}
                      </span>
                      <span style={styles.metaPill}>
                        Posted {formatDate(job.created_at || job.posted_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card
            title="Recent Applications"
            subtitle="Latest candidate interest coming into your roles"
          >
            {loading ? (
              <EmptyMessage text="Loading recent applications..." />
            ) : recentApplications.length === 0 ? (
              <EmptyMessage text="No applications received yet." />
            ) : (
              <div style={styles.listStack}>
                {recentApplications.map((application) => (
                  <div key={application.id} style={styles.infoCard}>
                    <div style={styles.infoCardTop}>
                      <div>
                        <h4 style={styles.infoTitle}>
                          {application.job_title || "Unknown role"}
                        </h4>
                        <p style={styles.infoMeta}>
                          {application.candidate_name || "Unknown candidate"}
                        </p>
                      </div>

                      <Badge variant={statusVariant(application.status)}>
                        {application.status || "pending"}
                      </Badge>
                    </div>

                    <div style={styles.metaRow}>
                      <span style={styles.metaPill}>
                        Applied {formatDate(application.created_at || application.applied_at)}
                      </span>
                      <span style={styles.metaPill}>
                        {application.company_name || "Company not specified"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <Card
          title="Recommended Focus"
          subtitle="Simple next actions to improve hiring performance"
        >
          <div style={styles.recommendationGrid}>
            <RecommendationCard
              title="Increase applicant flow"
              text="If applications per job remain low, revise titles, salary visibility, and role descriptions to improve conversion."
            />
            <RecommendationCard
              title="Prioritize active markets"
              text="Focus recruitment energy in the countries and roles already showing stronger job demand and candidate activity."
            />
            <RecommendationCard
              title="Shortlist faster"
              text="Reducing review delay helps you secure strong candidates before they move to competing employers."
            />
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function MetricCard({ title, value, subtitle }) {
  return (
    <div style={styles.metricCard}>
      <span style={styles.metricTitle}>{title}</span>
      <strong style={styles.metricValue}>{value}</strong>
      <p style={styles.metricSubtitle}>{subtitle}</p>
    </div>
  );
}

function InsightRow({ title, value, meta }) {
  return (
    <div style={styles.insightRow}>
      <div>
        <h4 style={styles.insightTitle}>{title}</h4>
        <p style={styles.insightMeta}>{meta}</p>
      </div>
      <strong style={styles.insightValue}>{value}</strong>
    </div>
  );
}

function ProgressRow({ label, value, max }) {
  const width = Math.max(8, Math.round((value / Math.max(max, 1)) * 100));

  return (
    <div style={styles.progressItem}>
      <div style={styles.progressTop}>
        <span style={styles.progressLabel}>{label}</span>
        <span style={styles.progressCount}>{value}</span>
      </div>
      <div style={styles.progressTrack}>
        <div style={{ ...styles.progressFill, width: `${width}%` }} />
      </div>
    </div>
  );
}

function RecommendationCard({ title, text }) {
  return (
    <div style={styles.recommendationCard}>
      <h4 style={styles.recommendationTitle}>{title}</h4>
      <p style={styles.recommendationText}>{text}</p>
    </div>
  );
}

function EmptyMessage({ text }) {
  return <p style={styles.emptyMessage}>{text}</p>;
}

const styles = {
  page: {
    display: "grid",
    gap: "20px",
  },
  hero: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.5fr) minmax(260px, 0.8fr)",
    gap: "20px",
    alignItems: "stretch",
  },
  heroContent: {
    display: "grid",
    gap: "12px",
  },
  eyebrow: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontWeight: 700,
    color: "#64748b",
  },
  heroTitle: {
    margin: 0,
    fontSize: "30px",
    lineHeight: 1.15,
    fontWeight: 800,
    color: "#0f172a",
  },
  heroSubtitle: {
    margin: 0,
    fontSize: "15px",
    lineHeight: 1.7,
    color: "#64748b",
    maxWidth: "740px",
  },
  heroTags: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginTop: "4px",
  },
  heroPanel: {
    display: "flex",
  },
  heroPanelCard: {
    width: "100%",
    border: "1px solid #e2e8f0",
    borderRadius: "20px",
    padding: "20px",
    background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)",
    display: "grid",
    gap: "8px",
    alignContent: "start",
  },
  heroPanelLabel: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "#64748b",
    fontWeight: 700,
  },
  heroPanelValue: {
    fontSize: "34px",
    fontWeight: 800,
    color: "#0f172a",
  },
  heroPanelText: {
    margin: 0,
    fontSize: "14px",
    color: "#64748b",
    lineHeight: 1.6,
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "16px",
  },
  metricCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "20px",
    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
  },
  metricTitle: {
    display: "block",
    fontSize: "13px",
    color: "#64748b",
    fontWeight: 600,
    marginBottom: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  },
  metricValue: {
    display: "block",
    fontSize: "30px",
    fontWeight: 800,
    color: "#0f172a",
    marginBottom: "8px",
  },
  metricSubtitle: {
    margin: 0,
    fontSize: "13px",
    color: "#94a3b8",
    lineHeight: 1.5,
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "20px",
  },
  funnelList: {
    display: "grid",
    gap: "14px",
  },
  progressItem: {
    display: "grid",
    gap: "8px",
  },
  progressTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  progressLabel: {
    fontSize: "14px",
    fontWeight: 700,
    color: "#0f172a",
  },
  progressCount: {
    fontSize: "13px",
    color: "#64748b",
  },
  progressTrack: {
    height: "10px",
    width: "100%",
    borderRadius: "999px",
    background: "#e2e8f0",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: "999px",
    background: "linear-gradient(90deg, #0f172a 0%, #334155 100%)",
  },
  listStack: {
    display: "grid",
    gap: "12px",
  },
  insightRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "14px",
    padding: "14px 16px",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    background: "#ffffff",
  },
  insightTitle: {
    margin: 0,
    fontSize: "15px",
    color: "#0f172a",
    fontWeight: 700,
  },
  insightMeta: {
    margin: "4px 0 0",
    fontSize: "13px",
    color: "#64748b",
  },
  insightValue: {
    fontSize: "15px",
    color: "#0f172a",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },
  infoCard: {
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "16px",
    display: "grid",
    gap: "12px",
    background: "#ffffff",
  },
  infoCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
  },
  infoTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 700,
    color: "#0f172a",
  },
  infoMeta: {
    margin: "6px 0 0",
    fontSize: "14px",
    color: "#64748b",
  },
  metaRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  metaPill: {
    fontSize: "13px",
    color: "#475569",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "999px",
    padding: "7px 10px",
    fontWeight: 500,
  },
  recommendationGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "14px",
  },
  recommendationCard: {
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "16px",
    background: "#ffffff",
  },
  recommendationTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 700,
    color: "#0f172a",
  },
  recommendationText: {
    margin: "8px 0 0",
    fontSize: "14px",
    lineHeight: 1.6,
    color: "#64748b",
  },
  emptyMessage: {
    margin: 0,
    fontSize: "14px",
    color: "#64748b",
  },
};

export default EmployerOverview;