import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import ConfirmModal from "../../components/ui/ConfirmModal";

function EmployerJobs() {
  const token = localStorage.getItem("token");

  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const [editForm, setEditForm] = useState({
    company_id: "",
    title: "",
    description: "",
    location: "",
    salary_range: "",
    remote: true,
  });

  const [form, setForm] = useState({
    company_id: "",
    title: "",
    description: "",
    location: "",
    salary_range: "",
    remote: true,
  });

  const resetCreateForm = () => {
    setForm({
      company_id: "",
      title: "",
      description: "",
      location: "",
      salary_range: "",
      remote: true,
    });
  };

  const fetchCompanies = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/companies");
      setCompanies(res.data);
    } catch {
      toast.error("Failed to load companies");
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/jobs");
      setJobs(res.data);
    } catch {
      toast.error("Failed to load jobs");
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchJobs();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const createJob = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/jobs",
        { ...form, company_id: Number(form.company_id) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Job created");
      resetCreateForm();
      setShowCreateModal(false);
      fetchJobs();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create job");
    }
  };

  const startEdit = (job) => {
    setEditingId(job.id);
    setEditForm({
      company_id: job.company_id || "",
      title: job.title || "",
      description: job.description || "",
      location: job.location || "",
      salary_range: job.salary_range || "",
      remote: job.remote ?? true,
    });
  };

  const saveEdit = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/jobs/${id}`,
        {
          ...editForm,
          company_id: Number(editForm.company_id),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Job updated");
      setEditingId(null);
      fetchJobs();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update job");
    }
  };

  const confirmDeleteJob = async () => {
    if (!deleteTarget) return;

    try {
      await axios.delete(`http://localhost:5000/api/jobs/${deleteTarget.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Job deleted");
      setDeleteTarget(null);
      fetchJobs();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete job");
    }
  };

  const filteredJobs = useMemo(() => {
    const q = search.trim().toLowerCase();

    return jobs.filter((job) => {
      if (!q) return true;

      return (
        job.title?.toLowerCase().includes(q) ||
        job.company_name?.toLowerCase().includes(q) ||
        job.location?.toLowerCase().includes(q) ||
        job.salary_range?.toLowerCase().includes(q) ||
        (job.remote ? "remote" : "on-site").includes(q)
      );
    });
  }, [jobs, search]);

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
      title="Jobs"
      subtitle="Manage your open roles in a clean standard table."
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
              label="Search jobs"
              placeholder="Search by title, company, location, salary, or job type"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Button onClick={() => setShowCreateModal(true)}>+ Create Job</Button>
        </div>

        <div className="ui-table-wrap">
          <table className="ui-table">
            <thead>
              <tr>
                <th style={{ width: "70px" }}>#</th>
                <th>Title</th>
                <th>Company</th>
                <th>Location</th>
                <th>Salary</th>
                <th>Type</th>
                <th style={{ width: "180px" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedJobs.length === 0 ? (
                <tr>
                  <td colSpan="7" className="ui-table-empty">
                    No jobs found.
                  </td>
                </tr>
              ) : (
                paginatedJobs.map((job, index) => {
                  const rowNumber = (currentPage - 1) * pageSize + index + 1;

                  return (
                    <tr key={job.id}>
                      <td>{rowNumber}</td>

                      <td>
                        {editingId === job.id ? (
                          <Input
                            value={editForm.title}
                            onChange={(e) =>
                              setEditForm({ ...editForm, title: e.target.value })
                            }
                          />
                        ) : (
                          job.title
                        )}
                      </td>

                      <td>
                        {editingId === job.id ? (
                          <Input
                            as="select"
                            value={editForm.company_id}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                company_id: e.target.value,
                              })
                            }
                            options={[
                              { value: "", label: "Select company" },
                              ...companies.map((company) => ({
                                value: company.id,
                                label: company.name,
                              })),
                            ]}
                          />
                        ) : (
                          job.company_name
                        )}
                      </td>

                      <td>
                        {editingId === job.id ? (
                          <Input
                            value={editForm.location}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                location: e.target.value,
                              })
                            }
                          />
                        ) : (
                          job.location || "Not set"
                        )}
                      </td>

                      <td>
                        {editingId === job.id ? (
                          <Input
                            value={editForm.salary_range}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                salary_range: e.target.value,
                              })
                            }
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
                              onChange={(e) =>
                                setEditForm({
                                  ...editForm,
                                  remote: e.target.checked,
                                })
                              }
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
                              <Button onClick={() => saveEdit(job.id)}>
                                Save
                              </Button>
                              <Button
                                variant="secondary"
                                onClick={() => setEditingId(null)}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="secondary"
                                onClick={() => startEdit(job)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="danger"
                                onClick={() => setDeleteTarget(job)}
                              >
                                Delete
                              </Button>
                            </>
                          )}
                        </div>
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
            Showing {filteredJobs.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            {" - "}
            {Math.min(currentPage * pageSize, filteredJobs.length)} of {filteredJobs.length} jobs
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <Button
              variant="secondary"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            <span style={{ fontSize: "14px", minWidth: "90px", textAlign: "center" }}>
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

      {showCreateModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 1000,
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "720px",
              background: "#fff",
              borderRadius: "16px",
              padding: "24px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
                gap: "12px",
                marginBottom: "18px",
              }}
            >
              <div>
                <h3 style={{ margin: 0 }}>Create Job</h3>
                <p style={{ margin: "6px 0 0", opacity: 0.7 }}>
                  Publish a new role for candidates.
                </p>
              </div>

              <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                Close
              </Button>
            </div>

            <div
              className="ui-inline-stack"
              style={{ display: "grid", gap: "14px" }}
            >
              <Input
                label="Company"
                as="select"
                value={form.company_id}
                onChange={(e) =>
                  setForm({ ...form, company_id: e.target.value })
                }
                options={[
                  { value: "", label: "Select company" },
                  ...companies.map((company) => ({
                    value: company.id,
                    label: company.name,
                  })),
                ]}
              />

              <Input
                label="Job title"
                placeholder="Backend Developer"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />

              <Input
                label="Description"
                as="textarea"
                rows={5}
                placeholder="Describe the role"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />

              <Input
                label="Location"
                placeholder="Remote"
                value={form.location}
                onChange={(e) =>
                  setForm({ ...form, location: e.target.value })
                }
              />

              <Input
                label="Salary range"
                placeholder="$3000 - $5000"
                value={form.salary_range}
                onChange={(e) =>
                  setForm({ ...form, salary_range: e.target.value })
                }
              />

              <label className="auth-checkbox">
                <input
                  type="checkbox"
                  checked={form.remote}
                  onChange={(e) =>
                    setForm({ ...form, remote: e.target.checked })
                  }
                />
                Remote role
              </label>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "10px",
                  marginTop: "8px",
                }}
              >
                <Button
                  variant="secondary"
                  onClick={() => {
                    resetCreateForm();
                    setShowCreateModal(false);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={createJob}>Publish Job</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete job?"
        message={`Are you sure you want to delete "${deleteTarget?.title || ""}"? This may also remove related applications.`}
        confirmText="Delete job"
        onConfirm={confirmDeleteJob}
        onCancel={() => setDeleteTarget(null)}
      />
    </DashboardLayout>
  );
}

export default EmployerJobs;