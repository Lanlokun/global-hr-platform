import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import ConfirmModal from "../../components/ui/ConfirmModal";

function EmployerJobs() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    salary_range: "",
    remote: true,
  });

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    location: "",
    salary_range: "",
    remote: true,
  });

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };

  const fetchJobs = useCallback(async () => {
    try {
      const res = await api.get("/api/employer/jobs", authHeaders);
      setJobs(res.data);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to load jobs");
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const createJob = async () => {
    try {
      await api.post("/api/employer/jobs", form, authHeaders);
      setForm({
        title: "",
        description: "",
        location: "",
        salary_range: "",
        remote: true,
      });
      toast.success("Job created");
      fetchJobs();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create job");
    }
  };

  const startEdit = (job) => {
    setEditingId(job.id);
    setEditForm({
      title: job.title || "",
      description: job.description || "",
      location: job.location || "",
      salary_range: job.salary_range || "",
      remote: job.remote ?? true,
    });
  };

  const saveEdit = async (id) => {
    try {
      await api.put(`/api/employer/jobs/${id}`, editForm, authHeaders);
      setEditingId(null);
      toast.success("Job updated");
      fetchJobs();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update job");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await api.delete(`/api/employer/jobs/${deleteTarget.id}`, authHeaders);
      setDeleteTarget(null);
      toast.success("Job deleted");
      fetchJobs();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete job");
    }
  };

  const filteredJobs = useMemo(() => {
    const q = search.toLowerCase();
    return jobs.filter((job) => {
      return (
        !q ||
        job.title?.toLowerCase().includes(q) ||
        job.location?.toLowerCase().includes(q)
      );
    });
  }, [jobs, search]);

  return (
    <DashboardLayout
      title="Jobs"
      subtitle="Manage jobs for your company only."
    >
      <PageHeader
        title="Job Management"
        subtitle="All roles here belong to your company."
        action={<Badge variant="default">{filteredJobs.length} jobs</Badge>}
      />

      <Card title="Create Job" subtitle="Publish a role under your company.">
        <Input
          label="Job title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <div style={{ height: 14 }} />
        <Input
          label="Description"
          as="textarea"
          rows={5}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <div style={{ height: 14 }} />
        <Input
          label="Location"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
        />
        <div style={{ height: 14 }} />
        <Input
          label="Salary range"
          value={form.salary_range}
          onChange={(e) => setForm({ ...form, salary_range: e.target.value })}
        />
        <div style={{ height: 14 }} />
        <label className="auth-checkbox">
          <input
            type="checkbox"
            checked={form.remote}
            onChange={(e) => setForm({ ...form, remote: e.target.checked })}
          />
          Remote role
        </label>
        <div style={{ height: 16 }} />
        <Button onClick={createJob}>Publish Job</Button>
      </Card>

      <div style={{ height: 20 }} />

      <Card title="My Jobs" subtitle="Only jobs for your company are shown here.">
        <Input
          label="Search jobs"
          placeholder="Search by title or location"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div style={{ height: 18 }} />

        <div className="ui-table-wrap">
          <table className="ui-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Location</th>
                <th>Salary</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="ui-table-empty">
                    No jobs found.
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr key={job.id}>
                    <td>
                      {editingId === job.id ? (
                        <Input
                          value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        />
                      ) : (
                        job.title
                      )}
                    </td>
                    <td>
                      {editingId === job.id ? (
                        <Input
                          value={editForm.location}
                          onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        />
                      ) : (
                        job.location || "Not set"
                      )}
                    </td>
                    <td>
                      {editingId === job.id ? (
                        <Input
                          value={editForm.salary_range}
                          onChange={(e) => setEditForm({ ...editForm, salary_range: e.target.value })}
                        />
                      ) : (
                        job.salary_range || "Open"
                      )}
                    </td>
                    <td>
                      {editingId === job.id ? (
                        <label className="auth-checkbox">
                          <input
                            type="checkbox"
                            checked={editForm.remote}
                            onChange={(e) => setEditForm({ ...editForm, remote: e.target.checked })}
                          />
                          Remote
                        </label>
                      ) : (
                        <Badge variant={job.remote ? "success" : "default"}>
                          {job.remote ? "Remote" : "On-site"}
                        </Badge>
                      )}
                    </td>
                    <td>
                      <div className="ui-table-actions">
                        {editingId === job.id ? (
                          <>
                            <Button onClick={() => saveEdit(job.id)}>Save</Button>
                            <Button variant="secondary" onClick={() => setEditingId(null)}>
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button variant="secondary" onClick={() => startEdit(job)}>
                              Edit
                            </Button>
                            <Button variant="danger" onClick={() => setDeleteTarget(job)}>
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete job?"
        message={`Are you sure you want to delete "${deleteTarget?.title || ""}"?`}
        confirmText="Delete job"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </DashboardLayout>
  );
}

export default EmployerJobs;