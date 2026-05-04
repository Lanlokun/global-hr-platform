import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import api from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { useLanguage } from "../../context/LanguageContext";

function AdminJobs() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();

  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);

  const [summary, setSummary] = useState({
    jobs: 0,
    active: 0,
    inactive: 0,
    withApplications: 0,
    totalApplications: 0,
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const companyFilter = searchParams.get("company");

  const fetchSummary = async () => {
    try {
      const res = await api.get("/api/admin/job-stats");

      setSummary({
        jobs: res.data.jobs || 0,
        active: res.data.active || 0,
        inactive: res.data.inactive || 0,
        withApplications: res.data.withApplications || 0,
        totalApplications: res.data.totalApplications || 0,
      });
    } catch (error) {
      console.error("Failed to fetch job summary:", error);
    }
  };

  const fetchJobs = async () => {
    try {
      setLoading(true);

      const res = await api.get("/api/admin/jobs", {
        params: {
          search,
          status,
          type,
          page,
          limit,
          company: companyFilter || undefined,
        },
      });

      setJobs(res.data.jobs || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch jobs:", error);
      alert(error.response?.data?.error || t("adminJobs.errors.fetchJobs"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, type, companyFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchJobs();
  };

  const handleStatusFilter = (nextStatus) => {
    setStatus(nextStatus);
    setPage(1);
  };

  const handleStatusChange = async (jobId, action) => {
    const confirmed = window.confirm(
      t("adminJobs.confirm.statusChange")
    );

    if (!confirmed) return;

    try {
      await api.patch(`/api/admin/jobs/${jobId}/status`, {
        action,
      });

      await fetchJobs();
      await fetchSummary();
      setSelectedJob(null);
    } catch (error) {
      console.error("Failed to update job status:", error);
      alert(error.response?.data?.error || t("adminJobs.errors.updateStatus"));
    }
  };

  return (
    <DashboardLayout
      title={t("adminJobs.title")}
      subtitle={t("adminJobs.subtitle")}
    >
      <div style={statsGridStyle}>
        <StatCard
          title={t("adminJobs.stats.totalJobs")}
          value={summary.jobs}
          subtitle={t("adminJobs.stats.totalJobsSub").replace(
            "{{count}}",
            summary.jobs
          )}
          color="#0f172a"
        />

        <StatCard
          title={t("adminJobs.stats.active")}
          value={summary.active}
          subtitle={t("adminJobs.stats.activeSub")
            .replace("{{active}}", summary.active)
            .replace("{{total}}", summary.jobs)}
          color="#16a34a"
        />

        <StatCard
          title={t("adminJobs.stats.withApplications")}
          value={summary.withApplications}
          subtitle={t("adminJobs.stats.withApplicationsSub").replace(
            "{{count}}",
            summary.withApplications
          )}
          color="#2563eb"
        />

        <StatCard
          title={t("adminJobs.stats.applications")}
          value={summary.totalApplications}
          subtitle={t("adminJobs.stats.applicationsSub").replace(
            "{{count}}",
            summary.totalApplications
          )}
          color="#7c3aed"
        />
      </div>

      <Card
        title={t("adminJobs.directory.title")}
        subtitle={t("adminJobs.directory.subtitle")}
      >
        <div style={statusTabsStyle}>
          {[
            {
              value: "all",
              label: t("adminJobs.filters.all"),
              count: summary.jobs,
            },
            {
              value: "active",
              label: t("adminJobs.filters.active"),
              count: summary.active,
            },
            {
              value: "inactive",
              label: t("adminJobs.filters.inactive"),
              count: summary.inactive,
            },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => handleStatusFilter(item.value)}
              style={{
                ...statusTabStyle,
                ...(status === item.value ? activeStatusTabStyle : {}),
              }}
            >
              {item.label}
              <span
                style={{
                  ...statusTabCountStyle,
                  ...(status === item.value ? activeStatusTabCountStyle : {}),
                }}
              >
                {item.count}
              </span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} style={filterBarStyle}>
          <input
            type="text"
            placeholder={t("adminJobs.directory.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={inputStyle}
          />

          <select
            value={status}
            onChange={(e) => handleStatusFilter(e.target.value)}
            style={selectStyle}
          >
            <option value="all">{t("adminJobs.filters.allStatus")}</option>
            <option value="active">{t("adminJobs.filters.active")}</option>
            <option value="inactive">{t("adminJobs.filters.inactive")}</option>
          </select>

          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
            style={selectStyle}
          >
            <option value="all">{t("adminJobs.filters.allTypes")}</option>
            <option value="Full-time">{t("adminJobs.filters.fullTime")}</option>
            <option value="Part-time">{t("adminJobs.filters.partTime")}</option>
            <option value="Contract">{t("adminJobs.filters.contract")}</option>
            <option value="Internship">{t("adminJobs.filters.internship")}</option>
            <option value="Remote">{t("adminJobs.filters.remote")}</option>
          </select>

          <Button type="submit">{t("adminJobs.filters.search")}</Button>
        </form>

        {companyFilter && (
          <div style={filterNoticeStyle}>
            <span>
              {t("adminJobs.directory.showingCompany").replace(
                "{{id}}",
                companyFilter
              )}
            </span>

            <button
              type="button"
              style={clearFilterButtonStyle}
              onClick={() => navigate("/admin/jobs")}
            >
              {t("adminJobs.directory.clearFilter")}
            </button>
          </div>
        )}

        <div style={directoryStyle}>
          <div style={tableHeaderStyle}>
            <span>{t("adminJobs.table.job")}</span>
            <span>{t("adminJobs.table.company")}</span>
            <span>{t("adminJobs.table.type")}</span>
            <span>{t("adminJobs.table.applications")}</span>
            <span>{t("adminJobs.table.status")}</span>
            <span>{t("adminJobs.table.actions")}</span>
          </div>

          {loading ? (
            <div style={emptyStyle}>{t("adminJobs.directory.loading")}</div>
          ) : jobs.length === 0 ? (
            <div style={emptyStyle}>{t("adminJobs.directory.noJobs")}</div>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                style={rowStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f8fafc";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#ffffff";
                }}
              >
                <div>
                  <strong style={jobTitleStyle}>
                    {job.title || t("adminJobs.fallback.untitled")}
                  </strong>

                  <div style={mutedStyle}>
                    {job.location || t("adminJobs.fallback.noLocation")}
                  </div>

                  <div style={tinyMutedStyle}>
                    {t("adminJobs.fallback.posted")}{" "}
                    {formatDate(job.created_at)}
                  </div>
                </div>

                <div>
                  <strong style={companyNameStyle}>
                    {job.company_name || t("adminJobs.fallback.unknownCompany")}
                  </strong>

                  <div style={mutedStyle}>
                    {job.industry || t("adminJobs.fallback.noIndustry")}
                  </div>
                </div>

                <div>
                  <Badge variant={getTypeVariant(job.employment_type)}>
                    {formatEmploymentType(job.employment_type, t)}
                  </Badge>
                </div>

                <div style={cellStyle}>
                  <strong>{job.application_count || 0}</strong>
                  <div style={mutedStyle}>
                    {t("adminJobs.table.applications").toLowerCase()}
                  </div>
                </div>

                <div>
                  <StatusPill status={job.status} t={t} />
                </div>

                <div style={actionGroupStyle}>
                  {job.status !== "active" ? (
                    <button
                      type="button"
                      style={smallActivateButtonStyle}
                      onClick={() => handleStatusChange(job.id, "activate")}
                    >
                      {t("adminJobs.actions.activate")}
                    </button>
                  ) : (
                    <button
                      type="button"
                      style={smallDeactivateButtonStyle}
                      onClick={() => handleStatusChange(job.id, "deactivate")}
                    >
                      {t("adminJobs.actions.deactivate")}
                    </button>
                  )}

                  <button
                    type="button"
                    style={detailsButtonStyle}
                    onClick={() => setSelectedJob(job)}
                  >
                    {t("adminJobs.actions.viewDetails")}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={paginationStyle}>
          <Button
            variant="secondary"
            disabled={page <= 1}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          >
            {t("adminJobs.actions.previous")}
          </Button>

          <span style={pageTextStyle}>
            {t("adminJobs.actions.page")
              .replace("{{page}}", page)
              .replace("{{total}}", totalPages)}
          </span>

          <Button
            variant="secondary"
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          >
            {t("adminJobs.actions.next")}
          </Button>
        </div>
      </Card>

      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          t={t}
          onClose={() => setSelectedJob(null)}
          onViewApplications={() => {
            setSelectedJob(null);
            navigate(`/admin/applications?job=${selectedJob.id}`);
          }}
          onStatusChange={(action) => handleStatusChange(selectedJob.id, action)}
        />
      )}
    </DashboardLayout>
  );
}

function JobDetailsModal({ job, t, onClose, onViewApplications, onStatusChange }) {
  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <div>
            <h2 style={modalTitleStyle}>
              {job.title || t("adminJobs.fallback.untitled")}
            </h2>

            <p style={modalSubtitleStyle}>
              {job.company_name || t("adminJobs.fallback.unknownCompany")} ·{" "}
              {job.location || t("adminJobs.fallback.noLocation")}
            </p>
          </div>

          <button type="button" onClick={onClose} style={closeButtonStyle}>
            ×
          </button>
        </div>

        <div style={modalStatusBarStyle}>
          <span style={modalStatusTextStyle}>
            {t("adminJobs.modal.currentStatus")}
          </span>
          <StatusPill status={job.status} t={t} />
        </div>

        <div style={modalGridStyle}>
          <DetailItem label={t("adminJobs.details.jobId")} value={job.id} />
          <DetailItem
            label={t("adminJobs.details.company")}
            value={job.company_name || t("adminJobs.fallback.notAvailable")}
          />
          <DetailItem
            label={t("adminJobs.details.employmentType")}
            value={formatEmploymentType(job.employment_type, t)}
          />
          <DetailItem
            label={t("adminJobs.details.location")}
            value={job.location || t("adminJobs.fallback.notAvailable")}
          />
          <DetailItem
            label={t("adminJobs.details.applications")}
            value={job.application_count || 0}
          />
          <DetailItem
            label={t("adminJobs.details.status")}
            value={formatStatus(job.status, t)}
          />
          <DetailItem
            label={t("adminJobs.details.posted")}
            value={formatDate(job.created_at)}
          />
          <DetailItem
            label={t("adminJobs.details.salary")}
            value={formatSalary(job, t)}
          />
        </div>

        <div style={descriptionBoxStyle}>
          <h3 style={sectionTitleStyle}>
            {t("adminJobs.modal.jobDescription")}
          </h3>

          <p style={descriptionTextStyle}>
            {job.description || t("adminJobs.fallback.noDescription")}
          </p>
        </div>

        <div style={modalFooterStyle}>
          <Button variant="secondary" onClick={onViewApplications}>
            {t("adminJobs.modal.viewApplications")}
          </Button>

          {job.status !== "active" ? (
            <button
              type="button"
              style={activateButtonStyle}
              onClick={() => onStatusChange("activate")}
            >
              {t("adminJobs.actions.activate")}
            </button>
          ) : (
            <button
              type="button"
              style={deactivateButtonStyle}
              onClick={() => onStatusChange("deactivate")}
            >
              {t("adminJobs.actions.deactivateLong")}
            </button>
          )}

          <Button variant="secondary" onClick={onClose}>
            {t("adminJobs.modal.close")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div style={detailItemStyle}>
      <span style={detailLabelStyle}>{label}</span>
      <strong style={detailValueStyle}>{value}</strong>
    </div>
  );
}

function StatCard({ title, value, subtitle, color }) {
  return (
    <Card title={title} subtitle={subtitle}>
      <div style={{ fontSize: "34px", fontWeight: 900, color }}>{value}</div>
    </Card>
  );
}

function StatusPill({ status, t }) {
  const normalized = status || "active";

  const styles = {
    active: {
      background: "#dcfce7",
      color: "#15803d",
      border: "1px solid #bbf7d0",
    },
    inactive: {
      background: "#fee2e2",
      color: "#b91c1c",
      border: "1px solid #fecaca",
    },
  };

  return (
    <span style={{ ...statusPillStyle, ...(styles[normalized] || styles.active) }}>
      {formatStatus(normalized, t)}
    </span>
  );
}

function formatStatus(status, t) {
  switch (status) {
    case "inactive":
      return t("adminJobs.filters.inactive");
    case "active":
    default:
      return t("adminJobs.filters.active");
  }
}

function formatEmploymentType(type, t) {
  switch ((type || "").toLowerCase()) {
    case "full-time":
      return t("adminJobs.filters.fullTime");
    case "part-time":
      return t("adminJobs.filters.partTime");
    case "contract":
      return t("adminJobs.filters.contract");
    case "internship":
      return t("adminJobs.filters.internship");
    case "remote":
      return t("adminJobs.filters.remote");
    default:
      return t("adminJobs.fallback.notSpecified");
  }
}

function getTypeVariant(type) {
  switch ((type || "").toLowerCase()) {
    case "full-time":
      return "success";
    case "part-time":
      return "warning";
    case "contract":
      return "default";
    case "internship":
      return "danger";
    case "remote":
      return "default";
    default:
      return "default";
  }
}

function formatDate(date) {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatSalary(job, t) {
  const currency = job.currency || "";

  if (job.salary_min && job.salary_max) {
    return `${currency} ${job.salary_min} - ${job.salary_max}`;
  }

  if (job.salary_min) {
    return `${currency} ${job.salary_min}+`;
  }

  if (job.salary_max) {
    return `${t("adminJobs.fallback.upTo")} ${currency} ${job.salary_max}`;
  }

  return t("adminJobs.fallback.notSpecified");
}

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "20px",
  marginBottom: "24px",
};

const statusTabsStyle = {
  display: "flex",
  gap: "10px",
  marginBottom: "18px",
  flexWrap: "wrap",
};

const statusTabStyle = {
  padding: "8px 14px",
  borderRadius: "999px",
  border: "1px solid #e2e8f0",
  background: "#ffffff",
  color: "#334155",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: 800,
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
};

const activeStatusTabStyle = {
  background: "#0f172a",
  color: "#ffffff",
  borderColor: "#0f172a",
};

const statusTabCountStyle = {
  minWidth: "22px",
  height: "22px",
  padding: "0 7px",
  borderRadius: "999px",
  background: "#f1f5f9",
  color: "#334155",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "12px",
  fontWeight: 900,
};

const activeStatusTabCountStyle = {
  background: "rgba(255,255,255,0.16)",
  color: "#ffffff",
};

const filterBarStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 180px 180px auto",
  gap: "12px",
  marginBottom: "22px",
  alignItems: "center",
};

const inputStyle = {
  width: "100%",
  padding: "13px 15px",
  border: "1px solid #dbe3ef",
  borderRadius: "14px",
  fontSize: "14px",
  outline: "none",
  background: "#ffffff",
};

const selectStyle = {
  padding: "13px 15px",
  border: "1px solid #dbe3ef",
  borderRadius: "14px",
  fontSize: "14px",
  outline: "none",
  background: "#ffffff",
};

const filterNoticeStyle = {
  marginBottom: "16px",
  padding: "12px 14px",
  borderRadius: "14px",
  background: "#eff6ff",
  color: "#1d4ed8",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "12px",
  fontSize: "14px",
};

const clearFilterButtonStyle = {
  border: "none",
  background: "#2563eb",
  color: "#ffffff",
  borderRadius: "999px",
  padding: "7px 12px",
  fontWeight: 800,
  cursor: "pointer",
};

const directoryStyle = {
  border: "1px solid #e2e8f0",
  borderRadius: "18px",
  overflow: "hidden",
  background: "#ffffff",
};

const tableHeaderStyle = {
  display: "grid",
  gridTemplateColumns: "1.7fr 1.3fr 0.9fr 0.8fr 0.8fr 1.25fr",
  gap: "14px",
  padding: "15px 18px",
  background: "#f8fafc",
  borderBottom: "1px solid #e2e8f0",
  fontSize: "12px",
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  color: "#64748b",
};

const rowStyle = {
  display: "grid",
  gridTemplateColumns: "1.7fr 1.3fr 0.9fr 0.8fr 0.8fr 1.25fr",
  gap: "14px",
  padding: "16px 18px",
  borderBottom: "1px solid #f1f5f9",
  alignItems: "center",
  background: "#ffffff",
  transition: "background 0.2s ease",
};

const jobTitleStyle = {
  color: "#0f172a",
  fontSize: "15px",
  fontWeight: 900,
  display: "block",
};

const companyNameStyle = {
  color: "#0f172a",
  fontSize: "14px",
  fontWeight: 900,
  display: "block",
};

const mutedStyle = {
  marginTop: "3px",
  fontSize: "12px",
  color: "#94a3b8",
};

const tinyMutedStyle = {
  marginTop: "3px",
  fontSize: "11px",
  color: "#94a3b8",
};

const cellStyle = {
  fontSize: "14px",
  color: "#334155",
};

const statusPillStyle = {
  padding: "6px 10px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: 900,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const actionGroupStyle = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  alignItems: "center",
};

const smallActivateButtonStyle = {
  padding: "8px 14px",
  borderRadius: "999px",
  border: "none",
  background: "#16a34a",
  color: "#ffffff",
  fontWeight: 800,
  cursor: "pointer",
  fontSize: "12px",
};

const smallDeactivateButtonStyle = {
  padding: "8px 14px",
  borderRadius: "999px",
  border: "none",
  background: "#dc2626",
  color: "#ffffff",
  fontWeight: 800,
  cursor: "pointer",
  fontSize: "12px",
};

const detailsButtonStyle = {
  padding: "8px 14px",
  borderRadius: "999px",
  border: "1px solid #dbe3ef",
  background: "#ffffff",
  color: "#0f172a",
  fontWeight: 800,
  cursor: "pointer",
  fontSize: "12px",
};

const paginationStyle = {
  marginTop: "20px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const pageTextStyle = {
  fontSize: "14px",
  fontWeight: 800,
  color: "#475569",
};

const emptyStyle = {
  padding: "42px",
  textAlign: "center",
  color: "#64748b",
  fontSize: "14px",
};

const modalOverlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.55)",
  zIndex: 5000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
};

const modalStyle = {
  width: "100%",
  maxWidth: "820px",
  background: "#ffffff",
  borderRadius: "24px",
  boxShadow: "0 30px 80px rgba(15, 23, 42, 0.35)",
  overflow: "hidden",
};

const modalHeaderStyle = {
  padding: "24px",
  borderBottom: "1px solid #e2e8f0",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "16px",
};

const modalTitleStyle = {
  margin: 0,
  fontSize: "22px",
  fontWeight: 900,
  color: "#0f172a",
};

const modalSubtitleStyle = {
  margin: "4px 0 0",
  fontSize: "14px",
  color: "#64748b",
};

const closeButtonStyle = {
  width: "34px",
  height: "34px",
  borderRadius: "999px",
  border: "1px solid #e2e8f0",
  background: "#f8fafc",
  color: "#0f172a",
  fontSize: "22px",
  cursor: "pointer",
  lineHeight: 1,
};

const modalStatusBarStyle = {
  padding: "14px 24px",
  background: "#f8fafc",
  borderBottom: "1px solid #e2e8f0",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const modalStatusTextStyle = {
  fontSize: "13px",
  fontWeight: 800,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const modalGridStyle = {
  padding: "24px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "14px",
};

const detailItemStyle = {
  padding: "14px",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  background: "#f8fafc",
};

const detailLabelStyle = {
  display: "block",
  fontSize: "12px",
  fontWeight: 800,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  marginBottom: "6px",
};

const detailValueStyle = {
  fontSize: "14px",
  color: "#0f172a",
};

const descriptionBoxStyle = {
  margin: "0 24px 24px",
  padding: "18px",
  borderRadius: "18px",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
};

const sectionTitleStyle = {
  margin: "0 0 8px",
  fontSize: "15px",
  fontWeight: 900,
  color: "#0f172a",
};

const descriptionTextStyle = {
  margin: 0,
  color: "#475569",
  fontSize: "14px",
  lineHeight: 1.7,
};

const modalFooterStyle = {
  padding: "18px 24px",
  borderTop: "1px solid #e2e8f0",
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
  flexWrap: "wrap",
};

const activateButtonStyle = {
  padding: "10px 14px",
  borderRadius: "10px",
  border: "none",
  background: "#16a34a",
  color: "#ffffff",
  fontWeight: 800,
  cursor: "pointer",
};

const deactivateButtonStyle = {
  padding: "10px 14px",
  borderRadius: "10px",
  border: "none",
  background: "#dc2626",
  color: "#ffffff",
  fontWeight: 800,
  cursor: "pointer",
};

export default AdminJobs;