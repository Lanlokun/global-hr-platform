import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import {
  Mail,
  MapPin,
  Briefcase,
  UserCircle2,
  X,
  ExternalLink,
  Phone,
  Globe2,
  GraduationCap,
  Award,
  FileText,
} from "lucide-react";

import api from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { useLanguage } from "../../context/LanguageContext";

function EmployerApplicants() {
  const { t } = useLanguage();

  const [applicants, setApplicants] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const applicantsPerPage = 16;

  const [filters, setFilters] = useState({
    search: "",
    status: "",
  });

  const authHeaders = useMemo(
    () => ({
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }),
    []
  );

  const fetchApplicants = useCallback(async () => {
    try {
      const res = await api.get("/api/employer/applicants", authHeaders);
      setApplicants(res.data);
    } catch (error) {
      toast.error(error.response?.data?.error || t("loadApplicantsError"));
    }
  }, [authHeaders, t]);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/api/applications/${id}/status`, { status }, authHeaders);
      toast.success(t("applicationStatusUpdated"));
      fetchApplicants();

      setSelectedApplicant((prev) =>
        prev && prev.id === id ? { ...prev, status } : prev
      );
    } catch (error) {
      toast.error(error.response?.data?.error || t("updateStatusError"));
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
        item.skills?.toLowerCase().includes(q) ||
        item.country?.toLowerCase().includes(q) ||
        item.professional_title?.toLowerCase().includes(q);

      const matchesStatus =
        !filters.status || (item.status || "pending") === filters.status;

      return matchesSearch && matchesStatus;
    });
  }, [applicants, filters]);

  const totalPages = Math.ceil(filteredApplicants.length / applicantsPerPage);

  const paginatedApplicants = useMemo(() => {
    const start = (currentPage - 1) * applicantsPerPage;
    return filteredApplicants.slice(start, start + applicantsPerPage);
  }, [filteredApplicants, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.search, filters.status]);

  return (
    <DashboardLayout
      title={t("applicants")}
      subtitle={t("applicantsSubtitle")}
    >
      <PageHeader
        action={
          <Badge variant="default">
            {filteredApplicants.length} {t("applicants")}
          </Badge>
        }
      />

      <div style={styles.filterBar}>
        <div style={styles.searchBox}>
          <Input
            label=""
            placeholder={t("searchApplicantsPlaceholder")}
            value={filters.search}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value })
            }
          />
        </div>

        <div style={styles.statusBox}>
          <Input
            label=""
            as="select"
            value={filters.status}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value })
            }
            options={[
              { value: "", label: t("allStatuses") },
              { value: "pending", label: t("pending") },
              { value: "reviewed", label: t("reviewed") },
              { value: "shortlisted", label: t("shortlisted") },
              { value: "rejected", label: t("rejected") },
            ]}
          />
        </div>
      </div>

      <div style={{ height: 20 }} />

      <div style={styles.applicantGrid}>
        {filteredApplicants.length === 0 ? (
          <Card>
            <div style={styles.emptyState}>
              <UserCircle2 size={42} />
              <h3>{t("noApplicantsFound")}</h3>
              <p>{t("noApplicantsFoundDesc")}</p>
            </div>
          </Card>
        ) : (
          paginatedApplicants.map((item) => (
            <button
              key={item.id}
              type="button"
              style={styles.applicantCard}
              onClick={() => setSelectedApplicant(item)}
            >
              <div style={styles.cardTop}>
                <Avatar applicant={item} t={t} />

                <div style={{ flex: 1 }}>
                  <h3 style={styles.name}>
                    {item.candidate_name || t("unknownCandidate")}
                  </h3>
                  <p style={styles.title}>
                    {item.professional_title || t("applicant")}
                  </p>
                </div>

                <Badge variant={statusVariant(item.status)}>
                  {t(item.status || "pending")}
                </Badge>
              </div>

              <div style={styles.metaList}>
                <span style={styles.metaItem}>
                  <Mail size={15} />
                  <span>{item.candidate_email || t("noEmail")}</span>
                </span>

                <span style={styles.metaItem}>
                  <Briefcase size={15} />
                  <span>{item.job_title || t("unknownJob")}</span>
                </span>

                <span style={styles.metaItem}>
                  <MapPin size={15} />
                  <span>{item.country || t("countryNotSet")}</span>
                </span>
              </div>

              <div style={styles.skillTags}>
                {(item.skills || "")
                  .split(",")
                  .map((skill) => skill.trim())
                  .filter(Boolean)
                  .map((skill, i) => (
                    <span key={i} style={styles.skillTag}>
                      {skill}
                    </span>
                  ))}
              </div>

              <div style={styles.cardFooter}>
                <span>{t("viewFullProfile")}</span>
                <ExternalLink size={15} />
              </div>
            </button>
          ))
        )}
      </div>

      {filteredApplicants.length > applicantsPerPage && (
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

      {selectedApplicant && (
        <ApplicantModal
          applicant={selectedApplicant}
          statusVariant={statusVariant}
          updateStatus={updateStatus}
          onClose={() => setSelectedApplicant(null)}
          t={t}
        />
      )}
    </DashboardLayout>
  );
}

function ApplicantModal({ applicant, statusVariant, updateStatus, onClose, t }) {
  const resumeUrl = applicant.resume_url || applicant.application_resume_url;

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <div style={styles.modalIdentity}>
            <Avatar applicant={applicant} large t={t} />

            <div>
              <h2 style={styles.modalName}>
                {applicant.candidate_name || t("unknownCandidate")}
              </h2>
              <p style={styles.modalRole}>
                {applicant.professional_title || t("applicant")}
              </p>
              <p style={styles.modalSubText}>
                {t("appliedFor")} {applicant.job_title || t("unknownJob")}
              </p>
            </div>
          </div>

          <button style={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div style={styles.modalStatusRow}>
          <Badge variant={statusVariant(applicant.status)}>
            {t(applicant.status || "pending")}
          </Badge>

          <Input
            as="select"
            value={applicant.status || "pending"}
            onChange={(e) => updateStatus(applicant.id, e.target.value)}
            options={[
              { value: "pending", label: t("pending") },
              { value: "reviewed", label: t("reviewed") },
              { value: "shortlisted", label: t("shortlisted") },
              { value: "rejected", label: t("rejected") },
            ]}
          />
        </div>

        <Section title={t("contactInformation")} icon={<Phone size={18} />}>
          <InfoGrid
            t={t}
            items={[
              [t("email"), applicant.candidate_email],
              [t("phone"), applicant.phone],
              [t("country"), applicant.country],
              [t("city"), applicant.city],
              [t("address"), applicant.address],
            ]}
          />
        </Section>

        <Section title={t("professionalProfile")} icon={<Briefcase size={18} />}>
          <InfoGrid
            t={t}
            items={[
              [t("title"), applicant.professional_title],
              [t("yearsOfExperience"), applicant.years_of_experience],
              [t("languages"), applicant.languages],
              [t("skills"), applicant.skills],
            ]}
          />

          <div style={{ height: 12 }} />

          <TextBlock
            title={t("professionalSummary")}
            text={applicant.professional_summary}
            empty={t("noProfessionalSummary")}
          />
        </Section>

        <Section title={t("jobPreferences")} icon={<Globe2 size={18} />}>
          <InfoGrid
            t={t}
            items={[
              [t("desiredRole"), applicant.desired_job_title],
              [t("employmentType"), applicant.preferred_employment_type],
              [t("workMode"), applicant.preferred_work_mode],
              [
                t("expectedSalary"),
                applicant.expected_salary
                  ? `${applicant.salary_currency || ""} ${applicant.expected_salary}`
                  : t("notAvailable"),
              ],
              [t("noticePeriod"), applicant.notice_period],
              [t("availability"), applicant.availability],
              [t("workAuthorization"), applicant.work_authorization],
              [
                t("willingToRelocate"),
                applicant.willing_to_relocate ? t("yes") : t("no"),
              ],
            ]}
          />
        </Section>

        <Section title={t("experience")} icon={<Briefcase size={18} />}>
          <TimelineList
            items={applicant.experience}
            emptyText={t("noWorkExperience")}
            renderItem={(item) => (
              <>
                <strong>{item.job_title || t("roleNotSpecified")}</strong>
                <p>{item.company || t("companyNotSpecified")}</p>
                <p>
                  {item.start_date || t("startDate")} -{" "}
                  {item.currently_working
                    ? t("present")
                    : item.end_date || t("endDate")}
                </p>
                <p>{item.description || t("noDescriptionProvided")}</p>
              </>
            )}
          />
        </Section>

        <Section title={t("education")} icon={<GraduationCap size={18} />}>
          <TimelineList
            items={applicant.education}
            emptyText={t("noEducationAdded")}
            renderItem={(item) => (
              <>
                <strong>{item.degree || t("degreeNotSpecified")}</strong>
                <p>{item.institution || t("institutionNotSpecified")}</p>
                <p>{item.field_of_study || t("fieldNotSpecified")}</p>
                <p>
                  {item.start_year || t("startYear")} -{" "}
                  {item.end_year || t("endYear")}
                </p>
                {item.grade && (
                  <p>
                    {t("grade")}: {item.grade}
                  </p>
                )}
                {item.description && <p>{item.description}</p>}
              </>
            )}
          />
        </Section>

        <Section title={t("certifications")} icon={<Award size={18} />}>
          <TimelineList
            items={applicant.certifications}
            emptyText={t("noCertificationsAdded")}
            renderItem={(item) => (
              <>
                <strong>{item.name || t("certificationNotSpecified")}</strong>
                <p>{item.issuer || t("issuerNotSpecified")}</p>
                <p>{item.issue_date || t("issueDateNotSet")}</p>
                {item.credential_url && (
                  <a
                    href={item.credential_url}
                    target="_blank"
                    rel="noreferrer"
                    style={styles.link}
                  >
                    {t("viewCredential")}
                  </a>
                )}
              </>
            )}
          />
        </Section>

        <Section title={t("applicationMaterials")} icon={<FileText size={18} />}>
          <TextBlock
            title={t("coverLetter")}
            text={applicant.cover_letter}
            empty={t("noCoverLetterSubmitted")}
          />

          <div style={{ height: 12 }} />

          <div style={styles.linkGrid}>
            {applicant.linkedin_url && (
              <a href={applicant.linkedin_url} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            )}
            {applicant.github_url && (
              <a href={applicant.github_url} target="_blank" rel="noreferrer">
                GitHub
              </a>
            )}
            {applicant.portfolio_url && (
              <a href={applicant.portfolio_url} target="_blank" rel="noreferrer">
                Portfolio
              </a>
            )}
            {resumeUrl && (
              <a href={resumeUrl} target="_blank" rel="noreferrer">
                {t("resume")}
              </a>
            )}
          </div>

          {!applicant.linkedin_url &&
            !applicant.github_url &&
            !applicant.portfolio_url &&
            !resumeUrl && <p style={styles.muted}>{t("noLinksProvided")}</p>}
        </Section>

        <div style={styles.modalActions}>
          <Button variant="secondary" onClick={onClose}>
            {t("close")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Avatar({ applicant, large = false, t }) {
  const size = large ? 72 : 48;

  if (applicant.profile_image) {
    return (
      <img
        src={applicant.profile_image}
        alt={applicant.candidate_name || t("candidate")}
        style={{
          width: size,
          height: size,
          borderRadius: large ? 24 : 16,
          objectFit: "cover",
          border: "1px solid #e5e7eb",
        }}
      />
    );
  }

  return (
    <div
      style={{
        ...styles.avatar,
        width: size,
        height: size,
        borderRadius: large ? 24 : 16,
        fontSize: large ? 26 : 18,
      }}
    >
      {(applicant.candidate_name || "U").charAt(0).toUpperCase()}
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div style={styles.section}>
      <div style={styles.sectionHeader}>
        {icon}
        <h4>{title}</h4>
      </div>
      {children}
    </div>
  );
}

function InfoGrid({ items, t }) {
  return (
    <div style={styles.infoGrid}>
      {items.map(([label, value]) => (
        <div key={label} style={styles.infoBox}>
          <span style={styles.infoLabel}>{label}</span>
          <strong style={styles.infoValue}>{value || t("notAvailable")}</strong>
        </div>
      ))}
    </div>
  );
}

function TimelineList({ items, emptyText, renderItem }) {
  const safeItems = Array.isArray(items) ? items : [];

  if (safeItems.length === 0) {
    return <p style={styles.muted}>{emptyText}</p>;
  }

  return (
    <div style={styles.timelineList}>
      {safeItems.map((item, index) => (
        <div key={index} style={styles.timelineItem}>
          {renderItem(item)}
        </div>
      ))}
    </div>
  );
}

function TextBlock({ title, text, empty }) {
  return (
    <div style={styles.textBlock}>
      <strong>{title}</strong>
      <p>{text || empty}</p>
    </div>
  );
}

const styles = {
  applicantGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: 18,
  },
  applicantCard: {
    width: "100%",
    textAlign: "left",
    border: "1px solid #e5e7eb",
    background: "#fff",
    borderRadius: 22,
    padding: 18,
    cursor: "pointer",
    boxShadow: "0 14px 35px rgba(15, 23, 42, 0.06)",
  },
  cardTop: {
    display: "flex",
    gap: 14,
    alignItems: "flex-start",
  },
  avatar: {
    background: "linear-gradient(135deg, #111827, #2563eb)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
  },
  name: {
    margin: 0,
    fontSize: 17,
    color: "#111827",
  },
  title: {
    margin: "4px 0 0",
    color: "#6b7280",
    fontSize: 14,
  },
  metaList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginTop: 14,
  },
  skillsPreview: {
    marginTop: 14,
    padding: 12,
    borderRadius: 14,
    background: "#f9fafb",
    color: "#4b5563",
    fontSize: 14,
    lineHeight: 1.5,
    wordBreak: "break-word",
  },
  skillTags: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 10,
  },
  skillTag: {
    padding: "6px 10px",
    borderRadius: 10,
    background: "#e5e7eb",
    fontSize: 12,
    fontWeight: 600,
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 14,
    color: "#374151",
    lineHeight: 1.4,
    wordBreak: "break-word",
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    color: "#2563eb",
    fontWeight: 700,
    fontSize: 14,
  },
  emptyState: {
    textAlign: "center",
    padding: "45px 20px",
    color: "#6b7280",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(17, 24, 39, 0.62)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    zIndex: 1000,
  },
  modal: {
    width: "100%",
    maxWidth: 960,
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
    gap: 18,
    marginBottom: 18,
  },
  modalIdentity: {
    display: "flex",
    alignItems: "center",
    gap: 16,
  },
  modalName: {
    margin: 0,
    fontSize: 26,
    color: "#111827",
  },
  modalRole: {
    margin: "5px 0 0",
    color: "#6b7280",
  },
  modalSubText: {
    margin: "5px 0 0",
    color: "#2563eb",
    fontWeight: 700,
  },
  closeButton: {
    width: 40,
    height: 40,
    border: "none",
    borderRadius: "50%",
    background: "#f3f4f6",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalStatusRow: {
    display: "grid",
    gridTemplateColumns: "160px minmax(220px, 1fr)",
    gap: 14,
    alignItems: "end",
    marginBottom: 18,
  },
  section: {
    padding: 16,
    borderRadius: 18,
    border: "1px solid #e5e7eb",
    marginTop: 14,
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
    color: "#111827",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
  },
  infoBox: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    minHeight: 72,
    padding: 14,
    borderRadius: 14,
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
  },
  filterBar: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 220px",
    gap: 12,
    padding: 14,
    borderRadius: 18,
    background: "#fff",
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 25px rgba(15, 23, 42, 0.04)",
    marginBottom: 20,
  },
  searchBox: {
    minWidth: 0,
  },
  statusBox: {
    minWidth: 180,
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
  infoLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  infoValue: {
    fontSize: 14,
    color: "#111827",
    lineHeight: 1.4,
    wordBreak: "break-word",
  },
  timelineList: {
    display: "grid",
    gap: 12,
  },
  timelineItem: {
    padding: 14,
    borderRadius: 16,
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
  },
  textBlock: {
    padding: 14,
    borderRadius: 16,
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
  },
  linkGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
  },
  link: {
    color: "#2563eb",
    fontWeight: 700,
  },
  muted: {
    color: "#6b7280",
    margin: 0,
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 20,
  },
};

export default EmployerApplicants;