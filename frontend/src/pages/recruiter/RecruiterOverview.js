import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  Briefcase,
  Star,
  TrendingUp,
  Clock,
  CheckCircle2,
  Search,
  MessageCircle,
  Settings,
  ArrowRight,
  Activity,
  ShieldCheck,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import api from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";

function RecruiterOverview() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const tt = (key, fallback) => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  const [stats, setStats] = useState({
    assignedTalent: 0,
    evaluatedTalent: 0,
    openJobs: 0,
    recommendations: 0,
  });

  const [recommendations, setRecommendations] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadOverview = async () => {
    try {
      setLoading(true);
      setError("");

      const [overviewRes, recommendationsRes, settingsRes] =
        await Promise.allSettled([
          api.get("/api/recruiter/overview"),
          api.get("/api/recruiter/recommendations"),
          api.get("/api/recruiter/settings"),
        ]);

      if (overviewRes.status === "fulfilled") {
        setStats({
          assignedTalent: overviewRes.value.data?.assignedTalent || 0,
          evaluatedTalent: overviewRes.value.data?.evaluatedTalent || 0,
          openJobs: overviewRes.value.data?.openJobs || 0,
          recommendations: overviewRes.value.data?.recommendations || 0,
        });
      }

      if (recommendationsRes.status === "fulfilled") {
        const data = Array.isArray(recommendationsRes.value.data)
          ? recommendationsRes.value.data
          : recommendationsRes.value.data?.recommendations || [];

        setRecommendations(data.slice(0, 5));
      }

      if (settingsRes.status === "fulfilled") {
        setSettings(settingsRes.value.data || null);
      }

      if (
        overviewRes.status === "rejected" &&
        recommendationsRes.status === "rejected"
      ) {
        setError(
          tt(
            "recruiterOverview.errors.endpointsNotReady",
            "Recruiter backend endpoints are not ready yet."
          )
        );
      }
    } catch (err) {
      console.error("Failed to load recruiter overview:", err);
      setError(
        tt(
          "recruiterOverview.errors.failedLoadOverview",
          "Failed to load recruiter overview."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const performance = useMemo(() => {
    const total = recommendations.length;

    const accepted = recommendations.filter(
      (item) => item.status === "accepted"
    ).length;

    const viewed = recommendations.filter((item) => item.employer_viewed).length;

    const avgScore =
      total > 0
        ? Math.round(
            recommendations.reduce(
              (sum, item) => sum + Number(item.match_score || 0),
              0
            ) / total
          )
        : 0;

    return {
      accepted,
      viewed,
      avgScore,
      acceptanceRate: total > 0 ? Math.round((accepted / total) * 100) : 0,
      viewedRate: total > 0 ? Math.round((viewed / total) * 100) : 0,
    };
  }, [recommendations]);

  return (
    <DashboardLayout
      title={tt("recruiterOverview.title", "Recruiter Workspace")}
      subtitle={tt(
        "recruiterOverview.subtitle",
        "Manage assigned talent, evaluate readiness, and connect strong candidates to suitable opportunities."
      )}
    >
      {error && <div style={styles.alert}>{error}</div>}

      <section style={styles.hero}>
        <div>
          <span style={styles.heroBadge}>
            {tt(
              "recruiterOverview.hero.badge",
              "Recruiter Command Center"
            )}
          </span>

          <h2 style={styles.heroTitle}>
            {tt("recruiterOverview.hero.welcomeBack", "Welcome back")}
            {settings?.name ? `, ${settings.name}` : ""}
          </h2>

          <p style={styles.heroText}>
            {tt(
              "recruiterOverview.hero.text",
              "Focus on quality matches, thoughtful recommendations, and timely employer follow-ups."
            )}
          </p>
        </div>

        <div style={styles.heroActions}>
          <Button onClick={() => navigate("/dashboard/jobs")}>
            <Search size={16} />
            {tt("recruiterOverview.actions.matchTalent", "Match Talent")}
          </Button>

          <button
            type="button"
            style={styles.secondaryButton}
            onClick={() => navigate("/dashboard/settings")}
          >
            <Settings size={16} />
            {tt("recruiterOverview.actions.settings", "Settings")}
          </button>
        </div>
      </section>

      <div style={styles.grid}>
        <StatCard
          icon={<Users size={24} />}
          title={tt("recruiterOverview.stats.assignedTalent", "Assigned Talent")}
          value={stats.assignedTalent}
          subtitle={tt(
            "recruiterOverview.stats.assignedTalentSubtitle",
            "Candidates available for review"
          )}
          color="#2563eb"
          bg="#dbeafe"
          loading={loading}
        />

        <StatCard
          icon={<UserCheck size={24} />}
          title={tt("recruiterOverview.stats.evaluatedTalent", "Evaluated Talent")}
          value={stats.evaluatedTalent}
          subtitle={tt(
            "recruiterOverview.stats.evaluatedTalentSubtitle",
            "Profiles reviewed or scored"
          )}
          color="#16a34a"
          bg="#dcfce7"
          loading={loading}
        />

        <StatCard
          icon={<Briefcase size={24} />}
          title={tt("recruiterOverview.stats.openJobs", "Open Jobs")}
          value={stats.openJobs}
          subtitle={tt(
            "recruiterOverview.stats.openJobsSubtitle",
            "Active employer opportunities"
          )}
          color="#7c3aed"
          bg="#ede9fe"
          loading={loading}
        />

        <StatCard
          icon={<Star size={24} />}
          title={tt("recruiterOverview.stats.recommendations", "Recommendations")}
          value={stats.recommendations}
          subtitle={tt(
            "recruiterOverview.stats.recommendationsSubtitle",
            "Talent recommendations sent"
          )}
          color="#f97316"
          bg="#ffedd5"
          loading={loading}
        />
      </div>

      <div style={styles.twoColumn}>
        <Card
          title={tt(
            "recruiterOverview.performance.title",
            "Performance Snapshot"
          )}
          subtitle={tt(
            "recruiterOverview.performance.subtitle",
            "Recent recommendation quality and employer engagement."
          )}
        >
          <div style={styles.performanceGrid}>
            <Metric
              icon={<TrendingUp size={18} />}
              label={tt("recruiterOverview.performance.averageMatch", "Average Match")}
              value={`${performance.avgScore}%`}
            />

            <Metric
              icon={<CheckCircle2 size={18} />}
              label={tt(
                "recruiterOverview.performance.acceptanceRate",
                "Acceptance Rate"
              )}
              value={`${performance.acceptanceRate}%`}
            />

            <Metric
              icon={<Activity size={18} />}
              label={tt(
                "recruiterOverview.performance.employerViewed",
                "Employer Viewed"
              )}
              value={`${performance.viewedRate}%`}
            />

            <Metric
              icon={<Clock size={18} />}
              label={tt(
                "recruiterOverview.performance.followUpWindow",
                "Follow-up Window"
              )}
              value={`${settings?.follow_up_days || 3} ${tt(
                "recruiterOverview.labels.days",
                "days"
              )}`}
            />
          </div>
        </Card>

        <Card
          title={tt("recruiterOverview.health.title", "Workspace Health")}
          subtitle={tt(
            "recruiterOverview.health.subtitle",
            "Settings that control your recommendation workflow."
          )}
        >
          <div style={styles.healthList}>
            <HealthItem
              label={tt(
                "recruiterOverview.health.defaultRecommendationNote",
                "Default recommendation note"
              )}
              active={Boolean(settings?.default_recommendation_note)}
              tt={tt}
            />

            <HealthItem
              label={tt(
                "recruiterOverview.health.employerMessageTemplate",
                "Employer message template"
              )}
              active={Boolean(settings?.default_employer_message)}
              tt={tt}
            />

            <HealthItem
              label={tt(
                "recruiterOverview.health.aiNotesEnabled",
                "AI notes enabled"
              )}
              active={Boolean(settings?.auto_include_ai_notes)}
              tt={tt}
            />

            <HealthItem
              label={tt(
                "recruiterOverview.health.autoNotifyEmployer",
                "Auto notify employer"
              )}
              active={Boolean(settings?.auto_notify_employer)}
              tt={tt}
            />
          </div>
        </Card>
      </div>

      <div style={styles.twoColumn}>
        <Card
          title={tt("recruiterOverview.mission.title", "Recruiter Mission")}
          subtitle={tt(
            "recruiterOverview.mission.subtitle",
            "A simple workflow for high-quality talent support."
          )}
        >
          <div style={styles.missionList}>
            <MissionStep
              number="01"
              title={tt(
                "recruiterOverview.mission.step1Title",
                "Review candidate profiles"
              )}
              text={tt(
                "recruiterOverview.mission.step1Text",
                "Check profile quality, skills, work preferences, and readiness."
              )}
            />

            <MissionStep
              number="02"
              title={tt(
                "recruiterOverview.mission.step2Title",
                "Evaluate career readiness"
              )}
              text={tt(
                "recruiterOverview.mission.step2Text",
                "Add useful notes and identify the strongest candidate-job alignment."
              )}
            />

            <MissionStep
              number="03"
              title={tt(
                "recruiterOverview.mission.step3Title",
                "Recommend talent"
              )}
              text={tt(
                "recruiterOverview.mission.step3Text",
                "Send focused recommendations to employers with clear match reasoning."
              )}
            />

            <MissionStep
              number="04"
              title={tt("recruiterOverview.mission.step4Title", "Follow up")}
              text={tt(
                "recruiterOverview.mission.step4Text",
                "Track employer views, feedback, and outcomes after submission."
              )}
            />
          </div>
        </Card>

        <Card
          title={tt(
            "recruiterOverview.recentRecommendations.title",
            "Recent Recommendations"
          )}
          subtitle={tt(
            "recruiterOverview.recentRecommendations.subtitle",
            "Latest candidates recommended to employers."
          )}
        >
          {recommendations.length === 0 ? (
            <div style={styles.emptyState}>
              {tt(
                "recruiterOverview.recentRecommendations.empty",
                "No recent recommendations yet."
              )}
            </div>
          ) : (
            <div style={styles.recentList}>
              {recommendations.map((item) => (
                <div key={item.id} style={styles.recentItem}>
                  <div style={styles.recentAvatar}>
                    {(item.candidate_name || "C").charAt(0).toUpperCase()}
                  </div>

                  <div style={styles.recentBody}>
                    <strong>
                      {item.candidate_name ||
                        tt(
                          "recruiterOverview.defaults.unnamedCandidate",
                          "Unnamed Candidate"
                        )}
                    </strong>

                    <span>
                      {item.job_title ||
                        tt("recruiterOverview.defaults.untitledJob", "Untitled Job")}{" "}
                      ·{" "}
                      {item.company_name ||
                        tt("recruiterOverview.defaults.company", "Company")}
                    </span>
                  </div>

                  <span style={styles.scorePill}>
                    {item.match_score || 0}%
                  </span>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            style={styles.linkButton}
            onClick={() => navigate("/dashboard/recommendations")}
          >
            {tt(
              "recruiterOverview.actions.viewAllRecommendations",
              "View all recommendations"
            )}
            <ArrowRight size={15} />
          </button>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ icon, title, value, subtitle, color, bg, loading }) {
  return (
    <div style={styles.statCard}>
      <div style={{ ...styles.statIcon, background: bg, color }}>{icon}</div>

      <div>
        <p style={styles.statTitle}>{title}</p>
        <h2 style={styles.statValue}>{loading ? "..." : value}</h2>
        <span style={styles.statSubtitle}>{subtitle}</span>
      </div>
    </div>
  );
}

function Metric({ icon, label, value }) {
  return (
    <div style={styles.metric}>
      <div style={styles.metricIcon}>{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function HealthItem({ label, active, tt }) {
  return (
    <div style={styles.healthItem}>
      <div style={active ? styles.healthIconActive : styles.healthIcon}>
        {active ? <CheckCircle2 size={15} /> : <ShieldCheck size={15} />}
      </div>

      <span>{label}</span>

      <strong style={active ? styles.activeText : styles.inactiveText}>
        {active
          ? tt("recruiterOverview.health.ready", "Ready")
          : tt("recruiterOverview.health.missing", "Missing")}
      </strong>
    </div>
  );
}

function MissionStep({ number, title, text }) {
  return (
    <div style={styles.missionStep}>
      <span style={styles.stepNumber}>{number}</span>

      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </div>
  );
}

const styles = {
  alert: {
    padding: 14,
    borderRadius: 14,
    background: "#fff7ed",
    color: "#9a3412",
    marginBottom: 20,
    fontWeight: 700,
  },

  hero: {
    background: "linear-gradient(135deg, #0f172a, #1e3a8a)",
    color: "#fff",
    borderRadius: 28,
    padding: 28,
    marginBottom: 24,
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    alignItems: "center",
    flexWrap: "wrap",
    boxShadow: "0 24px 70px rgba(15, 23, 42, 0.18)",
  },

  heroBadge: {
    display: "inline-flex",
    padding: "6px 11px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.14)",
    fontSize: 12,
    fontWeight: 800,
    marginBottom: 10,
  },

  heroTitle: {
    margin: 0,
    fontSize: 30,
  },

  heroText: {
    margin: "8px 0 0",
    color: "#dbeafe",
    maxWidth: 680,
    lineHeight: 1.7,
  },

  heroActions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  secondaryButton: {
    height: 42,
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: 13,
    background: "rgba(255,255,255,0.12)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    padding: "0 16px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 18,
    marginBottom: 24,
  },

  statCard: {
    minHeight: 116,
    background: "#fff",
    border: "1px solid #e8edf5",
    borderRadius: 24,
    padding: 20,
    display: "flex",
    gap: 16,
    alignItems: "center",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.055)",
  },

  statIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  statTitle: {
    margin: 0,
    color: "#475569",
    fontSize: 14,
    fontWeight: 700,
  },

  statValue: {
    margin: "6px 0 2px",
    fontSize: 30,
    color: "#0f172a",
    lineHeight: 1,
  },

  statSubtitle: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: 600,
  },

  twoColumn: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 20,
    marginBottom: 22,
  },

  performanceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: 12,
  },

  metric: {
    border: "1px solid #e5e7eb",
    borderRadius: 18,
    padding: 15,
    background: "#f8fafc",
    display: "grid",
    gap: 6,
  },

  metricIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  healthList: {
    display: "grid",
    gap: 12,
  },

  healthItem: {
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 13,
    display: "grid",
    gridTemplateColumns: "32px 1fr auto",
    alignItems: "center",
    gap: 10,
    color: "#334155",
    fontWeight: 700,
  },

  healthIcon: {
    width: 32,
    height: 32,
    borderRadius: 11,
    background: "#f1f5f9",
    color: "#64748b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  healthIconActive: {
    width: 32,
    height: 32,
    borderRadius: 11,
    background: "#dcfce7",
    color: "#16a34a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  activeText: {
    color: "#16a34a",
  },

  inactiveText: {
    color: "#f97316",
  },

  missionList: {
    display: "grid",
    gap: 14,
  },

  missionStep: {
    display: "grid",
    gridTemplateColumns: "48px 1fr",
    gap: 13,
    alignItems: "start",
  },

  stepNumber: {
    width: 42,
    height: 42,
    borderRadius: 15,
    background: "#eef2ff",
    color: "#4338ca",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
  },

  recentList: {
    display: "grid",
    gap: 12,
  },

  recentItem: {
    border: "1px solid #e5e7eb",
    borderRadius: 17,
    padding: 13,
    display: "grid",
    gridTemplateColumns: "42px 1fr auto",
    alignItems: "center",
    gap: 12,
  },

  recentAvatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
  },

  recentBody: {
    display: "grid",
    gap: 3,
    color: "#334155",
  },

  scorePill: {
    padding: "7px 9px",
    borderRadius: 999,
    background: "#dcfce7",
    color: "#166534",
    fontWeight: 900,
    fontSize: 12,
  },

  linkButton: {
    marginTop: 14,
    height: 42,
    border: "none",
    borderRadius: 13,
    background: "#0f172a",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    padding: "0 16px",
  },

  emptyState: {
    padding: 30,
    textAlign: "center",
    color: "#64748b",
    fontWeight: 700,
  },
};

export default RecruiterOverview;