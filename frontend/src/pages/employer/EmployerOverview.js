import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import {
  Building2,
  Briefcase,
  Users,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";

import api from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { useLanguage } from "../../context/LanguageContext";

function EmployerOverview() {
  const { t } = useLanguage();

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
      toast.error(
        error.response?.data?.error || t("failedEmployerOverview")
      );
    }
  }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const activeJobs = useMemo(
    () => jobs.filter((job) => job.status !== "closed"),
    [jobs]
  );

  const shortlistedApplicants = useMemo(
    () => applicants.filter((item) => item.status === "shortlisted"),
    [applicants]
  );

  const pendingApplicants = useMemo(
    () => applicants.filter((item) => !item.status || item.status === "pending"),
    [applicants]
  );

  return (
    <DashboardLayout
      title={t("employerOverview")}
      subtitle={t("employerOverviewSubtitle")}
    >
      <PageHeader
        subtitle={t("employerOverviewHeader")}
        action={
          <Badge variant={company ? "success" : "warning"}>
            {company ? t("companyLinked") : t("setupNeeded")}
          </Badge>
        }
      />

      {/* HERO */}
      <div style={styles.hero}>
        <div>
          <p style={styles.eyebrow}>{t("employerDashboard")}</p>

          <h2 style={styles.heroTitle}>
            {company ? company.name : t("setupCompanyProfile")}
          </h2>

          <p style={styles.heroText}>
            {company
              ? t("employerHeroText")
              : t("employerHeroSetupText")}
          </p>
        </div>

        <div style={styles.heroActions}>
          <Link to="/dashboard/company">
            <Button variant="secondary">
              <Building2 size={16} />
              {t("myCompany")}
            </Button>
          </Link>

          <Link to="/dashboard/jobs">
            <Button>
              <Briefcase size={16} />
              {t("manageJobs")}
            </Button>
          </Link>
        </div>
      </div>

      {/* STATS */}
      <div style={styles.statsGrid}>
        <StatCard
          icon={<Building2 size={22} />}
          label={t("company")}
          value={company ? company.name : t("notSet")}
          tone={company ? "success" : "warning"}
        />

        <StatCard
          icon={<Briefcase size={22} />}
          label={t("totalJobs")}
          value={jobs.length}
          helper={`${activeJobs.length} ${t("active")}`}
        />

        <StatCard
          icon={<Users size={22} />}
          label={t("applicants")}
          value={applicants.length}
          helper={`${pendingApplicants.length} ${t("pending")}`}
        />

        <StatCard
          icon={<TrendingUp size={22} />}
          label={t("shortlisted")}
          value={shortlistedApplicants.length}
          helper={t("readyNextStep")}
        />
      </div>

      {/* CONTENT */}
      <div style={styles.contentGrid}>
        <Card title={t("hiringPipeline")} subtitle={t("pipelineSubtitle")}>
          <div style={styles.pipelineList}>
            <PipelineItem label={t("pending")} value={pendingApplicants.length} />
            <PipelineItem
              label={t("reviewed")}
              value={applicants.filter((a) => a.status === "reviewed").length}
            />
            <PipelineItem
              label={t("shortlisted")}
              value={shortlistedApplicants.length}
            />
            <PipelineItem
              label={t("rejected")}
              value={applicants.filter((a) => a.status === "rejected").length}
            />
          </div>
        </Card>

        <Card title={t("quickActions")} subtitle={t("quickActionsSubtitle")}>
          <div style={styles.actionList}>
            <QuickAction
              to="/employer/company"
              icon={<Building2 size={18} />}
              title={t("updateCompanyProfile")}
              text={t("updateCompanyProfileText")}
            />
            <QuickAction
              to="/employer/jobs"
              icon={<Briefcase size={18} />}
              title={t("createManageJobs")}
              text={t("createManageJobsText")}
            />
            <QuickAction
              to="/employer/applicants"
              icon={<Users size={18} />}
              title={t("reviewApplicants")}
              text={t("reviewApplicantsText")}
            />
          </div>
        </Card>
      </div>

      <div style={{ height: 20 }} />

      <Card title={t("workspaceHealth")} subtitle={t("workspaceHealthSubtitle")}>
        <div style={styles.healthList}>
          <HealthItem
            complete={Boolean(company)}
            title={t("companyProfileConnected")}
            text={
              company
                ? t("companyLinkedText")
                : t("setupCompanyBeforeJobs")
            }
          />

          <HealthItem
            complete={jobs.length > 0}
            title={t("jobPosted")}
            text={
              jobs.length > 0
                ? t("activeHiringText")
                : t("createFirstJob")
            }
          />

          <HealthItem
            complete={applicants.length > 0}
            title={t("applicantsReceived")}
            text={
              applicants.length > 0
                ? t("candidatesToReview")
                : t("noApplicantsYet")
            }
          />
        </div>
      </Card>
    </DashboardLayout>
  );
}

function StatCard({ icon, label, value, helper, tone }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statTop}>
        <div style={styles.statIcon}>{icon}</div>
        {tone === "warning" && <Badge variant="warning">Needs setup</Badge>}
      </div>

      <span style={styles.statLabel}>{label}</span>

      <strong style={styles.statValue}>{value}</strong>

      {helper && <p style={styles.statHelper}>{helper}</p>}
    </div>
  );
}

function PipelineItem({ label, value }) {
  return (
    <div style={styles.pipelineItem}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function QuickAction({ to, icon, title, text }) {
  return (
    <Link to={to} style={styles.quickAction}>
      <div style={styles.quickIcon}>{icon}</div>
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
      <ArrowRight size={18} />
    </Link>
  );
}

function HealthItem({ complete, title, text }) {
  return (
    <div style={styles.healthItem}>
      {complete ? (
        <CheckCircle2 size={22} color="#16a34a" />
      ) : (
        <AlertCircle size={22} color="#f59e0b" />
      )}

      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </div>
  );
}

const styles = {
  hero: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 20,
    padding: 24,
    borderRadius: 26,
    background: "linear-gradient(135deg, #111827, #1d4ed8)",
    color: "#fff",
    marginBottom: 22,
  },
  eyebrow: {
    margin: 0,
    fontSize: 13,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    opacity: 0.8,
  },
  heroTitle: {
    margin: "8px 0",
    fontSize: 30,
  },
  heroText: {
    margin: 0,
    maxWidth: 620,
    opacity: 0.88,
    lineHeight: 1.6,
  },
  heroActions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
statsGrid: {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 16,
  marginBottom: 20,
},
  statCard: {
  display: "flex",
  flexDirection: "column",
  gap: 8,
  minHeight: 150,
  padding: 18,
  borderRadius: 22,
  background: "#fff",
  border: "1px solid #e5e7eb",
  boxShadow: "0 12px 30px rgba(15, 23, 42, 0.06)",
  overflow: "hidden",
},

statTop: {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  marginBottom: 4,
},

statIcon: {
  width: 42,
  height: 42,
  minWidth: 42,
  borderRadius: 14,
  background: "#eff6ff",
  color: "#2563eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
},

statLabel: {
  display: "block",
  fontSize: 13,
  fontWeight: 700,
  color: "#6b7280",
  textTransform: "uppercase",
  letterSpacing: 0.4,
},

statValue: {
  display: "block",
  fontSize: 22,
  lineHeight: 1.25,
  color: "#111827",
  wordBreak: "break-word",
},

statHelper: {
  margin: 0,
  fontSize: 14,
  color: "#6b7280",
  lineHeight: 1.4,
},
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 420px",
    gap: 20,
    alignItems: "start",
  },
  pipelineList: {
    display: "grid",
    gap: 12,
  },
  pipelineItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 16,
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
  },
  actionList: {
    display: "grid",
    gap: 12,
  },
  quickAction: {
    display: "grid",
    gridTemplateColumns: "42px 1fr auto",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    textDecoration: "none",
    color: "#111827",
  },
  quickIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#2563eb",
  },
  healthList: {
    display: "grid",
    gap: 14,
  },
  healthItem: {
    display: "flex",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
  },
};

export default EmployerOverview;