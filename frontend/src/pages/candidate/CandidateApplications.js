import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import Badge from "../../components/ui/Badge";
import Card from "../../components/ui/Card";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import ConfirmModal from "../../components/ui/ConfirmModal";

function CandidateApplications() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const token = localStorage.getItem("token");
  const [applications, setApplications] = useState([]);

  const fetchApplications = useCallback(async () => {
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
  }, [token, user.id]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const [withdrawTarget, setWithdrawTarget] = useState(null);

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
      toast.error(error.response?.data?.error || "Failed to withdraw application");
    }
  };

  const statusVariant = (status) => {
    if (status === "shortlisted") return "success";
    if (status === "reviewed") return "default";
    if (status === "rejected") return "danger";
    return "warning";
  };

  return (
    <DashboardLayout
      title="My Applications"
      subtitle="Track the status of your submitted applications."
    >

      <Card
      >
        {applications.length === 0 ? (
          <p style={{ color: "#64748b", marginBottom: 0 }}>No applications yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "12px" }}>
            {applications.map((application) => (
              <div
                key={application.id}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "16px",
                  padding: "16px",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "12px",
                  alignItems: "center",
                }}
              >
                <div>
                  <strong style={{ display: "block", marginBottom: "6px" }}>
                    {application.job_title || "Unknown job"}
                  </strong>
                  <span style={{ color: "#64748b", fontSize: "14px", display: "block" }}>
                    Candidate: {application.candidate_name || "Unknown candidate"}
                  </span>
                  <span style={{ color: "#94a3b8", fontSize: "13px" }}>
                    {application.cover_letter || "No cover letter"}
                  </span>
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <Badge variant={statusVariant(application.status)}>
                    {application.status || "pending"}
                  </Badge>

                  <Button
                    variant="danger"
                    onClick={() => setWithdrawTarget(application)}
                  >
                    Withdraw
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      <ConfirmModal
  open={!!withdrawTarget}
  title="Withdraw application?"
  message={`Are you sure you want to withdraw your application for "${withdrawTarget?.job_title || "this job"}"?`}
  confirmText="Withdraw"
  onConfirm={withdrawApplication}
  onCancel={() => setWithdrawTarget(null)}
/>
    </DashboardLayout>
  );
}

export default CandidateApplications;