import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";

function EmployerApplicants() {
  const [applicants, setApplicants] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
  });

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };

  const fetchApplicants = useCallback(async () => {
    try {
      const res = await api.get("/api/employer/applicants", authHeaders);
      setApplicants(res.data);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to load applicants");
    }
  }, []);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/api/applications/${id}/status`, { status }, authHeaders);
      toast.success("Application status updated");
      fetchApplicants();
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

  const filteredApplicants = useMemo(() => {
    const q = filters.search.toLowerCase();

    return applicants.filter((item) => {
      const matchesSearch =
        !q ||
        item.candidate_name?.toLowerCase().includes(q) ||
        item.candidate_email?.toLowerCase().includes(q) ||
        item.job_title?.toLowerCase().includes(q) ||
        item.skills?.toLowerCase().includes(q);

      const matchesStatus =
        !filters.status || (item.status || "pending") === filters.status;

      return matchesSearch && matchesStatus;
    });
  }, [applicants, filters]);

  return (
    <DashboardLayout
      title="Applicants"
      subtitle="Review applications submitted to your jobs."
    >
      <PageHeader
        title="Applicant Pipeline"
        subtitle="This page only includes candidates who applied to your company’s jobs."
        action={<Badge variant="default">{filteredApplicants.length} applicants</Badge>}
      />

      <Card title="Search and Filter" subtitle="Search by candidate, job, or status.">
        <div className="ui-toolbar">
          <Input
            label="Search"
            placeholder="Search applicants"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          <Input
            label="Status"
            as="select"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            options={[
              { value: "", label: "All statuses" },
              { value: "pending", label: "Pending" },
              { value: "reviewed", label: "Reviewed" },
              { value: "shortlisted", label: "Shortlisted" },
              { value: "rejected", label: "Rejected" },
            ]}
          />
        </div>
      </Card>

      <div style={{ height: 20 }} />

      <Card title="Applicants Table" subtitle="Applications tied only to your jobs.">
        <div className="ui-table-wrap">
          <table className="ui-table">
            <thead>
              <tr>
                <th>Candidate</th>
                <th>Email</th>
                <th>Job</th>
                <th>Country</th>
                <th>Skills</th>
                <th>Status</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplicants.length === 0 ? (
                <tr>
                  <td colSpan="7" className="ui-table-empty">
                    No applicants found.
                  </td>
                </tr>
              ) : (
                filteredApplicants.map((item) => (
                  <tr key={item.id}>
                    <td>{item.candidate_name || "Unknown candidate"}</td>
                    <td>{item.candidate_email || "N/A"}</td>
                    <td>{item.job_title || "Unknown job"}</td>
                    <td>{item.country || "N/A"}</td>
                    <td>{item.skills || "N/A"}</td>
                    <td>
                      <Badge variant={statusVariant(item.status)}>
                        {item.status || "pending"}
                      </Badge>
                    </td>
                    <td>
                      <Input
                        as="select"
                        value={item.status || "pending"}
                        onChange={(e) => updateStatus(item.id, e.target.value)}
                        options={[
                          { value: "pending", label: "Pending" },
                          { value: "reviewed", label: "Reviewed" },
                          { value: "shortlisted", label: "Shortlisted" },
                          { value: "rejected", label: "Rejected" },
                        ]}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}

export default EmployerApplicants;