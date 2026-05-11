import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Briefcase,
  MapPin,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  MessageCircle,
  Filter,
  RotateCcw,
  Building2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Send,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import Button from "../../components/ui/Button";
import api from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";

const ITEMS_PER_PAGE = 16;

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
}

function RecruiterJobs() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { t } = useLanguage();

  const tt = (key, fallback) => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const [matchJob, setMatchJob] = useState(null);
  const [matches, setMatches] = useState([]);
  const [matchingLoading, setMatchingLoading] = useState(false);

  const [postJobOpen, setPostJobOpen] = useState(false);
  const [postingJob, setPostingJob] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [workModeFilter, setWorkModeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [currentPage, setCurrentPage] = useState(1);

  const [jobForm, setJobForm] = useState({
    title: "",
    company_id: "",
    description: "",
    location: "",
    salary_range: "",
    employment_type: "Full-time",
    work_mode: "Remote",
    experience_level: "",
    required_skills: "",
    benefits: "",
    application_instructions: "",
  });

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/recruiter/jobs");
      const data = Array.isArray(res.data) ? res.data : res.data.jobs || [];
      setJobs(data);
    } catch (err) {
      console.error("Failed to load recruiter jobs:", err);
      alert(err.response?.data?.error || tt("recruiterJobs.alerts.failedLoadJobs", "Failed to load jobs"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    let result = [...jobs];

    result = result.filter((job) => {
      const text = [
        job.title,
        job.company_name,
        job.location,
        job.description,
        job.required_skills,
        job.employment_type,
        job.work_mode,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = text.includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || job.status === statusFilter;

      const matchesWorkMode =
        workModeFilter === "all" ||
        String(job.work_mode || "").toLowerCase() === workModeFilter;

      return matchesSearch && matchesStatus && matchesWorkMode;
    });

    if (sortBy === "applications") {
      result.sort(
        (a, b) =>
          Number(b.application_count || 0) - Number(a.application_count || 0)
      );
    }

    if (sortBy === "salary") {
      result.sort((a, b) => Number(b.salary_max || 0) - Number(a.salary_max || 0));
    }

    if (sortBy === "recent") {
      result.sort(
        (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
      );
    }

    return result;
  }, [jobs, searchTerm, statusFilter, workModeFilter, sortBy]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, workModeFilter, sortBy]);

  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);

  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const stats = useMemo(() => {
    const total = jobs.length;
    const active = jobs.filter((job) => job.status === "active").length;
    const remote = jobs.filter(
      (job) => String(job.work_mode || "").toLowerCase() === "remote"
    ).length;
    const applications = jobs.reduce(
      (sum, job) => sum + Number(job.application_count || 0),
      0
    );

    return { total, active, remote, applications };
  }, [jobs]);

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setWorkModeFilter("all");
    setSortBy("recent");
    setCurrentPage(1);
  };

  const matchTalent = async (job) => {
    try {
      setMatchJob(job);
      setMatchingLoading(true);

      const res = await api.get(`/api/recruiter/jobs/${job.id}/matches`);
      setMatches(res.data.matches || []);
    } catch (err) {
      console.error("Failed to load talent matches:", err);
      alert(
        err.response?.data?.error ||
          tt("recruiterJobs.alerts.failedLoadMatches", "Failed to load talent matches")
      );
    } finally {
      setMatchingLoading(false);
    }
  };

  const recommendCandidate = async (candidate, job) => {
    const notes = window.prompt(
      `${tt("recruiterJobs.alerts.recommendationNotes", "Add recommendation notes for")} ${
        candidate.name || tt("recruiterJobs.alerts.thisCandidate", "this candidate")
      }:`
    );

    try {
      await api.post("/api/recruiter/recommendations", {
        candidate_id: candidate.id,
        job_id: job.id,
        match_score: candidate.match_score || 0,
        notes: notes || "",
      });

      alert(tt("recruiterJobs.alerts.recommendSuccess", "Candidate recommended successfully."));
    } catch (err) {
      console.error("Failed to recommend candidate:", err);
      alert(
        err.response?.data?.error ||
          tt("recruiterJobs.alerts.failedRecommend", "Failed to recommend candidate")
      );
    }
  };

  const messageEmployer = async (job) => {
    const receiverId =
      job.employer_id ||
      job.user_id ||
      job.created_by ||
      job.company_user_id ||
      job.company_owner_id;

    if (!receiverId) {
      alert(
        tt(
          "recruiterJobs.alerts.noEmployer",
          "No employer account is linked to this job yet."
        )
      );
      return;
    }

    try {
      const res = await api.post("/api/messages/conversations", {
        receiver_id: receiverId,
        job_id: job.id,
        context_type: "job",
        context_id: job.id,
      });

      const conversationId =
        res.data?.conversation?.id ||
        res.data?.conversation_id ||
        res.data?.id;

      navigate(
        `/dashboard/messages?conversation=${conversationId}&employer=${receiverId}&job=${job.id}`
      );
    } catch (err) {
      console.error("Failed to start employer conversation:", err);
      navigate(`/dashboard/messages?employer=${receiverId}&job=${job.id}`);
    }
  };

  const handleJobFormChange = (e) => {
    const { name, value } = e.target;
    setJobForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submitJob = async (e) => {
    e.preventDefault();

    if (!jobForm.title || !jobForm.description) {
      alert(
        tt(
          "recruiterJobs.alerts.requiredFields",
          "Job title and description are required."
        )
      );
      return;
    }

    try {
      setPostingJob(true);

      await api.post("/api/recruiter/jobs", {
        ...jobForm,
        required_skills: jobForm.required_skills,
        status: "active",
      });

      setPostJobOpen(false);
      setJobForm({
        title: "",
        company_id: "",
        description: "",
        location: "",
        salary_range: "",
        employment_type: "Full-time",
        work_mode: "Remote",
        experience_level: "",
        required_skills: "",
        benefits: "",
        application_instructions: "",
      });

      fetchJobs();
    } catch (err) {
      console.error("Failed to post job:", err);
      alert(
        err.response?.data?.error ||
          tt("recruiterJobs.alerts.failedPostJob", "Failed to post job")
      );
    } finally {
      setPostingJob(false);
    }
  };

  return (
    <DashboardLayout
      title={tt("recruiterJobs.title", "Recruiter Jobs")}
      subtitle={tt(
        "recruiterJobs.subtitle",
        "Browse hiring opportunities, review job details, recommend talent, and post recruiter-led jobs."
      )}
    >
      <div
        style={{
          ...styles.statsGrid,
          gridTemplateColumns: isMobile ? "1fr" : "repeat(4, minmax(0, 1fr))",
        }}
      >
        <StatCard
          icon={<Briefcase size={26} />}
          title={tt("recruiterJobs.stats.totalJobs", "Total Jobs")}
          value={stats.total}
          subtext={tt("recruiterJobs.stats.availableRoles", "Available roles")}
          color="#4f46e5"
          bg="#eef2ff"
        />

        <StatCard
          icon={<CheckCircle2 size={26} />}
          title={tt("recruiterJobs.stats.activeJobs", "Active Jobs")}
          value={stats.active}
          subtext={tt("recruiterJobs.stats.currentlyHiring", "Currently hiring")}
          color="#16a34a"
          bg="#dcfce7"
        />

        <StatCard
          icon={<MapPin size={26} />}
          title={tt("recruiterJobs.stats.remoteJobs", "Remote Jobs")}
          value={stats.remote}
          subtext={tt("recruiterJobs.stats.flexibleRoles", "Flexible roles")}
          color="#2563eb"
          bg="#dbeafe"
        />

        <StatCard
          icon={<Users size={26} />}
          title={tt("recruiterJobs.stats.applications", "Applications")}
          value={stats.applications}
          subtext={tt("recruiterJobs.stats.totalApplicants", "Total applicants")}
          color="#f97316"
          bg="#ffedd5"
        />
      </div>

      <section style={styles.panel}>
        <div style={styles.panelHeader}>
          <div>
            <h2 style={styles.panelTitle}>
              {tt("recruiterJobs.pipeline.title", "Job Pipeline")}
            </h2>
            <p style={styles.panelSubtitle}>
              {tt(
                "recruiterJobs.pipeline.subtitle",
                "Manage open roles and recommend suitable candidates."
              )}
            </p>
          </div>

          <button style={styles.postJobButton} onClick={() => setPostJobOpen(true)}>
            <Plus size={17} />
            {tt("recruiterJobs.pipeline.postJob", "Post Job")}
          </button>
        </div>

        <div
          style={{
            ...styles.toolbar,
            gridTemplateColumns: isMobile ? "1fr" : "1fr auto",
          }}
        >
          <div style={styles.searchBox}>
            <Search size={18} color="#64748b" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={tt(
                "recruiterJobs.filters.searchPlaceholder",
                "Search jobs by title, company, skill, or location..."
              )}
              style={styles.input}
            />
          </div>

          <div
            style={{
              ...styles.controlGroup,
              flexDirection: isMobile ? "column" : "row",
              alignItems: isMobile ? "stretch" : "center",
            }}
          >
            <div style={{ ...styles.selectBox, width: isMobile ? "100%" : "auto" }}>
              <Filter size={16} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={styles.select}
              >
                <option value="all">
                  {tt("recruiterJobs.filters.allStatus", "All status")}
                </option>
                <option value="active">
                  {tt("recruiterJobs.filters.active", "Active")}
                </option>
                <option value="pending">
                  {tt("recruiterJobs.filters.pending", "Pending")}
                </option>
                <option value="closed">
                  {tt("recruiterJobs.filters.closed", "Closed")}
                </option>
                <option value="inactive">
                  {tt("recruiterJobs.filters.inactive", "Inactive")}
                </option>
              </select>
            </div>

            <div style={{ ...styles.selectBox, width: isMobile ? "100%" : "auto" }}>
              <select
                value={workModeFilter}
                onChange={(e) => setWorkModeFilter(e.target.value)}
                style={styles.select}
              >
                <option value="all">
                  {tt("recruiterJobs.filters.allWorkModes", "All work modes")}
                </option>
                <option value="remote">
                  {tt("recruiterJobs.filters.remote", "Remote")}
                </option>
                <option value="hybrid">
                  {tt("recruiterJobs.filters.hybrid", "Hybrid")}
                </option>
                <option value="onsite">
                  {tt("recruiterJobs.filters.onsite", "On-site")}
                </option>
              </select>
            </div>

            <button
              style={{ ...styles.resetButton, width: isMobile ? "100%" : "auto" }}
              onClick={resetFilters}
            >
              <RotateCcw size={16} />
              {tt("recruiterJobs.filters.reset", "Reset")}
            </button>
          </div>
        </div>

        <div
          style={{
            ...styles.panelMeta,
            flexDirection: isMobile ? "column" : "row",
            alignItems: isMobile ? "flex-start" : "center",
            gap: isMobile ? 12 : 0,
          }}
        >
          <span>
            {filteredJobs.length}{" "}
            {tt("recruiterJobs.filters.jobsFound", "jobs found")}
          </span>

          <div style={styles.sortWrap}>
            <span>{tt("recruiterJobs.filters.sortBy", "Sort by:")}</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={styles.sortSelect}
            >
              <option value="recent">
                {tt("recruiterJobs.filters.recentlyAdded", "Recently added")}
              </option>
              <option value="applications">
                {tt("recruiterJobs.filters.mostApplications", "Most applications")}
              </option>
              <option value="salary">
                {tt("recruiterJobs.filters.highestSalary", "Highest salary")}
              </option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={styles.emptyState}>
            {tt("recruiterJobs.states.loadingJobs", "Loading jobs...")}
          </div>
        ) : filteredJobs.length === 0 ? (
          <div style={styles.emptyState}>
            {tt("recruiterJobs.states.noJobs", "No jobs found.")}
          </div>
        ) : (
          <>
            <div
              style={{
                ...styles.jobsGrid,
                gridTemplateColumns: isMobile
                  ? "1fr"
                  : "repeat(auto-fill, minmax(320px, 1fr))",
              }}
            >
              {paginatedJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  tt={tt}
                  onView={() => setSelectedJob(job)}
                  onMatch={() => matchTalent(job)}
                  onMessage={() => messageEmployer(job)}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div style={styles.pagination}>
                <button
                  style={styles.pageButton}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index + 1}
                    style={{
                      ...styles.pageNumber,
                      ...(currentPage === index + 1
                        ? styles.activePageNumber
                        : {}),
                    }}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  style={styles.pageButton}
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                >
                  <ChevronRight size={16} />
                </button>

                <span style={styles.paginationText}>
                  {tt("recruiterJobs.pagination.showing", "Showing")}{" "}
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredJobs.length)}{" "}
                  {tt("recruiterJobs.pagination.of", "of")} {filteredJobs.length}
                </span>
              </div>
            )}
          </>
        )}
      </section>

      {selectedJob && (
        <JobModal
          job={selectedJob}
          tt={tt}
          onClose={() => setSelectedJob(null)}
          onMatch={() => matchTalent(selectedJob)}
          onMessage={() => messageEmployer(selectedJob)}
          isMobile={isMobile}
        />
      )}

      {matchJob && (
        <MatchTalentModal
          job={matchJob}
          matches={matches}
          loading={matchingLoading}
          tt={tt}
          onClose={() => {
            setMatchJob(null);
            setMatches([]);
          }}
          onRecommend={(candidate) => recommendCandidate(candidate, matchJob)}
          isMobile={isMobile}
        />
      )}

      {postJobOpen && (
        <PostJobModal
          form={jobForm}
          loading={postingJob}
          tt={tt}
          onChange={handleJobFormChange}
          onSubmit={submitJob}
          onClose={() => setPostJobOpen(false)}
          isMobile={isMobile}
        />
      )}
    </DashboardLayout>
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

function JobCard({ job, tt, onView, onMatch, onMessage }) {
  const skills = parseSkills(job.required_skills || job.skills);
  const salary = formatSalary(job);

  return (
    <div style={styles.jobCard}>
      <div style={styles.jobHeader}>
        {job.company_logo ? (
          <img
            src={job.company_logo}
            alt={job.company_name || tt("recruiterJobs.defaults.company", "Company")}
            style={styles.companyLogo}
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const fallback = e.currentTarget.nextSibling;
              if (fallback) fallback.style.display = "flex";
            }}
          />
        ) : null}

        <div
          style={{
            ...styles.jobIcon,
            display: job.company_logo ? "none" : "flex",
          }}
        >
          <Briefcase size={22} />
        </div>

        <div>
          <h3 style={styles.jobTitle}>
            {job.title || tt("recruiterJobs.defaults.untitledJob", "Untitled Job")}
          </h3>
          <p style={styles.companyName}>
            {job.company_name ||
              tt("recruiterJobs.defaults.companyNotSpecified", "Company not specified")}
          </p>
        </div>
      </div>

      <div style={styles.jobMeta}>
        <span>
          <MapPin size={14} />
          {job.location ||
            tt("recruiterJobs.defaults.locationNotSpecified", "Location not specified")}
        </span>

        <span>
          <Clock size={14} />
          {job.employment_type ||
            tt(
              "recruiterJobs.defaults.employmentTypeNotSpecified",
              "Employment type not specified"
            )}
        </span>

        <span>
          <Users size={14} />
          {Number(job.application_count || 0)}{" "}
          {tt("recruiterJobs.labels.applicants", "applicants")}
        </span>
      </div>

      <div style={styles.jobTags}>
        <span style={styles.statusTag}>{job.status || "active"}</span>
        <span>
          {job.work_mode ||
            tt("recruiterJobs.defaults.workModeNotSpecified", "Work mode not specified")}
        </span>
        {salary && <span>{salary}</span>}
      </div>

      <p style={styles.description}>
        {job.description
          ? `${job.description.slice(0, 140)}${
              job.description.length > 140 ? "..." : ""
            }`
          : tt("recruiterJobs.states.noDescription", "No job description provided.")}
      </p>

      <div style={styles.skills}>
        {skills.length === 0 ? (
          <span>{tt("recruiterJobs.states.noSkills", "No skills listed")}</span>
        ) : (
          <>
            {skills.slice(0, 4).map((skill, index) => (
              <span key={index}>{skill}</span>
            ))}
            {skills.length > 4 && <span>+{skills.length - 4}</span>}
          </>
        )}
      </div>

      <div style={styles.actions}>
        <button style={styles.viewButton} onClick={onView}>
          <Eye size={15} />
          {tt("recruiterJobs.actions.view", "View")}
        </button>

        <button style={styles.matchButton} onClick={onMatch}>
          <Users size={15} />
          {tt("recruiterJobs.actions.match", "Match")}
        </button>

        <button style={styles.messageButton} onClick={onMessage}>
          <MessageCircle size={15} />
          {tt("recruiterJobs.actions.message", "Message")}
        </button>
      </div>
    </div>
  );
}

function JobModal({ job, tt, onClose, onMatch, onMessage, isMobile }) {
  const skills = parseSkills(job.required_skills || job.skills);
  const salary = formatSalary(job);

  const details = [
    [tt("recruiterJobs.fields.company", "Company"), job.company_name, <Building2 size={15} />],
    [tt("recruiterJobs.fields.location", "Location"), job.location, <MapPin size={15} />],
    [
      tt("recruiterJobs.fields.employmentType", "Employment Type"),
      job.employment_type,
      <Briefcase size={15} />,
    ],
    [tt("recruiterJobs.fields.workMode", "Work Mode"), job.work_mode, <MapPin size={15} />],
    [
      tt("recruiterJobs.fields.experienceLevel", "Experience Level"),
      job.experience_level,
      <AlertCircle size={15} />,
    ],
    [tt("recruiterJobs.fields.salary", "Salary"), salary, <Briefcase size={15} />],
    [tt("recruiterJobs.fields.status", "Status"), job.status, <CheckCircle2 size={15} />],
    [
      tt("recruiterJobs.fields.created", "Created"),
      job.created_at ? new Date(job.created_at).toLocaleDateString() : null,
      <Calendar size={15} />,
    ],
    [
      tt("recruiterJobs.fields.expires", "Expires"),
      job.expires_at ? new Date(job.expires_at).toLocaleDateString() : null,
      <Calendar size={15} />,
    ],
    [
      tt("recruiterJobs.fields.applications", "Applications"),
      Number(job.application_count || 0),
      <Users size={15} />,
    ],
  ];

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.largeModal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHero}>
          <div>
            <h2 style={styles.modalTitle}>
              {job.title || tt("recruiterJobs.defaults.untitledJob", "Untitled Job")}
            </h2>
            <p style={styles.modalSubtitle}>
              {job.company_name ||
                tt("recruiterJobs.defaults.companyNotSpecified", "Company not specified")}
            </p>
            <span style={styles.statusBadge}>{job.status || "active"}</span>
          </div>

          <button style={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div style={styles.modalGrid}>
          <section style={styles.modalSection}>
            <h3>{tt("recruiterJobs.modal.jobDetails", "Job Details")}</h3>

            <div
              style={{
                ...styles.detailGrid,
                gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))",
              }}
            >
              {details.map(([label, value, icon]) => (
                <div key={label} style={styles.detailItem}>
                  <span style={styles.detailIcon}>{icon}</span>
                  <div>
                    <strong>{label}</strong>
                    <p>
                      {value ||
                        tt("recruiterJobs.states.notSpecified", "Not specified")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section style={styles.modalSection}>
            <h3>{tt("recruiterJobs.modal.description", "Description")}</h3>
            <p>
              {job.description ||
                tt("recruiterJobs.states.noDescription", "No description provided.")}
            </p>
          </section>

          <section style={styles.modalSection}>
            <h3>{tt("recruiterJobs.modal.requiredSkills", "Required Skills")}</h3>
            <div style={styles.skills}>
              {skills.length === 0 ? (
                <span>{tt("recruiterJobs.states.noSkills", "No skills listed")}</span>
              ) : (
                skills.map((skill, index) => <span key={index}>{skill}</span>)
              )}
            </div>
          </section>

          <section style={styles.modalSection}>
            <h3>{tt("recruiterJobs.modal.benefits", "Benefits")}</h3>
            <p>
              {job.benefits ||
                tt("recruiterJobs.states.noBenefits", "No benefits listed.")}
            </p>
          </section>

          <section style={styles.modalSection}>
            <h3>
              {tt("recruiterJobs.modal.applicationInstructions", "Application Instructions")}
            </h3>
            <p>
              {job.application_instructions ||
                tt("recruiterJobs.states.noInstructions", "No instructions provided.")}
            </p>
          </section>
        </div>

        <div
          style={{
            ...styles.modalFooter,
            flexDirection: isMobile ? "column" : "row",
          }}
        >
          <Button variant="secondary" onClick={onClose}>
            {tt("recruiterJobs.actions.close", "Close")}
          </Button>

          <Button onClick={onMatch}>
            <Users size={15} />
            {tt("recruiterJobs.actions.matchTalent", "Match Talent")}
          </Button>

          <Button onClick={onMessage}>
            <MessageCircle size={15} />
            {tt("recruiterJobs.actions.messageEmployer", "Message Employer")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function MatchTalentModal({ job, matches, loading, onClose, onRecommend, isMobile, tt }) {
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.largeModal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHero}>
          <div>
            <h2 style={styles.modalTitle}>
              {tt("recruiterJobs.modal.matchedTalent", "Matched Talent")}
            </h2>
            <p style={styles.modalSubtitle}>
              {tt(
                "recruiterJobs.modal.recommendedCandidatesFor",
                "Recommended candidates for"
              )}{" "}
              {job.title || tt("recruiterJobs.modal.thisJob", "this job")}
            </p>
          </div>

          <button style={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div style={styles.modalGrid}>
          {loading ? (
            <div style={styles.emptyState}>
              {tt("recruiterJobs.states.findingMatches", "Finding best matches...")}
            </div>
          ) : matches.length === 0 ? (
            <div style={styles.emptyState}>
              {tt("recruiterJobs.states.noCandidateMatches", "No candidate matches found.")}
            </div>
          ) : (
            <div style={styles.matchList}>
              {matches.map((candidate) => (
                <div
                  key={candidate.id}
                  style={{
                    ...styles.matchCard,
                    gridTemplateColumns: isMobile ? "1fr" : "1fr auto",
                  }}
                >
                  <div style={styles.matchProfile}>
                    <img
                      src={candidate.profile_image || "/images/avatar.jpg"}
                      alt={
                        candidate.name ||
                        tt("recruiterJobs.defaults.candidate", "Candidate")
                      }
                      style={styles.matchAvatar}
                      onError={(e) => {
                        e.currentTarget.src = "/images/avatar.jpg";
                      }}
                    />

                    <div>
                      <h3 style={styles.matchName}>
                        {candidate.name ||
                          tt("recruiterJobs.defaults.unnamedCandidate", "Unnamed Candidate")}
                      </h3>
                      <p style={styles.matchRole}>
                        {candidate.professional_title ||
                          candidate.desired_job_title ||
                          tt("recruiterJobs.defaults.roleNotSpecified", "Role not specified")}
                      </p>

                      <div style={styles.matchMeta}>
                        <span>
                          <MapPin size={13} />
                          {[candidate.city, candidate.country]
                            .filter(Boolean)
                            .join(", ") ||
                            tt(
                              "recruiterJobs.defaults.locationNotSpecified",
                              "Location not specified"
                            )}
                        </span>

                        <span>
                          <Briefcase size={13} />
                          {candidate.years_of_experience || 0}{" "}
                          {tt("recruiterJobs.labels.years", "years")}
                        </span>
                      </div>

                      <div style={styles.skills}>
                        {(candidate.matched_skills || []).length === 0 ? (
                          <span>
                            {tt(
                              "recruiterJobs.states.noDirectSkillOverlap",
                              "No direct skill overlap"
                            )}
                          </span>
                        ) : (
                          candidate.matched_skills.map((skill, index) => (
                            <span key={index}>{skill}</span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={styles.matchActionBox}>
                    <div style={styles.scoreCircle}>
                      {candidate.match_score || 0}%
                    </div>

                    <button
                      style={styles.recommendButton}
                      onClick={() => onRecommend(candidate)}
                    >
                      <Send size={15} />
                      {tt("recruiterJobs.actions.recommend", "Recommend")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PostJobModal({ form, loading, onChange, onSubmit, onClose, isMobile, tt }) {
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <form
        style={styles.largeModal}
        onSubmit={onSubmit}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.modalHero}>
          <div>
            <h2 style={styles.modalTitle}>
              {tt("recruiterJobs.modal.postJob", "Post a Job")}
            </h2>
            <p style={styles.modalSubtitle}>
              {tt(
                "recruiterJobs.modal.createOpening",
                "Create a recruiter-led job opening."
              )}
            </p>
          </div>

          <button type="button" style={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div style={styles.modalGrid}>
          <div
            style={{
              ...styles.formGrid,
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            }}
          >
            <FormField
              label={tt("recruiterJobs.fields.jobTitle", "Job Title")}
              name="title"
              value={form.title}
              onChange={onChange}
              required
            />

            <FormField
              label={tt("recruiterJobs.fields.companyId", "Company ID")}
              name="company_id"
              value={form.company_id}
              onChange={onChange}
              placeholder={tt(
                "recruiterJobs.placeholders.optionalIfRecruiterOwns",
                "Optional if recruiter owns posting"
              )}
            />

            <FormField
              label={tt("recruiterJobs.fields.location", "Location")}
              name="location"
              value={form.location}
              onChange={onChange}
            />

            <FormField
              label={tt("recruiterJobs.fields.salaryRange", "Salary Range")}
              name="salary_range"
              value={form.salary_range}
              onChange={onChange}
              placeholder={tt(
                "recruiterJobs.placeholders.salaryExample",
                "e.g. $1000 - $2500"
              )}
            />

            <label style={styles.formField}>
              <span>{tt("recruiterJobs.fields.employmentType", "Employment Type")}</span>
              <select
                name="employment_type"
                value={form.employment_type}
                onChange={onChange}
                style={styles.formInput}
              >
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Internship</option>
              </select>
            </label>

            <label style={styles.formField}>
              <span>{tt("recruiterJobs.fields.workMode", "Work Mode")}</span>
              <select
                name="work_mode"
                value={form.work_mode}
                onChange={onChange}
                style={styles.formInput}
              >
                <option>Remote</option>
                <option>Hybrid</option>
                <option>Onsite</option>
              </select>
            </label>

            <FormField
              label={tt("recruiterJobs.fields.experienceLevel", "Experience Level")}
              name="experience_level"
              value={form.experience_level}
              onChange={onChange}
              placeholder={tt(
                "recruiterJobs.placeholders.experienceExample",
                "Junior, Mid-level, Senior"
              )}
            />

            <FormField
              label={tt("recruiterJobs.fields.requiredSkills", "Required Skills")}
              name="required_skills"
              value={form.required_skills}
              onChange={onChange}
              placeholder={tt(
                "recruiterJobs.placeholders.skillsExample",
                "React, Node.js, PostgreSQL"
              )}
            />
          </div>

          <TextAreaField
            label={tt("recruiterJobs.fields.description", "Description")}
            name="description"
            value={form.description}
            onChange={onChange}
            required
          />

          <TextAreaField
            label={tt("recruiterJobs.fields.benefits", "Benefits")}
            name="benefits"
            value={form.benefits}
            onChange={onChange}
          />

          <TextAreaField
            label={tt(
              "recruiterJobs.fields.applicationInstructions",
              "Application Instructions"
            )}
            name="application_instructions"
            value={form.application_instructions}
            onChange={onChange}
          />
        </div>

        <div
          style={{
            ...styles.modalFooter,
            flexDirection: isMobile ? "column" : "row",
          }}
        >
          <Button type="button" variant="secondary" onClick={onClose}>
            {tt("recruiterJobs.actions.cancel", "Cancel")}
          </Button>

          <Button type="submit" disabled={loading}>
            <Plus size={15} />
            {loading
              ? tt("recruiterJobs.actions.posting", "Posting...")
              : tt("recruiterJobs.actions.postJob", "Post Job")}
          </Button>
        </div>
      </form>
    </div>
  );
}

function FormField({ label, name, value, onChange, required, placeholder }) {
  return (
    <label style={styles.formField}>
      <span>{label}</span>
      <input
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        style={styles.formInput}
      />
    </label>
  );
}

function TextAreaField({ label, name, value, onChange, required }) {
  return (
    <label style={styles.formField}>
      <span>{label}</span>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        style={styles.formTextarea}
      />
    </label>
  );
}

const parseSkills = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
};

const formatSalary = (job) => {
  if (job.salary_range) return job.salary_range;

  if (job.salary_min && job.salary_max) {
    return `${job.salary_currency || job.currency || ""} ${job.salary_min} - ${job.salary_max}`;
  }

  if (job.salary_min) {
    return `${job.salary_currency || job.currency || ""} ${job.salary_min}+`;
  }

  return null;
};

const styles = {
  statsGrid: {
    display: "grid",
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
    minWidth: 0,
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
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "center",
    marginBottom: 20,
    flexWrap: "wrap",
  },

  panelTitle: {
    margin: 0,
    color: "#0f172a",
  },

  panelSubtitle: {
    margin: "6px 0 0",
    color: "#64748b",
  },

  postJobButton: {
    height: 44,
    border: "none",
    borderRadius: 14,
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    padding: "0 18px",
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 12px 26px rgba(37, 99, 235, 0.25)",
  },

  toolbar: {
    display: "grid",
    gap: 16,
    alignItems: "center",
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
    minWidth: 0,
  },

  input: {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: 14,
    color: "#0f172a",
    minWidth: 0,
  },

  controlGroup: {
    display: "flex",
    gap: 12,
  },

  selectBox: {
    height: 50,
    minWidth: 160,
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
    justifyContent: "center",
    gap: 8,
    fontWeight: 800,
    color: "#334155",
    cursor: "pointer",
  },

  panelMeta: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 18,
    color: "#64748b",
    fontSize: 14,
    fontWeight: 700,
  },

  sortWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },

  sortSelect: {
    height: 42,
    border: "1px solid #dbe3ef",
    borderRadius: 14,
    padding: "0 14px",
    fontWeight: 700,
    color: "#334155",
    background: "#fff",
  },

  jobsGrid: {
    display: "grid",
    gap: 18,
  },

  jobCard: {
    border: "1px solid #e3eaf4",
    borderRadius: 22,
    padding: 18,
    background: "#fff",
    display: "grid",
    gap: 15,
    boxShadow: "0 14px 35px rgba(15, 23, 42, 0.045)",
    minWidth: 0,
  },

  jobHeader: {
    display: "flex",
    gap: 13,
    alignItems: "center",
    minWidth: 0,
  },

  companyLogo: {
    width: 50,
    height: 50,
    borderRadius: 16,
    objectFit: "cover",
    border: "1px solid #e5e7eb",
    background: "#fff",
    flexShrink: 0,
  },

  jobIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    background: "linear-gradient(135deg, #2563eb, #4f46e5)",
    color: "#fff",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  jobTitle: {
    margin: 0,
    fontSize: 16,
    color: "#0f172a",
  },

  companyName: {
    margin: "5px 0 0",
    color: "#475569",
    fontSize: 13,
  },

  jobMeta: {
    display: "grid",
    gap: 7,
    color: "#64748b",
    fontSize: 13,
  },

  jobTags: {
    display: "flex",
    gap: 7,
    flexWrap: "wrap",
  },

  statusTag: {
    textTransform: "capitalize",
  },

  description: {
    margin: 0,
    color: "#475569",
    fontSize: 14,
    lineHeight: 1.6,
  },

  skills: {
    display: "flex",
    gap: 7,
    flexWrap: "wrap",
  },

  actions: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
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

  matchButton: {
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

  messageButton: {
    height: 42,
    border: "1px solid #bfdbfe",
    borderRadius: 13,
    background: "#eff6ff",
    color: "#1d4ed8",
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

  pagination: {
    marginTop: 24,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },

  pageButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    border: "1px solid #dbe3ef",
    background: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  pageNumber: {
    width: 38,
    height: 38,
    borderRadius: 12,
    border: "1px solid #dbe3ef",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 800,
  },

  activePageNumber: {
    background: "#2563eb",
    color: "#fff",
    borderColor: "#2563eb",
  },

  paginationText: {
    marginLeft: 12,
    color: "#64748b",
    fontSize: 13,
    fontWeight: 700,
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.58)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    zIndex: 5000,
  },

  largeModal: {
    width: "100%",
    maxWidth: 980,
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#fff",
    borderRadius: 28,
  },

  modalHero: {
    padding: 26,
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },

  modalTitle: {
    margin: 0,
    color: "#0f172a",
  },

  modalSubtitle: {
    margin: "6px 0 0",
    color: "#64748b",
  },

  statusBadge: {
    display: "inline-flex",
    marginTop: 8,
    padding: "6px 10px",
    borderRadius: 999,
    background: "#dcfce7",
    color: "#166534",
    fontWeight: 800,
    fontSize: 12,
    textTransform: "capitalize",
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 999,
    border: "none",
    background: "#f1f5f9",
    fontSize: 22,
    cursor: "pointer",
    flexShrink: 0,
  },

  modalGrid: {
    padding: 24,
    display: "grid",
    gap: 18,
  },

  modalSection: {
    border: "1px solid #e5e7eb",
    borderRadius: 18,
    padding: 18,
    background: "#fff",
  },

  detailGrid: {
    display: "grid",
    gap: 14,
  },

  detailItem: {
    display: "flex",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
  },

  detailIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  modalFooter: {
    padding: 20,
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
  },

  matchList: {
    display: "grid",
    gap: 14,
  },

  matchCard: {
    display: "grid",
    gap: 16,
    alignItems: "center",
    border: "1px solid #e5e7eb",
    borderRadius: 18,
    padding: 16,
    background: "#fff",
  },

  matchProfile: {
    display: "flex",
    gap: 14,
    alignItems: "flex-start",
  },

  matchAvatar: {
    width: 58,
    height: 58,
    borderRadius: 18,
    objectFit: "cover",
    background: "#eef2ff",
    flexShrink: 0,
  },

  matchName: {
    margin: 0,
    color: "#0f172a",
  },

  matchRole: {
    margin: "5px 0 8px",
    color: "#64748b",
  },

  matchMeta: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    color: "#64748b",
    fontSize: 13,
    marginBottom: 10,
  },

  matchActionBox: {
    display: "grid",
    gap: 10,
    justifyItems: "center",
  },

  scoreCircle: {
    width: 62,
    height: 62,
    borderRadius: "50%",
    background: "#dcfce7",
    color: "#166534",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
  },

  recommendButton: {
    height: 42,
    border: "none",
    borderRadius: 13,
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    padding: "0 16px",
    fontWeight: 800,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 7,
  },

  formGrid: {
    display: "grid",
    gap: 14,
  },

  formField: {
    display: "grid",
    gap: 7,
    color: "#334155",
    fontWeight: 800,
    fontSize: 13,
  },

  formInput: {
    height: 46,
    border: "1px solid #dbe3ef",
    borderRadius: 14,
    padding: "0 12px",
    outline: "none",
    color: "#0f172a",
  },

  formTextarea: {
    minHeight: 110,
    border: "1px solid #dbe3ef",
    borderRadius: 14,
    padding: 12,
    outline: "none",
    resize: "vertical",
    color: "#0f172a",
  },
};

export default RecruiterJobs;