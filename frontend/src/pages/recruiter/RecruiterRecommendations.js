import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
  Search,
  Star,
  UserCheck,
  Briefcase,
  Building2,
  MessageCircle,
  Eye,
  Filter,
  RotateCcw,
  X,
  Brain,
  TrendingUp,
  Activity,
  ShieldCheck,
  Clock,
  CheckCircle2,
  FileText,
  Send,
  CalendarDays,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import Button from "../../components/ui/Button";
import api from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";

const defaultRecruiterSettings = {
  default_candidate_message:
    "Hello, I reviewed your profile and believe you may be suitable for new opportunities on our platform.",
  default_employer_message:
    "Hello, I would like to recommend a candidate who may be a strong fit for your role.",
  default_recommendation_note:
    "Recommended based on skills, experience, and role alignment.",
  auto_signature: "Best regards,\nRecruitment Team",
  auto_include_ai_notes: true,
  auto_notify_employer: true,
  follow_up_days: 3,
};

function RecruiterRecommendations() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const tt = (key, fallback) => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  const [recommendations, setRecommendations] = useState([]);
  const [settings, setSettings] = useState(defaultRecruiterSettings);
  const [loading, setLoading] = useState(false);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const fetchPageData = async () => {
    try {
      setLoading(true);

      const [recommendationsRes, settingsRes] = await Promise.allSettled([
        api.get("/api/recruiter/recommendations"),
        api.get("/api/recruiter/settings"),
      ]);

      if (recommendationsRes.status === "fulfilled") {
        const data = Array.isArray(recommendationsRes.value.data)
          ? recommendationsRes.value.data
          : recommendationsRes.value.data.recommendations || [];

        setRecommendations(data);
      } else {
        toast.error(
          recommendationsRes.reason?.response?.data?.error ||
            tt(
              "recruiterRecommendations.alerts.failedLoadRecommendations",
              "Failed to load recommendations."
            )
        );
      }

      if (settingsRes.status === "fulfilled") {
        setSettings({
          ...defaultRecruiterSettings,
          ...(settingsRes.value.data || {}),
        });
      }
    } catch (err) {
      console.error("Failed to load recruiter recommendation data:", err);
      toast.error(
        tt(
          "recruiterRecommendations.alerts.failedLoadData",
          "Failed to load recommendation data."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageData();
  }, []);

  const filteredRecommendations = useMemo(() => {
    let result = [...recommendations];

    result = result.filter((item) => {
      const text = [
        item.candidate_name,
        item.candidate_email,
        item.professional_title,
        item.desired_job_title,
        item.job_title,
        item.company_name,
        item.job_location,
        item.notes,
        item.ai_notes,
        item.employer_feedback,
        item.workflow_stage,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = text.includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;
      const matchesStage =
        stageFilter === "all" || item.workflow_stage === stageFilter;

      const score = Number(item.match_score || 0);

      const matchesScore =
        scoreFilter === "all" ||
        (scoreFilter === "high" && score >= 80) ||
        (scoreFilter === "medium" && score >= 50 && score < 80) ||
        (scoreFilter === "low" && score < 50);

      return matchesSearch && matchesStatus && matchesStage && matchesScore;
    });

    if (sortBy === "match") {
      result.sort(
        (a, b) => Number(b.match_score || 0) - Number(a.match_score || 0)
      );
    }

    if (sortBy === "rating") {
      result.sort(
        (a, b) => Number(b.employer_rating || 0) - Number(a.employer_rating || 0)
      );
    }

    if (sortBy === "response") {
      result.sort(
        (a, b) =>
          Number(a.recruiter_response_time_hours || 999) -
          Number(b.recruiter_response_time_hours || 999)
      );
    }

    if (sortBy === "newest") {
      result.sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
      );
    }

    return result;
  }, [
    recommendations,
    searchTerm,
    statusFilter,
    scoreFilter,
    stageFilter,
    sortBy,
  ]);

  const stats = useMemo(() => {
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
      total,
      accepted,
      avgScore,
      acceptanceRate: total > 0 ? Math.round((accepted / total) * 100) : 0,
      engagementRate: total > 0 ? Math.round((viewed / total) * 100) : 0,
    };
  }, [recommendations]);

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setScoreFilter("all");
    setStageFilter("all");
    setSortBy("newest");
    toast(tt("recruiterRecommendations.alerts.filtersReset", "Filters reset."));
  };

  const buildEmployerMessage = (item) => {
    const aiNotes =
      settings.auto_include_ai_notes && item.ai_notes
        ? `\n\n${tt("recruiterRecommendations.message.aiMatchInsight", "AI Match Insight")}:\n${item.ai_notes}`
        : "";

    return `${settings.default_employer_message}

${tt("recruiterRecommendations.message.candidate", "Candidate")}: ${
      item.candidate_name ||
      tt("recruiterRecommendations.defaults.candidate", "Candidate")
    }
${tt("recruiterRecommendations.message.role", "Role")}: ${
      item.job_title ||
      tt("recruiterRecommendations.defaults.jobOpportunity", "Job opportunity")
    }
${tt("recruiterRecommendations.message.matchScore", "Match Score")}: ${
      item.match_score || 0
    }%
${tt("recruiterRecommendations.message.recommendationNote", "Recommendation Note")}: ${
      item.notes || settings.default_recommendation_note
    }${aiNotes}

${tt("recruiterRecommendations.message.followUp", "Follow-up")}: ${tt(
      "recruiterRecommendations.message.checkBack",
      "I will check back in"
    )} ${settings.follow_up_days || 3} ${tt(
      "recruiterRecommendations.labels.days",
      "days"
    )}.

${settings.auto_signature || ""}`;
  };

  const messageEmployer = async (item) => {
    if (!item.employer_id) {
      toast.error(
        tt(
          "recruiterRecommendations.alerts.noEmployer",
          "No employer account is linked to this job yet."
        )
      );
      return;
    }

    try {
      const res = await api.post("/api/messages/conversations", {
        receiver_id: item.employer_id,
        job_id: item.job_id,
        default_message: buildEmployerMessage(item),
      });

      const conversationId =
        res.data?.conversation?.id || res.data?.conversation_id || res.data?.id;

      toast.success(
        tt(
          "recruiterRecommendations.alerts.conversationOpened",
          "Employer conversation opened."
        )
      );

      navigate(
        `/dashboard/messages?conversation=${conversationId}&employer=${item.employer_id}&job=${item.job_id}`
      );
    } catch (err) {
      console.error("Failed to message employer:", err);
      toast.error(
        tt(
          "recruiterRecommendations.alerts.redirectingMessages",
          "Could not open conversation. Redirecting to messages."
        )
      );

      navigate(
        `/dashboard/messages?employer=${item.employer_id}&job=${item.job_id}`
      );
    }
  };

  return (
    <DashboardLayout
      title={tt("recruiterRecommendations.title", "Talent Recommendations")}
      subtitle={tt(
        "recruiterRecommendations.subtitle",
        "Track recommendation outcomes, employer feedback, AI insights, and recruiter performance."
      )}
    >
      <Toaster position="top-right" />

      <div style={styles.settingsNote}>
        <ShieldCheck size={17} />
        <span>
          {tt(
            "recruiterRecommendations.settings.poweredBySettings",
            "Recommendation messages and follow-up timing are powered by your recruiter settings."
          )}
        </span>
      </div>

      <div style={styles.statsGrid}>
        <StatCard
          icon={<Star size={25} />}
          title={tt("recruiterRecommendations.stats.total", "Total")}
          value={stats.total}
          subtext={tt(
            "recruiterRecommendations.stats.recommendationsSent",
            "Recommendations sent"
          )}
          color="#4f46e5"
          bg="#eef2ff"
        />

        <StatCard
          icon={<TrendingUp size={25} />}
          title={tt("recruiterRecommendations.stats.avgMatch", "Avg Match")}
          value={`${stats.avgScore}%`}
          subtext={tt(
            "recruiterRecommendations.stats.recommendationQuality",
            "Recommendation quality"
          )}
          color="#16a34a"
          bg="#dcfce7"
        />

        <StatCard
          icon={<UserCheck size={25} />}
          title={tt("recruiterRecommendations.stats.acceptance", "Acceptance")}
          value={`${stats.acceptanceRate}%`}
          subtext={`${stats.accepted} ${tt(
            "recruiterRecommendations.stats.accepted",
            "accepted"
          )}`}
          color="#2563eb"
          bg="#dbeafe"
        />

        <StatCard
          icon={<Activity size={25} />}
          title={tt(
            "recruiterRecommendations.stats.employerViewed",
            "Employer Viewed"
          )}
          value={`${stats.engagementRate}%`}
          subtext={tt(
            "recruiterRecommendations.stats.engagementRate",
            "Engagement rate"
          )}
          color="#f97316"
          bg="#ffedd5"
        />
      </div>

      <section style={styles.panel}>
        <div style={styles.panelHeader}>
          <div>
            <h2 style={styles.panelTitle}>
              {tt(
                "recruiterRecommendations.pipeline.title",
                "Recommendation Pipeline"
              )}
            </h2>
            <p style={styles.panelSubtitle}>
              {tt(
                "recruiterRecommendations.pipeline.subtitle",
                "Open a recommendation for full details."
              )}
            </p>
          </div>
        </div>

        <div style={styles.toolbar}>
          <div style={styles.searchBox}>
            <Search size={18} color="#64748b" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={tt(
                "recruiterRecommendations.filters.searchPlaceholder",
                "Search candidate, job, company..."
              )}
              style={styles.input}
            />
          </div>

          <div style={styles.controlGroup}>
            <SelectBox
              icon={<Filter size={16} />}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <option value="all">
                {tt("recruiterRecommendations.filters.allStatus", "All status")}
              </option>
              <option value="recommended">
                {tt(
                  "recruiterRecommendations.filters.recommended",
                  "Recommended"
                )}
              </option>
              <option value="reviewed">
                {tt("recruiterRecommendations.filters.reviewed", "Reviewed")}
              </option>
              <option value="accepted">
                {tt("recruiterRecommendations.filters.accepted", "Accepted")}
              </option>
              <option value="rejected">
                {tt("recruiterRecommendations.filters.rejected", "Rejected")}
              </option>
            </SelectBox>

            <SelectBox value={scoreFilter} onChange={setScoreFilter}>
              <option value="all">
                {tt("recruiterRecommendations.filters.allScores", "All scores")}
              </option>
              <option value="high">
                {tt("recruiterRecommendations.filters.high", "High, 80%+")}
              </option>
              <option value="medium">
                {tt(
                  "recruiterRecommendations.filters.medium",
                  "Medium, 50-79%"
                )}
              </option>
              <option value="low">
                {tt(
                  "recruiterRecommendations.filters.low",
                  "Low, below 50%"
                )}
              </option>
            </SelectBox>

            <SelectBox value={stageFilter} onChange={setStageFilter}>
              <option value="all">
                {tt("recruiterRecommendations.filters.allStages", "All stages")}
              </option>
              <option value="submitted_to_employer">
                {tt("recruiterRecommendations.filters.submitted", "Submitted")}
              </option>
              <option value="employer_review">
                {tt(
                  "recruiterRecommendations.filters.employerReview",
                  "Employer Review"
                )}
              </option>
              <option value="accepted_by_employer">
                {tt("recruiterRecommendations.filters.accepted", "Accepted")}
              </option>
              <option value="closed_rejected">
                {tt("recruiterRecommendations.filters.rejected", "Rejected")}
              </option>
            </SelectBox>

            <SelectBox value={sortBy} onChange={setSortBy}>
              <option value="newest">
                {tt("recruiterRecommendations.filters.newest", "Newest")}
              </option>
              <option value="match">
                {tt(
                  "recruiterRecommendations.filters.highestMatch",
                  "Highest match"
                )}
              </option>
              <option value="rating">
                {tt(
                  "recruiterRecommendations.filters.employerRating",
                  "Employer rating"
                )}
              </option>
              <option value="response">
                {tt(
                  "recruiterRecommendations.filters.fastestResponse",
                  "Fastest response"
                )}
              </option>
            </SelectBox>

            <button type="button" style={styles.resetButton} onClick={resetFilters}>
              <RotateCcw size={16} />
              {tt("recruiterRecommendations.actions.reset", "Reset")}
            </button>
          </div>
        </div>

        <div style={styles.panelMeta}>
          <span>
            {filteredRecommendations.length}{" "}
            {tt(
              "recruiterRecommendations.labels.recommendationsFound",
              "recommendations found"
            )}
          </span>
        </div>

        {loading ? (
          <div style={styles.emptyState}>
            {tt(
              "recruiterRecommendations.states.loadingRecommendations",
              "Loading recommendations..."
            )}
          </div>
        ) : filteredRecommendations.length === 0 ? (
          <div style={styles.emptyState}>
            {tt(
              "recruiterRecommendations.states.noRecommendations",
              "No recommendations found. Use Match Talent on the Jobs page to recommend candidates."
            )}
          </div>
        ) : (
          <div style={styles.recommendationGrid}>
            {filteredRecommendations.map((item) => (
              <RecommendationCard
                key={item.id}
                item={item}
                tt={tt}
                onView={() => setSelectedRecommendation(item)}
                onMessage={() => messageEmployer(item)}
              />
            ))}
          </div>
        )}
      </section>

      {selectedRecommendation && (
        <RecommendationModal
          item={selectedRecommendation}
          settings={settings}
          employerMessage={buildEmployerMessage(selectedRecommendation)}
          onClose={() => setSelectedRecommendation(null)}
          onMessage={() => messageEmployer(selectedRecommendation)}
          tt={tt}
        />
      )}
    </DashboardLayout>
  );
}

function SelectBox({ icon, value, onChange, children }) {
  return (
    <div style={styles.selectBox}>
      {icon}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={styles.select}
      >
        {children}
      </select>
    </div>
  );
}

function StatCard({ icon, title, value, subtext, color, bg }) {
  return (
    <div style={styles.statCard}>
      <div style={{ ...styles.statIcon, background: bg, color }}>{icon}</div>

      <div>
        <p style={styles.statTitle}>{title}</p>
        <h2 style={styles.statValue}>{value}</h2>
        <span style={styles.statSubtext}>{subtext}</span>
      </div>
    </div>
  );
}

function RecommendationCard({ item, onView, onMessage, tt }) {
  const stage = getStageLabel(item.workflow_stage || item.status, tt);

  return (
    <div style={styles.recommendationCard}>
      <div style={styles.cardTop}>
        <img
          src={item.candidate_image || "/images/avatar.jpg"}
          alt={
            item.candidate_name ||
            tt("recruiterRecommendations.defaults.candidate", "Candidate")
          }
          style={styles.avatar}
          onError={(e) => {
            e.currentTarget.src = "/images/avatar.jpg";
          }}
        />

        <div style={styles.cardIdentity}>
          <h3 style={styles.cardTitle}>
            {item.candidate_name ||
              tt(
                "recruiterRecommendations.defaults.unnamedCandidate",
                "Unnamed Candidate"
              )}
          </h3>
          <p style={styles.cardSubtitle}>
            {item.professional_title ||
              item.desired_job_title ||
              tt("recruiterRecommendations.defaults.candidate", "Candidate")}
          </p>
        </div>

        <span style={styles.scoreBadge}>{item.match_score || 0}%</span>
      </div>

      <div style={styles.cardJobLine}>
        <Briefcase size={14} />
        <span>
          {item.job_title ||
            tt("recruiterRecommendations.defaults.untitledJob", "Untitled Job")}
        </span>
      </div>

      <div style={styles.cardJobLine}>
        <Building2 size={14} />
        <span>
          {item.company_name ||
            tt(
              "recruiterRecommendations.defaults.companyNotSpecified",
              "Company not specified"
            )}
        </span>
      </div>

      <div style={styles.cardFooter}>
        <span style={styles.stageTag}>{stage}</span>
        <span style={item.employer_viewed ? styles.viewedTag : styles.notViewedTag}>
          {item.employer_viewed
            ? tt("recruiterRecommendations.labels.viewed", "Viewed")
            : tt("recruiterRecommendations.labels.notViewed", "Not viewed")}
        </span>
      </div>

      <div style={styles.actions}>
        <button type="button" style={styles.viewButton} onClick={onView}>
          <Eye size={15} />
          {tt("recruiterRecommendations.actions.viewDetails", "View Details")}
        </button>

        <button type="button" style={styles.messageButton} onClick={onMessage}>
          <MessageCircle size={15} />
          {tt("recruiterRecommendations.actions.message", "Message")}
        </button>
      </div>
    </div>
  );
}

function RecommendationModal({
  item,
  settings,
  employerMessage,
  onClose,
  onMessage,
  tt,
}) {
  const timeline = buildTimeline(item, tt);
  const rating = Number(item.employer_rating || 0);

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.largeModal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHero}>
          <div style={styles.heroLeft}>
            <img
              src={item.candidate_image || "/images/avatar.jpg"}
              alt={
                item.candidate_name ||
                tt("recruiterRecommendations.defaults.candidate", "Candidate")
              }
              style={styles.heroAvatar}
              onError={(e) => {
                e.currentTarget.src = "/images/avatar.jpg";
              }}
            />

            <div>
              <div style={styles.heroBadge}>
                {tt(
                  "recruiterRecommendations.modal.recommendationDetails",
                  "Recommendation Details"
                )}
              </div>
              <h2 style={styles.modalTitle}>
                {item.candidate_name ||
                  tt(
                    "recruiterRecommendations.defaults.unnamedCandidate",
                    "Unnamed Candidate"
                  )}
              </h2>
              <p style={styles.modalSubtitle}>
                {item.professional_title ||
                  item.desired_job_title ||
                  tt("recruiterRecommendations.defaults.candidate", "Candidate")}{" "}
                {tt("recruiterRecommendations.labels.for", "for")}{" "}
                {item.job_title ||
                  tt(
                    "recruiterRecommendations.defaults.untitledJob",
                    "Untitled Job"
                  )}
              </p>
            </div>
          </div>

          <button type="button" style={styles.closeButton} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={styles.modalSummaryGrid}>
          <SummaryCard
            icon={<TrendingUp size={20} />}
            label={tt("recruiterRecommendations.summary.matchScore", "Match Score")}
            value={`${item.match_score || 0}%`}
            tt={tt}
          />
          <SummaryCard
            icon={<CheckCircle2 size={20} />}
            label={tt("recruiterRecommendations.summary.status", "Status")}
            value={item.status || "recommended"}
            tt={tt}
          />
          <SummaryCard
            icon={<Eye size={20} />}
            label={tt(
              "recruiterRecommendations.summary.employerViewed",
              "Employer Viewed"
            )}
            value={
              item.employer_viewed
                ? tt("recruiterRecommendations.options.yes", "Yes")
                : tt("recruiterRecommendations.options.no", "No")
            }
            tt={tt}
          />
          <SummaryCard
            icon={<Clock size={20} />}
            label={tt(
              "recruiterRecommendations.summary.responseTime",
              "Response Time"
            )}
            value={`${item.recruiter_response_time_hours || 0}h`}
            tt={tt}
          />
        </div>

        <div style={styles.modalBody}>
          <div style={styles.modalMain}>
            <section style={styles.modalSection}>
              <SectionTitle
                icon={<UserCheck size={18} />}
                title={tt(
                  "recruiterRecommendations.sections.candidateProfile",
                  "Candidate Profile"
                )}
              />

              <div style={styles.detailGrid}>
                <Detail
                  label={tt("recruiterRecommendations.fields.name", "Name")}
                  value={item.candidate_name}
                  tt={tt}
                />
                <Detail
                  label={tt("recruiterRecommendations.fields.email", "Email")}
                  value={item.candidate_email}
                  tt={tt}
                />
                <Detail
                  label={tt("recruiterRecommendations.fields.title", "Title")}
                  value={item.professional_title || item.desired_job_title}
                  tt={tt}
                />
                <Detail
                  label={tt(
                    "recruiterRecommendations.fields.experience",
                    "Experience"
                  )}
                  value={
                    item.years_of_experience
                      ? `${item.years_of_experience} ${tt(
                          "recruiterRecommendations.labels.years",
                          "years"
                        )}`
                      : ""
                  }
                  tt={tt}
                />
                <Detail
                  label={tt("recruiterRecommendations.fields.country", "Country")}
                  value={item.country}
                  tt={tt}
                />
                <Detail
                  label={tt("recruiterRecommendations.fields.city", "City")}
                  value={item.city}
                  tt={tt}
                />
              </div>
            </section>

            <section style={styles.modalSection}>
              <SectionTitle
                icon={<Briefcase size={18} />}
                title={tt(
                  "recruiterRecommendations.sections.jobAndCompany",
                  "Job and Company"
                )}
              />

              <div style={styles.jobHeaderBox}>
                {item.company_logo ? (
                  <img
                    src={item.company_logo}
                    alt={
                      item.company_name ||
                      tt("recruiterRecommendations.defaults.company", "Company")
                    }
                    style={styles.companyLogoLarge}
                  />
                ) : (
                  <div style={styles.companyLogoFallback}>
                    <Building2 size={24} />
                  </div>
                )}

                <div>
                  <h3>
                    {item.job_title ||
                      tt(
                        "recruiterRecommendations.defaults.untitledJob",
                        "Untitled Job"
                      )}
                  </h3>
                  <p>
                    {item.company_name ||
                      tt(
                        "recruiterRecommendations.defaults.companyNotSpecified",
                        "Company not specified"
                      )}
                  </p>
                </div>
              </div>

              <div style={styles.detailGrid}>
                <Detail
                  label={tt("recruiterRecommendations.fields.location", "Location")}
                  value={item.job_location}
                  tt={tt}
                />
                <Detail
                  label={tt("recruiterRecommendations.fields.workMode", "Work Mode")}
                  value={item.work_mode}
                  tt={tt}
                />
                <Detail
                  label={tt(
                    "recruiterRecommendations.fields.employmentType",
                    "Employment Type"
                  )}
                  value={item.employment_type}
                  tt={tt}
                />
                <Detail
                  label={tt("recruiterRecommendations.fields.jobStatus", "Job Status")}
                  value={item.job_status}
                  tt={tt}
                />
                <Detail
                  label={tt("recruiterRecommendations.fields.employer", "Employer")}
                  value={item.employer_name}
                  tt={tt}
                />
                <Detail
                  label={tt(
                    "recruiterRecommendations.fields.employerEmail",
                    "Employer Email"
                  )}
                  value={item.employer_email}
                  tt={tt}
                />
              </div>
            </section>

            <section style={styles.modalSection}>
              <SectionTitle
                icon={<Brain size={18} />}
                title={tt(
                  "recruiterRecommendations.sections.aiMatchAnalysis",
                  "AI Match Analysis"
                )}
              />

              <div style={styles.insightBox}>
                <p>
                  {settings.auto_include_ai_notes
                    ? item.ai_notes ||
                      tt(
                        "recruiterRecommendations.states.noAiInsight",
                        "No AI insight available yet."
                      )
                    : tt(
                        "recruiterRecommendations.states.aiNotesDisabled",
                        "AI notes are disabled in recruiter settings."
                      )}
                </p>
              </div>
            </section>

            <section style={styles.modalSection}>
              <SectionTitle
                icon={<FileText size={18} />}
                title={tt(
                  "recruiterRecommendations.sections.recruiterNotes",
                  "Recruiter Notes"
                )}
              />
              <p style={styles.noteText}>
                {item.notes || settings.default_recommendation_note}
              </p>
            </section>

            <section style={styles.modalSection}>
              <SectionTitle
                icon={<MessageCircle size={18} />}
                title={tt(
                  "recruiterRecommendations.sections.employerFeedback",
                  "Employer Feedback"
                )}
              />

              <p style={styles.noteText}>
                {item.employer_feedback ||
                  tt(
                    "recruiterRecommendations.states.pendingEmployerFeedback",
                    "Pending employer feedback."
                  )}
              </p>

              <div style={styles.ratingBox}>
                <span>{renderStars(rating)}</span>
                <strong>
                  {rating
                    ? `${rating}/5`
                    : tt(
                        "recruiterRecommendations.states.noRatingYet",
                        "No rating yet"
                      )}
                </strong>
              </div>
            </section>

            <section style={styles.modalSection}>
              <SectionTitle
                icon={<Send size={18} />}
                title={tt(
                  "recruiterRecommendations.sections.employerMessagePreview",
                  "Employer Message Preview"
                )}
              />

              <pre style={styles.messagePreview}>{employerMessage}</pre>
            </section>
          </div>

          <aside style={styles.modalAside}>
            <section style={styles.sidePanel}>
              <SectionTitle
                icon={<CalendarDays size={18} />}
                title={tt("recruiterRecommendations.sections.timeline", "Timeline")}
              />

              <div style={styles.timeline}>
                {timeline.map((event, index) => (
                  <div key={index} style={styles.timelineItem}>
                    <span
                      style={{
                        ...styles.timelineDot,
                        background: event.date ? "#2563eb" : "#cbd5e1",
                      }}
                    />

                    <div>
                      <strong>{event.title}</strong>
                      <p>
                        {event.date ||
                          tt("recruiterRecommendations.states.pending", "Pending")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section style={styles.sidePanel}>
              <SectionTitle
                icon={<Activity size={18} />}
                title={tt(
                  "recruiterRecommendations.sections.workflowSignals",
                  "Workflow Signals"
                )}
              />

              <Signal
                label={tt(
                  "recruiterRecommendations.signals.workflowStage",
                  "Workflow Stage"
                )}
                value={getStageLabel(item.workflow_stage || item.status, tt)}
                tt={tt}
              />
              <Signal
                label={tt(
                  "recruiterRecommendations.signals.employerViewed",
                  "Employer Viewed"
                )}
                value={
                  item.employer_viewed
                    ? tt("recruiterRecommendations.options.yes", "Yes")
                    : tt("recruiterRecommendations.options.no", "No")
                }
                tt={tt}
              />
              <Signal
                label={tt(
                  "recruiterRecommendations.signals.followUpWindow",
                  "Follow-up Window"
                )}
                value={`${settings.follow_up_days || 3} ${tt(
                  "recruiterRecommendations.labels.days",
                  "days"
                )}`}
                tt={tt}
              />
              <Signal
                label={tt(
                  "recruiterRecommendations.signals.autoNotifyEmployer",
                  "Auto Notify Employer"
                )}
                value={
                  settings.auto_notify_employer
                    ? tt("recruiterRecommendations.options.enabled", "Enabled")
                    : tt("recruiterRecommendations.options.disabled", "Disabled")
                }
                tt={tt}
              />
              <Signal
                label={tt("recruiterRecommendations.signals.aiNotes", "AI Notes")}
                value={
                  settings.auto_include_ai_notes
                    ? tt("recruiterRecommendations.options.enabled", "Enabled")
                    : tt("recruiterRecommendations.options.disabled", "Disabled")
                }
                tt={tt}
              />
            </section>
          </aside>
        </div>

        <div style={styles.modalFooter}>
          <Button variant="secondary" onClick={onClose}>
            {tt("recruiterRecommendations.actions.close", "Close")}
          </Button>

          <Button onClick={onMessage}>
            <MessageCircle size={15} />
            {tt(
              "recruiterRecommendations.actions.messageEmployer",
              "Message Employer"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value, tt }) {
  return (
    <div style={styles.summaryCard}>
      <div style={styles.summaryIcon}>{icon}</div>
      <span>{label}</span>
      <strong>
        {value || tt("recruiterRecommendations.states.notAvailable", "Not available")}
      </strong>
    </div>
  );
}

function SectionTitle({ icon, title }) {
  return (
    <div style={styles.sectionTitle}>
      {icon}
      <h3>{title}</h3>
    </div>
  );
}

function Detail({ label, value, tt }) {
  return (
    <div style={styles.detailItem}>
      <span>{label}</span>
      <strong>
        {value || tt("recruiterRecommendations.states.notAvailable", "Not available")}
      </strong>
    </div>
  );
}

function Signal({ label, value, tt }) {
  return (
    <div style={styles.signalBox}>
      <span>{label}</span>
      <strong>
        {value || tt("recruiterRecommendations.states.notAvailable", "Not available")}
      </strong>
    </div>
  );
}

function buildTimeline(item, tt) {
  return [
    {
      title: tt("recruiterRecommendations.timeline.recommended", "Recommended"),
      date: formatDateTime(item.created_at),
    },
    {
      title: tt("recruiterRecommendations.timeline.employerViewed", "Employer Viewed"),
      date: item.employer_viewed
        ? formatDateTime(item.reviewed_at || item.created_at)
        : null,
    },
    {
      title: tt("recruiterRecommendations.timeline.reviewed", "Reviewed"),
      date: formatDateTime(item.reviewed_at),
    },
    {
      title: tt("recruiterRecommendations.timeline.accepted", "Accepted"),
      date: formatDateTime(item.accepted_at),
    },
    {
      title: tt("recruiterRecommendations.timeline.rejected", "Rejected"),
      date: formatDateTime(item.rejected_at),
    },
  ];
}

function getStageLabel(stage, tt) {
  const labels = {
    submitted_to_employer: tt(
      "recruiterRecommendations.stages.submitted",
      "Submitted"
    ),
    employer_review: tt(
      "recruiterRecommendations.stages.employerReview",
      "Employer Review"
    ),
    accepted_by_employer: tt(
      "recruiterRecommendations.stages.accepted",
      "Accepted"
    ),
    closed_rejected: tt(
      "recruiterRecommendations.stages.rejected",
      "Rejected"
    ),
    recommended: tt(
      "recruiterRecommendations.stages.recommended",
      "Recommended"
    ),
    reviewed: tt("recruiterRecommendations.stages.reviewed", "Reviewed"),
    accepted: tt("recruiterRecommendations.stages.accepted", "Accepted"),
    rejected: tt("recruiterRecommendations.stages.rejected", "Rejected"),
  };

  return labels[stage] || tt("recruiterRecommendations.stages.submitted", "Submitted");
}

function renderStars(rating) {
  if (!rating) return "☆☆☆☆☆";
  return "★".repeat(rating) + "☆".repeat(Math.max(0, 5 - rating));
}

function formatDateTime(date) {
  if (!date) return "";
  return new Date(date).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const styles = {
  settingsNote: {
    marginBottom: 18,
    border: "1px solid #dbeafe",
    background: "#eff6ff",
    color: "#1d4ed8",
    borderRadius: 16,
    padding: "13px 15px",
    display: "flex",
    alignItems: "center",
    gap: 9,
    fontWeight: 700,
    fontSize: 13,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 18,
    marginBottom: 22,
  },

  statCard: {
    minHeight: 112,
    background: "#fff",
    border: "1px solid #e8edf5",
    borderRadius: 24,
    padding: 20,
    display: "flex",
    gap: 16,
    alignItems: "center",
    boxShadow: "0 20px 50px rgba(15, 23, 42, 0.06)",
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
    fontSize: 28,
    color: "#0f172a",
    lineHeight: 1,
  },

  statSubtext: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: 600,
  },

  panel: {
    background: "#fff",
    border: "1px solid #e8edf5",
    borderRadius: 26,
    padding: 22,
    boxShadow: "0 24px 70px rgba(15, 23, 42, 0.07)",
  },

  panelHeader: {
    marginBottom: 20,
  },

  panelTitle: {
    margin: 0,
    color: "#0f172a",
  },

  panelSubtitle: {
    margin: "6px 0 0",
    color: "#64748b",
  },

  toolbar: {
    display: "grid",
    gap: 16,
    marginBottom: 18,
  },

  searchBox: {
    height: 50,
    border: "1px solid #dbe3ef",
    borderRadius: 16,
    padding: "0 16px",
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#f8fafc",
  },

  input: {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: 14,
    color: "#0f172a",
  },

  controlGroup: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },

  selectBox: {
    height: 50,
    minWidth: 170,
    border: "1px solid #dbe3ef",
    borderRadius: 16,
    padding: "0 12px",
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#fff",
  },

  select: {
    border: "none",
    outline: "none",
    background: "transparent",
    fontWeight: 700,
    color: "#334155",
    width: "100%",
  },

  resetButton: {
    height: 50,
    border: "1px solid #dbe3ef",
    borderRadius: 16,
    background: "#fff",
    padding: "0 18px",
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontWeight: 800,
    color: "#334155",
    cursor: "pointer",
  },

  panelMeta: {
    marginBottom: 18,
    color: "#64748b",
    fontSize: 14,
    fontWeight: 700,
  },

  recommendationGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: 16,
  },

  recommendationCard: {
    border: "1px solid #e3eaf4",
    borderRadius: 22,
    padding: 18,
    background: "#fff",
    display: "grid",
    gap: 13,
    boxShadow: "0 14px 35px rgba(15, 23, 42, 0.045)",
  },

  cardTop: {
    display: "grid",
    gridTemplateColumns: "52px 1fr auto",
    gap: 12,
    alignItems: "center",
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 17,
    objectFit: "cover",
    background: "#eef2ff",
  },

  cardIdentity: {
    minWidth: 0,
  },

  cardTitle: {
    margin: 0,
    color: "#0f172a",
    fontSize: 16,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  cardSubtitle: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: 13,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  scoreBadge: {
    width: 54,
    height: 54,
    borderRadius: "50%",
    background: "#dcfce7",
    color: "#166534",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
  },

  cardJobLine: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#475569",
    fontSize: 13,
    fontWeight: 700,
  },

  cardFooter: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },

  stageTag: {
    padding: "6px 10px",
    borderRadius: 999,
    background: "#eef2ff",
    color: "#4338ca",
    fontWeight: 800,
    fontSize: 12,
  },

  viewedTag: {
    padding: "6px 10px",
    borderRadius: 999,
    background: "#dcfce7",
    color: "#166534",
    fontWeight: 800,
    fontSize: 12,
  },

  notViewedTag: {
    padding: "6px 10px",
    borderRadius: 999,
    background: "#f1f5f9",
    color: "#64748b",
    fontWeight: 800,
    fontSize: 12,
  },

  actions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },

  viewButton: {
    height: 42,
    border: "1px solid #dbe3ef",
    borderRadius: 13,
    background: "#fff",
    color: "#334155",
    fontWeight: 800,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  messageButton: {
    height: 42,
    border: "none",
    borderRadius: 13,
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  emptyState: {
    padding: 60,
    textAlign: "center",
    color: "#64748b",
    fontWeight: 700,
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    zIndex: 5000,
  },

  largeModal: {
    width: "100%",
    maxWidth: 1120,
    maxHeight: "92vh",
    overflowY: "auto",
    background: "#f8fafc",
    borderRadius: 30,
    boxShadow: "0 30px 90px rgba(15, 23, 42, 0.35)",
  },

  modalHero: {
    padding: 26,
    background: "linear-gradient(135deg, #0f172a, #1e3a8a)",
    color: "#fff",
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "center",
  },

  heroLeft: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },

  heroAvatar: {
    width: 74,
    height: 74,
    borderRadius: 24,
    objectFit: "cover",
    border: "3px solid rgba(255,255,255,0.22)",
    background: "#fff",
  },

  heroBadge: {
    display: "inline-flex",
    padding: "5px 10px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.14)",
    fontSize: 12,
    fontWeight: 800,
    marginBottom: 8,
  },

  modalTitle: {
    margin: 0,
    color: "#fff",
    fontSize: 26,
  },

  modalSubtitle: {
    margin: "7px 0 0",
    color: "#dbeafe",
  },

  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    border: "none",
    background: "rgba(255,255,255,0.15)",
    color: "#fff",
    cursor: "pointer",
  },

  modalSummaryGrid: {
    padding: 20,
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: 14,
  },

  summaryCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 18,
    padding: 16,
    display: "grid",
    gap: 7,
    boxShadow: "0 14px 30px rgba(15, 23, 42, 0.06)",
  },

  summaryIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  modalBody: {
    padding: "0 20px 20px",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.4fr) minmax(300px, 0.8fr)",
    gap: 18,
    alignItems: "start",
  },

  modalMain: {
    display: "grid",
    gap: 16,
  },

  modalAside: {
    display: "grid",
    gap: 16,
  },

  modalSection: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 22,
    padding: 18,
    boxShadow: "0 14px 30px rgba(15, 23, 42, 0.045)",
  },

  sidePanel: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 22,
    padding: 18,
    boxShadow: "0 14px 30px rgba(15, 23, 42, 0.045)",
  },

  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "#0f172a",
    marginBottom: 14,
  },

  detailGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: 12,
  },

  detailItem: {
    border: "1px solid #edf2f7",
    background: "#f8fafc",
    borderRadius: 15,
    padding: 12,
    display: "grid",
    gap: 5,
  },

  jobHeaderBox: {
    border: "1px solid #edf2f7",
    background: "#f8fafc",
    borderRadius: 18,
    padding: 14,
    display: "flex",
    alignItems: "center",
    gap: 13,
    marginBottom: 14,
  },

  companyLogoLarge: {
    width: 58,
    height: 58,
    borderRadius: 18,
    objectFit: "cover",
  },

  companyLogoFallback: {
    width: 58,
    height: 58,
    borderRadius: 18,
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  insightBox: {
    border: "1px solid #dbeafe",
    background: "#eff6ff",
    color: "#1e3a8a",
    borderRadius: 18,
    padding: 15,
    lineHeight: 1.7,
  },

  noteText: {
    color: "#475569",
    lineHeight: 1.7,
    margin: 0,
  },

  ratingBox: {
    marginTop: 12,
    border: "1px solid #fef3c7",
    background: "#fffbeb",
    color: "#92400e",
    borderRadius: 15,
    padding: 12,
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
  },

  timeline: {
    display: "grid",
    gap: 14,
  },

  timelineItem: {
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
  },

  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: "50%",
    marginTop: 5,
    flexShrink: 0,
  },

  signalBox: {
    border: "1px solid #edf2f7",
    background: "#f8fafc",
    borderRadius: 15,
    padding: 12,
    display: "grid",
    gap: 5,
    marginBottom: 10,
  },

  messagePreview: {
    whiteSpace: "pre-wrap",
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: 16,
    padding: 16,
    color: "#e2e8f0",
    lineHeight: 1.7,
    fontFamily: "inherit",
    margin: 0,
  },

  modalFooter: {
    padding: 20,
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    background: "#fff",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
};

export default RecruiterRecommendations;