import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

function EmployerApplications() {
  const token = localStorage.getItem("token");

  const [applications, setApplications] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const fetchApplications = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/applications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplications(res.data);
    } catch {
      toast.error("Failed to load applications");
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/applications/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Application status updated");
      fetchApplications();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update status");
    }
  };

  const statusVariant = (status) => {
    if (status === "shortlisted") return "success";
    if (status === "reviewed") return "default";
    if (status === "rejected") return "danger";
    return "warning";
  };

  const filteredApplications = useMemo(() => {
    const q = filters.search.toLowerCase();

    return applications.filter((application) => {
      const matchesSearch =
        !q ||
        application.candidate_name?.toLowerCase().includes(q) ||
        application.job_title?.toLowerCase().includes(q) ||
        application.cover_letter?.toLowerCase().includes(q) ||
        (application.status || "").toLowerCase().includes(q);

      const matchesStatus =
        !filters.status ||
        (application.status || "pending") === filters.status;

      return matchesSearch && matchesStatus;
    });
  }, [applications, filters]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredApplications.length / pageSize)
  );

  const paginatedApplications = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredApplications.slice(start, start + pageSize);
  }, [filteredApplications, currentPage]);

  return (
    <DashboardLayout
      title="Applications"
      subtitle="Review and manage candidate activity efficiently."
    >
      <Card
      >
        {/* 🔹 TOOLBAR */}
        <div
          className="ui-toolbar"
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
            alignItems: "end",
            marginBottom: "16px",
          }}
        >
          <div style={{ flex: "1 1 420px", minWidth: "280px" }}>
            <Input
              label="Search"
              placeholder="Search by candidate, job, cover letter, or status"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
          </div>

          <div style={{ width: "220px" }}>
            <Input
              label="Status"
              as="select"
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
              options={[
                { value: "", label: "All statuses" },
                { value: "pending", label: "Pending" },
                { value: "reviewed", label: "Reviewed" },
                { value: "shortlisted", label: "Shortlisted" },
                { value: "rejected", label: "Rejected" },
              ]}
            />
          </div>
        </div>

        {/* 🔹 TABLE */}
        <div className="ui-table-wrap">
          <table className="ui-table">
            <thead>
              <tr>
                <th style={{ width: "60px" }}>#</th>
                <th>Candidate</th>
                <th>Job</th>
                <th>Cover Letter</th>
                <th>Status</th>
                <th style={{ width: "180px" }}>Update</th>
              </tr>
            </thead>

            <tbody>
              {paginatedApplications.length === 0 ? (
                <tr>
                  <td colSpan="6" className="ui-table-empty">
                    No applications found.
                  </td>
                </tr>
              ) : (
                paginatedApplications.map((application, index) => {
                  const rowNumber =
                    (currentPage - 1) * pageSize + index + 1;

                  return (
                    <tr key={application.id}>
                      <td>{rowNumber}</td>
                      <td>{application.candidate_name || "Unknown"}</td>
                      <td>{application.job_title || "Unknown"}</td>

                      <td style={{ maxWidth: "260px" }}>
                        <div
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={application.cover_letter}
                        >
                          {application.cover_letter || "No cover letter"}
                        </div>
                      </td>

                      <td>
                        <Badge variant={statusVariant(application.status)}>
                          {application.status || "pending"}
                        </Badge>
                      </td>

                      <td>
                        <Input
                          as="select"
                          value={application.status || "pending"}
                          onChange={(e) =>
                            updateStatus(application.id, e.target.value)
                          }
                          options={[
                            { value: "pending", label: "Pending" },
                            { value: "reviewed", label: "Reviewed" },
                            { value: "shortlisted", label: "Shortlisted" },
                            { value: "rejected", label: "Rejected" },
                          ]}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* 🔹 PAGINATION */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "16px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div style={{ fontSize: "14px", opacity: 0.8 }}>
            Showing{" "}
            {filteredApplications.length === 0
              ? 0
              : (currentPage - 1) * pageSize + 1}
            {" - "}
            {Math.min(
              currentPage * pageSize,
              filteredApplications.length
            )}{" "}
            of {filteredApplications.length}
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <Button
              variant="secondary"
              onClick={() =>
                setCurrentPage((p) => Math.max(p - 1, 1))
              }
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            <span style={{ alignSelf: "center", fontSize: "14px" }}>
              Page {currentPage} / {totalPages}
            </span>

            <Button
              variant="secondary"
              onClick={() =>
                setCurrentPage((p) => Math.min(p + 1, totalPages))
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

export default EmployerApplications;