import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import ConfirmModal from "../../components/ui/ConfirmModal";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

function CandidateApplications() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");

  const [applications, setApplications] = useState([]);
  const [withdrawTarget, setWithdrawTarget] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const fetchApplications = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/applications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const mine = res.data.filter(
        (item) => Number(item.user_id) === Number(user.id)
      );

      setApplications(mine);
    } catch {
      toast.error("Failed to load applications");
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [token, user.id]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const withdrawApplication = async () => {
    if (!withdrawTarget) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/applications/${withdrawTarget.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Application withdrawn");
      setWithdrawTarget(null);
      fetchApplications();
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to withdraw application"
      );
    }
  };

  const statusVariant = (status) => {
    if (status === "shortlisted") return "success";
    if (status === "reviewed") return "default";
    if (status === "rejected") return "danger";
    return "warning";
  };

  const filteredApplications = useMemo(() => {
    const q = search.trim().toLowerCase();

    return applications.filter((application) => {
      const matchesSearch =
        !q ||
        application.job_title?.toLowerCase().includes(q) ||
        application.candidate_name?.toLowerCase().includes(q) ||
        application.cover_letter?.toLowerCase().includes(q) ||
        (application.status || "pending").toLowerCase().includes(q);

      const matchesStatus =
        !statusFilter ||
        (application.status || "pending") === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [applications, search, statusFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredApplications.length / pageSize)
  );

  const paginatedApplications = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredApplications.slice(start, start + pageSize);
  }, [filteredApplications, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <DashboardLayout
      title="My Applications"
      subtitle="Track your submitted applications and monitor hiring progress."
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
          <div style={{ flex: "1 1 420px", minWidth: "280px" }}>
            <Input
              label="Search applications"
              placeholder="Search by job title, status, or cover letter"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ width: "220px" }}>
            <Input
              label="Status"
              as="select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
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

        <div className="ui-table-wrap">
          <table className="ui-table">
            <thead>
              <tr>
                <th style={{ width: "70px" }}>#</th>
                <th>Job Title</th>
                <th>Candidate</th>
                <th>Cover Letter</th>
                <th>Status</th>
                <th style={{ width: "160px" }}>Action</th>
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

                      <td>{application.job_title || "Unknown job"}</td>

                      <td>{application.candidate_name || "Unknown candidate"}</td>

                      <td style={{ maxWidth: "280px" }}>
                        <div
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={application.cover_letter || "No cover letter"}
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
                        <Button
                          variant="danger"
                          onClick={() => setWithdrawTarget(application)}
                        >
                          Withdraw
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
            {filteredApplications.length === 0
              ? 0
              : (currentPage - 1) * pageSize + 1}
            {" - "}
            {Math.min(currentPage * pageSize, filteredApplications.length)} of{" "}
            {filteredApplications.length} applications
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

      <ConfirmModal
        open={!!withdrawTarget}
        title="Withdraw application?"
        message={`Are you sure you want to withdraw your application for "${
          withdrawTarget?.job_title || "this job"
        }"?`}
        confirmText="Withdraw"
        onConfirm={withdrawApplication}
        onCancel={() => setWithdrawTarget(null)}
      />
    </DashboardLayout>
  );
}

export default CandidateApplications;