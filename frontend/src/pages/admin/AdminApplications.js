import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import api from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { useLanguage } from "../../context/LanguageContext";

function AdminApplications() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();

  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);

  const [summary, setSummary] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    shortlisted: 0,
    interview: 0,
    hired: 0,
    rejected: 0,
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const jobFilter = searchParams.get("job");

  const fetchSummary = async () => {
    try {
      const res = await api.get("/api/admin/application-stats");

      setSummary({
        total: res.data.total || 0,
        pending: res.data.pending || 0,
        reviewed: res.data.reviewed || 0,
        shortlisted: res.data.shortlisted || 0,
        interview: res.data.interview || 0,
        hired: res.data.hired || 0,
        rejected: res.data.rejected || 0,
      });
    } catch (error) {
      console.error("Failed to fetch application summary:", error);
    }
  };

  const fetchApplications = async () => {
    try {
      setLoading(true);

      const res = await api.get("/api/admin/applications", {
        params: {
          search,
          status,
          page,
          limit,
          job: jobFilter || undefined,
        },
      });

      setApplications(res.data.applications || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch applications:", error);
      alert(error.response?.data?.error || t("adminApplications.errors.fetch"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status, jobFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchApplications();
  };

  const handleStatusFilter = (nextStatus) => {
    setStatus(nextStatus);
    setPage(1);
  };

  const handleStatusChange = async (applicationId, nextStatus) => {
    const confirmed = window.confirm(
      t("adminApplications.confirm.statusChange").replace(
        "{{status}}",
        formatStatus(nextStatus, t)
      )
    );

    if (!confirmed) return;

    try {
      await api.patch(`/api/admin/applications/${applicationId}/status`, {
        status: nextStatus,
      });

      await fetchApplications();
      await fetchSummary();
      setSelectedApplication(null);
    } catch (error) {
      console.error("Failed to update application status:", error);
      alert(error.response?.data?.error || t("adminApplications.errors.update"));
    }
  };

  return (
    <DashboardLayout
      title={t("adminApplications.title")}
      subtitle={t("adminApplications.subtitle")}
    >
      <div style={statsGridStyle}>
        <StatCard
          title={t("adminApplications.stats.total")}
          value={summary.total}
          subtitle={t("adminApplications.stats.totalSub").replace(
            "{{count}}",
            summary.total
          )}
          color="#0f172a"
        />

        <StatCard
          title={t("adminApplications.stats.pending")}
          value={summary.pending}
          subtitle={t("adminApplications.stats.pendingSub").replace(
            "{{count}}",
            summary.pending
          )}
          color="#f59e0b"
        />

        <StatCard
          title={t("adminApplications.stats.shortlisted")}
          value={summary.shortlisted}
          subtitle={t("adminApplications.stats.shortlistedSub").replace(
            "{{count}}",
            summary.shortlisted
          )}
          color="#16a34a"
        />

        <StatCard
          title={t("adminApplications.stats.hired")}
          value={summary.hired}
          subtitle={t("adminApplications.stats.hiredSub").replace(
            "{{count}}",
            summary.hired
          )}
          color="#7c3aed"
        />
      </div>

      <Card
        title={t("adminApplications.pipeline.title")}
        subtitle={t("adminApplications.pipeline.subtitle")}
      >
        <div style={statusTabsStyle}>
          {[
            {
              value: "all",
              label: t("adminApplications.filters.all"),
              count: summary.total,
            },
            {
              value: "pending",
              label: t("adminApplications.filters.pending"),
              count: summary.pending,
            },
            {
              value: "reviewed",
              label: t("adminApplications.filters.reviewed"),
              count: summary.reviewed,
            },
            {
              value: "shortlisted",
              label: t("adminApplications.filters.shortlisted"),
              count: summary.shortlisted,
            },
            {
              value: "interview",
              label: t("adminApplications.filters.interview"),
              count: summary.interview,
            },
            {
              value: "hired",
              label: t("adminApplications.filters.hired"),
              count: summary.hired,
            },
            {
              value: "rejected",
              label: t("adminApplications.filters.rejected"),
              count: summary.rejected,
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
            placeholder={t("adminApplications.filters.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={inputStyle}
          />

          <select
            value={status}
            onChange={(e) => handleStatusFilter(e.target.value)}
            style={selectStyle}
          >
            <option value="all">{t("adminApplications.filters.allStatus")}</option>
            <option value="pending">{t("adminApplications.filters.pending")}</option>
            <option value="reviewed">{t("adminApplications.filters.reviewed")}</option>
            <option value="shortlisted">
              {t("adminApplications.filters.shortlisted")}
            </option>
            <option value="interview">{t("adminApplications.filters.interview")}</option>
            <option value="hired">{t("adminApplications.filters.hired")}</option>
            <option value="rejected">{t("adminApplications.filters.rejected")}</option>
          </select>

          <Button type="submit">{t("adminApplications.filters.search")}</Button>
        </form>

        {jobFilter && (
          <div style={filterNoticeStyle}>
            <span>
              {t("adminApplications.filters.showingJob").replace(
                "{{id}}",
                jobFilter
              )}
            </span>

            <button
              type="button"
              style={clearFilterButtonStyle}
              onClick={() => navigate("/admin/applications")}
            >
              {t("adminApplications.filters.clear")}
            </button>
          </div>
        )}

        <div style={directoryStyle}>
          <div style={tableHeaderStyle}>
            <span>{t("adminApplications.table.application")}</span>
            <span>{t("adminApplications.table.candidate")}</span>
            <span>{t("adminApplications.table.company")}</span>
            <span>{t("adminApplications.table.status")}</span>
            <span>{t("adminApplications.table.actions")}</span>
          </div>

          {loading ? (
            <div style={emptyStyle}>
              {t("adminApplications.directory.loading")}
            </div>
          ) : applications.length === 0 ? (
            <div style={emptyStyle}>{t("adminApplications.directory.empty")}</div>
          ) : (
            applications.map((application) => (
              <div
                key={application.id}
                style={rowStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f8fafc";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#ffffff";
                }}
              >
                <div>
                  <strong style={mainTitleStyle}>
                    {application.job_title ||
                      t("adminApplications.fallback.unknownJob")}
                  </strong>

                  <div style={mutedStyle}>
                    {t("adminApplications.fallback.applied")}{" "}
                    {formatDate(application.created_at)}
                  </div>

                  <div style={tinyMutedStyle}>
                    {t("adminApplications.details.id")}: {application.id}
                  </div>
                </div>

                <div>
                  <strong style={nameStyle}>
                    {application.candidate_name ||
                      t("adminApplications.fallback.unknownCandidate")}
                  </strong>

                  <div style={mutedStyle}>
                    {application.candidate_email ||
                      t("adminApplications.fallback.noEmail")}
                  </div>
                </div>

                <div>
                  <strong style={nameStyle}>
                    {application.company_name ||
                      t("adminApplications.fallback.unknownCompany")}
                  </strong>

                  <div style={mutedStyle}>
                    {application.location ||
                      t("adminApplications.fallback.noLocation")}
                  </div>
                </div>

                <div>
                  <StatusPill status={application.status} t={t} />
                </div>

                <div style={actionGroupStyle}>
                  {application.status === "pending" && (
                    <button
                      type="button"
                      style={smallPrimaryButtonStyle}
                      onClick={() =>
                        handleStatusChange(application.id, "reviewed")
                      }
                    >
                      {t("adminApplications.actions.markReviewed")}
                    </button>
                  )}

                  {application.status !== "shortlisted" && (
                    <button
                      type="button"
                      style={smallSuccessButtonStyle}
                      onClick={() =>
                        handleStatusChange(application.id, "shortlisted")
                      }
                    >
                      {t("adminApplications.actions.shortlist")}
                    </button>
                  )}

                  <button
                    type="button"
                    style={detailsButtonStyle}
                    onClick={() => setSelectedApplication(application)}
                  >
                    {t("adminApplications.actions.viewDetails")}
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
            {t("adminApplications.actions.previous")}
          </Button>

          <span style={pageTextStyle}>
            {t("adminApplications.actions.page")
              .replace("{{page}}", page)
              .replace("{{total}}", totalPages)}
          </span>

          <Button
            variant="secondary"
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          >
            {t("adminApplications.actions.next")}
          </Button>
        </div>
      </Card>

      {selectedApplication && (
        <ApplicationDetailsModal
          application={selectedApplication}
          t={t}
          onClose={() => setSelectedApplication(null)}
          onViewJob={() => {
            setSelectedApplication(null);
            navigate(`/admin/jobs?job=${selectedApplication.job_id}`);
          }}
          onStatusChange={(nextStatus) =>
            handleStatusChange(selectedApplication.id, nextStatus)
          }
        />
      )}
    </DashboardLayout>
  );
}

function ApplicationDetailsModal({
  application,
  t,
  onClose,
  onViewJob,
  onStatusChange,
}) {
  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <div>
            <h2 style={modalTitleStyle}>
              {application.candidate_name ||
                t("adminApplications.fallback.unknownCandidate")}
            </h2>

            <p style={modalSubtitleStyle}>
              {application.job_title ||
                t("adminApplications.fallback.unknownJob")}{" "}
              ·{" "}
              {application.company_name ||
                t("adminApplications.fallback.unknownCompany")}
            </p>
          </div>

          <button type="button" onClick={onClose} style={closeButtonStyle}>
            ×
          </button>
        </div>

        <div style={modalStatusBarStyle}>
          <span style={modalStatusTextStyle}>
            {t("adminApplications.modal.currentStatus")}
          </span>
          <StatusPill status={application.status} t={t} />
        </div>

        <div style={modalGridStyle}>
          <DetailItem
            label={t("adminApplications.details.id")}
            value={application.id}
          />
          <DetailItem
            label={t("adminApplications.details.candidate")}
            value={
              application.candidate_name ||
              t("adminApplications.fallback.na")
            }
          />
          <DetailItem
            label={t("adminApplications.details.email")}
            value={
              application.candidate_email ||
              t("adminApplications.fallback.na")
            }
          />
          <DetailItem
            label={t("adminApplications.details.job")}
            value={application.job_title || t("adminApplications.fallback.na")}
          />
          <DetailItem
            label={t("adminApplications.details.company")}
            value={application.company_name || t("adminApplications.fallback.na")}
          />
          <DetailItem
            label={t("adminApplications.details.location")}
            value={application.location || t("adminApplications.fallback.na")}
          />
          <DetailItem
            label={t("adminApplications.details.status")}
            value={formatStatus(application.status, t)}
          />
          <DetailItem
            label={t("adminApplications.details.applied")}
            value={formatDate(application.created_at)}
          />
        </div>

        <div style={descriptionBoxStyle}>
          <h3 style={sectionTitleStyle}>
            {t("adminApplications.modal.notes")}
          </h3>

          <p style={descriptionTextStyle}>
            {t("adminApplications.modal.notesText")}
          </p>
        </div>

        <div style={modalFooterStyle}>
          <Button variant="secondary" onClick={onViewJob}>
            {t("adminApplications.actions.viewJob")}
          </Button>

          {[
            "pending",
            "reviewed",
            "shortlisted",
            "interview",
            "hired",
            "rejected",
          ].map((item) => (
            <button
              key={item}
              type="button"
              style={{
                ...modalStatusButtonStyle,
                ...(application.status === item
                  ? activeModalStatusButtonStyle
                  : {}),
              }}
              onClick={() => onStatusChange(item)}
              disabled={application.status === item}
            >
              {formatStatus(item, t)}
            </button>
          ))}

          <Button variant="secondary" onClick={onClose}>
            {t("adminApplications.actions.close")}
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
  const normalized = status || "pending";

  const styles = {
    pending: {
      background: "#fef3c7",
      color: "#b45309",
      border: "1px solid #fde68a",
    },
    reviewed: {
      background: "#dbeafe",
      color: "#1d4ed8",
      border: "1px solid #bfdbfe",
    },
    shortlisted: {
      background: "#dcfce7",
      color: "#15803d",
      border: "1px solid #bbf7d0",
    },
    interview: {
      background: "#ede9fe",
      color: "#6d28d9",
      border: "1px solid #ddd6fe",
    },
    hired: {
      background: "#dcfce7",
      color: "#166534",
      border: "1px solid #86efac",
    },
    rejected: {
      background: "#fee2e2",
      color: "#b91c1c",
      border: "1px solid #fecaca",
    },
  };

  return (
    <span
      style={{
        ...statusPillStyle,
        ...(styles[normalized] || styles.pending),
      }}
    >
      {formatStatus(normalized, t)}
    </span>
  );
}

function formatStatus(status, t) {
  switch (status) {
    case "reviewed":
      return t("adminApplications.filters.reviewed");
    case "shortlisted":
      return t("adminApplications.filters.shortlisted");
    case "interview":
      return t("adminApplications.filters.interview");
    case "hired":
      return t("adminApplications.filters.hired");
    case "rejected":
      return t("adminApplications.filters.rejected");
    case "pending":
    default:
      return t("adminApplications.filters.pending");
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
  gridTemplateColumns: "1fr 180px auto",
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
  gridTemplateColumns: "1.5fr 1.3fr 1.3fr 0.9fr 1.5fr",
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
  gridTemplateColumns: "1.5fr 1.3fr 1.3fr 0.9fr 1.5fr",
  gap: "14px",
  padding: "16px 18px",
  borderBottom: "1px solid #f1f5f9",
  alignItems: "center",
  background: "#ffffff",
  transition: "background 0.2s ease",
};

const mainTitleStyle = {
  color: "#0f172a",
  fontSize: "15px",
  fontWeight: 900,
  display: "block",
};

const nameStyle = {
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

const actionGroupStyle = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  alignItems: "center",
};

const smallPrimaryButtonStyle = {
  padding: "8px 14px",
  borderRadius: "999px",
  border: "none",
  background: "#2563eb",
  color: "#ffffff",
  fontWeight: 800,
  cursor: "pointer",
  fontSize: "12px",
};

const smallSuccessButtonStyle = {
  padding: "8px 14px",
  borderRadius: "999px",
  border: "none",
  background: "#16a34a",
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

const statusPillStyle = {
  padding: "6px 10px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: 900,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
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
  maxWidth: "880px",
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

const modalStatusButtonStyle = {
  padding: "10px 13px",
  borderRadius: "10px",
  border: "1px solid #dbe3ef",
  background: "#ffffff",
  color: "#0f172a",
  fontWeight: 800,
  cursor: "pointer",
  fontSize: "13px",
};

const activeModalStatusButtonStyle = {
  background: "#0f172a",
  color: "#ffffff",
  cursor: "not-allowed",
};

export default AdminApplications;