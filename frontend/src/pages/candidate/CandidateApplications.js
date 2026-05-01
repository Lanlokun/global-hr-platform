import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import ConfirmModal from "../../components/ui/ConfirmModal";
import { useLanguage } from "../../context/LanguageContext";

function CandidateApplications() {
  const { t } = useLanguage();
  const token = localStorage.getItem("token");

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawTarget, setWithdrawTarget] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const PAGE_SIZE = 8;

  const fetchApplications = useCallback(
    async (showRefreshState = false) => {
      if (!token || !user?.id) {
        setApplications([]);
        setLoading(false);
        return;
      }

      try {
        setError("");

        if (showRefreshState) setRefreshing(true);
        else setLoading(true);

        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/applications`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const mine = Array.isArray(res.data)
          ? res.data.filter((item) => Number(item.user_id) === Number(user.id))
          : [];

        setApplications(mine);
      } catch (err) {
        console.error("Failed to load applications:", err);
        setError(t("failedToLoadApplications"));
        toast.error(t("failedToLoadApplications"));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, user?.id, t]
  );

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const withdrawApplication = async () => {
    if (!withdrawTarget || !token) return;

    try {
      setWithdrawing(true);

      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/applications/${withdrawTarget.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(t("applicationWithdrawnSuccess"));
      setWithdrawTarget(null);
      fetchApplications(true);
    } catch (error) {
      console.error("Withdraw failed:", error);
      toast.error(
        error?.response?.data?.error || t("failedToWithdrawApplication")
      );
    } finally {
      setWithdrawing(false);
    }
  };

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

  const statusLabel = (status) => {
    const normalized = (status || "pending").toLowerCase();

    switch (normalized) {
      case "reviewed":
        return t("reviewed");
      case "shortlisted":
        return t("shortlisted");
      case "rejected":
        return t("rejected");
      case "pending":
      default:
        return t("pending");
    }
  };

  const formatDate = (value) => {
    if (!value) return t("notAvailable");

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return t("notAvailable");

    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const matchesSearch =
        !search ||
        application.job_title?.toLowerCase().includes(search.toLowerCase()) ||
        application.company_name?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (application.status || "pending").toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredApplications.length / PAGE_SIZE)
  );

  const paginatedApplications = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredApplications.slice(start, start + PAGE_SIZE);
  }, [filteredApplications, currentPage]);

  const counts = useMemo(() => {
    return {
      all: applications.length,
      pending: applications.filter(
        (a) => (a.status || "pending").toLowerCase() === "pending"
      ).length,
      reviewed: applications.filter(
        (a) => (a.status || "").toLowerCase() === "reviewed"
      ).length,
      shortlisted: applications.filter(
        (a) => (a.status || "").toLowerCase() === "shortlisted"
      ).length,
      rejected: applications.filter(
        (a) => (a.status || "").toLowerCase() === "rejected"
      ).length,
    };
  }, [applications]);

  return (
    <DashboardLayout
      title={t("myApplications")}
      subtitle={t("myApplicationsSubtitle")}
    >
      <div style={styles.page}>
        <Card>
          <div style={styles.toolbarHeader}>
            <div>
              <h3 style={styles.cardTitle}>{t("applicationTracker")}</h3>
              <p style={styles.cardSubtitle}>
                {t("applicationTrackerSubtitle")}
              </p>
            </div>

            <Button
              variant="secondary"
              onClick={() => fetchApplications(true)}
              disabled={loading || refreshing}
            >
              {refreshing ? t("refreshing") : t("refresh")}
            </Button>
          </div>

          <div style={styles.filterBar}>
            <input
              type="text"
              placeholder={t("searchApplicationsPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={styles.selectInput}
            >
              <option value="all">{t("allStatuses")}</option>
              <option value="pending">{t("pending")}</option>
              <option value="reviewed">{t("reviewed")}</option>
              <option value="shortlisted">{t("shortlisted")}</option>
              <option value="rejected">{t("rejected")}</option>
            </select>
          </div>

          <div style={styles.miniStats}>
            <span style={styles.miniStat}>
              {t("all")}: {counts.all}
            </span>
            <span style={styles.miniStat}>
              {t("pending")}: {counts.pending}
            </span>
            <span style={styles.miniStat}>
              {t("reviewed")}: {counts.reviewed}
            </span>
            <span style={styles.miniStat}>
              {t("shortlisted")}: {counts.shortlisted}
            </span>
            <span style={styles.miniStat}>
              {t("rejected")}: {counts.rejected}
            </span>
          </div>
        </Card>

        <Card>
          <div style={styles.sectionHeader}>
            <div>
              <h3 style={styles.cardTitle}>{t("submittedApplications")}</h3>
              <p style={styles.cardSubtitle}>
                {t("submittedApplicationsSubtitle")}
              </p>
            </div>
          </div>

          {loading ? (
            <div style={styles.stateBox}>
              <p style={styles.stateTitle}>{t("loadingApplications")}</p>
              <p style={styles.stateSubtext}>
                {t("loadingApplicationsSubtitle")}
              </p>
            </div>
          ) : error ? (
            <div style={styles.stateBox}>
              <p style={styles.stateTitle}>{t("couldNotLoadApplications")}</p>
              <p style={styles.stateSubtext}>{error}</p>
              <div style={{ marginTop: "12px" }}>
                <Button variant="primary" onClick={() => fetchApplications()}>
                  {t("tryAgain")}
                </Button>
              </div>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📂</div>
              <h3 style={styles.emptyTitle}>{t("noMatchingApplications")}</h3>
              <p style={styles.emptyText}>
                {t("noMatchingApplicationsSubtitle")}
              </p>
            </div>
          ) : (
            <>
              <div style={styles.tableWrap}>
                <div style={styles.tableHeader}>
                  <span>{t("role")}</span>
                  <span>{t("company")}</span>
                  <span>{t("applied")}</span>
                  <span>{t("updated")}</span>
                  <span>{t("status")}</span>
                  <span>{t("action")}</span>
                </div>

                <div style={styles.tableBody}>
                  {paginatedApplications.map((application) => (
                    <div key={application.id} style={styles.tableRow}>
                      <div style={styles.roleCell}>
                        <strong style={styles.roleTitle}>
                          {application.job_title || t("unknownJob")}
                        </strong>
                      </div>

                      <div style={styles.cellText}>
                        {application.company_name || t("notSpecified")}
                      </div>

                      <div style={styles.cellText}>
                        {formatDate(
                          application.applied_at ||
                            application.created_at ||
                            application.application_date
                        )}
                      </div>

                      <div style={styles.cellText}>
                        {formatDate(application.updated_at)}
                      </div>

                      <div>
                        <Badge variant={statusVariant(application.status)}>
                          {statusLabel(application.status)}
                        </Badge>
                      </div>

                      <div>
                        <Button
                          variant="danger"
                          onClick={() => setWithdrawTarget(application)}
                        >
                          {t("withdraw")}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.pagination}>
                <Button
                  variant="secondary"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  {t("previous")}
                </Button>

                <span style={styles.pageText}>
                  {t("page")} {currentPage} / {totalPages}
                </span>

                <Button
                  variant="secondary"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  {t("next")}
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>

      <ConfirmModal
        open={!!withdrawTarget}
        title={t("withdrawApplicationTitle")}
        message={t("withdrawApplicationMessage").replace(
          "{{job}}",
          withdrawTarget?.job_title || t("thisJob")
        )}
        confirmText={withdrawing ? t("withdrawing") : t("withdraw")}
        onConfirm={withdrawApplication}
        onCancel={() => {
          if (!withdrawing) setWithdrawTarget(null);
        }}
      />
    </DashboardLayout>
  );
}

const styles = {
  page: {
    display: "grid",
    gap: "20px",
  },
  toolbarHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "18px",
  },
  sectionHeader: {
    marginBottom: "18px",
  },
  cardTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 700,
    color: "#0f172a",
  },
  cardSubtitle: {
    margin: "4px 0 0",
    fontSize: "14px",
    color: "#64748b",
  },
  filterBar: {
    display: "grid",
    gridTemplateColumns: "minmax(220px, 1fr) 220px",
    gap: "12px",
    marginBottom: "14px",
  },
  searchInput: {
    width: "100%",
    height: "46px",
    borderRadius: "12px",
    border: "1px solid #dbe2ea",
    padding: "0 14px",
    fontSize: "14px",
    color: "#0f172a",
    outline: "none",
    background: "#fff",
    boxSizing: "border-box",
  },
  selectInput: {
    width: "100%",
    height: "46px",
    borderRadius: "12px",
    border: "1px solid #dbe2ea",
    padding: "0 14px",
    fontSize: "14px",
    color: "#0f172a",
    outline: "none",
    background: "#fff",
    boxSizing: "border-box",
  },
  miniStats: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
  },
  miniStat: {
    fontSize: "13px",
    color: "#475569",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "999px",
    padding: "8px 12px",
    fontWeight: 500,
  },
  tableWrap: {
    width: "100%",
    overflowX: "auto",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
  },
  tableHeader: {
    minWidth: "920px",
    display: "grid",
    gridTemplateColumns: "2fr 1.5fr 1.2fr 1.2fr 1fr 1fr",
    gap: "12px",
    padding: "14px 16px",
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: "#64748b",
  },
  tableBody: {
    display: "grid",
  },
  tableRow: {
    minWidth: "920px",
    display: "grid",
    gridTemplateColumns: "2fr 1.5fr 1.2fr 1.2fr 1fr 1fr",
    gap: "12px",
    padding: "16px",
    alignItems: "center",
    borderBottom: "1px solid #eef2f7",
    background: "#fff",
  },
  roleCell: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  roleTitle: {
    fontSize: "15px",
    color: "#0f172a",
    fontWeight: 700,
  },
  cellText: {
    fontSize: "14px",
    color: "#475569",
  },
  pagination: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    marginTop: "18px",
    flexWrap: "wrap",
  },
  pageText: {
    fontSize: "14px",
    color: "#64748b",
    fontWeight: 500,
  },
  stateBox: {
    border: "1px dashed #cbd5e1",
    borderRadius: "16px",
    padding: "28px",
    textAlign: "center",
    background: "#f8fafc",
  },
  stateTitle: {
    margin: 0,
    fontSize: "18px",
    fontWeight: 700,
    color: "#0f172a",
  },
  stateSubtext: {
    margin: "8px 0 0",
    fontSize: "14px",
    color: "#64748b",
  },
  emptyState: {
    border: "1px dashed #cbd5e1",
    borderRadius: "18px",
    padding: "40px 20px",
    textAlign: "center",
    background: "#f8fafc",
  },
  emptyIcon: {
    fontSize: "32px",
    marginBottom: "12px",
  },
  emptyTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 700,
    color: "#0f172a",
  },
  emptyText: {
    margin: "10px auto 0",
    fontSize: "14px",
    color: "#64748b",
    maxWidth: "520px",
    lineHeight: 1.6,
  },
};

export default CandidateApplications;