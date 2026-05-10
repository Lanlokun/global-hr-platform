import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
  Search,
  Users,
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  MessageCircle,
  Eye,
  MapPin,
  GraduationCap,
  Filter,
  RotateCcw,
  Grid2X2,
  List,
  Phone,
  Mail,
  Languages,
  Calendar,
  Award,
  ChevronLeft,
  ChevronRight,
  Plus,
  Upload,
  Pencil,
  Trash2,
  X,
  Save,
  UserPlus,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import Button from "../../components/ui/Button";
import api from "../../services/api";

const ITEMS_PER_PAGE = 16;

const emptyTalentForm = {
  name: "",
  email: "",
  phone: "",
  country: "",
  city: "",
  professional_title: "",
  desired_job_title: "",
  professional_summary: "",
  years_of_experience: "",
  skills: "",
  languages: "",
  availability: "",
  preferred_work_mode: "",
  preferred_employment_type: "",
  expected_salary: "",
  salary_currency: "USD",
  work_authorization: "",
  willing_to_relocate: "",
};

const getProfileImage = (candidate) =>
  candidate.profile_image || candidate.avatar || candidate.image || "/images/avatar.jpg";

const formatJsonLike = (value) => {
  if (!value) return "Not specified";

  if (typeof value === "string") {
    try {
      return formatJsonLike(JSON.parse(value));
    } catch {
      return value;
    }
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return "Not specified";

    return value
      .map((item) => {
        if (typeof item === "string") return `• ${item}`;
        return Object.values(item).filter(Boolean).join(" | ");
      })
      .join("\n");
  }

  if (typeof value === "object") {
    return Object.entries(value)
      .map(([key, val]) => `${key}: ${val}`)
      .join("\n");
  }

  return String(value);
};

function RecruiterTalent() {
  const navigate = useNavigate();

  const [talent, setTalent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("all");
  const [readinessFilter, setReadinessFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenu, setOpenMenu] = useState(null);

  const fetchTalent = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/recruiter/talent");
      const data = Array.isArray(res.data) ? res.data : res.data.talent || [];
      setTalent(data);
    } catch (err) {
      console.error("Failed to load talent:", err);
      toast.error(err.response?.data?.error || "Failed to load talent");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTalent();
  }, []);

  const getReadinessScore = (candidate) => {
    let score = 0;

    if (candidate.professional_title || candidate.desired_job_title) score += 20;
    if (candidate.professional_summary) score += 20;
    if (candidate.skills) score += 20;
    if (candidate.years_of_experience) score += 15;
    if (candidate.education) score += 10;
    if (candidate.languages) score += 10;
    if (candidate.profile_image) score += 5;

    return Math.min(score, 100);
  };

  const filteredTalent = useMemo(() => {
    let result = [...talent];

    result = result.filter((candidate) => {
      const text = [
        candidate.name,
        candidate.email,
        candidate.country,
        candidate.city,
        candidate.professional_title,
        candidate.desired_job_title,
        candidate.skills,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = text.includes(searchTerm.toLowerCase());
      const years = Number(candidate.years_of_experience || 0);

      const matchesExperience =
        experienceFilter === "all" ||
        (experienceFilter === "junior" && years <= 2) ||
        (experienceFilter === "mid" && years >= 3 && years <= 5) ||
        (experienceFilter === "senior" && years >= 6);

      const score = getReadinessScore(candidate);

      const matchesReadiness =
        readinessFilter === "all" ||
        (readinessFilter === "high" && score >= 80) ||
        (readinessFilter === "medium" && score >= 50 && score < 80) ||
        (readinessFilter === "low" && score < 50);

      return matchesSearch && matchesExperience && matchesReadiness;
    });

    if (sortBy === "readiness") {
      result.sort((a, b) => getReadinessScore(b) - getReadinessScore(a));
    }

    if (sortBy === "experience") {
      result.sort(
        (a, b) =>
          Number(b.years_of_experience || 0) -
          Number(a.years_of_experience || 0)
      );
    }

    if (sortBy === "recent") {
      result.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    }

    return result;
  }, [talent, searchTerm, experienceFilter, readinessFilter, sortBy]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, experienceFilter, readinessFilter, sortBy]);

  const totalPages = Math.ceil(filteredTalent.length / ITEMS_PER_PAGE) || 1;

  const paginatedTalent = filteredTalent.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const stats = useMemo(() => {
    const total = talent.length;
    const highReadiness = talent.filter((c) => getReadinessScore(c) >= 80).length;
    const needsSupport = talent.filter((c) => getReadinessScore(c) < 50).length;
    const seniorTalent = talent.filter(
      (c) => Number(c.years_of_experience || 0) >= 6
    ).length;

    return { total, highReadiness, needsSupport, seniorTalent };
  }, [talent]);

  const resetFilters = () => {
    setSearchTerm("");
    setExperienceFilter("all");
    setReadinessFilter("all");
    setSortBy("recent");
    setCurrentPage(1);
    toast("Filters reset.");
  };

  const messageCandidate = async (candidateId) => {
    try {
      const res = await api.post("/api/messages/conversations", {
        receiver_id: candidateId,
      });

      const conversationId = res.data?.conversation?.id || res.data?.id;

      if (conversationId) {
        navigate(`/dashboard/messages?conversation=${conversationId}`);
      } else {
        navigate(`/dashboard/messages?candidate=${candidateId}`);
      }
    } catch (err) {
      console.error("Failed to start conversation:", err);
      navigate(`/dashboard/messages?candidate=${candidateId}`);
    }
  };

  const createTalent = async (form) => {
    try {
      const payload = normalizeTalentPayload(form);

      if (!payload.name || !payload.email) {
        toast.error("Name and email are required.");
        return;
      }

      const res = await api.post("/api/recruiter/talent", payload);
      const created = res.data?.talent;

      if (created) {
        setTalent((prev) => [created, ...prev]);
      } else {
        await fetchTalent();
      }

      toast.success("Talent created and assigned to you.");
      setShowCreateModal(false);
    } catch (err) {
      console.error("Failed to create talent:", err);
      toast.error(err.response?.data?.error || "Failed to create talent.");
    }
  };

  const updateTalent = async (candidateId, form) => {
    try {
      const payload = normalizeTalentPayload(form);

      const res = await api.patch(`/api/recruiter/talent/${candidateId}`, payload);
      const updated = res.data?.talent || res.data;

      setTalent((prev) =>
        prev.map((item) => (item.id === candidateId ? { ...item, ...updated } : item))
      );

      setSelectedCandidate((prev) =>
        prev?.id === candidateId ? { ...prev, ...updated } : prev
      );

      toast.success("Talent updated successfully.");
      setEditingCandidate(null);
    } catch (err) {
      console.error("Failed to update talent:", err);
      toast.error(err.response?.data?.error || "Failed to update talent.");
    }
  };

  const removeTalent = async (candidateId) => {
    const confirmed = window.confirm(
      "Remove this talent from your workspace? This will not delete the candidate globally."
    );

    if (!confirmed) return;

    try {
      await api.delete(`/api/recruiter/talent/${candidateId}`);

      setTalent((prev) => prev.filter((item) => item.id !== candidateId));

      if (selectedCandidate?.id === candidateId) {
        setSelectedCandidate(null);
      }

      toast.success("Talent removed from your workspace.");
    } catch (err) {
      console.error("Failed to remove talent:", err);
      toast.error(err.response?.data?.error || "Failed to remove talent.");
    }
  };

  const bulkCreateTalent = async (items) => {
    try {
      if (!items.length) {
        toast.error("No valid talent records found.");
        return;
      }

      const res = await api.post("/api/recruiter/talent/bulk", {
        talents: items,
      });

      toast.success(
        `Bulk import completed. Created ${res.data?.createdCount || 0}, skipped ${
          res.data?.skippedCount || 0
        }.`
      );

      setShowBulkModal(false);
      await fetchTalent();
    } catch (err) {
      console.error("Failed to bulk create talent:", err);
      toast.error(err.response?.data?.error || "Failed to bulk create talent.");
    }
  };

  return (
    <DashboardLayout
      title="Talent Management"
      subtitle="Create, assign, manage, evaluate, and support talent through the recruiter lifecycle."
    >
      <Toaster position="top-right" />

      <div style={styles.pageHeader}>
        <div>
          <h2 style={styles.pageTitle}>Recruiter Talent Workspace</h2>
          <p style={styles.pageSubtitle}>
            Manage assigned candidates, add agency talent, and prepare profiles for matching.
          </p>
        </div>

        <div style={styles.headerActions}>
          <button
            type="button"
            style={styles.secondaryAction}
            onClick={() => setShowBulkModal(true)}
          >
            <Upload size={16} />
            Bulk Create
          </button>

          <Button onClick={() => setShowCreateModal(true)}>
            <Plus size={16} />
            Create Talent
          </Button>
        </div>
      </div>

      <div style={styles.statsGrid}>
        <StatCard
          icon={<Users size={26} />}
          title="Total Talent"
          value={stats.total}
          subtext="Assigned to you"
          color="#4f46e5"
          bg="#eef2ff"
        />

        <StatCard
          icon={<CheckCircle2 size={26} />}
          title="High Readiness"
          value={stats.highReadiness}
          subtext={`${stats.total ? Math.round((stats.highReadiness / stats.total) * 100) : 0}% of total`}
          color="#16a34a"
          bg="#dcfce7"
        />

        <StatCard
          icon={<AlertCircle size={26} />}
          title="Needs Support"
          value={stats.needsSupport}
          subtext={`${stats.total ? Math.round((stats.needsSupport / stats.total) * 100) : 0}% of total`}
          color="#f97316"
          bg="#ffedd5"
        />

        <StatCard
          icon={<Briefcase size={26} />}
          title="Senior Talent"
          value={stats.seniorTalent}
          subtext={`${stats.total ? Math.round((stats.seniorTalent / stats.total) * 100) : 0}% of total`}
          color="#2563eb"
          bg="#dbeafe"
        />
      </div>

      <section style={styles.panel}>
        <div style={styles.toolbar}>
          <div style={styles.searchBox}>
            <Search size={18} color="#64748b" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, role, skills, or country..."
              style={styles.input}
            />
          </div>

          <div style={styles.controlGroup}>
            <div style={styles.selectBox}>
              <Filter size={16} />
              <select
                value={experienceFilter}
                onChange={(e) => setExperienceFilter(e.target.value)}
                style={styles.select}
              >
                <option value="all">All experience</option>
                <option value="junior">Junior, 0-2 years</option>
                <option value="mid">Mid-level, 3-5 years</option>
                <option value="senior">Senior, 6+ years</option>
              </select>
            </div>

            <div style={styles.selectBox}>
              <select
                value={readinessFilter}
                onChange={(e) => setReadinessFilter(e.target.value)}
                style={styles.select}
              >
                <option value="all">All readiness</option>
                <option value="high">High readiness</option>
                <option value="medium">Medium readiness</option>
                <option value="low">Needs support</option>
              </select>
            </div>

            <button type="button" style={styles.resetButton} onClick={resetFilters}>
              <RotateCcw size={16} />
              Reset
            </button>
          </div>
        </div>

        <div style={styles.panelMeta}>
          <span>{filteredTalent.length} results found</span>

          <div style={styles.sortWrap}>
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={styles.sortSelect}
            >
              <option value="recent">Recently added</option>
              <option value="readiness">Readiness score</option>
              <option value="experience">Experience</option>
            </select>

            <div style={styles.viewButtons}>
              <button
                type="button"
                style={viewMode === "grid" ? styles.activeViewButton : styles.viewButton}
                onClick={() => setViewMode("grid")}
              >
                <Grid2X2 size={16} />
              </button>

              <button
                type="button"
                style={viewMode === "list" ? styles.activeViewButton : styles.viewButton}
                onClick={() => setViewMode("list")}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={styles.emptyState}>Loading talent...</div>
        ) : filteredTalent.length === 0 ? (
          <div style={styles.emptyState}>
            No talent found. Create talent manually or bulk import your agency list.
          </div>
        ) : (
          <>
            <div style={viewMode === "grid" ? styles.talentGrid : styles.talentList}>
              {paginatedTalent.map((candidate) => (
                    <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    viewMode={viewMode}
                    readinessScore={getReadinessScore(candidate)}
                    openMenu={openMenu}
                    setOpenMenu={setOpenMenu}
                    onView={() => setSelectedCandidate(candidate)}
                    onEdit={() => setEditingCandidate(candidate)}
                    onRemove={() => removeTalent(candidate.id)}
                    onMessage={() => messageCandidate(candidate.id)}
                    />
              ))}
            </div>

            {totalPages > 1 && (
              <div style={styles.pagination}>
                <button
                  type="button"
                  style={styles.pageButton}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                >
                  <ChevronLeft size={16} />
                </button>

                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    type="button"
                    key={index + 1}
                    style={{
                      ...styles.pageNumber,
                      ...(currentPage === index + 1 ? styles.activePageNumber : {}),
                    }}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  type="button"
                  style={styles.pageButton}
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                >
                  <ChevronRight size={16} />
                </button>

                <span style={styles.paginationText}>
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}-
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredTalent.length)} of{" "}
                  {filteredTalent.length}
                </span>
              </div>
            )}
          </>
        )}
      </section>

      {selectedCandidate && (
        <CandidateModal
          candidate={selectedCandidate}
          readinessScore={getReadinessScore(selectedCandidate)}
          onClose={() => setSelectedCandidate(null)}
          onEdit={() => setEditingCandidate(selectedCandidate)}
          onRemove={() => removeTalent(selectedCandidate.id)}
          onMessage={() => messageCandidate(selectedCandidate.id)}
        />
      )}

      {showCreateModal && (
        <TalentFormModal
          title="Create Talent"
          subtitle="Create a candidate profile and automatically assign it to your recruiter workspace."
          initialValues={emptyTalentForm}
          submitLabel="Create Talent"
          onSubmit={createTalent}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {editingCandidate && (
        <TalentFormModal
          title="Edit Talent"
          subtitle="Update candidate profile information and readiness data."
          initialValues={candidateToForm(editingCandidate)}
          submitLabel="Save Changes"
          onSubmit={(form) => updateTalent(editingCandidate.id, form)}
          onClose={() => setEditingCandidate(null)}
        />
      )}

      {showBulkModal && (
        <BulkCreateModal
          onClose={() => setShowBulkModal(false)}
          onSubmit={bulkCreateTalent}
        />
      )}
    </DashboardLayout>
  );
}

function normalizeTalentPayload(form) {
  return {
    ...form,
    years_of_experience: form.years_of_experience
      ? Number(form.years_of_experience)
      : 0,
    expected_salary: form.expected_salary ? Number(form.expected_salary) : null,
    willing_to_relocate:
      form.willing_to_relocate === "true"
        ? true
        : form.willing_to_relocate === "false"
        ? false
        : null,
  };
}

function candidateToForm(candidate) {
  return {
    name: candidate.name || "",
    email: candidate.email || "",
    phone: candidate.phone || "",
    country: candidate.country || "",
    city: candidate.city || "",
    professional_title: candidate.professional_title || "",
    desired_job_title: candidate.desired_job_title || "",
    professional_summary: candidate.professional_summary || "",
    years_of_experience: candidate.years_of_experience || "",
    skills: candidate.skills || "",
    languages: candidate.languages || "",
    availability: candidate.availability || "",
    preferred_work_mode: candidate.preferred_work_mode || "",
    preferred_employment_type: candidate.preferred_employment_type || "",
    expected_salary: candidate.expected_salary || "",
    salary_currency: candidate.salary_currency || "USD",
    work_authorization: candidate.work_authorization || "",
    willing_to_relocate:
      candidate.willing_to_relocate === true
        ? "true"
        : candidate.willing_to_relocate === false
        ? "false"
        : "",
  };
}

function StatCard({ icon, title, value, subtext, color, bg }) {
  return (
    <div style={styles.statCard}>
      <div style={{ ...styles.statIcon, background: bg, color }}>{icon}</div>

      <div>
        <p style={styles.statTitle}>{title}</p>
        <h2 style={styles.statValue}>{value}</h2>
        <span style={styles.statSubtext}>{subtext}</span>
      </div>
    </div>
  );
}

function CandidateCard({
  candidate,
  readinessScore,
  viewMode,
  onView,
  onEdit,
  onRemove,
  onMessage,
  openMenu,
  setOpenMenu,
}) {
  const skills = String(candidate.skills || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <div style={viewMode === "list" ? styles.candidateListItem : styles.candidateCard}>
 <div style={styles.cardHeader}>
  <div style={styles.profileRow}>
    <img
      src={getProfileImage(candidate)}
      alt={candidate.name || "Candidate"}
      style={styles.avatarImage}
      onError={(e) => {
        e.currentTarget.src = "/images/avatar.jpg";
      }}
    />

    <div>
      <h3 style={styles.name}>
        {candidate.name || "Unnamed Candidate"}
      </h3>

      <p style={styles.role}>
        {candidate.professional_title ||
          candidate.desired_job_title ||
          "Role not specified"}
      </p>
    </div>
  </div>

  <div style={styles.menuWrapper}>
    <button
      type="button"
      style={styles.menuButton}
      onClick={() =>
        setOpenMenu((prev) =>
          prev === candidate.id ? null : candidate.id
        )
      }
    >
      <MoreVertical size={18} />
    </button>

    {openMenu === candidate.id && (
      <div style={styles.dropdownMenu}>
        <button
          type="button"
          style={styles.dropdownItem}
          onClick={() => {
            setOpenMenu(null);
            onEdit();
          }}
        >
          <Pencil size={15} />
          Edit Talent
        </button>

        <button
          type="button"
          style={styles.dropdownDelete}
          onClick={() => {
            setOpenMenu(null);
            onRemove();
          }}
        >
          <Trash2 size={15} />
          Remove Talent
        </button>
      </div>
    )}
  </div>
</div>

      <div style={styles.metaList}>
        <span>
          <MapPin size={14} />
          {[candidate.city, candidate.country].filter(Boolean).join(", ") ||
            "Location not specified"}
        </span>

        <span>
          <Briefcase size={14} />
          {candidate.years_of_experience || 0} years experience
        </span>

        <span>
          <GraduationCap size={14} />
          {candidate.education ? "Education added" : "Education missing"}
        </span>
      </div>

      <div style={styles.readinessBlock}>
        <div style={styles.readinessTop}>
          <span>Readiness</span>
          <strong>{readinessScore}%</strong>
        </div>

        <div style={styles.progressTrack}>
          <div
            style={{
              ...styles.progressFill,
              width: `${readinessScore}%`,
            }}
          />
        </div>
      </div>

      <div style={styles.skills}>
        {skills.length === 0 ? (
          <span>No skills added</span>
        ) : (
          <>
            {skills.slice(0, 3).map((skill, index) => (
              <span key={index}>{skill}</span>
            ))}
            {skills.length > 3 && <span>+{skills.length - 3}</span>}
          </>
        )}
      </div>

<div style={styles.actions}>
  <button type="button" style={styles.viewProfileButton} onClick={onView}>
    <Eye size={15} />
    View
  </button>

  <button type="button" style={styles.messageButton} onClick={onMessage}>
    <MessageCircle size={15} />
    Message
  </button>

</div>
    </div>
  );
}

function CandidateModal({
  candidate,
  readinessScore,
  onClose,
  onEdit,
  onRemove,
  onMessage,
}) {
  const details = [
    ["Email", candidate.email, <Mail size={15} />],
    ["Phone", candidate.phone, <Phone size={15} />],
    [
      "Location",
      [candidate.city, candidate.country].filter(Boolean).join(", "),
      <MapPin size={15} />,
    ],
    [
      "Experience",
      `${candidate.years_of_experience || 0} years`,
      <Briefcase size={15} />,
    ],
    ["Languages", candidate.languages, <Languages size={15} />],
    ["Availability", candidate.availability, <Calendar size={15} />],
    ["Work Authorization", candidate.work_authorization, <Award size={15} />],
    [
      "Expected Salary",
      candidate.expected_salary
        ? `${candidate.expected_salary} ${candidate.salary_currency || ""}`
        : null,
      <Briefcase size={15} />,
    ],
    [
      "Preferred Employment",
      candidate.preferred_employment_type,
      <Briefcase size={15} />,
    ],
    ["Preferred Work Mode", candidate.preferred_work_mode, <Briefcase size={15} />],
    [
      "Willing to Relocate",
      candidate.willing_to_relocate === true
        ? "Yes"
        : candidate.willing_to_relocate === false
        ? "No"
        : null,
      <MapPin size={15} />,
    ],
  ];

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.largeModal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.modalHero}>
          <div style={styles.modalProfileLeft}>
            <img
              src={getProfileImage(candidate)}
              alt={candidate.name || "Candidate"}
              style={styles.modalProfileImage}
              onError={(e) => {
                e.currentTarget.src = "/images/avatar.jpg";
              }}
            />

            <div>
              <h2 style={styles.modalTitle}>
                {candidate.name || "Unnamed Candidate"}
              </h2>
              <p style={styles.modalSubtitle}>
                {candidate.professional_title ||
                  candidate.desired_job_title ||
                  "Candidate"}
              </p>
              <span style={styles.readinessBadge}>Readiness {readinessScore}%</span>
            </div>
          </div>

          <button type="button" style={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div style={styles.modalGrid}>
          <section style={styles.modalSection}>
            <h3>Professional Summary</h3>
            <p>{candidate.professional_summary || "No summary provided."}</p>
          </section>

          <section style={styles.modalSection}>
            <h3>Candidate Details</h3>

            <div style={styles.detailGrid}>
              {details.map(([label, value, icon]) => (
                <div key={label} style={styles.detailItem}>
                  <span style={styles.detailIcon}>{icon}</span>

                  <div>
                    <strong>{label}</strong>
                    <p>{value || "Not specified"}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section style={styles.modalSection}>
            <h3>Skills</h3>
            <div style={styles.skills}>
              {String(candidate.skills || "No skills added")
                .split(",")
                .map((skill, index) => (
                  <span key={index}>{skill.trim()}</span>
                ))}
            </div>
          </section>

          <section style={styles.modalTwoColumns}>
            <div style={styles.modalSection}>
              <h3>Education</h3>
              <pre style={styles.preBlock}>{formatJsonLike(candidate.education)}</pre>
            </div>

            <div style={styles.modalSection}>
              <h3>Experience</h3>
              <pre style={styles.preBlock}>{formatJsonLike(candidate.experience)}</pre>
            </div>
          </section>

          <section style={styles.modalSection}>
            <h3>Certifications</h3>
            <pre style={styles.preBlock}>{formatJsonLike(candidate.certifications)}</pre>
          </section>

          <section style={styles.modalSection}>
            <h3>Recruiter Assignment</h3>
            <div style={styles.detailGrid}>
              <div style={styles.detailItem}>
                <span style={styles.detailIcon}>
                  <UserPlus size={15} />
                </span>
                <div>
                  <strong>Source</strong>
                  <p>{candidate.assignment_source || "assigned"}</p>
                </div>
              </div>

              <div style={styles.detailItem}>
                <span style={styles.detailIcon}>
                  <CheckCircle2 size={15} />
                </span>
                <div>
                  <strong>Status</strong>
                  <p>{candidate.assignment_status || "assigned"}</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div style={styles.modalFooter}>
          <button type="button" style={styles.removeOutlineButton} onClick={onRemove}>
            <Trash2 size={15} />
            Remove
          </button>

          <Button variant="secondary" onClick={onEdit}>
            <Pencil size={15} />
            Edit
          </Button>

          <Button onClick={onMessage}>
            <MessageCircle size={15} />
            Open Conversation
          </Button>
        </div>
      </div>
    </div>
  );
}

function TalentFormModal({
  title,
  subtitle,
  initialValues,
  submitLabel,
  onSubmit,
  onClose,
}) {
  const [form, setForm] = useState(initialValues);
  const [saving, setSaving] = useState(false);

  const update = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      await onSubmit(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <form style={styles.formModal} onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
        <div style={styles.formHeader}>
          <div>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>

          <button type="button" style={styles.iconButton} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={styles.formBody}>
          <Input label="Full Name" value={form.name} onChange={(v) => update("name", v)} required />
          <Input label="Email" type="email" value={form.email} onChange={(v) => update("email", v)} required />
          <Input label="Phone" value={form.phone} onChange={(v) => update("phone", v)} />
          <Input label="Country" value={form.country} onChange={(v) => update("country", v)} />
          <Input label="City" value={form.city} onChange={(v) => update("city", v)} />
          <Input label="Professional Title" value={form.professional_title} onChange={(v) => update("professional_title", v)} />
          <Input label="Desired Job Title" value={form.desired_job_title} onChange={(v) => update("desired_job_title", v)} />
          <Input label="Years of Experience" type="number" value={form.years_of_experience} onChange={(v) => update("years_of_experience", v)} />
          <Input label="Skills, comma separated" value={form.skills} onChange={(v) => update("skills", v)} />
          <Input label="Languages" value={form.languages} onChange={(v) => update("languages", v)} />
          <Input label="Availability" value={form.availability} onChange={(v) => update("availability", v)} />
          <Select label="Preferred Work Mode" value={form.preferred_work_mode} onChange={(v) => update("preferred_work_mode", v)}>
            <option value="">Select</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Onsite">Onsite</option>
          </Select>
          <Select label="Preferred Employment Type" value={form.preferred_employment_type} onChange={(v) => update("preferred_employment_type", v)}>
            <option value="">Select</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Internship">Internship</option>
          </Select>
          <Input label="Expected Salary" type="number" value={form.expected_salary} onChange={(v) => update("expected_salary", v)} />
          <Input label="Salary Currency" value={form.salary_currency} onChange={(v) => update("salary_currency", v)} />
          <Input label="Work Authorization" value={form.work_authorization} onChange={(v) => update("work_authorization", v)} />
          <Select label="Willing to Relocate" value={form.willing_to_relocate} onChange={(v) => update("willing_to_relocate", v)}>
            <option value="">Not specified</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </Select>

          <label style={styles.fullField}>
            <span>Professional Summary</span>
            <textarea
              value={form.professional_summary}
              onChange={(e) => update("professional_summary", e.target.value)}
              style={styles.formTextarea}
              placeholder="Write a short candidate summary..."
            />
          </label>
        </div>

        <div style={styles.formFooter}>
          <button type="button" style={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>

          <Button type="submit" disabled={saving}>
            <Save size={15} />
            {saving ? "Saving..." : submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}

function BulkCreateModal({ onClose, onSubmit }) {
  const [rawText, setRawText] = useState(`name,email,phone,country,city,professional_title,desired_job_title,years_of_experience,skills
Amina Yusuf,amina@example.com,+2348012345678,Nigeria,Lagos,Frontend Developer,React Developer,3,"React, JavaScript, CSS"
Kwame Mensah,kwame@example.com,+233201234567,Ghana,Accra,Backend Engineer,Node.js Engineer,5,"Node.js, PostgreSQL, APIs"`);
  const [saving, setSaving] = useState(false);

  const parsedItems = useMemo(() => parseCsvLike(rawText), [rawText]);

  const handleSubmit = async () => {
    try {
      setSaving(true);
      await onSubmit(parsedItems);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.bulkModal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.formHeader}>
          <div>
            <h2>Bulk Create Talent</h2>
            <p>
              Paste CSV-style rows. Each talent will be created as a candidate and assigned to you.
            </p>
          </div>

          <button type="button" style={styles.iconButton} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          style={styles.bulkTextarea}
        />

        <div style={styles.bulkMeta}>
          <strong>{parsedItems.length}</strong> valid records detected.
        </div>

        <div style={styles.formFooter}>
          <button type="button" style={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>

          <Button onClick={handleSubmit} disabled={saving || parsedItems.length === 0}>
            <Upload size={15} />
            {saving ? "Importing..." : "Import Talent"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function parseCsvLike(text) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]).map((h) => h.trim());

  return lines
    .slice(1)
    .map((line) => {
      const values = splitCsvLine(line);
      const item = {};

      headers.forEach((header, index) => {
        item[header] = values[index]?.trim() || "";
      });

      return item;
    })
    .filter((item) => item.name && item.email);
}

function splitCsvLine(line) {
  const result = [];
  let current = "";
  let insideQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

function Input({ label, value, onChange, type = "text", required }) {
  return (
    <label style={styles.formField}>
      <span>
        {label}
        {required ? " *" : ""}
      </span>
      <input
        type={type}
        value={value || ""}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        style={styles.formInput}
      />
    </label>
  );
}

function Select({ label, value, onChange, children }) {
  return (
    <label style={styles.formField}>
      <span>{label}</span>
      <select value={value || ""} onChange={(e) => onChange(e.target.value)} style={styles.formInput}>
        {children}
      </select>
    </label>
  );
}

const styles = {
  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 22,
  },

  pageTitle: {
    margin: 0,
    color: "#0f172a",
  },

  pageSubtitle: {
    margin: "6px 0 0",
    color: "#64748b",
  },

  headerActions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  secondaryAction: {
    height: 42,
    border: "1px solid #dbe3ef",
    borderRadius: 13,
    background: "#fff",
    color: "#334155",
    fontWeight: 800,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    padding: "0 16px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 18,
    marginBottom: 22,
  },

  statCard: {
    minHeight: 120,
    background: "#fff",
    border: "1px solid #e8edf5",
    borderRadius: 24,
    padding: 22,
    display: "flex",
    gap: 18,
    alignItems: "center",
    boxShadow: "0 20px 50px rgba(15, 23, 42, 0.06)",
  },

  statIcon: {
    width: 64,
    height: 64,
    borderRadius: 22,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  statTitle: {
    margin: 0,
    color: "#475569",
    fontSize: 14,
    fontWeight: 700,
  },

  statValue: {
    margin: "6px 0 2px",
    fontSize: 30,
    color: "#0f172a",
    lineHeight: 1,
  },

  statSubtext: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: 600,
  },

  panel: {
    background: "#fff",
    border: "1px solid #e8edf5",
    borderRadius: 26,
    padding: 22,
    boxShadow: "0 24px 70px rgba(15, 23, 42, 0.07)",
  },

  toolbar: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: 16,
    alignItems: "center",
    marginBottom: 18,
  },

  searchBox: {
    height: 50,
    border: "1px solid #dbe3ef",
    borderRadius: 16,
    padding: "0 16px",
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#f8fafc",
  },

  input: {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    fontSize: 14,
    color: "#0f172a",
  },

  controlGroup: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    flexWrap: "wrap",
  },

  selectBox: {
    height: 50,
    minWidth: 170,
    border: "1px solid #dbe3ef",
    borderRadius: 16,
    padding: "0 12px",
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#fff",
  },

  select: {
    border: "none",
    outline: "none",
    background: "transparent",
    fontWeight: 700,
    color: "#334155",
    width: "100%",
  },

  resetButton: {
    height: 50,
    border: "1px solid #dbe3ef",
    borderRadius: 16,
    background: "#fff",
    padding: "0 18px",
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontWeight: 800,
    color: "#334155",
    cursor: "pointer",
  },

  panelMeta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
    color: "#64748b",
    fontSize: 14,
    fontWeight: 700,
    flexWrap: "wrap",
    gap: 12,
  },

  sortWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },

  sortSelect: {
    height: 42,
    border: "1px solid #dbe3ef",
    borderRadius: 14,
    padding: "0 14px",
    fontWeight: 700,
    color: "#334155",
    background: "#fff",
  },

  viewButtons: {
    height: 42,
    border: "1px solid #dbe3ef",
    borderRadius: 14,
    overflow: "hidden",
    display: "flex",
  },

  activeViewButton: {
    width: 42,
    border: "none",
    background: "#eef2ff",
    color: "#2563eb",
    cursor: "pointer",
  },

  viewButton: {
    width: 42,
    border: "none",
    background: "#fff",
    color: "#64748b",
    cursor: "pointer",
  },

  talentGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(285px, 1fr))",
    gap: 18,
  },

  talentList: {
    display: "grid",
    gap: 14,
  },

  candidateCard: {
    border: "1px solid #e3eaf4",
    borderRadius: 22,
    padding: 18,
    background: "#fff",
    display: "grid",
    gap: 15,
    boxShadow: "0 14px 35px rgba(15, 23, 42, 0.045)",
  },

  candidateListItem: {
    border: "1px solid #e3eaf4",
    borderRadius: 22,
    padding: 18,
    background: "#fff",
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr 220px",
    gap: 15,
    alignItems: "center",
    boxShadow: "0 14px 35px rgba(15, 23, 42, 0.045)",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
  },

  profileRow: {
    display: "flex",
    gap: 13,
    alignItems: "center",
  },

  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 16,
    objectFit: "cover",
    boxShadow: "0 10px 25px rgba(37, 99, 235, 0.18)",
    background: "#eef2ff",
  },

  name: {
    margin: 0,
    fontSize: 16,
    color: "#0f172a",
  },

  role: {
    margin: "5px 0 0",
    color: "#475569",
    fontSize: 13,
  },


  

  metaList: {
    display: "grid",
    gap: 7,
    color: "#64748b",
    fontSize: 13,
  },

  readinessBlock: {
    display: "grid",
    gap: 8,
  },

  readinessTop: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 13,
    color: "#334155",
    fontWeight: 800,
  },

  progressTrack: {
    height: 8,
    background: "#e5e7eb",
    borderRadius: 999,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    background: "#22c55e",
    borderRadius: 999,
  },

  skills: {
    display: "flex",
    gap: 7,
    flexWrap: "wrap",
  },

  actions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },

  viewProfileButton: {
    height: 42,
    border: "1px solid #dbe3ef",
    borderRadius: 13,
    background: "#fff",
    color: "#334155",
    fontWeight: 800,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  editButton: {
    height: 42,
    border: "1px solid #dbe3ef",
    borderRadius: 13,
    background: "#f8fafc",
    color: "#334155",
    fontWeight: 800,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  messageButton: {
    height: 42,
    border: "none",
    borderRadius: 13,
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },

  removeButton: {
    height: 42,
    border: "1px solid #fee2e2",
    borderRadius: 13,
    background: "#fef2f2",
    color: "#dc2626",
    fontWeight: 800,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyState: {
    padding: 60,
    textAlign: "center",
    color: "#64748b",
    fontWeight: 700,
  },

  pagination: {
    marginTop: 24,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },

  pageButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    border: "1px solid #dbe3ef",
    background: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  pageNumber: {
    width: 38,
    height: 38,
    borderRadius: 12,
    border: "1px solid #dbe3ef",
    background: "#fff",
    cursor: "pointer",
    fontWeight: 800,
  },

  activePageNumber: {
    background: "#2563eb",
    color: "#fff",
    borderColor: "#2563eb",
  },

  paginationText: {
    marginLeft: 12,
    color: "#64748b",
    fontSize: 13,
    fontWeight: 700,
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.58)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    zIndex: 5000,
  },

  largeModal: {
    width: "100%",
    maxWidth: 980,
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#fff",
    borderRadius: 28,
  },

  modalHero: {
    padding: 26,
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  modalProfileLeft: {
    display: "flex",
    alignItems: "center",
    gap: 18,
  },

  modalProfileImage: {
    width: 82,
    height: 82,
    borderRadius: 24,
    objectFit: "cover",
    background: "#eef2ff",
  },

  modalTitle: {
    margin: 0,
    color: "#0f172a",
  },

  modalSubtitle: {
    margin: "6px 0 0",
    color: "#64748b",
  },

  readinessBadge: {
    display: "inline-flex",
    marginTop: 8,
    padding: "6px 10px",
    borderRadius: 999,
    background: "#dcfce7",
    color: "#166534",
    fontWeight: 800,
    fontSize: 12,
  },

  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 999,
    border: "none",
    background: "#f1f5f9",
    fontSize: 22,
    cursor: "pointer",
  },

  modalGrid: {
    padding: 24,
    display: "grid",
    gap: 18,
  },

  modalSection: {
    border: "1px solid #e5e7eb",
    borderRadius: 18,
    padding: 18,
    background: "#fff",
  },

  modalTwoColumns: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 18,
  },

  detailGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 14,
  },

  detailItem: {
    display: "flex",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
  },

  detailIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  preBlock: {
    whiteSpace: "pre-wrap",
    margin: 0,
    fontFamily: "inherit",
    color: "#475569",
    lineHeight: 1.7,
  },

  modalFooter: {
    padding: 20,
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    flexWrap: "wrap",
  },

  removeOutlineButton: {
    height: 42,
    border: "1px solid #fee2e2",
    borderRadius: 13,
    background: "#fef2f2",
    color: "#dc2626",
    fontWeight: 800,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    padding: "0 16px",
  },

  formModal: {
    width: "100%",
    maxWidth: 920,
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#fff",
    borderRadius: 28,
  },

  bulkModal: {
    width: "100%",
    maxWidth: 880,
    background: "#fff",
    borderRadius: 28,
  },

  formHeader: {
    padding: 24,
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
  },

  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 999,
    border: "none",
    background: "#f1f5f9",
    cursor: "pointer",
  },

  formBody: {
    padding: 24,
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 14,
  },

  formField: {
    display: "grid",
    gap: 7,
    color: "#334155",
    fontSize: 13,
    fontWeight: 800,
  },

  fullField: {
    gridColumn: "1 / -1",
    display: "grid",
    gap: 7,
    color: "#334155",
    fontSize: 13,
    fontWeight: 800,
  },

  formInput: {
    height: 46,
    border: "1px solid #dbe3ef",
    borderRadius: 14,
    padding: "0 13px",
    outline: "none",
    color: "#0f172a",
    fontWeight: 600,
  },

  formTextarea: {
    minHeight: 110,
    border: "1px solid #dbe3ef",
    borderRadius: 14,
    padding: 13,
    outline: "none",
    color: "#0f172a",
    resize: "vertical",
  },

  formFooter: {
    padding: 20,
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
  },

  cancelButton: {
    height: 42,
    border: "1px solid #dbe3ef",
    borderRadius: 13,
    background: "#fff",
    color: "#334155",
    fontWeight: 800,
    cursor: "pointer",
    padding: "0 16px",
  },

  bulkTextarea: {
    width: "calc(100% - 48px)",
    minHeight: 320,
    margin: 24,
    border: "1px solid #dbe3ef",
    borderRadius: 16,
    padding: 16,
    resize: "vertical",
    outline: "none",
    fontFamily: "monospace",
    lineHeight: 1.6,
  },

  menuWrapper: {
  position: "relative",
},

menuButton: {
  width: 42,
  height: 42,
  borderRadius: 13,
  border: "1px solid #dbe3ef",
  background: "#fff",
  color: "#334155",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
},

dropdownMenu: {
  position: "absolute",
  top: 48,
  right: 0,
  width: 190,
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  overflow: "hidden",
  boxShadow: "0 20px 50px rgba(15,23,42,0.14)",
  zIndex: 30,
},

dropdownItem: {
  width: "100%",
  height: 46,
  border: "none",
  background: "#fff",
  color: "#334155",
  fontWeight: 700,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "0 14px",
},

dropdownDelete: {
  width: "100%",
  height: 46,
  border: "none",
  background: "#fff",
  color: "#dc2626",
  fontWeight: 700,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 10,
  padding: "0 14px",
  borderTop: "1px solid #f1f5f9",
},
  bulkMeta: {
    margin: "0 24px 20px",
    padding: 13,
    borderRadius: 14,
    background: "#eff6ff",
    color: "#1d4ed8",
    fontWeight: 800,
  },
};

export default RecruiterTalent;