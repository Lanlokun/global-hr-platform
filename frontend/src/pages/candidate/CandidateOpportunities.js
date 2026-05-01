import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Input from "../../components/ui/Input";
import { useLanguage } from "../../context/LanguageContext";

function CandidateOpportunities() {
  const { t } = useLanguage();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  const [jobs, setJobs] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    location: "",
    remoteOnly: false,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/jobs`);
      setJobs(res.data);
    } catch {
      toast.error(t("failedToLoadJobs"));
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const applyToJob = async (jobId) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/applications`,
        {
          job_id: jobId,
          user_id: user.id,
          cover_letter: t("defaultCoverLetter"),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(t("applicationSubmitted"));
    } catch (error) {
      toast.error(
        error.response?.data?.error || t("applicationFailed")
      );
    }
  };

  const filteredJobs = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    const locationQuery = filters.location.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesSearch =
        !q ||
        job.title?.toLowerCase().includes(q) ||
        job.company_name?.toLowerCase().includes(q) ||
        job.description?.toLowerCase().includes(q) ||
        job.salary_range?.toLowerCase().includes(q) ||
        (job.remote ? "remote" : "on-site").includes(q);

      const matchesLocation =
        !locationQuery ||
        job.location?.toLowerCase().includes(locationQuery);

      const matchesRemote = !filters.remoteOnly || job.remote === true;

      return matchesSearch && matchesLocation && matchesRemote;
    });
  }, [jobs, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / pageSize));

  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredJobs.slice(start, start + pageSize);
  }, [filteredJobs, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <DashboardLayout
      title={t("opportunities")}
      subtitle={t("opportunitiesSubtitle")}
    >
      <Card>
        <div className="ui-toolbar" style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}>
          
          <div style={{ flex: "1 1 360px" }}>
            <Input
              label={t("search")}
              placeholder={t("searchJobsPlaceholder")}
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
          </div>

          <div style={{ flex: "0 1 220px" }}>
            <Input
              label={t("location")}
              placeholder={t("locationPlaceholder")}
              value={filters.location}
              onChange={(e) =>
                setFilters({ ...filters, location: e.target.value })
              }
            />
          </div>

          <label className="auth-checkbox">
            <input
              type="checkbox"
              checked={filters.remoteOnly}
              onChange={(e) =>
                setFilters({ ...filters, remoteOnly: e.target.checked })
              }
            />
            {t("remoteOnly")}
          </label>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <div>
            {filteredJobs.length} {t("jobsFound", { count: filteredJobs.length })}
          </div>

          {(filters.search || filters.location || filters.remoteOnly) && (
            <Button
              variant="secondary"
              onClick={() =>
                setFilters({ search: "", location: "", remoteOnly: false })
              }
            >
              {t("clearFilters")}
            </Button>
          )}
        </div>
      </Card>

      <div style={{ height: 18 }} />

      <Card
        title={t("availableJobs")}
        subtitle={t("availableJobsSubtitle")}
      >
        <div className="ui-table-wrap">
          <table className="ui-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{t("title")}</th>
                <th>{t("company")}</th>
                <th>{t("location")}</th>
                <th>{t("salary")}</th>
                <th>{t("type")}</th>
                <th>{t("action")}</th>
              </tr>
            </thead>

            <tbody>
              {paginatedJobs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="ui-table-empty">
                    {t("noJobsMatch")}
                  </td>
                </tr>
              ) : (
                paginatedJobs.map((job, index) => {
                  const rowNumber =
                    (currentPage - 1) * pageSize + index + 1;

                  return (
                    <tr key={job.id}>
                      <td>{rowNumber}</td>

                      <td>{job.title || t("untitledRole")}</td>

                      <td>{job.company_name || t("unknownCompany")}</td>

                      <td>{job.location || t("notSpecified")}</td>

                      <td>{job.salary_range || t("notSpecified")}</td>

                      <td>
                        <Badge variant={job.remote ? "success" : "default"}>
                          {job.remote ? t("remote") : t("onSite")}
                        </Badge>
                      </td>

                      <td>
                        <Button onClick={() => applyToJob(job.id)}>
                          {t("apply")}
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
          <div>
            {t("showing")}{" "}
            {filteredJobs.length === 0
              ? 0
              : (currentPage - 1) * pageSize + 1}
            {" - "}
            {Math.min(currentPage * pageSize, filteredJobs.length)}{" "}
            {t("of")} {filteredJobs.length}
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <Button
              variant="secondary"
              onClick={() =>
                setCurrentPage((prev) => Math.max(prev - 1, 1))
              }
              disabled={currentPage === 1}
            >
              {t("previous")}
            </Button>

            <span>
              {t("page")} {currentPage} / {totalPages}
            </span>

            <Button
              variant="secondary"
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(prev + 1, totalPages)
                )
              }
              disabled={currentPage === totalPages}
            >
              {t("next")}
            </Button>
          </div>
        </div>
      </Card>
    </DashboardLayout>
  );
}

export default CandidateOpportunities;