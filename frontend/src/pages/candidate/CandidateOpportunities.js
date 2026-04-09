import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Input from "../../components/ui/Input";

function CandidateOpportunities() {
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
      const res = await axios.get("http://localhost:5000/api/jobs");
      setJobs(res.data);
    } catch {
      toast.error("Failed to load jobs");
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
        "http://localhost:5000/api/applications",
        {
          job_id: jobId,
          user_id: user.id,
          cover_letter: "I am interested in this opportunity.",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Application submitted");
    } catch (error) {
      toast.error(error.response?.data?.error || "Application failed");
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
      title="Opportunities"
      subtitle="Explore and apply for open roles in a scalable, easy-to-browse layout."
    >
      <Card
      >
        <div
          className="ui-toolbar"
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "12px",
            alignItems: "end",
            flexWrap: "wrap",
            marginBottom: "16px",
          }}
        >
          <div style={{ flex: "1 1 360px", minWidth: "260px" }}>
            <Input
              label="Search"
              placeholder="Search by title, company, keyword, salary, or job type"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
          </div>

          <div style={{ flex: "0 1 220px", minWidth: "200px" }}>
            <Input
              label="Location"
              placeholder="Tokyo, Remote, London..."
              value={filters.location}
              onChange={(e) =>
                setFilters({ ...filters, location: e.target.value })
              }
            />
          </div>

          <label
            className="auth-checkbox"
            style={{ marginBottom: "10px", whiteSpace: "nowrap" }}
          >
            <input
              type="checkbox"
              checked={filters.remoteOnly}
              onChange={(e) =>
                setFilters({ ...filters, remoteOnly: e.target.checked })
              }
            />
            Remote only
          </label>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
            marginBottom: "8px",
          }}
        >
          <div style={{ fontSize: "14px", opacity: 0.8 }}>
            {filteredJobs.length} job{filteredJobs.length === 1 ? "" : "s"} found
          </div>

          {(filters.search || filters.location || filters.remoteOnly) && (
            <Button
              variant="secondary"
              onClick={() =>
                setFilters({
                  search: "",
                  location: "",
                  remoteOnly: false,
                })
              }
            >
              Clear Filters
            </Button>
          )}
        </div>
      </Card>

      <div style={{ height: 18 }} />

      <Card
        title="Available Jobs"
        subtitle="Browse open roles in a compact, manageable table."
      >
        <div className="ui-table-wrap">
          <table className="ui-table">
            <thead>
              <tr>
                <th style={{ width: "60px" }}>#</th>
                <th>Title</th>
                <th>Company</th>
                <th>Location</th>
                <th>Salary</th>
                <th>Type</th>
                <th style={{ width: "140px" }}>Action</th>
              </tr>
            </thead>

            <tbody>
              {paginatedJobs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="ui-table-empty">
                    No jobs match your current filters.
                  </td>
                </tr>
              ) : (
                paginatedJobs.map((job, index) => {
                  const rowNumber = (currentPage - 1) * pageSize + index + 1;

                  return (
                    <tr key={job.id}>
                      <td>{rowNumber}</td>

                      <td>{job.title || "Untitled role"}</td>

                      <td>{job.company_name || "Unknown company"}</td>

                      <td>{job.location || "Not specified"}</td>

                      <td>{job.salary_range || "Not specified"}</td>

                      <td>
                        <Badge variant={job.remote ? "success" : "default"}>
                          {job.remote ? "Remote" : "On-site"}
                        </Badge>
                      </td>

                      <td>
                        <Button onClick={() => applyToJob(job.id)}>
                          Apply
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            marginTop: "16px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontSize: "14px", opacity: 0.8 }}>
            Showing{" "}
            {filteredJobs.length === 0
              ? 0
              : (currentPage - 1) * pageSize + 1}
            {" - "}
            {Math.min(currentPage * pageSize, filteredJobs.length)} of{" "}
            {filteredJobs.length} jobs
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <Button
              variant="secondary"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            <span
              style={{
                fontSize: "14px",
                minWidth: "90px",
                textAlign: "center",
              }}
            >
              Page {currentPage} of {totalPages}
            </span>

            <Button
              variant="secondary"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>
    </DashboardLayout>
  );
}

export default CandidateOpportunities;