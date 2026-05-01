import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import {
  Briefcase,
  MapPin,
  Banknote,
  Clock,
  Pencil,
  Trash2,
  Plus,
  X,
  Search,
  Users,
  Building2,
  CalendarDays,
} from "lucide-react";

import api from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/ui/PageHeader";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import ConfirmModal from "../../components/ui/ConfirmModal";

function EmployerJobs() {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 16;

  const emptyForm = {
    title: "",
    description: "",
    location: "",
    employment_type: "Full-time",
    experience_level: "Mid-level",
    required_skills: "",
    salary_range: "",
    salary_min: "",
    salary_max: "",
    currency: "USD",
    remote: true,
    expires_at: "",
    status: "active",
    work_mode: "Remote",
    department: "",
    benefits: "",
    application_instructions: "",
  };

  const [form, setForm] = useState(emptyForm);

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };

  const fetchJobs = useCallback(async () => {
    try {
      const res = await api.get("/api/jobs/my", authHeaders);
      setJobs(res.data);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to load jobs");
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const openCreateModal = () => {
    setEditingJob(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEditModal = (job) => {
    setEditingJob(job);

    setForm({
      title: job.title || "",
      description: job.description || "",
      location: job.location || "",
      employment_type: job.employment_type || "Full-time",
      experience_level: job.experience_level || "Mid-level",
      required_skills: job.required_skills || "",
      salary_range: job.salary_range || "",
      salary_min: job.salary_min || "",
      salary_max: job.salary_max || "",
      currency: job.currency || "USD",
      remote: job.remote ?? true,
      expires_at: job.expires_at ? job.expires_at.slice(0, 10) : "",
      status: job.status || "active",
      work_mode: job.work_mode || "Remote",
      department: job.department || "",
      benefits: job.benefits || "",
      application_instructions: job.application_instructions || "",
    });

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingJob(null);
    setForm(emptyForm);
  };

  const saveJob = async () => {
    if (!form.title.trim()) {
      toast.error("Job title is required");
      return;
    }

    try {
      const payload = {
        ...form,
        salary_min: form.salary_min ? Number(form.salary_min) : null,
        salary_max: form.salary_max ? Number(form.salary_max) : null,
        expires_at: form.expires_at || null,
      };

      if (editingJob) {
        await api.put(`/api/employer/jobs/${editingJob.id}`, payload, authHeaders);
        toast.success("Job updated");
      } else {
        await api.post("/api/employer/jobs", payload, authHeaders);
        toast.success("Job created");
      }

      closeModal();
      fetchJobs();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to save job");
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
        job.location?.toLowerCase().includes(q) ||
        job.salary_range?.toLowerCase().includes(q) ||
        job.required_skills?.toLowerCase().includes(q) ||
        job.employment_type?.toLowerCase().includes(q) ||
        job.department?.toLowerCase().includes(q) ||
        job.status?.toLowerCase().includes(q) ||
        job.work_mode?.toLowerCase().includes(q)
      );
    });
  }, [jobs, search]);

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);

    const paginatedJobs = useMemo(() => {
      const start = (currentPage - 1) * jobsPerPage;
      return filteredJobs.slice(start, start + jobsPerPage);
    }, [filteredJobs, currentPage]);

    useEffect(() => {
      setCurrentPage(1);
    }, [search]);

  return (
    <DashboardLayout
      title="Jobs"
      subtitle="Create and manage company job openings."
    >
      <PageHeader
        subtitle="Publish roles, update openings, and track applicant activity."
        action={
          <div style={styles.headerActions}>
            <Badge variant="default">{filteredJobs.length} jobs</Badge>
            <Button onClick={openCreateModal}>
              <Plus size={16} />
              Create Job
            </Button>
          </div>
        }
      />

      <div style={styles.filterBar}>
        <Search size={18} color="#64748b" />
        <input
          style={styles.searchInput}
          placeholder="Search by title, location, skill, department, status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div style={styles.jobsGrid}>
        {filteredJobs.length === 0 ? (
          <div style={styles.emptyState}>
            <Briefcase size={44} />
            <h3>No jobs found</h3>
            <p>Create your first job or adjust your search.</p>
            <Button onClick={openCreateModal}>Create Job</Button>
          </div>
        ) : (
          paginatedJobs.map((job) => (
            <div key={job.id} style={styles.jobCard}>
              <div style={styles.jobHeader}>
                <div style={{ flex: 1 }}>
                  <div style={styles.badgeRow}>
                    <Badge variant={statusVariant(job.status)}>
                      {job.status || "active"}
                    </Badge>

                    <Badge variant={job.remote ? "success" : "default"}>
                      {job.work_mode || (job.remote ? "Remote" : "On-site")}
                    </Badge>
                  </div>

                  <h3 style={styles.jobTitle}>{job.title}</h3>

                  <p style={styles.jobDescription}>
                    {job.description || "No description added yet."}
                  </p>
                </div>
              </div>

              <div style={styles.metaGrid}>
                <Meta
                  icon={<Building2 size={16} />}
                  label={job.department || "No department"}
                />
                <Meta
                  icon={<MapPin size={16} />}
                  label={job.location || "Location not set"}
                />
                <Meta
                  icon={<Banknote size={16} />}
                  label={job.salary_range || "Salary open"}
                />
                <Meta
                  icon={<Briefcase size={16} />}
                  label={job.employment_type || "Type not set"}
                />
                <Meta
                  icon={<Clock size={16} />}
                  label={job.experience_level || "Level not set"}
                />
                <Meta
                  icon={<Users size={16} />}
                  label={`${job.application_count || 0} applicants`}
                />
              </div>

              <div style={styles.deadlineBox}>
                <CalendarDays size={16} />
                <span>
                  {job.expires_at
                    ? `Deadline: ${new Date(job.expires_at).toLocaleDateString()}`
                    : "No application deadline set"}
                </span>
              </div>

              <SkillTags skills={job.required_skills} />

              {job.benefits && (
                <PreviewBlock title="Benefits" text={job.benefits} />
              )}

              {job.application_instructions && (
                <PreviewBlock
                  title="Application Instructions"
                  text={job.application_instructions}
                />
              )}

              <div style={styles.jobActions}>
                <Button variant="secondary" onClick={() => openEditModal(job)}>
                  <Pencil size={15} />
                  Edit
                </Button>

                <Button variant="danger" onClick={() => setDeleteTarget(job)}>
                  <Trash2 size={15} />
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

        {filteredJobs.length > jobsPerPage && (
  <div style={styles.pagination}>
    <Button
      variant="secondary"
      disabled={currentPage === 1}
      onClick={() => setCurrentPage((page) => page - 1)}
    >
      Previous
    </Button>

    <span style={styles.pageInfo}>
      Page {currentPage} of {totalPages}
    </span>

    <Button
      variant="secondary"
      disabled={currentPage === totalPages}
      onClick={() => setCurrentPage((page) => page + 1)}
    >
      Next
    </Button>
  </div>
)}
      {modalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>
                  {editingJob ? "Edit Job" : "Create Job"}
                </h2>
                <p style={styles.modalSubtitle}>
                  {editingJob
                    ? "Update role details and hiring requirements."
                    : "Publish a structured role under your company."}
                </p>
              </div>

              <button style={styles.closeButton} onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <Input
              label="Job title"
              placeholder="e.g. Senior Frontend Developer"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <div style={{ height: 14 }} />

            <Input
              label="Description"
              placeholder="Describe the role, responsibilities, requirements, and expected impact."
              as="textarea"
              rows={5}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            <div style={{ height: 14 }} />

            <div style={styles.formGrid}>
              <Input
                label="Department"
                placeholder="Engineering, Product, HR..."
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
              />

              <Input
                label="Location"
                placeholder="e.g. Lagos, Nigeria"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />

              <Input
                label="Employment type"
                as="select"
                value={form.employment_type}
                onChange={(e) =>
                  setForm({ ...form, employment_type: e.target.value })
                }
                options={[
                  { value: "Full-time", label: "Full-time" },
                  { value: "Part-time", label: "Part-time" },
                  { value: "Contract", label: "Contract" },
                  { value: "Internship", label: "Internship" },
                  { value: "Freelance", label: "Freelance" },
                ]}
              />

              <Input
                label="Experience level"
                as="select"
                value={form.experience_level}
                onChange={(e) =>
                  setForm({ ...form, experience_level: e.target.value })
                }
                options={[
                  { value: "Entry-level", label: "Entry-level" },
                  { value: "Junior", label: "Junior" },
                  { value: "Mid-level", label: "Mid-level" },
                  { value: "Senior", label: "Senior" },
                  { value: "Lead", label: "Lead" },
                ]}
              />

              <Input
                label="Work mode"
                as="select"
                value={form.work_mode}
                onChange={(e) => {
                  const workMode = e.target.value;
                  setForm({
                    ...form,
                    work_mode: workMode,
                    remote: workMode === "Remote",
                  });
                }}
                options={[
                  { value: "Remote", label: "Remote" },
                  { value: "Hybrid", label: "Hybrid" },
                  { value: "On-site", label: "On-site" },
                ]}
              />

              <Input
                label="Job status"
                as="select"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                options={[
                  { value: "active", label: "Active" },
                  { value: "paused", label: "Paused" },
                  { value: "closed", label: "Closed" },
                  { value: "draft", label: "Draft" },
                ]}
              />

              <Input
                label="Currency"
                as="select"
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                options={[
                  { value: "USD", label: "USD" },
                  { value: "EUR", label: "EUR" },
                  { value: "GBP", label: "GBP" },
                  { value: "NGN", label: "NGN" },
                  { value: "GMD", label: "GMD" },
                  { value: "CNY", label: "CNY" },
                ]}
              />

              <Input
                label="Salary min"
                type="number"
                placeholder="1500"
                value={form.salary_min}
                onChange={(e) => setForm({ ...form, salary_min: e.target.value })}
              />

              <Input
                label="Salary max"
                type="number"
                placeholder="2500"
                value={form.salary_max}
                onChange={(e) => setForm({ ...form, salary_max: e.target.value })}
              />

              <Input
                label="Salary display"
                placeholder="e.g. $1,500 - $2,500 monthly"
                value={form.salary_range}
                onChange={(e) =>
                  setForm({ ...form, salary_range: e.target.value })
                }
              />

              <Input
                label="Application deadline"
                type="date"
                value={form.expires_at}
                onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
              />
            </div>

            <div style={{ height: 14 }} />

            <Input
              label="Required skills"
              placeholder="React, TypeScript, REST APIs, CSS"
              as="textarea"
              rows={3}
              value={form.required_skills}
              onChange={(e) =>
                setForm({ ...form, required_skills: e.target.value })
              }
            />

            <div style={{ height: 14 }} />

            <Input
              label="Benefits"
              placeholder="Health insurance, paid leave, remote allowance..."
              as="textarea"
              rows={3}
              value={form.benefits}
              onChange={(e) => setForm({ ...form, benefits: e.target.value })}
            />

            <div style={{ height: 14 }} />

            <Input
              label="Application instructions"
              placeholder="Attach CV, portfolio, GitHub, or relevant project links."
              as="textarea"
              rows={3}
              value={form.application_instructions}
              onChange={(e) =>
                setForm({ ...form, application_instructions: e.target.value })
              }
            />

            <div style={styles.remoteBox}>
              <input
                type="checkbox"
                checked={form.remote}
                onChange={(e) => setForm({ ...form, remote: e.target.checked })}
              />
              <div>
                <strong>Remote-friendly role</strong>
                <p>Candidates can apply from outside the listed location.</p>
              </div>
            </div>

            <div style={styles.modalActions}>
              <Button variant="secondary" onClick={closeModal}>
                Cancel
              </Button>
              <Button onClick={saveJob}>
                {editingJob ? "Save Changes" : "Publish Job"}
              </Button>
            </div>
          </div>
        </div>
      )}

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

function statusVariant(status) {
  if (status === "active") return "success";
  if (status === "paused") return "warning";
  if (status === "closed") return "danger";
  return "default";
}

function Meta({ icon, label }) {
  return (
    <div style={styles.metaItem}>
      {icon}
      <span>{label}</span>
    </div>
  );
}

function SkillTags({ skills }) {
  const list = skills
    ? skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
    : [];

  if (list.length === 0) {
    return <p style={styles.noSkills}>No required skills added.</p>;
  }

  return (
    <div style={styles.skillTags}>
      {list.slice(0, 8).map((skill, index) => (
        <span key={index} style={styles.skillTag}>
          {skill}
        </span>
      ))}
    </div>
  );
}

function PreviewBlock({ title, text }) {
  return (
    <div style={styles.previewBlock}>
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}

const styles = {
  headerActions: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },

  filterBar: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "14px 16px",
    borderRadius: 18,
    background: "#fff",
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 25px rgba(15, 23, 42, 0.04)",
    marginBottom: 20,
  },

  searchInput: {
    width: "100%",
    border: "none",
    outline: "none",
    fontSize: 14,
    color: "#111827",
    background: "transparent",
  },

jobsGrid: {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
  gap: 18,
},

  jobCard: {
    border: "1px solid #e5e7eb",
    borderRadius: 24,
    padding: 20,
    background: "#fff",
    boxShadow: "0 14px 35px rgba(15, 23, 42, 0.06)",
  },

  jobHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 14,
    alignItems: "flex-start",
  },

  badgeRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 10,
  },

  jobTitle: {
    margin: 0,
    fontSize: 19,
    color: "#111827",
  },

  jobDescription: {
    margin: "8px 0 0",
    color: "#6b7280",
    lineHeight: 1.55,
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },

  metaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 10,
    marginTop: 16,
  },

  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 12px",
    borderRadius: 14,
    background: "#f9fafb",
    color: "#374151",
    fontSize: 13,
    fontWeight: 600,
    minWidth: 0,
  },

  deadlineBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    padding: "10px 12px",
    borderRadius: 14,
    background: "#fff7ed",
    color: "#9a3412",
    fontSize: 13,
    fontWeight: 700,
    wordBreak: "break-word",
    lineHeight: 1.4,
  },

  skillTags: {
    display: "flex",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 14,
  },

  skillTag: {
    padding: "6px 10px",
    borderRadius: 999,
    background: "#eff6ff",
    color: "#1d4ed8",
    fontSize: 12,
    fontWeight: 700,
  },

  noSkills: {
    color: "#6b7280",
    margin: "14px 0 0",
    fontSize: 14,
  },

  previewBlock: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
  },

  jobActions: {
    display: "flex",
    gap: 10,
    justifyContent: "flex-end",
    marginTop: 18,
  },

  emptyState: {
    gridColumn: "1 / -1",
    textAlign: "center",
    padding: "58px 20px",
    border: "1px dashed #d1d5db",
    borderRadius: 24,
    background: "#fff",
    color: "#6b7280",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(17, 24, 39, 0.62)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 20,
  },

  modal: {
    width: "100%",
    maxWidth: 860,
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#fff",
    borderRadius: 26,
    padding: 26,
    boxShadow: "0 30px 80px rgba(0,0,0,0.28)",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 20,
  },

  modalTitle: {
    margin: 0,
    fontSize: 24,
    color: "#111827",
  },

  modalSubtitle: {
    margin: "6px 0 0",
    color: "#6b7280",
  },

  closeButton: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    border: "none",
    background: "#f3f4f6",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 14,
  },

  pagination: {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: 12,
  marginTop: 24,
},

pageInfo: {
  fontSize: 14,
  fontWeight: 700,
  color: "#374151",
},

  remoteBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
  },

  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 22,
  },
};

export default EmployerJobs;