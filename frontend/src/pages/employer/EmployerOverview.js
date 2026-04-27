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
      toast.error(
        error.response?.data?.error || "Failed to load employer overview"
      );
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const activeJobs = useMemo(() => jobs.filter((job) => job.status !== "closed"), [jobs]);

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
      title="Employer Overview"
      subtitle="Your company hiring workspace."
    >
      <PageHeader
        subtitle="Track your company profile, jobs, applicants, and hiring activity."
        action={
          <Badge variant={company ? "success" : "warning"}>
            {company ? "Company linked" : "Setup needed"}
          </Badge>
        }
      />

      <div style={styles.hero}>
        <div>
          <p style={styles.eyebrow}>Employer Dashboard</p>
          <h2 style={styles.heroTitle}>
            {company ? company.name : "Set up your company profile"}
          </h2>
          <p style={styles.heroText}>
            {company
              ? "Manage hiring activity, monitor applicants, and keep your company presence updated."
              : "Create your company profile first so you can post jobs and manage applicants."}
          </p>
        </div>

        <div style={styles.heroActions}>
          <Link to="/dashboard/company">
            <Button variant="secondary">
              <Building2 size={16} />
              My Company
            </Button>
          </Link>

          <Link to="/dashboard/jobs">
            <Button>
              <Briefcase size={16} />
              Manage Jobs
            </Button>
          </Link>
        </div>
      </div>

      <div style={styles.statsGrid}>
        <StatCard
          icon={<Building2 size={22} />}
          label="Company"
          value={company ? company.name : "Not set"}
          tone={company ? "success" : "warning"}
        />

        <StatCard
          icon={<Briefcase size={22} />}
          label="Total Jobs"
          value={jobs.length}
          helper={`${activeJobs.length} active`}
        />

        <StatCard
          icon={<Users size={22} />}
          label="Applicants"
          value={applicants.length}
          helper={`${pendingApplicants.length} pending`}
        />

        <StatCard
          icon={<TrendingUp size={22} />}
          label="Shortlisted"
          value={shortlistedApplicants.length}
          helper="Ready for next step"
        />
      </div>

      <div style={styles.contentGrid}>
        <Card title="Hiring Pipeline" subtitle="Current applicant status overview.">
          <div style={styles.pipelineList}>
            <PipelineItem label="Pending" value={pendingApplicants.length} />
            <PipelineItem
              label="Reviewed"
              value={applicants.filter((item) => item.status === "reviewed").length}
            />
            <PipelineItem label="Shortlisted" value={shortlistedApplicants.length} />
            <PipelineItem
              label="Rejected"
              value={applicants.filter((item) => item.status === "rejected").length}
            />
          </div>
        </Card>

        <Card title="Quick Actions" subtitle="Common employer tasks.">
          <div style={styles.actionList}>
            <QuickAction
              to="/employer/company"
              icon={<Building2 size={18} />}
              title="Update company profile"
              text="Improve your employer presence."
            />
            <QuickAction
              to="/employer/jobs"
              icon={<Briefcase size={18} />}
              title="Create or manage jobs"
              text="Publish roles and update openings."
            />
            <QuickAction
              to="/employer/applicants"
              icon={<Users size={18} />}
              title="Review applicants"
              text="Check candidate profiles and status."
            />
          </div>
        </Card>
      </div>

      <div style={{ height: 20 }} />

      <Card title="Workspace Health" subtitle="Recommended next steps.">
        <div style={styles.healthList}>
          <HealthItem
            complete={Boolean(company)}
            title="Company profile connected"
            text={
              company
                ? "Your company is linked to this employer account."
                : "Set up your company profile before publishing jobs."
            }
          />

          <HealthItem
            complete={jobs.length > 0}
            title="At least one job posted"
            text={
              jobs.length > 0
                ? "Your company has active hiring activity."
                : "Create your first job post to start receiving applicants."
            }
          />

          <HealthItem
            complete={applicants.length > 0}
            title="Applicants received"
            text={
              applicants.length > 0
                ? "You have candidates to review."
                : "Applicants will appear here once candidates apply."
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