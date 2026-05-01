import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { useLanguage } from "../../context/LanguageContext";

function CandidateOverview() {
  const { t } = useLanguage();
  const token = localStorage.getItem("token");

  let user = {};
  try {
    user = JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    user = {};
  }

  const [jobs, setJobs] = useState([]);
  const [marketStats, setMarketStats] = useState(null);
  const [candidateStats, setCandidateStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const candidateTitle =
    user?.professional_title ||
    user?.title ||
    user?.role ||
    t("softwareEngineer");

  const candidateCountry =
    user?.country || user?.location_country || user?.nationality || t("nigeria");

  const firstName =
    user?.first_name ||
    user?.name?.split(" ")?.[0] ||
    user?.full_name?.split(" ")?.[0] ||
    t("candidate");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [jobsRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/api/jobs`),
        ]);

        const jobsData = Array.isArray(jobsRes.data) ? jobsRes.data : [];
        setJobs(jobsData);

        try {
          const [marketRes, candidateRes] = await Promise.all([
            axios.get(`${process.env.REACT_APP_API_URL}/api/market-insights`, {
              params: {
                title: candidateTitle,
                country: candidateCountry,
              },
            }),
            axios.get(`${process.env.REACT_APP_API_URL}/api/candidate-insights`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }),
          ]);

          setMarketStats(marketRes.data || null);
          setCandidateStats(candidateRes.data || null);
        } catch {
          setMarketStats(null);
          setCandidateStats(null);
        }
      } catch (error) {
        console.error("Failed to load candidate overview:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token, candidateTitle, candidateCountry]);

  const matchingJobs = useMemo(() => {
    const titleLower = candidateTitle.toLowerCase();

    return jobs.filter((job) => {
      const role = job?.title || job?.job_title || "";
      const skills = Array.isArray(job?.skills)
        ? job.skills.join(" ")
        : job?.skills || "";
      const category = job?.category || "";

      return (
        role.toLowerCase().includes(titleLower) ||
        skills.toLowerCase().includes(titleLower) ||
        category.toLowerCase().includes(titleLower)
      );
    });
  }, [jobs, candidateTitle]);

  const newestJobs = useMemo(() => {
    return [...matchingJobs]
      .sort((a, b) => {
        const aDate = new Date(a?.created_at || a?.posted_at || 0).getTime();
        const bDate = new Date(b?.created_at || b?.posted_at || 0).getTime();
        return bDate - aDate;
      })
      .slice(0, 6);
  }, [matchingJobs]);

  const remoteVsOnsite = useMemo(() => {
    const base = matchingJobs.length ? matchingJobs : jobs;

    const remote = base.filter((job) =>
      (job?.work_mode || job?.job_type || job?.location_type || "")
        .toLowerCase()
        .includes("remote")
    ).length;

    const onsite = base.filter((job) => {
      const mode = (
        job?.work_mode ||
        job?.job_type ||
        job?.location_type ||
        ""
      ).toLowerCase();
      return mode.includes("on-site") || mode.includes("onsite");
    }).length;

    const hybrid = base.filter((job) =>
      (job?.work_mode || job?.job_type || job?.location_type || "")
        .toLowerCase()
        .includes("hybrid")
    ).length;

    const total = remote + onsite + hybrid || 1;

    return {
      remote,
      onsite,
      hybrid,
      remotePct: Math.round((remote / total) * 100),
      onsitePct: Math.round((onsite / total) * 100),
      hybridPct: Math.round((hybrid / total) * 100),
    };
  }, [jobs, matchingJobs]);

  const jobsByCountry = useMemo(() => {
    const base = matchingJobs.length ? matchingJobs : jobs;
    const map = {};

    base.forEach((job) => {
      const country =
        job?.country || job?.job_country || job?.location_country || t("other");
      map[country] = (map[country] || 0) + 1;
    });

    return Object.entries(map)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [jobs, matchingJobs, t]);

  const topWageCountries = useMemo(() => {
    if (marketStats?.top_wage_countries?.length) {
      return marketStats.top_wage_countries.slice(0, 5);
    }

    const grouped = {};

    jobs.forEach((job) => {
      const country = job?.country || job?.job_country || job?.location_country;
      const salary =
        Number(job?.salary_max) ||
        Number(job?.salary) ||
        Number(job?.monthly_salary) ||
        null;

      if (!country || !salary) return;

      if (!grouped[country]) grouped[country] = [];
      grouped[country].push(salary);
    });

    return Object.entries(grouped)
      .map(([country, values]) => ({
        country,
        avg_salary: Math.round(
          values.reduce((sum, value) => sum + value, 0) / values.length
        ),
      }))
      .sort((a, b) => b.avg_salary - a.avg_salary)
      .slice(0, 5);
  }, [jobs, marketStats]);

  const hottestRoles = useMemo(() => {
    const map = {};

    jobs.forEach((job) => {
      const role = job?.title || job?.job_title || job?.category || t("other");
      map[role] = (map[role] || 0) + 1;
    });

    return Object.entries(map)
      .map(([role, count]) => ({ role, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [jobs, t]);

  const candidateRank = useMemo(() => {
    if (candidateStats?.country_rank) return candidateStats.country_rank;

    return {
      position: 18,
      total: 240,
      percentile: 93,
      label: t("topTenInMarket").replace("{{country}}", candidateCountry),
    };
  }, [candidateStats, candidateCountry, t]);

  const marketHealth = useMemo(() => {
    const base = matchingJobs.length || jobs.length;
    if (base > 100) return t("strong");
    if (base > 40) return t("active");
    return t("emerging");
  }, [jobs.length, matchingJobs.length, t]);

  const formatMoney = (value) => {
    const amount = Number(value);
    if (!amount) return t("salaryNotDisclosed");
    return `$${amount.toLocaleString()}`;
  };

  return (
    <DashboardLayout
      title={t("candidateOverview")}
      subtitle={t("candidateOverviewSubtitle")}
    >
      <div style={styles.page}>
        <Card>
          <div style={styles.hero}>
            <div style={styles.heroContent}>
              <span style={styles.eyebrow}>{t("careerIntelligence")}</span>

              <h2 style={styles.heroTitle}>
                {t("welcomeBack")}, {firstName}
              </h2>

              <p style={styles.heroSubtitle}>{t("overviewHeroSubtitle")}</p>

              <div style={styles.heroTags}>
                <Badge variant="default">{candidateTitle}</Badge>
                <Badge variant="success">{candidateCountry}</Badge>
                <Badge variant="warning">
                  {marketHealth} {t("market")}
                </Badge>
              </div>
            </div>

            <div style={styles.heroSide}>
              <div style={styles.rankCard}>
                <span style={styles.rankLabel}>{t("countryRanking")}</span>

                <strong style={styles.rankValue}>
                  #{candidateRank.position}
                </strong>

                <p style={styles.rankMeta}>
                  {t("outOf")} {candidateRank.total} {t("candidates")}
                </p>

                <span style={styles.rankFoot}>{candidateRank.label}</span>
              </div>
            </div>
          </div>
        </Card>

        <div style={styles.metricsGrid}>
          <MetricCard
            title={t("matchingJobs")}
            value={loading ? "..." : matchingJobs.length}
            subtitle={t("matchingJobsSubtitle")}
          />
          <MetricCard
            title={t("topPercentile")}
            value={loading ? "..." : `${candidateRank.percentile}%`}
            subtitle={t("topPercentileSubtitle")}
          />
          <MetricCard
            title={t("remoteRoles")}
            value={loading ? "..." : remoteVsOnsite.remote}
            subtitle={t("remoteRolesSubtitle")}
          />
          <MetricCard
            title={t("topWageMarket")}
            value={
              loading
                ? "..."
                : topWageCountries[0]?.country || t("notAvailable")
            }
            subtitle={t("topWageMarketSubtitle")}
          />
        </div>

        <div style={styles.mainGrid}>
          <Card
            title={t("topPayingMarkets")}
            subtitle={t("topPayingMarketsSubtitle")}
          >
            {loading ? (
              <EmptyMessage text={t("loadingWageInsights")} />
            ) : topWageCountries.length === 0 ? (
              <EmptyMessage text={t("noSalaryData")} />
            ) : (
              <div style={styles.listStack}>
                {topWageCountries.map((item, index) => (
                  <InsightRow
                    key={`${item.country}-${index}`}
                    title={item.country}
                    value={
                      item.avg_salary
                        ? `$${item.avg_salary.toLocaleString()}`
                        : t("highDemand")
                    }
                    meta={t("averageVisibleCompensation")}
                  />
                ))}
              </div>
            )}
          </Card>

          <Card
            title={t("workModeDemand")}
            subtitle={t("workModeDemandSubtitle")}
          >
            {loading ? (
              <EmptyMessage text={t("loadingWorkModeInsights")} />
            ) : (
              <div style={styles.modePanel}>
                <ProgressBar
                  label={t("remote")}
                  value={remoteVsOnsite.remotePct}
                  count={remoteVsOnsite.remote}
                  t={t}
                />
                <ProgressBar
                  label={t("hybrid")}
                  value={remoteVsOnsite.hybridPct}
                  count={remoteVsOnsite.hybrid}
                  t={t}
                />
                <ProgressBar
                  label={t("onSite")}
                  value={remoteVsOnsite.onsitePct}
                  count={remoteVsOnsite.onsite}
                  t={t}
                />
              </div>
            )}
          </Card>
        </div>

        <div style={styles.mainGrid}>
          <Card
            title={t("jobDemandByCountry")}
            subtitle={t("jobDemandByCountrySubtitle")}
          >
            {loading ? (
              <EmptyMessage text={t("loadingCountryDistribution")} />
            ) : jobsByCountry.length === 0 ? (
              <EmptyMessage text={t("noCountryDistribution")} />
            ) : (
              <div style={styles.chartList}>
                {jobsByCountry.map((item) => {
                  const max = jobsByCountry[0]?.count || 1;
                  const width = Math.max(
                    12,
                    Math.round((item.count / max) * 100)
                  );

                  return (
                    <div key={item.country} style={styles.chartRow}>
                      <div style={styles.chartLabelWrap}>
                        <span style={styles.chartLabel}>{item.country}</span>
                        <span style={styles.chartValue}>{item.count}</span>
                      </div>
                      <div style={styles.chartTrack}>
                        <div style={{ ...styles.chartBar, width: `${width}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card title={t("hottestRoles")} subtitle={t("hottestRolesSubtitle")}>
            {loading ? (
              <EmptyMessage text={t("loadingRoleDemand")} />
            ) : hottestRoles.length === 0 ? (
              <EmptyMessage text={t("noRoleTrendData")} />
            ) : (
              <div style={styles.listStack}>
                {hottestRoles.map((item) => (
                  <InsightRow
                    key={item.role}
                    title={item.role}
                    value={`${item.count} ${t("roles")}`}
                    meta={t("currentPlatformDemand")}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>

        <Card
          title={t("newestMatchingJobs")}
          subtitle={t("newestMatchingJobsSubtitle")}
        >
          {loading ? (
            <EmptyMessage text={t("loadingNewestOpportunities")} />
          ) : newestJobs.length === 0 ? (
            <div style={styles.emptyState}>
              <h3 style={styles.emptyTitle}>{t("noMatchingJobsYet")}</h3>
              <p style={styles.emptyText}>{t("noMatchingJobsYetSubtitle")}</p>
            </div>
          ) : (
            <div style={styles.jobsGrid}>
              {newestJobs.map((job) => (
                <div key={job.id} style={styles.jobCard}>
                  <div style={styles.jobTop}>
                    <div>
                      <h4 style={styles.jobTitle}>
                        {job.title || job.job_title || t("untitledRole")}
                      </h4>
                      <p style={styles.jobCompany}>
                        {job.company_name || job.company || t("unknownCompany")}
                      </p>
                    </div>

                    <Badge variant="default">
                      {job.work_mode ||
                        job.location_type ||
                        job.job_type ||
                        t("role")}
                    </Badge>
                  </div>

                  <div style={styles.jobMetaRow}>
                    <span style={styles.jobMeta}>
                      {job.country ||
                        job.job_country ||
                        job.location_country ||
                        t("locationNotSpecified")}
                    </span>
                    <span style={styles.jobMeta}>
                      {formatMoney(
                        job.salary_max ||
                          job.salary ||
                          job.monthly_salary ||
                          null
                      )}
                    </span>
                  </div>

                  <div style={styles.jobActions}>
                    <Button variant="secondary">{t("viewJob")}</Button>
                    <Button>{t("applyNow")}</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div style={styles.mainGrid}>
          <Card title={t("marketTrendSignals")} subtitle={t("marketTrendSignalsSubtitle")}>
            <div style={styles.tipList}>
              <TipItem
                title={t("highestWageVisibility")}
                text={
                  topWageCountries[0]
                    ? t("highestWageVisibilityText").replace(
                        "{{country}}",
                        topWageCountries[0].country
                      )
                    : t("noSalaryInsight")
                }
              />
              <TipItem
                title={t("bestDemandPattern")}
                text={
                  remoteVsOnsite.remote >= remoteVsOnsite.onsite
                    ? t("remoteDemandTip")
                    : t("onsiteDemandTip")
                }
              />
              <TipItem
                title={t("careerFocus")}
                text={t("careerFocusText").replace(
                  "{{title}}",
                  candidateTitle
                )}
              />
            </div>
          </Card>

          <Card title={t("recommendedNextSteps")} subtitle={t("recommendedNextStepsSubtitle")}>
            <div style={styles.tipList}>
              <TipItem
                title={t("targetHighPayingMarkets")}
                text={t("targetHighPayingMarketsText")}
              />
              <TipItem
                title={t("optimizeForHotRoles")}
                text={t("optimizeForHotRolesText")}
              />
              <TipItem
                title={t("stayMarketResponsive")}
                text={t("stayMarketResponsiveText")}
              />
            </div>
          </Card>
        </div>
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

function ProgressBar({ label, value, count, t }) {
  return (
    <div style={styles.progressItem}>
      <div style={styles.progressTop}>
        <span style={styles.progressLabel}>{label}</span>
        <span style={styles.progressCount}>
          {count} {t("roles")} · {value}%
        </span>
      </div>
      <div style={styles.progressTrack}>
        <div style={{ ...styles.progressFill, width: `${value}%` }} />
      </div>
    </div>
  );
}

function TipItem({ title, text }) {
  return (
    <div style={styles.tipItem}>
      <h4 style={styles.tipTitle}>{title}</h4>
      <p style={styles.tipText}>{text}</p>
    </div>
  );
}

function EmptyMessage({ text }) {
  return <p style={styles.emptyMessage}>{text}</p>;
}

const styles = {
  page: { display: "grid", gap: "20px" },
  hero: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.6fr) minmax(280px, 0.8fr)",
    gap: "20px",
    alignItems: "stretch",
  },
  heroContent: { display: "grid", gap: "12px" },
  eyebrow: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontWeight: 700,
    color: "#64748b",
  },
  heroTitle: {
    margin: 0,
    fontSize: "32px",
    lineHeight: 1.15,
    fontWeight: 800,
    color: "#0f172a",
  },
  heroSubtitle: {
    margin: 0,
    maxWidth: "720px",
    fontSize: "15px",
    lineHeight: 1.7,
    color: "#64748b",
  },
  heroTags: { display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "4px" },
  heroSide: { display: "flex", justifyContent: "stretch" },
  rankCard: {
    width: "100%",
    border: "1px solid #e2e8f0",
    borderRadius: "20px",
    padding: "20px",
    background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)",
    display: "grid",
    gap: "8px",
    alignContent: "start",
  },
  rankLabel: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: "#64748b",
    fontWeight: 700,
  },
  rankValue: { fontSize: "34px", fontWeight: 800, color: "#0f172a" },
  rankMeta: { margin: 0, fontSize: "14px", color: "#64748b" },
  rankFoot: { fontSize: "13px", color: "#0f172a", fontWeight: 600 },
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
  listStack: { display: "grid", gap: "12px" },
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
  insightTitle: { margin: 0, fontSize: "15px", color: "#0f172a", fontWeight: 700 },
  insightMeta: { margin: "4px 0 0", fontSize: "13px", color: "#64748b" },
  insightValue: {
    fontSize: "15px",
    color: "#0f172a",
    fontWeight: 800,
    whiteSpace: "nowrap",
  },
  modePanel: { display: "grid", gap: "14px" },
  progressItem: { display: "grid", gap: "8px" },
  progressTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  progressLabel: { fontSize: "14px", fontWeight: 700, color: "#0f172a" },
  progressCount: { fontSize: "13px", color: "#64748b" },
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
  chartList: { display: "grid", gap: "14px" },
  chartRow: { display: "grid", gap: "8px" },
  chartLabelWrap: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
  },
  chartLabel: { fontSize: "14px", color: "#0f172a", fontWeight: 600 },
  chartValue: { fontSize: "13px", color: "#64748b", fontWeight: 600 },
  chartTrack: {
    height: "12px",
    width: "100%",
    background: "#e2e8f0",
    borderRadius: "999px",
    overflow: "hidden",
  },
  chartBar: {
    height: "100%",
    background: "linear-gradient(90deg, #1e293b 0%, #475569 100%)",
    borderRadius: "999px",
  },
  jobsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "16px",
  },
  jobCard: {
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    padding: "18px",
    display: "grid",
    gap: "14px",
    background: "#ffffff",
  },
  jobTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "12px",
  },
  jobTitle: { margin: 0, fontSize: "16px", color: "#0f172a", fontWeight: 700 },
  jobCompany: { margin: "6px 0 0", fontSize: "14px", color: "#64748b" },
  jobMetaRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  jobMeta: { fontSize: "13px", color: "#475569", fontWeight: 500 },
  jobActions: { display: "flex", gap: "10px", flexWrap: "wrap" },
  tipList: { display: "grid", gap: "12px" },
  tipItem: {
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "14px 16px",
    background: "#ffffff",
  },
  tipTitle: { margin: 0, fontSize: "15px", fontWeight: 700, color: "#0f172a" },
  tipText: {
    margin: "6px 0 0",
    fontSize: "14px",
    lineHeight: 1.6,
    color: "#64748b",
  },
  emptyState: {
    textAlign: "center",
    padding: "32px 16px",
    border: "1px dashed #cbd5e1",
    borderRadius: "16px",
    background: "#f8fafc",
  },
  emptyTitle: { margin: 0, fontSize: "18px", color: "#0f172a", fontWeight: 700 },
  emptyText: {
    margin: "8px 0 0",
    fontSize: "14px",
    color: "#64748b",
    lineHeight: 1.6,
  },
  emptyMessage: { margin: 0, fontSize: "14px", color: "#64748b" },
};

export default CandidateOverview;