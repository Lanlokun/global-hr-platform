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
import { useLanguage } from "../../context/LanguageContext";

function EmployerJobs() {
  const { t } = useLanguage();

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

  const authHeaders = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }),
    []
  );

  const fetchJobs = useCallback(async () => {
    try {
      const res = await api.get("/api/jobs/my", authHeaders);
      setJobs(res.data);
    } catch (error) {
      toast.error(error.response?.data?.error || t("loadJobsError"));
    }
  }, [authHeaders, t]);

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
      toast.error(t("jobTitleRequired"));
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
        await api.put(
          `/api/employer/jobs/${editingJob.id}`,
          payload,
          authHeaders
        );
        toast.success(t("jobUpdated"));
      } else {
        await api.post("/api/employer/jobs", payload, authHeaders);
        toast.success(t("jobCreated"));
      }

      closeModal();
      fetchJobs();
    } catch (error) {
      toast.error(error.response?.data?.error || t("saveJobError"));
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await api.delete(`/api/employer/jobs/${deleteTarget.id}`, authHeaders);
      setDeleteTarget(null);
      toast.success(t("jobDeleted"));
      fetchJobs();
    } catch (error) {
      toast.error(error.response?.data?.error || t("deleteJobError"));
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
    <DashboardLayout title={t("jobs")} subtitle={t("jobsSubtitle")}>
      <PageHeader
        subtitle={t("jobsHeaderSubtitle")}
        action={
          <div style={styles.headerActions}>
            <Badge variant="default">
              {filteredJobs.length} {t("jobsCountLabel")}
            </Badge>
            <Button onClick={openCreateModal}>
              <Plus size={16} />
              {t("createJob")}
            </Button>
          </div>
        }
      />

      <div style={styles.filterBar}>
        <Search size={18} color="#64748b" />
        <input
          style={styles.searchInput}
          placeholder={t("searchJobsPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div style={styles.jobsGrid}>
        {filteredJobs.length === 0 ? (
          <div style={styles.emptyState}>
            <Briefcase size={44} />
            <h3>{t("noJobsFound")}</h3>
            <p>{t("noJobsFoundDesc")}</p>
            <Button onClick={openCreateModal}>{t("createJob")}</Button>
          </div>
        ) : (
          paginatedJobs.map((job) => (
            <div key={job.id} style={styles.jobCard}>
              <div style={styles.jobHeader}>
                <div style={{ flex: 1 }}>
                  <div style={styles.badgeRow}>
                    <Badge variant={statusVariant(job.status)}>
                      {t(job.status || "active")}
                    </Badge>

                    <Badge variant={job.remote ? "success" : "default"}>
                      {job.work_mode
                        ? t(workModeKey(job.work_mode))
                        : job.remote
                        ? t("remote")
                        : t("onSite")}
                    </Badge>
                  </div>

                  <h3 style={styles.jobTitle}>{job.title}</h3>

                  <p style={styles.jobDescription}>
                    {job.description || t("noDescriptionAdded")}
                  </p>
                </div>
              </div>

              <div style={styles.metaGrid}>
                <Meta
                  icon={<Building2 size={16} />}
                  label={job.department || t("noDepartment")}
                />
                <Meta
                  icon={<MapPin size={16} />}
                  label={job.location || t("locationNotSet")}
                />
                <Meta
                  icon={<Banknote size={16} />}
                  label={job.salary_range || t("salaryOpen")}
                />
                <Meta
                  icon={<Briefcase size={16} />}
                  label={
                    job.employment_type
                      ? t(employmentTypeKey(job.employment_type))
                      : t("typeNotSet")
                  }
                />
                <Meta
                  icon={<Clock size={16} />}
                  label={
                    job.experience_level
                      ? t(experienceLevelKey(job.experience_level))
                      : t("levelNotSet")
                  }
                />
                <Meta
                  icon={<Users size={16} />}
                  label={`${job.application_count || 0} ${t("applicants")}`}
                />
              </div>

              <div style={styles.deadlineBox}>
                <CalendarDays size={16} />
                <span>
                  {job.expires_at
                    ? `${t("deadline")}: ${new Date(
                        job.expires_at
                      ).toLocaleDateString()}`
                    : t("noApplicationDeadline")}
                </span>
              </div>

              <SkillTags skills={job.required_skills} t={t} />

              {job.benefits && (
                <PreviewBlock title={t("benefits")} text={job.benefits} />
              )}

              {job.application_instructions && (
                <PreviewBlock
                  title={t("applicationInstructions")}
                  text={job.application_instructions}
                />
              )}

              <div style={styles.jobActions}>
                <Button variant="secondary" onClick={() => openEditModal(job)}>
                  <Pencil size={15} />
                  {t("edit")}
                </Button>

                <Button variant="danger" onClick={() => setDeleteTarget(job)}>
                  <Trash2 size={15} />
                  {t("delete")}
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
            {t("previous")}
          </Button>

          <span style={styles.pageInfo}>
            {t("page")} {currentPage} {t("of")} {totalPages}
          </span>

          <Button
            variant="secondary"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((page) => page + 1)}
          >
            {t("next")}
          </Button>
        </div>
      )}

      {modalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>
                  {editingJob ? t("editJob") : t("createJob")}
                </h2>
                <p style={styles.modalSubtitle}>
                  {editingJob
                    ? t("editJobSubtitle")
                    : t("createJobSubtitle")}
                </p>
              </div>

              <button style={styles.closeButton} onClick={closeModal}>
                <X size={20} />
              </button>
            </div>

            <Input
              label={t("jobTitle")}
              placeholder={t("jobTitlePlaceholder")}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <div style={{ height: 14 }} />

            <Input
              label={t("description")}
              placeholder={t("jobDescriptionPlaceholder")}
              as="textarea"
              rows={5}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <div style={{ height: 14 }} />

            <div style={styles.formGrid}>
              <Input
                label={t("department")}
                placeholder={t("departmentPlaceholder")}
                value={form.department}
                onChange={(e) =>
                  setForm({ ...form, department: e.target.value })
                }
              />

              <Input
                label={t("location")}
                placeholder={t("jobLocationPlaceholder")}
                value={form.location}
                onChange={(e) =>
                  setForm({ ...form, location: e.target.value })
                }
              />

              <Input
                label={t("employmentType")}
                as="select"
                value={form.employment_type}
                onChange={(e) =>
                  setForm({ ...form, employment_type: e.target.value })
                }
                options={[
                  { value: "Full-time", label: t("fullTime") },
                  { value: "Part-time", label: t("partTime") },
                  { value: "Contract", label: t("contract") },
                  { value: "Internship", label: t("internship") },
                  { value: "Freelance", label: t("freelance") },
                ]}
              />

              <Input
                label={t("experienceLevel")}
                as="select"
                value={form.experience_level}
                onChange={(e) =>
                  setForm({ ...form, experience_level: e.target.value })
                }
                options={[
                  { value: "Entry-level", label: t("entryLevel") },
                  { value: "Junior", label: t("junior") },
                  { value: "Mid-level", label: t("midLevel") },
                  { value: "Senior", label: t("senior") },
                  { value: "Lead", label: t("lead") },
                ]}
              />

              <Input
                label={t("workMode")}
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
                  { value: "Remote", label: t("remote") },
                  { value: "Hybrid", label: t("hybrid") },
                  { value: "On-site", label: t("onSite") },
                ]}
              />

              <Input
                label={t("jobStatus")}
                as="select"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                options={[
                  { value: "active", label: t("active") },
                  { value: "paused", label: t("paused") },
                  { value: "closed", label: t("closed") },
                  { value: "draft", label: t("draft") },
                ]}
              />

              <Input
                label={t("currency")}
                as="select"
                value={form.currency}
                onChange={(e) =>
                  setForm({ ...form, currency: e.target.value })
                }
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
                label={t("salaryMin")}
                type="number"
                placeholder="1500"
                value={form.salary_min}
                onChange={(e) =>
                  setForm({ ...form, salary_min: e.target.value })
                }
              />

              <Input
                label={t("salaryMax")}
                type="number"
                placeholder="2500"
                value={form.salary_max}
                onChange={(e) =>
                  setForm({ ...form, salary_max: e.target.value })
                }
              />

              <Input
                label={t("salaryDisplay")}
                placeholder={t("salaryDisplayPlaceholder")}
                value={form.salary_range}
                onChange={(e) =>
                  setForm({ ...form, salary_range: e.target.value })
                }
              />

              <Input
                label={t("applicationDeadline")}
                type="date"
                value={form.expires_at}
                onChange={(e) =>
                  setForm({ ...form, expires_at: e.target.value })
                }
              />
            </div>

            <div style={{ height: 14 }} />

            <Input
              label={t("requiredSkills")}
              placeholder={t("requiredSkillsPlaceholder")}
              as="textarea"
              rows={3}
              value={form.required_skills}
              onChange={(e) =>
                setForm({ ...form, required_skills: e.target.value })
              }
            />

            <div style={{ height: 14 }} />

            <Input
              label={t("benefits")}
              placeholder={t("benefitsPlaceholder")}
              as="textarea"
              rows={3}
              value={form.benefits}
              onChange={(e) => setForm({ ...form, benefits: e.target.value })}
            />

            <div style={{ height: 14 }} />

            <Input
              label={t("applicationInstructions")}
              placeholder={t("applicationInstructionsPlaceholder")}
              as="textarea"
              rows={3}
              value={form.application_instructions}
              onChange={(e) =>
                setForm({
                  ...form,
                  application_instructions: e.target.value,
                })
              }
            />

            <div style={styles.remoteBox}>
              <input
                type="checkbox"
                checked={form.remote}
                onChange={(e) =>
                  setForm({ ...form, remote: e.target.checked })
                }
              />
              <div>
                <strong>{t("remoteFriendlyRole")}</strong>
                <p>{t("remoteFriendlyRoleDesc")}</p>
              </div>
            </div>

            <div style={styles.modalActions}>
              <Button variant="secondary" onClick={closeModal}>
                {t("cancel")}
              </Button>
              <Button onClick={saveJob}>
                {editingJob ? t("saveChanges") : t("publishJob")}
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteTarget}
        title={t("deleteJobTitle")}
        message={`${t("deleteJobMessage")} "${
          deleteTarget?.title || ""
        }"?`}
        confirmText={t("deleteJob")}
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

function employmentTypeKey(value) {
  const map = {
    "Full-time": "fullTime",
    "Part-time": "partTime",
    Contract: "contract",
    Internship: "internship",
    Freelance: "freelance",
  };

  return map[value] || value;
}

function experienceLevelKey(value) {
  const map = {
    "Entry-level": "entryLevel",
    Junior: "junior",
    "Mid-level": "midLevel",
    Senior: "senior",
    Lead: "lead",
  };

  return map[value] || value;
}

function workModeKey(value) {
  const map = {
    Remote: "remote",
    Hybrid: "hybrid",
    "On-site": "onSite",
  };

  return map[value] || value;
}

function Meta({ icon, label }) {
  return (
    <div style={styles.metaItem}>
      {icon}
      <span>{label}</span>
    </div>
  );
}

function SkillTags({ skills, t }) {
  const list = skills
    ? skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean)
    : [];

  if (list.length === 0) {
    return <p style={styles.noSkills}>{t("noRequiredSkillsAdded")}</p>;
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