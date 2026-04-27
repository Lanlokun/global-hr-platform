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

function EmployerTalent() {
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const candidatesPerPage = 16;

  const [filters, setFilters] = useState({
    search: "",
    country: "",
  });

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };

  const fetchTalent = useCallback(async () => {
    try {
      const res = await api.get("/api/employer/talent", authHeaders);
      setCandidates(res.data);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to load talent directory");
    }
  }, []);

  useEffect(() => {
    fetchTalent();
  }, [fetchTalent]);

  const filtered = useMemo(() => {
    const q = filters.search.toLowerCase();
    const country = filters.country.toLowerCase();

    return candidates.filter((candidate) => {
      const matchesSearch =
        !q ||
        candidate.name?.toLowerCase().includes(q) ||
        candidate.email?.toLowerCase().includes(q) ||
        candidate.professional_title?.toLowerCase().includes(q) ||
        candidate.skills?.toLowerCase().includes(q);

      const matchesCountry =
        !country || candidate.country?.toLowerCase().includes(country);

      return matchesSearch && matchesCountry;
    });
  }, [candidates, filters]);

  const totalPages = Math.ceil(filtered.length / candidatesPerPage);

  const paginatedCandidates = useMemo(() => {
    const start = (currentPage - 1) * candidatesPerPage;
    return filtered.slice(start, start + candidatesPerPage);
  }, [filtered, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.search, filters.country]);

  return (
    <DashboardLayout
      title="Talent Directory"
      subtitle="Browse discoverable candidate talent on the platform."
    >
      <PageHeader
        subtitle="Discover candidates beyond your direct applicants."
        action={<Badge variant="default">{filtered.length} candidates</Badge>}
      />

      <div style={styles.filterBar}>
        <div style={styles.searchBox}>
          <Input
            label=""
            placeholder="Search by name, title, skill, or email..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>

        <div style={styles.countryBox}>
          <Input
            label=""
            placeholder="Country"
            value={filters.country}
            onChange={(e) => setFilters({ ...filters, country: e.target.value })}
          />
        </div>
      </div>

      <div style={styles.candidateGrid}>
        {filtered.length === 0 ? (
          <Card>
            <div style={styles.emptyState}>
              <UserCircle2 size={42} />
              <h3>No talent found</h3>
              <p>Try changing your search or country filter.</p>
            </div>
          </Card>
        ) : (
          paginatedCandidates.map((candidate) => (
            <button
              key={candidate.id}
              type="button"
              style={styles.candidateCard}
              onClick={() => setSelectedCandidate(candidate)}
            >
              <div style={styles.cardTop}>
                <Avatar candidate={candidate} />

                <div style={{ flex: 1 }}>
                  <h3 style={styles.name}>{candidate.name || "N/A"}</h3>
                  <p style={styles.title}>
                    {candidate.professional_title || "Candidate"}
                  </p>
                </div>

                <Badge variant="default">
                  {candidate.application_count || 0} apps
                </Badge>
              </div>

              <div style={styles.metaList}>
                <span style={styles.metaItem}>
                  <Mail size={15} />
                  <span>{candidate.email || "No email"}</span>
                </span>

                <span style={styles.metaItem}>
                  <MapPin size={15} />
                  <span>{candidate.country || "Country not set"}</span>
                </span>

                <span style={styles.metaItem}>
                  <Briefcase size={15} />
                  <span>
                    {candidate.years_of_experience
                      ? `${candidate.years_of_experience} years experience`
                      : "Experience not set"}
                  </span>
                </span>
              </div>

              <SkillTags skills={candidate.skills} />

              <div style={styles.cardFooter}>
                <span>View profile</span>
                <ExternalLink size={15} />
              </div>
            </button>
          ))
        )}
      </div>

      {filtered.length > candidatesPerPage && (
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

      {selectedCandidate && (
        <CandidateModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </DashboardLayout>
  );
}

function CandidateModal({ candidate, onClose }) {
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <div style={styles.modalIdentity}>
            <Avatar candidate={candidate} large />

            <div>
              <h2 style={styles.modalName}>{candidate.name || "Unknown candidate"}</h2>
              <p style={styles.modalRole}>
                {candidate.professional_title || "Candidate"}
              </p>
              <p style={styles.modalSubText}>
                {candidate.country || "Country not set"}
              </p>
            </div>
          </div>

          <button style={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <Section title="Contact Information" icon={<Phone size={18} />}>
          <InfoGrid
            items={[
              ["Email", candidate.email],
              ["Phone", candidate.phone],
              ["Country", candidate.country],
              ["City", candidate.city],
              ["Address", candidate.address],
            ]}
          />
        </Section>

        <Section title="Professional Profile" icon={<Briefcase size={18} />}>
          <InfoGrid
            items={[
              ["Title", candidate.professional_title],
              ["Years of Experience", candidate.years_of_experience],
              ["Languages", candidate.languages],
              ["Applications", candidate.application_count || 0],
            ]}
          />

          <div style={{ height: 12 }} />

          <TextBlock
            title="Professional Summary"
            text={candidate.professional_summary}
            empty="No professional summary provided."
          />

          <div style={{ height: 12 }} />

          <div style={styles.textBlock}>
            <strong>Skills</strong>
            <SkillTags skills={candidate.skills} />
          </div>
        </Section>

        <Section title="Job Preferences" icon={<Globe2 size={18} />}>
          <InfoGrid
            items={[
              ["Desired Role", candidate.desired_job_title],
              ["Employment Type", candidate.preferred_employment_type],
              ["Work Mode", candidate.preferred_work_mode],
              [
                "Expected Salary",
                candidate.expected_salary
                  ? `${candidate.salary_currency || ""} ${candidate.expected_salary}`
                  : "N/A",
              ],
              ["Notice Period", candidate.notice_period],
              ["Availability", candidate.availability],
              ["Work Authorization", candidate.work_authorization],
              ["Willing to Relocate", candidate.willing_to_relocate ? "Yes" : "No"],
            ]}
          />
        </Section>

        <Section title="Experience" icon={<Briefcase size={18} />}>
          <TimelineList
            items={candidate.experience}
            emptyText="No work experience added."
            renderItem={(item) => (
              <>
                <strong>{item.job_title || "Role not specified"}</strong>
                <p>{item.company || "Company not specified"}</p>
                <p>
                  {item.start_date || "Start date"} -{" "}
                  {item.currently_working ? "Present" : item.end_date || "End date"}
                </p>
                <p>{item.description || "No description provided."}</p>
              </>
            )}
          />
        </Section>

        <Section title="Education" icon={<GraduationCap size={18} />}>
          <TimelineList
            items={candidate.education}
            emptyText="No education added."
            renderItem={(item) => (
              <>
                <strong>{item.degree || "Degree not specified"}</strong>
                <p>{item.institution || "Institution not specified"}</p>
                <p>{item.field_of_study || "Field not specified"}</p>
                <p>
                  {item.start_year || "Start year"} - {item.end_year || "End year"}
                </p>
              </>
            )}
          />
        </Section>

        <Section title="Certifications" icon={<Award size={18} />}>
          <TimelineList
            items={candidate.certifications}
            emptyText="No certifications added."
            renderItem={(item) => (
              <>
                <strong>{item.name || "Certification not specified"}</strong>
                <p>{item.issuer || "Issuer not specified"}</p>
                <p>{item.issue_date || "Issue date not set"}</p>
                {item.credential_url && (
                  <a href={item.credential_url} target="_blank" rel="noreferrer">
                    View credential
                  </a>
                )}
              </>
            )}
          />
        </Section>

        <Section title="Links and Resume" icon={<FileText size={18} />}>
          <div style={styles.linkGrid}>
            {candidate.linkedin_url && (
              <a href={candidate.linkedin_url} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            )}
            {candidate.github_url && (
              <a href={candidate.github_url} target="_blank" rel="noreferrer">
                GitHub
              </a>
            )}
            {candidate.portfolio_url && (
              <a href={candidate.portfolio_url} target="_blank" rel="noreferrer">
                Portfolio
              </a>
            )}
            {candidate.resume_url && (
              <a href={candidate.resume_url} target="_blank" rel="noreferrer">
                Resume
              </a>
            )}
          </div>

          {!candidate.linkedin_url &&
            !candidate.github_url &&
            !candidate.portfolio_url &&
            !candidate.resume_url && (
              <p style={styles.muted}>No professional links provided.</p>
            )}
        </Section>

        <div style={styles.modalActions}>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

function Avatar({ candidate, large = false }) {
  const size = large ? 72 : 48;

  if (candidate.profile_image) {
    return (
      <img
        src={candidate.profile_image}
        alt={candidate.name || "Candidate"}
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
      {(candidate.name || "U").charAt(0).toUpperCase()}
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
    return <p style={styles.muted}>No skills added.</p>;
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

function InfoGrid({ items }) {
  return (
    <div style={styles.infoGrid}>
      {items.map(([label, value]) => (
        <div key={label} style={styles.infoBox}>
          <span style={styles.infoLabel}>{label}</span>
          <strong style={styles.infoValue}>{value || "N/A"}</strong>
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
  countryBox: {
    minWidth: 180,
  },
candidateGrid: {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
  gap: 18,
},
  candidateCard: {
    width: "100%",
    textAlign: "left",
    border: "1px solid #e5e7eb",
    background: "#fff",
    borderRadius: 22,
    padding: 18,
    cursor: "pointer",
    boxShadow: "0 14px 35px rgba(15, 23, 42, 0.06)",
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
    flexShrink: 0,
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
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 14,
    color: "#374151",
    lineHeight: 1.4,
    wordBreak: "break-word",
  },
  skillTags: {
    display: "flex",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 12,
  },
  skillTag: {
    padding: "6px 10px",
    borderRadius: 999,
    background: "#f3f4f6",
    color: "#374151",
    fontSize: 12,
    fontWeight: 700,
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

export default EmployerTalent;