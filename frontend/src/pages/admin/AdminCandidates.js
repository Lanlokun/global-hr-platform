import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { useLanguage } from "../../context/LanguageContext";

function AdminCandidates() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [editingCandidate, setEditingCandidate] = useState(null);

  const [summary, setSummary] = useState({
    total: 0,
    withApplications: 0,
    withResume: 0,
    available: 0,
    completeProfiles: 0,
  });

  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchSummary = async () => {
    try {
      const res = await api.get("/api/admin/candidate-stats");

      setSummary({
        total: res.data.total || 0,
        withApplications: res.data.withApplications || 0,
        withResume: res.data.withResume || 0,
        available: res.data.available || 0,
        completeProfiles: res.data.completeProfiles || 0,
      });
    } catch (error) {
      console.error("Failed to fetch candidate summary:", error);
    }
  };

  const fetchCandidates = async () => {
    try {
      setLoading(true);

      const res = await api.get("/api/admin/candidates", {
        params: {
          search,
          country,
          page,
          limit,
        },
      });

      setCandidates(res.data.candidates || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch candidates:", error);
      alert(error.response?.data?.error || t("adminCandidates.errors.fetch"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchCandidates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, country]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchCandidates();
  };

  const handleDeleteCandidate = async (candidateId) => {
    const confirmed = window.confirm(t("adminCandidates.confirm.delete"));

    if (!confirmed) return;

    try {
      await api.delete(`/api/admin/candidates/${candidateId}`);

      await fetchCandidates();
      await fetchSummary();

      setSelectedCandidate(null);
      setEditingCandidate(null);
    } catch (error) {
      console.error("Failed to delete candidate:", error);
      alert(error.response?.data?.error || t("adminCandidates.errors.delete"));
    }
  };

  const handleUpdateCandidate = async (candidateId, payload) => {
    try {
      await api.patch(`/api/admin/candidates/${candidateId}`, payload);

      await fetchCandidates();
      await fetchSummary();

      setEditingCandidate(null);
      setSelectedCandidate(null);
    } catch (error) {
      console.error("Failed to update candidate:", error);
      alert(error.response?.data?.error || t("adminCandidates.errors.update"));
    }
  };

  return (
    <DashboardLayout
      title={t("adminCandidates.title")}
      subtitle={t("adminCandidates.subtitle")}
    >
      <div style={statsGridStyle}>
        <StatCard
          title={t("adminCandidates.stats.total")}
          value={summary.total}
          subtitle={t("adminCandidates.stats.totalSub").replace(
            "{{count}}",
            summary.total
          )}
          color="#0f172a"
        />

        <StatCard
          title={t("adminCandidates.stats.withApplications")}
          value={summary.withApplications}
          subtitle={t("adminCandidates.stats.withApplicationsSub").replace(
            "{{count}}",
            summary.withApplications
          )}
          color="#2563eb"
        />

        <StatCard
          title={t("adminCandidates.stats.withResume")}
          value={summary.withResume}
          subtitle={t("adminCandidates.stats.withResumeSub").replace(
            "{{count}}",
            summary.withResume
          )}
          color="#16a34a"
        />

        <StatCard
          title={t("adminCandidates.stats.completeProfiles")}
          value={summary.completeProfiles}
          subtitle={t("adminCandidates.stats.completeProfilesSub").replace(
            "{{count}}",
            summary.completeProfiles
          )}
          color="#7c3aed"
        />
      </div>

      <Card
        title={t("adminCandidates.directory.title")}
        subtitle={t("adminCandidates.directory.subtitle")}
      >
        <form onSubmit={handleSearch} style={filterBarStyle}>
          <input
            type="text"
            placeholder={t("adminCandidates.directory.searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={inputStyle}
          />

          <select
            value={country}
            onChange={(e) => {
              setCountry(e.target.value);
              setPage(1);
            }}
            style={selectStyle}
          >
            <option value="all">{t("adminCandidates.filters.allCountries")}</option>
            <option value="The Gambia">The Gambia</option>
            <option value="Nigeria">Nigeria</option>
            <option value="Ghana">Ghana</option>
            <option value="Kenya">Kenya</option>
            <option value="Sierra Leone">Sierra Leone</option>
            <option value="China">China</option>
          </select>

          <Button type="submit">{t("adminCandidates.filters.search")}</Button>
        </form>

        <div style={directoryStyle}>
          <div style={tableHeaderStyle}>
            <span>{t("adminCandidates.table.candidate")}</span>
            <span>{t("adminCandidates.table.role")}</span>
            <span>{t("adminCandidates.table.location")}</span>
            <span>{t("adminCandidates.table.experience")}</span>
            <span>{t("adminCandidates.table.applications")}</span>
            <span>{t("adminCandidates.table.actions")}</span>
          </div>

          {loading ? (
            <div style={emptyStyle}>{t("adminCandidates.directory.loading")}</div>
          ) : candidates.length === 0 ? (
            <div style={emptyStyle}>{t("adminCandidates.directory.empty")}</div>
          ) : (
            candidates.map((candidate) => (
              <div
                key={candidate.id}
                style={rowStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f8fafc";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#ffffff";
                }}
              >
                <div style={candidateCellStyle}>
                  <CandidateAvatar candidate={candidate} t={t} />

                  <div style={{ minWidth: 0 }}>
                    <strong style={nameStyle}>
                      {candidate.name || t("adminCandidates.fallback.unnamed")}
                    </strong>

                    <div style={mutedStyle}>
                      {candidate.email || t("adminCandidates.fallback.noEmail")}
                    </div>
                  </div>
                </div>

                <div>
                  <strong style={roleStyle}>
                    {candidate.professional_title ||
                      candidate.desired_job_title ||
                      t("adminCandidates.fallback.notSpecified")}
                  </strong>

                  <div style={mutedStyle}>
                    {candidate.preferred_employment_type ||
                      candidate.preferred_work_mode ||
                      t("adminCandidates.fallback.preferenceNotSet")}
                  </div>
                </div>

                <div style={cellStyle}>
                  {candidate.city && candidate.country
                    ? `${candidate.city}, ${candidate.country}`
                    : candidate.country ||
                      candidate.city ||
                      t("adminCandidates.fallback.notSpecified")}
                </div>

                <div style={cellStyle}>
                  <strong>{candidate.years_of_experience || 0}</strong>
                  <div style={mutedStyle}>
                    {t("adminCandidates.fallback.years")}
                  </div>
                </div>

                <div style={cellStyle}>
                  <strong>{candidate.application_count || 0}</strong>
                  <div style={mutedStyle}>
                    {t("adminCandidates.table.applications")}
                  </div>
                </div>

                <div style={actionGroupStyle}>
                  {candidate.resume_url && (
                    <a
                      href={normalizeUrl(candidate.resume_url)}
                      target="_blank"
                      rel="noreferrer"
                      style={smallPrimaryLinkStyle}
                    >
                      {t("adminCandidates.actions.resume")}
                    </a>
                  )}

                  <button
                    type="button"
                    style={detailsButtonStyle}
                    onClick={() => setSelectedCandidate(candidate)}
                  >
                    {t("adminCandidates.actions.viewDetails")}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div style={paginationStyle}>
          <Button
            variant="secondary"
            disabled={page <= 1}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          >
            {t("adminCandidates.actions.previous")}
          </Button>

          <span style={pageTextStyle}>
            {t("adminCandidates.actions.page")
              .replace("{{page}}", page)
              .replace("{{total}}", totalPages)}
          </span>

          <Button
            variant="secondary"
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          >
            {t("adminCandidates.actions.next")}
          </Button>
        </div>
      </Card>

      {selectedCandidate && (
        <CandidateDetailsModal
          candidate={selectedCandidate}
          t={t}
          onClose={() => setSelectedCandidate(null)}
          onEdit={() => {
            setEditingCandidate(selectedCandidate);
            setSelectedCandidate(null);
          }}
          onDelete={() => handleDeleteCandidate(selectedCandidate.id)}
          onViewApplications={() => {
            setSelectedCandidate(null);
            navigate(`/admin/applications?candidate=${selectedCandidate.id}`);
          }}
        />
      )}

      {editingCandidate && (
        <CandidateEditModal
          candidate={editingCandidate}
          t={t}
          onClose={() => setEditingCandidate(null)}
          onSave={(payload) => handleUpdateCandidate(editingCandidate.id, payload)}
        />
      )}
    </DashboardLayout>
  );
}

function CandidateDetailsModal({
  candidate,
  t,
  onClose,
  onEdit,
  onDelete,
  onViewApplications,
}) {
  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <div style={candidateCellStyle}>
            <CandidateAvatar candidate={candidate} t={t} />

            <div>
              <h2 style={modalTitleStyle}>
                {candidate.name || t("adminCandidates.fallback.unnamed")}
              </h2>

              <p style={modalSubtitleStyle}>
                {candidate.professional_title ||
                  candidate.desired_job_title ||
                  t("adminCandidates.modal.profile")}{" "}
                · {candidate.country || t("adminCandidates.fallback.noLocation")}
              </p>
            </div>
          </div>

          <button type="button" onClick={onClose} style={closeButtonStyle}>
            ×
          </button>
        </div>

        <div style={modalGridStyle}>
          <DetailItem label={t("adminCandidates.details.id")} value={candidate.id} />
          <DetailItem
            label={t("adminCandidates.details.email")}
            value={candidate.email || t("adminCandidates.fallback.na")}
          />
          <DetailItem
            label={t("adminCandidates.details.phone")}
            value={candidate.phone || t("adminCandidates.fallback.na")}
          />
          <DetailItem
            label={t("adminCandidates.details.country")}
            value={candidate.country || t("adminCandidates.fallback.na")}
          />
          <DetailItem
            label={t("adminCandidates.details.city")}
            value={candidate.city || t("adminCandidates.fallback.na")}
          />
          <DetailItem
            label={t("adminCandidates.details.address")}
            value={candidate.address || t("adminCandidates.fallback.na")}
          />
          <DetailItem
            label={t("adminCandidates.details.gender")}
            value={candidate.gender || t("adminCandidates.fallback.na")}
          />
          <DetailItem
            label={t("adminCandidates.details.dob")}
            value={formatDate(candidate.date_of_birth)}
          />
          <DetailItem
            label={t("adminCandidates.details.title")}
            value={candidate.professional_title || t("adminCandidates.fallback.na")}
          />
          <DetailItem
            label={t("adminCandidates.details.desiredRole")}
            value={candidate.desired_job_title || t("adminCandidates.fallback.na")}
          />
          <DetailItem
            label={t("adminCandidates.details.experience")}
            value={`${candidate.years_of_experience || 0} ${t(
              "adminCandidates.fallback.years"
            )}`}
          />
          <DetailItem
            label={t("adminCandidates.details.applications")}
            value={candidate.application_count || 0}
          />
          <DetailItem
            label={t("adminCandidates.details.employmentType")}
            value={
              candidate.preferred_employment_type ||
              t("adminCandidates.fallback.na")
            }
          />
          <DetailItem
            label={t("adminCandidates.details.workMode")}
            value={candidate.preferred_work_mode || t("adminCandidates.fallback.na")}
          />
          <DetailItem
            label={t("adminCandidates.details.salary")}
            value={formatSalary(candidate, t)}
          />
          <DetailItem
            label={t("adminCandidates.details.availability")}
            value={candidate.availability || t("adminCandidates.fallback.na")}
          />
          <DetailItem
            label={t("adminCandidates.details.notice")}
            value={candidate.notice_period || t("adminCandidates.fallback.na")}
          />
          <DetailItem
            label={t("adminCandidates.details.authorization")}
            value={candidate.work_authorization || t("adminCandidates.fallback.na")}
          />
          <DetailItem
            label={t("adminCandidates.details.relocation")}
            value={
              candidate.willing_to_relocate
                ? t("adminCandidates.fallback.willing")
                : t("adminCandidates.fallback.notSpecified")
            }
          />
          <DetailItem
            label={t("adminCandidates.details.joined")}
            value={formatDate(candidate.created_at)}
          />
        </div>

        <div style={descriptionBoxStyle}>
          <h3 style={sectionTitleStyle}>{t("adminCandidates.modal.summary")}</h3>
          <p style={descriptionTextStyle}>
            {candidate.professional_summary ||
              t("adminCandidates.fallback.noSummary")}
          </p>
        </div>

        <div style={twoColumnBoxStyle}>
          <InfoBlock
            title={t("adminCandidates.modal.skills")}
            value={candidate.skills}
            t={t}
          />
          <InfoBlock
            title={t("adminCandidates.modal.languages")}
            value={candidate.languages}
            t={t}
          />
        </div>

        <div style={modalFooterStyle}>
          <Button variant="secondary" onClick={onViewApplications}>
            {t("adminCandidates.actions.viewApplications")}
          </Button>

          <button type="button" style={editButtonStyle} onClick={onEdit}>
            {t("adminCandidates.actions.edit")}
          </button>

          {candidate.resume_url && (
            <a
              href={normalizeUrl(candidate.resume_url)}
              target="_blank"
              rel="noreferrer"
              style={modalLinkButtonStyle}
            >
              {t("adminCandidates.actions.resume")}
            </a>
          )}

          {candidate.linkedin_url && (
            <a
              href={normalizeUrl(candidate.linkedin_url)}
              target="_blank"
              rel="noreferrer"
              style={modalLinkButtonStyle}
            >
              LinkedIn
            </a>
          )}

          {candidate.github_url && (
            <a
              href={normalizeUrl(candidate.github_url)}
              target="_blank"
              rel="noreferrer"
              style={modalLinkButtonStyle}
            >
              GitHub
            </a>
          )}

          {candidate.portfolio_url && (
            <a
              href={normalizeUrl(candidate.portfolio_url)}
              target="_blank"
              rel="noreferrer"
              style={modalLinkButtonStyle}
            >
              Portfolio
            </a>
          )}

          <button type="button" style={deleteButtonStyle} onClick={onDelete}>
            {t("adminCandidates.actions.delete")}
          </button>

          <Button variant="secondary" onClick={onClose}>
            {t("adminCandidates.actions.close")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function CandidateEditModal({ candidate, t, onClose, onSave }) {
  const [form, setForm] = useState({
    name: candidate.name || "",
    email: candidate.email || "",
    country: candidate.country || "",
    phone: candidate.phone || "",
    city: candidate.city || "",
    address: candidate.address || "",
    date_of_birth: candidate.date_of_birth
      ? String(candidate.date_of_birth).slice(0, 10)
      : "",
    gender: candidate.gender || "",
    profile_image: candidate.profile_image || "",

    professional_title: candidate.professional_title || "",
    years_of_experience: candidate.years_of_experience || 0,
    professional_summary: candidate.professional_summary || "",
    skills: candidate.skills || "",
    languages: candidate.languages || "",

    desired_job_title: candidate.desired_job_title || "",
    preferred_employment_type: candidate.preferred_employment_type || "",
    preferred_work_mode: candidate.preferred_work_mode || "",
    expected_salary: candidate.expected_salary || "",
    salary_currency: candidate.salary_currency || "USD",
    notice_period: candidate.notice_period || "",
    availability: candidate.availability || "",
    work_authorization: candidate.work_authorization || "",
    willing_to_relocate: Boolean(candidate.willing_to_relocate),

    linkedin_url: candidate.linkedin_url || "",
    github_url: candidate.github_url || "",
    portfolio_url: candidate.portfolio_url || "",
    resume_url: candidate.resume_url || "",
  });

  const updateField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const submit = (e) => {
    e.preventDefault();

    onSave({
      ...form,
      years_of_experience: Number(form.years_of_experience || 0),
      expected_salary: form.expected_salary ? Number(form.expected_salary) : null,
      date_of_birth: form.date_of_birth || null,
    });
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <form
        style={editModalStyle}
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
      >
        <div style={modalHeaderStyle}>
          <div>
            <h2 style={modalTitleStyle}>{t("adminCandidates.modal.editTitle")}</h2>
            <p style={modalSubtitleStyle}>
              {t("adminCandidates.modal.editSubtitle")}
            </p>
          </div>

          <button type="button" onClick={onClose} style={closeButtonStyle}>
            ×
          </button>
        </div>

        <div style={editBodyStyle}>
          <SectionTitle title={t("adminCandidates.form.basicInfo")} />

          <div style={formGridStyle}>
            <FormInput label={t("adminCandidates.form.name")} value={form.name} onChange={(v) => updateField("name", v)} />
            <FormInput label={t("adminCandidates.form.email")} value={form.email} onChange={(v) => updateField("email", v)} />
            <FormInput label={t("adminCandidates.form.phone")} value={form.phone} onChange={(v) => updateField("phone", v)} />
            <FormInput label={t("adminCandidates.form.country")} value={form.country} onChange={(v) => updateField("country", v)} />
            <FormInput label={t("adminCandidates.form.city")} value={form.city} onChange={(v) => updateField("city", v)} />
            <FormInput label={t("adminCandidates.form.address")} value={form.address} onChange={(v) => updateField("address", v)} />
            <FormInput type="date" label={t("adminCandidates.form.dob")} value={form.date_of_birth} onChange={(v) => updateField("date_of_birth", v)} />

            <FormSelect
              label={t("adminCandidates.form.gender")}
              value={form.gender}
              onChange={(v) => updateField("gender", v)}
              options={[
                { value: "", label: t("adminCandidates.form.select") },
                { value: "Male", label: t("male") },
                { value: "Female", label: t("female") },
                { value: "Other", label: t("other") },
                { value: "Prefer not to say", label: t("preferNotToSay") },
              ]}
            />

            <FormInput label={t("adminCandidates.form.profileImage")} value={form.profile_image} onChange={(v) => updateField("profile_image", v)} />
          </div>

          <SectionTitle title={t("adminCandidates.form.professionalProfile")} />

          <div style={formGridStyle}>
            <FormInput label={t("adminCandidates.form.professionalTitle")} value={form.professional_title} onChange={(v) => updateField("professional_title", v)} />
            <FormInput label={t("adminCandidates.form.desiredJobTitle")} value={form.desired_job_title} onChange={(v) => updateField("desired_job_title", v)} />
            <FormInput type="number" label={t("adminCandidates.form.yearsExperience")} value={form.years_of_experience} onChange={(v) => updateField("years_of_experience", v)} />
            <FormInput label={t("adminCandidates.form.skills")} value={form.skills} onChange={(v) => updateField("skills", v)} />
            <FormInput label={t("adminCandidates.form.languages")} value={form.languages} onChange={(v) => updateField("languages", v)} />
            <FormTextarea label={t("adminCandidates.form.professionalSummary")} value={form.professional_summary} onChange={(v) => updateField("professional_summary", v)} />
          </div>

          <SectionTitle title={t("adminCandidates.form.jobPreferences")} />

          <div style={formGridStyle}>
            <FormSelect
              label={t("adminCandidates.form.employmentType")}
              value={form.preferred_employment_type}
              onChange={(v) => updateField("preferred_employment_type", v)}
              options={[
                { value: "", label: t("adminCandidates.form.select") },
                { value: "Full-time", label: t("fullTime") },
                { value: "Part-time", label: t("partTime") },
                { value: "Contract", label: t("contract") },
                { value: "Internship", label: t("internship") },
                { value: "Remote", label: t("remote") },
              ]}
            />

            <FormSelect
              label={t("adminCandidates.form.workMode")}
              value={form.preferred_work_mode}
              onChange={(v) => updateField("preferred_work_mode", v)}
              options={[
                { value: "", label: t("adminCandidates.form.select") },
                { value: "On-site", label: t("onSite") },
                { value: "Remote", label: t("remote") },
                { value: "Hybrid", label: t("hybrid") },
              ]}
            />

            <FormInput type="number" label={t("adminCandidates.form.expectedSalary")} value={form.expected_salary} onChange={(v) => updateField("expected_salary", v)} />
            <FormInput label={t("adminCandidates.form.currency")} value={form.salary_currency} onChange={(v) => updateField("salary_currency", v)} />
            <FormInput label={t("adminCandidates.form.noticePeriod")} value={form.notice_period} onChange={(v) => updateField("notice_period", v)} />
            <FormInput label={t("adminCandidates.form.availability")} value={form.availability} onChange={(v) => updateField("availability", v)} />
            <FormInput label={t("adminCandidates.form.workAuthorization")} value={form.work_authorization} onChange={(v) => updateField("work_authorization", v)} />

            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={form.willing_to_relocate}
                onChange={(e) =>
                  updateField("willing_to_relocate", e.target.checked)
                }
              />
              {t("adminCandidates.form.willingToRelocate")}
            </label>
          </div>

          <SectionTitle title={t("adminCandidates.form.links")} />

          <div style={formGridStyle}>
            <FormInput label={t("adminCandidates.form.linkedin")} value={form.linkedin_url} onChange={(v) => updateField("linkedin_url", v)} />
            <FormInput label={t("adminCandidates.form.github")} value={form.github_url} onChange={(v) => updateField("github_url", v)} />
            <FormInput label={t("adminCandidates.form.portfolio")} value={form.portfolio_url} onChange={(v) => updateField("portfolio_url", v)} />
            <FormInput label={t("adminCandidates.form.resume")} value={form.resume_url} onChange={(v) => updateField("resume_url", v)} />
          </div>
        </div>

        <div style={modalFooterStyle}>
          <Button variant="secondary" type="button" onClick={onClose}>
            {t("adminCandidates.actions.cancel")}
          </Button>

          <button type="submit" style={saveButtonStyle}>
            {t("adminCandidates.actions.save")}
          </button>
        </div>
      </form>
    </div>
  );
}

function FormInput({ label, value, onChange, type = "text" }) {
  return (
    <label style={fieldStyle}>
      <span style={fieldLabelStyle}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={fieldInputStyle}
      />
    </label>
  );
}

function FormTextarea({ label, value, onChange }) {
  return (
    <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
      <span style={fieldLabelStyle}>{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        style={fieldTextareaStyle}
      />
    </label>
  );
}

function FormSelect({ label, value, onChange, options }) {
  return (
    <label style={fieldStyle}>
      <span style={fieldLabelStyle}>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={fieldInputStyle}
      >
        {options.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function SectionTitle({ title }) {
  return <h3 style={editSectionTitleStyle}>{title}</h3>;
}

function CandidateAvatar({ candidate, t }) {
  const imageSrc =
    candidate.profile_image && candidate.profile_image.startsWith("/")
      ? candidate.profile_image
      : "/images/avatar.jpg";

  return (
    <div style={avatarWrapStyle}>
      <img
        src={imageSrc}
        alt={candidate.name || t("adminCandidates.fallback.candidate")}
        style={avatarImageStyle}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = "/images/avatar.jpg";
        }}
      />
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div style={detailItemStyle}>
      <span style={detailLabelStyle}>{label}</span>
      <strong style={detailValueStyle}>{value}</strong>
    </div>
  );
}

function InfoBlock({ title, value, t }) {
  return (
    <div style={descriptionBoxStyle}>
      <h3 style={sectionTitleStyle}>{title}</h3>
      <p style={descriptionTextStyle}>
        {value || t("adminCandidates.fallback.notSpecified")}
      </p>
    </div>
  );
}

function StatCard({ title, value, subtitle, color }) {
  return (
    <Card title={title} subtitle={subtitle}>
      <div style={{ fontSize: "34px", fontWeight: 900, color }}>{value}</div>
    </Card>
  );
}

function normalizeUrl(url) {
  if (!url) return "#";
  return url.startsWith("http") ? url : `https://${url}`;
}

function formatDate(date) {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatSalary(candidate, t) {
  if (!candidate.expected_salary) return t("adminCandidates.fallback.na");

  return `${candidate.salary_currency || "USD"} ${Number(
    candidate.expected_salary
  ).toLocaleString()}`;
}

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "20px",
  marginBottom: "24px",
};

const filterBarStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 180px auto",
  gap: "12px",
  marginBottom: "22px",
  alignItems: "center",
};

const inputStyle = {
  width: "100%",
  padding: "13px 15px",
  border: "1px solid #dbe3ef",
  borderRadius: "14px",
  fontSize: "14px",
  outline: "none",
  background: "#ffffff",
};

const selectStyle = {
  padding: "13px 15px",
  border: "1px solid #dbe3ef",
  borderRadius: "14px",
  fontSize: "14px",
  outline: "none",
  background: "#ffffff",
};

const directoryStyle = {
  border: "1px solid #e2e8f0",
  borderRadius: "18px",
  overflow: "hidden",
  background: "#ffffff",
};

const tableHeaderStyle = {
  display: "grid",
  gridTemplateColumns: "1.6fr 1.3fr 1.1fr 0.8fr 0.8fr 1.2fr",
  gap: "14px",
  padding: "15px 18px",
  background: "#f8fafc",
  borderBottom: "1px solid #e2e8f0",
  fontSize: "12px",
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  color: "#64748b",
};

const rowStyle = {
  display: "grid",
  gridTemplateColumns: "1.6fr 1.3fr 1.1fr 0.8fr 0.8fr 1.2fr",
  gap: "14px",
  padding: "16px 18px",
  borderBottom: "1px solid #f1f5f9",
  alignItems: "center",
  background: "#ffffff",
  transition: "background 0.2s ease",
};

const candidateCellStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  minWidth: 0,
};

const avatarWrapStyle = {
  width: "44px",
  height: "44px",
  minWidth: "44px",
  maxWidth: "44px",
  borderRadius: "14px",
  overflow: "hidden",
  border: "1px solid #e2e8f0",
  background: "#f8fafc",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const avatarImageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  objectPosition: "center",
  display: "block",
};

const avatarFallbackStyle = {
  width: "42px",
  height: "42px",
  borderRadius: "14px",
  background: "#eff6ff",
  color: "#2563eb",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 900,
  fontSize: "13px",
};

const nameStyle = {
  color: "#0f172a",
  fontSize: "15px",
  fontWeight: 900,
  display: "block",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const mutedStyle = {
  marginTop: "3px",
  fontSize: "12px",
  color: "#94a3b8",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};
const roleStyle = {
  color: "#0f172a",
  fontSize: "14px",
  fontWeight: 900,
  display: "block",
};



const cellStyle = {
  fontSize: "14px",
  color: "#334155",
};

const actionGroupStyle = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  alignItems: "center",
};

const smallPrimaryLinkStyle = {
  padding: "8px 14px",
  borderRadius: "999px",
  background: "#2563eb",
  color: "#ffffff",
  fontWeight: 800,
  fontSize: "12px",
  textDecoration: "none",
};

const detailsButtonStyle = {
  padding: "8px 14px",
  borderRadius: "999px",
  border: "1px solid #dbe3ef",
  background: "#ffffff",
  color: "#0f172a",
  fontWeight: 800,
  cursor: "pointer",
  fontSize: "12px",
};

const paginationStyle = {
  marginTop: "20px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const pageTextStyle = {
  fontSize: "14px",
  fontWeight: 800,
  color: "#475569",
};

const emptyStyle = {
  padding: "42px",
  textAlign: "center",
  color: "#64748b",
  fontSize: "14px",
};

const modalOverlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.55)",
  zIndex: 5000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
};

const modalStyle = {
  width: "100%",
  maxWidth: "920px",
  maxHeight: "90vh",
  overflowY: "auto",
  background: "#ffffff",
  borderRadius: "24px",
  boxShadow: "0 30px 80px rgba(15, 23, 42, 0.35)",
};

const editModalStyle = {
  width: "100%",
  maxWidth: "980px",
  maxHeight: "92vh",
  overflowY: "auto",
  background: "#ffffff",
  borderRadius: "24px",
  boxShadow: "0 30px 80px rgba(15, 23, 42, 0.35)",
};

const modalHeaderStyle = {
  padding: "24px",
  borderBottom: "1px solid #e2e8f0",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "16px",
};

const modalTitleStyle = {
  margin: 0,
  fontSize: "22px",
  fontWeight: 900,
  color: "#0f172a",
};

const modalSubtitleStyle = {
  margin: "4px 0 0",
  fontSize: "14px",
  color: "#64748b",
};

const closeButtonStyle = {
  width: "34px",
  height: "34px",
  borderRadius: "999px",
  border: "1px solid #e2e8f0",
  background: "#f8fafc",
  color: "#0f172a",
  fontSize: "22px",
  cursor: "pointer",
  lineHeight: 1,
};

const modalGridStyle = {
  padding: "24px",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "14px",
};

const detailItemStyle = {
  padding: "14px",
  border: "1px solid #e2e8f0",
  borderRadius: "16px",
  background: "#f8fafc",
};

const detailLabelStyle = {
  display: "block",
  fontSize: "12px",
  fontWeight: 800,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  marginBottom: "6px",
};

const detailValueStyle = {
  fontSize: "14px",
  color: "#0f172a",
};

const descriptionBoxStyle = {
  margin: "0 24px 24px",
  padding: "18px",
  borderRadius: "18px",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
};

const twoColumnBoxStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: "0",
};

const sectionTitleStyle = {
  margin: "0 0 8px",
  fontSize: "15px",
  fontWeight: 900,
  color: "#0f172a",
};

const descriptionTextStyle = {
  margin: 0,
  color: "#475569",
  fontSize: "14px",
  lineHeight: 1.7,
};

const modalFooterStyle = {
  padding: "18px 24px",
  borderTop: "1px solid #e2e8f0",
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
  flexWrap: "wrap",
};

const modalLinkButtonStyle = {
  padding: "10px 14px",
  borderRadius: "10px",
  background: "#2563eb",
  color: "#ffffff",
  textDecoration: "none",
  fontWeight: 800,
  fontSize: "14px",
};

const editButtonStyle = {
  padding: "10px 14px",
  borderRadius: "10px",
  border: "none",
  background: "#0f172a",
  color: "#ffffff",
  fontWeight: 800,
  cursor: "pointer",
};

const deleteButtonStyle = {
  padding: "10px 14px",
  borderRadius: "10px",
  border: "none",
  background: "#dc2626",
  color: "#ffffff",
  fontWeight: 800,
  cursor: "pointer",
};

const saveButtonStyle = {
  padding: "10px 14px",
  borderRadius: "10px",
  border: "none",
  background: "#16a34a",
  color: "#ffffff",
  fontWeight: 800,
  cursor: "pointer",
};

const editBodyStyle = {
  padding: "24px",
};

const editSectionTitleStyle = {
  margin: "22px 0 14px",
  fontSize: "15px",
  fontWeight: 900,
  color: "#0f172a",
};

const formGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "14px",
};

const fieldStyle = {
  display: "grid",
  gap: "6px",
};

const fieldLabelStyle = {
  fontSize: "12px",
  fontWeight: 800,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const fieldInputStyle = {
  padding: "11px 12px",
  border: "1px solid #dbe3ef",
  borderRadius: "12px",
  fontSize: "14px",
  outline: "none",
};

const fieldTextareaStyle = {
  padding: "11px 12px",
  border: "1px solid #dbe3ef",
  borderRadius: "12px",
  fontSize: "14px",
  outline: "none",
  resize: "vertical",
};

const checkboxLabelStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontSize: "14px",
  color: "#334155",
  fontWeight: 700,
};

export default AdminCandidates;