import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { useLanguage } from "../../context/LanguageContext";

function AdminCompanies() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const [summary, setSummary] = useState({
    companies: 0,
    active: 0,
    pending: 0,
    inactive: 0,
    withJobs: 0,
    totalJobs: 0,
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchSummary = async () => {
    try {
      const res = await api.get("/api/admin/company-stats");

      setSummary({
        companies: res.data.companies || 0,
        active: res.data.active || 0,
        pending: res.data.pending || 0,
        inactive: res.data.inactive || 0,
        withJobs: res.data.withJobs || 0,
        totalJobs: res.data.totalJobs || 0,
      });
    } catch (error) {
      console.error("Failed to fetch company summary:", error);
    }
  };

  const fetchCompanies = async () => {
    try {
      setLoading(true);

      const res = await api.get("/api/admin/companies", {
        params: {
          search,
          status,
          page,
          limit,
        },
      });

      setCompanies(res.data.companies || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch companies:", error);
      alert(error.response?.data?.error || t("adminCompanies.errors.fetch"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCompanies();
  };

  const handleStatusFilter = (nextStatus) => {
    setStatus(nextStatus);
    setPage(1);
  };

  const handleStatusChange = async (companyId, action) => {
    const confirmKey = {
      approve: "adminCompanies.confirm.approve",
      deactivate: "adminCompanies.confirm.deactivate",
      pending: "adminCompanies.confirm.pending",
    };

    const confirmed = window.confirm(
      t(confirmKey[action] || "adminCompanies.confirm.update")
    );

    if (!confirmed) return;

    try {
      await api.patch(`/api/admin/companies/${companyId}/status`, {
        action,
      });

      await fetchCompanies();
      await fetchSummary();
      setSelectedCompany(null);
    } catch (error) {
      console.error("Failed to update company status:", error);
      alert(error.response?.data?.error || t("adminCompanies.errors.update"));
    }
  };

  return (
    <DashboardLayout
      title={t("adminCompanies.title")}
      subtitle={t("adminCompanies.subtitle")}
    >
      <div style={statsGridStyle}>
        <StatCard
          title={t("adminCompanies.stats.total")}
          value={summary.companies}
          subtitle={t("adminCompanies.stats.totalSub").replace(
            "{{count}}",
            summary.companies
          )}
          color="#0f172a"
        />

        <StatCard
          title={t("adminCompanies.stats.active")}
          value={summary.active}
          subtitle={t("adminCompanies.stats.activeSub")
            .replace("{{active}}", summary.active)
            .replace("{{total}}", summary.companies)}
          color="#16a34a"
        />

        <StatCard
          title={t("adminCompanies.stats.pending")}
          value={summary.pending}
          subtitle={t("adminCompanies.stats.pendingSub").replace(
            "{{count}}",
            summary.pending
          )}
          color="#f59e0b"
        />

        <StatCard
          title={t("adminCompanies.stats.jobs")}
          value={summary.totalJobs}
          subtitle={t("adminCompanies.stats.jobsSub").replace(
            "{{count}}",
            summary.totalJobs
          )}
          color="#7c3aed"
        />
      </div>

      <Card
        title={t("adminCompanies.directory.title")}
        subtitle={t("adminCompanies.directory.subtitle")}
      >
        <div style={statusTabsStyle}>
          {[
            {
              value: "all",
              label: t("adminCompanies.filters.all"),
              count: summary.companies,
            },
            {
              value: "pending",
              label: t("adminCompanies.filters.pending"),
              count: summary.pending,
            },
            {
              value: "active",
              label: t("adminCompanies.filters.active"),
              count: summary.active,
            },
            {
              value: "inactive",
              label: t("adminCompanies.filters.inactive"),
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
            placeholder={t("adminCompanies.directory.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={inputStyle}
          />

          <select
            value={status}
            onChange={(e) => handleStatusFilter(e.target.value)}
            style={selectStyle}
          >
            <option value="all">{t("adminCompanies.filters.allStatus")}</option>
            <option value="pending">{t("adminCompanies.filters.pending")}</option>
            <option value="active">{t("adminCompanies.filters.active")}</option>
            <option value="inactive">{t("adminCompanies.filters.inactive")}</option>
          </select>

          <Button type="submit">{t("adminCompanies.filters.search")}</Button>
        </form>

        <div style={directoryStyle}>
          <div style={tableHeaderStyle}>
            <span>{t("adminCompanies.table.company")}</span>
            <span>{t("adminCompanies.table.industry")}</span>
            <span>{t("adminCompanies.table.location")}</span>
            <span>{t("adminCompanies.table.jobs")}</span>
            <span>{t("adminCompanies.table.status")}</span>
            <span>{t("adminCompanies.table.actions")}</span>
          </div>

          {loading ? (
            <div style={emptyStyle}>{t("adminCompanies.directory.loading")}</div>
          ) : companies.length === 0 ? (
            <div style={emptyStyle}>{t("adminCompanies.directory.empty")}</div>
          ) : (
            companies.map((company) => (
              <div
                key={company.id}
                style={rowStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f8fafc";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#ffffff";
                }}
              >
                <div style={companyCellStyle}>
                  <CompanyLogo company={company} t={t} />

                  <div>
                    <strong style={companyNameStyle}>
                      {company.name || t("adminCompanies.fallback.unknown")}
                    </strong>

                    {company.website ? (
                      <a
                        href={normalizeWebsite(company.website)}
                        target="_blank"
                        rel="noreferrer"
                        style={companyWebsiteStyle}
                      >
                        {company.website}
                      </a>
                    ) : (
                      <div style={mutedStyle}>
                        {company.description ||
                          t("adminCompanies.fallback.noDetails")}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Badge variant={getIndustryVariant(company.industry)}>
                    {company.industry || t("adminCompanies.fallback.other")}
                  </Badge>
                </div>

                <div style={cellStyle}>
                  {company.city && company.country
                    ? `${company.city}, ${company.country}`
                    : company.country ||
                      company.city ||
                      t("adminCompanies.fallback.notSpecified")}
                </div>

                <div style={cellStyle}>
                  <strong>{company.job_count || 0}</strong>
                  <div style={mutedStyle}>
                    {t("adminCompanies.fallback.jobsPosted")}
                  </div>
                </div>

                <div>
                  <StatusPill status={company.status} t={t} />
                </div>

                <div style={actionGroupStyle}>
                  {company.status !== "active" && (
                    <button
                      type="button"
                      style={smallApproveButtonStyle}
                      onClick={() => handleStatusChange(company.id, "approve")}
                    >
                      {t("adminCompanies.actions.approve")}
                    </button>
                  )}

                  <button
                    type="button"
                    style={detailsButtonStyle}
                    onClick={() => setSelectedCompany(company)}
                  >
                    {t("adminCompanies.actions.viewDetails")}
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
            {t("adminCompanies.actions.previous")}
          </Button>

          <span style={pageTextStyle}>
            {t("adminCompanies.actions.page")
              .replace("{{page}}", page)
              .replace("{{total}}", totalPages)}
          </span>

          <Button
            variant="secondary"
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          >
            {t("adminCompanies.actions.next")}
          </Button>
        </div>
      </Card>

      {selectedCompany && (
        <CompanyDetailsModal
          company={selectedCompany}
          t={t}
          onClose={() => setSelectedCompany(null)}
          onViewJobs={() => {
            setSelectedCompany(null);
            navigate(`/admin/jobs?company=${selectedCompany.id}`);
          }}
          onStatusChange={(action) =>
            handleStatusChange(selectedCompany.id, action)
          }
        />
      )}
    </DashboardLayout>
  );
}

function CompanyDetailsModal({
  company,
  t,
  onClose,
  onViewJobs,
  onStatusChange,
}) {
  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <div style={companyCellStyle}>
            <CompanyLogo company={company} t={t} />

            <div>
              <h2 style={modalTitleStyle}>
                {company.name || t("adminCompanies.fallback.unknown")}
              </h2>

              <p style={modalSubtitleStyle}>
                {company.industry || t("adminCompanies.fallback.noIndustry")}
              </p>
            </div>
          </div>

          <button type="button" onClick={onClose} style={closeButtonStyle}>
            ×
          </button>
        </div>

        <div style={modalStatusBarStyle}>
          <span style={modalStatusTextStyle}>
            {t("adminCompanies.modal.currentStatus")}
          </span>
          <StatusPill status={company.status} t={t} />
        </div>

        <div style={modalGridStyle}>
          <DetailItem label={t("adminCompanies.details.id")} value={company.id} />
          <DetailItem
            label={t("adminCompanies.details.industry")}
            value={company.industry || t("adminCompanies.fallback.notAvailable")}
          />
          <DetailItem
            label={t("adminCompanies.details.country")}
            value={company.country || t("adminCompanies.fallback.notAvailable")}
          />
          <DetailItem
            label={t("adminCompanies.details.city")}
            value={company.city || t("adminCompanies.fallback.notAvailable")}
          />
          <DetailItem
            label={t("adminCompanies.details.website")}
            value={company.website || t("adminCompanies.fallback.notAvailable")}
          />
          <DetailItem
            label={t("adminCompanies.details.jobs")}
            value={company.job_count || 0}
          />
          <DetailItem
            label={t("adminCompanies.details.status")}
            value={formatStatus(company.status, t)}
          />
          <DetailItem
            label={t("adminCompanies.details.registered")}
            value={formatDate(company.created_at)}
          />
        </div>

        <div style={descriptionBoxStyle}>
          <h3 style={sectionTitleStyle}>
            {t("adminCompanies.modal.description")}
          </h3>

          <p style={descriptionTextStyle}>
            {company.description || t("adminCompanies.fallback.noDescription")}
          </p>
        </div>

        <div style={modalFooterStyle}>
          {company.website && (
            <a
              href={normalizeWebsite(company.website)}
              target="_blank"
              rel="noreferrer"
              style={websiteButtonStyle}
            >
              {t("adminCompanies.actions.visitWebsite")}
            </a>
          )}

          <Button variant="secondary" onClick={onViewJobs}>
            {t("adminCompanies.actions.viewJobs")}
          </Button>

          {company.status !== "active" && (
            <button
              type="button"
              style={approveButtonStyle}
              onClick={() => onStatusChange("approve")}
            >
              {t("adminCompanies.actions.approve")}
            </button>
          )}

          {company.status !== "pending" && (
            <button
              type="button"
              style={pendingButtonStyle}
              onClick={() => onStatusChange("pending")}
            >
              {t("adminCompanies.actions.markPending")}
            </button>
          )}

          {company.status !== "inactive" && (
            <button
              type="button"
              style={deactivateButtonStyle}
              onClick={() => onStatusChange("deactivate")}
            >
              {t("adminCompanies.actions.deactivate")}
            </button>
          )}

          <Button variant="secondary" onClick={onClose}>
            {t("adminCompanies.actions.close")}
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

function CompanyLogo({ company, t }) {
  const logo = company.logo || company.logo_url;

  if (logo) {
    return (
      <img
        src={logo}
        alt={company.name || t("adminCompanies.fallback.companyLogo")}
        style={logoImageStyle}
      />
    );
  }

  return <div style={logoFallbackStyle}>{getInitials(company.name)}</div>;
}

function StatusPill({ status, t }) {
  const normalized = status || "pending";

  const styles = {
    active: {
      background: "#dcfce7",
      color: "#15803d",
      border: "1px solid #bbf7d0",
    },
    pending: {
      background: "#fef3c7",
      color: "#b45309",
      border: "1px solid #fde68a",
    },
    inactive: {
      background: "#fee2e2",
      color: "#b91c1c",
      border: "1px solid #fecaca",
    },
  };

  return (
    <span style={{ ...statusPillStyle, ...(styles[normalized] || styles.pending) }}>
      {formatStatus(normalized, t)}
    </span>
  );
}

function getInitials(name) {
  const source = name || "C";

  return source
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function normalizeWebsite(website) {
  if (!website) return "#";
  return website.startsWith("http") ? website : `https://${website}`;
}

function formatStatus(status, t) {
  switch (status) {
    case "active":
      return t("adminCompanies.filters.active");
    case "inactive":
      return t("adminCompanies.filters.inactive");
    case "pending":
    default:
      return t("adminCompanies.filters.pending");
  }
}

function getIndustryVariant(industry) {
  switch ((industry || "").toLowerCase()) {
    case "technology":
    case "software":
    case "it":
    case "software development":
    case "artificial intelligence":
    case "hr technology":
      return "default";
    case "finance":
    case "banking":
      return "success";
    case "education":
      return "warning";
    case "healthcare":
      return "danger";
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

const directoryStyle = {
  border: "1px solid #e2e8f0",
  borderRadius: "18px",
  overflow: "hidden",
  background: "#ffffff",
};

const tableHeaderStyle = {
  display: "grid",
  gridTemplateColumns: "1.8fr 1fr 1.2fr 0.8fr 0.9fr 1.25fr",
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
  gridTemplateColumns: "1.8fr 1fr 1.2fr 0.8fr 0.9fr 1.25fr",
  gap: "14px",
  padding: "16px 18px",
  borderBottom: "1px solid #f1f5f9",
  alignItems: "center",
  background: "#ffffff",
  transition: "background 0.2s ease",
};

const companyCellStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
};

const logoImageStyle = {
  width: "42px",
  height: "42px",
  borderRadius: "14px",
  objectFit: "cover",
  border: "1px solid #e2e8f0",
  background: "#ffffff",
};

const logoFallbackStyle = {
  width: "42px",
  height: "42px",
  borderRadius: "14px",
  background: "#eff6ff",
  color: "#2563eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 900,
  fontSize: "13px",
};

const companyNameStyle = {
  color: "#0f172a",
  fontSize: "15px",
  fontWeight: 900,
  display: "block",
};

const companyWebsiteStyle = {
  marginTop: "3px",
  fontSize: "12px",
  color: "#2563eb",
  textDecoration: "none",
  display: "inline-block",
};

const mutedStyle = {
  marginTop: "3px",
  fontSize: "12px",
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

const smallApproveButtonStyle = {
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

const websiteButtonStyle = {
  padding: "10px 14px",
  borderRadius: "10px",
  background: "#2563eb",
  color: "#ffffff",
  textDecoration: "none",
  fontWeight: 800,
  fontSize: "14px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const approveButtonStyle = {
  padding: "10px 14px",
  borderRadius: "10px",
  border: "none",
  background: "#16a34a",
  color: "#ffffff",
  fontWeight: 800,
  cursor: "pointer",
};

const pendingButtonStyle = {
  padding: "10px 14px",
  borderRadius: "10px",
  border: "none",
  background: "#f59e0b",
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

export default AdminCompanies;