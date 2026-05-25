import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { useLanguage } from "../../context/LanguageContext";

function AdminRecruiters() {
  const { t } = useLanguage();

  const [recruiters, setRecruiters] = useState([]);
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);
  const [editingRecruiter, setEditingRecruiter] = useState(null);
  const [details, setDetails] = useState(null);

  const [assigningRecruiter, setAssigningRecruiter] = useState(null);
  const [candidateSearch, setCandidateSearch] = useState("");
  const [candidateOptions, setCandidateOptions] = useState([]);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState([]);
  const [assignmentNotes, setAssignmentNotes] = useState("");
  const [assignmentLoading, setAssignmentLoading] = useState(false);

  const [confirmAction, setConfirmAction] = useState(null);

  const [summary, setSummary] = useState({
    recruiters: 0,
    activeRecruiters: 0,
    totalRecommendations: 0,
    acceptedRecommendations: 0,
    assignedTalent: 0,
  });

  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const tr = (key, fallback) => t(key) || fallback;

  const withCount = (key, count, fallback) =>
    tr(key, fallback).replace("{{count}}", count);

  const fetchSummary = async () => {
    try {
      const res = await api.get("/api/admin/recruiter-stats");

      setSummary({
        recruiters: res.data.recruiters || 0,
        activeRecruiters: res.data.activeRecruiters || 0,
        totalRecommendations: res.data.totalRecommendations || 0,
        acceptedRecommendations: res.data.acceptedRecommendations || 0,
        assignedTalent: res.data.assignedTalent || 0,
      });
    } catch (error) {
      console.error("Failed to fetch recruiter summary:", error);
    }
  };

  const fetchRecruiters = async () => {
    try {
      setLoading(true);

      const res = await api.get("/api/admin/recruiters", {
        params: { search, country, page, limit },
      });

      setRecruiters(res.data.recruiters || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
          tr("adminRecruiters.errors.fetch", "Failed to fetch recruiters")
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchRecruiterDetails = async (recruiter) => {
    try {
      setSelectedRecruiter(recruiter);
      setDetails(null);
      setDetailsLoading(true);

      const res = await api.get(
        `/api/admin/recruiters/${recruiter.recruiter_id}`
      );

      setDetails(res.data);
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
          tr("adminRecruiters.errors.details", "Failed to fetch recruiter details")
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const fetchCandidateOptions = async (searchValue = "") => {
    try {
      const res = await api.get("/api/admin/candidates", {
        params: {
          search: searchValue,
          country: "all",
          page: 1,
          limit: 50,
        },
      });

      setCandidateOptions(res.data.candidates || []);
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
          tr("adminRecruiters.assign.errors.fetchCandidates", "Failed to load candidates")
      );
    }
  };

  const openAssignModal = async (recruiter) => {
    setAssigningRecruiter(recruiter);
    setCandidateSearch("");
    setCandidateOptions([]);
    setSelectedCandidateIds([]);
    setAssignmentNotes("");

    await fetchCandidateOptions("");
  };

  const toggleCandidateSelection = (candidateId) => {
    setSelectedCandidateIds((prev) =>
      prev.includes(candidateId)
        ? prev.filter((id) => id !== candidateId)
        : [...prev, candidateId]
    );
  };

  const assignCandidatesToRecruiter = async () => {
    if (!assigningRecruiter || selectedCandidateIds.length === 0) {
      toast.error(
        tr(
          "adminRecruiters.assign.errors.selectCandidate",
          "Please select at least one candidate"
        )
      );
      return;
    }

    try {
      setAssignmentLoading(true);

      await api.post(
        `/api/admin/recruiters/${assigningRecruiter.recruiter_id}/assign-candidates`,
        {
          candidate_ids: selectedCandidateIds,
          notes: assignmentNotes,
        }
      );

      toast.success(
        tr("adminRecruiters.assign.success", "Candidates assigned successfully")
      );

      await fetchRecruiters();
      await fetchSummary();

      setAssigningRecruiter(null);
      setSelectedCandidateIds([]);
      setAssignmentNotes("");
      setCandidateSearch("");
      setCandidateOptions([]);
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
          tr("adminRecruiters.assign.errors.assign", "Failed to assign candidates")
      );
    } finally {
      setAssignmentLoading(false);
    }
  };

  const updateRecruiter = async (recruiterId, payload) => {
    try {
      setSaving(true);

      await api.patch(`/api/admin/recruiters/${recruiterId}`, payload);

      toast.success(
        tr("adminRecruiters.actions.updateSuccess", "Recruiter updated successfully")
      );

      await fetchRecruiters();
      await fetchSummary();

      setEditingRecruiter(null);
      setSelectedRecruiter(null);
      setDetails(null);
    } catch (error) {
      toast.error(
        error.response?.data?.error ||
          tr("adminRecruiters.actions.updateError", "Failed to update recruiter")
      );
    } finally {
      setSaving(false);
    }
  };

    const updateRecruiterStatus = async (recruiter, action) => {
    try {
        await api.patch(`/api/admin/recruiters/${recruiter.recruiter_id}/status`, {
        action,
        });

        toast.success(
        action === "activate"
            ? tr("adminRecruiters.actions.activateSuccess", "Recruiter activated")
            : tr("adminRecruiters.actions.suspendSuccess", "Recruiter suspended")
        );

        await fetchRecruiters();
        await fetchSummary();

        setSelectedRecruiter(null);
        setDetails(null);
        setConfirmAction(null);
    } catch (error) {
        toast.error(
        error.response?.data?.error ||
            tr(
            "adminRecruiters.actions.statusError",
            "Failed to update recruiter status"
            )
        );
    }
    };

const deleteRecruiter = async (recruiter) => {
  try {
    await api.delete(`/api/admin/recruiters/${recruiter.recruiter_id}`);

    toast.success(
      tr(
        "adminRecruiters.actions.deleteSuccess",
        "Recruiter deleted successfully"
      )
    );

    await fetchRecruiters();
    await fetchSummary();

    setSelectedRecruiter(null);
    setDetails(null);
    setConfirmAction(null);
  } catch (error) {
    toast.error(
      error.response?.data?.error ||
        tr("adminRecruiters.actions.deleteError", "Failed to delete recruiter")
    );
  }
};

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchRecruiters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, country]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRecruiters();
  };

  return (
    <DashboardLayout
      title={tr("adminRecruiters.title", "Recruiter Management")}
      subtitle={tr(
        "adminRecruiters.subtitle",
        "Monitor recruiter performance, assigned talent, and recommendation quality."
      )}
    >
      <div style={statsGridStyle}>
        <StatCard
          title={tr("adminRecruiters.stats.recruiters", "Recruiters")}
          value={summary.recruiters}
          subtitle={withCount(
            "adminRecruiters.stats.recruitersSub",
            summary.recruiters,
            "{{count}} recruiter accounts"
          )}
          color="#0f172a"
        />
        <StatCard
          title={tr("adminRecruiters.stats.available", "Available")}
          value={summary.activeRecruiters}
          subtitle={withCount(
            "adminRecruiters.stats.availableSub",
            summary.activeRecruiters,
            "{{count}} currently available"
          )}
          color="#2563eb"
        />
        <StatCard
          title={tr("adminRecruiters.stats.assignedTalent", "Assigned Talent")}
          value={summary.assignedTalent}
          subtitle={withCount(
            "adminRecruiters.stats.assignedTalentSub",
            summary.assignedTalent,
            "{{count}} talent assignments"
          )}
          color="#16a34a"
        />
        <StatCard
          title={tr("adminRecruiters.stats.recommendations", "Recommendations")}
          value={summary.totalRecommendations}
          subtitle={withCount(
            "adminRecruiters.stats.recommendationsSub",
            summary.totalRecommendations,
            "{{count}} submitted recommendations"
          )}
          color="#7c3aed"
        />
        <StatCard
          title={tr("adminRecruiters.stats.accepted", "Accepted")}
          value={summary.acceptedRecommendations}
          subtitle={withCount(
            "adminRecruiters.stats.acceptedSub",
            summary.acceptedRecommendations,
            "{{count}} accepted by employers"
          )}
          color="#ea580c"
        />
      </div>

      <Card
        title={tr("adminRecruiters.directory.title", "Recruiter Directory")}
        subtitle={tr(
          "adminRecruiters.directory.subtitle",
          "Review recruiter activity, performance, and recent assignments."
        )}
      >
        <form onSubmit={handleSearch} style={filterBarStyle}>
          <input
            type="text"
            placeholder={tr(
              "adminRecruiters.directory.searchPlaceholder",
              "Search recruiters by name, email, country, city, or title"
            )}
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
            <option value="all">
              {tr("adminRecruiters.filters.allCountries", "All countries")}
            </option>
            <option value="The Gambia">The Gambia</option>
            <option value="Nigeria">Nigeria</option>
            <option value="Ghana">Ghana</option>
            <option value="Kenya">Kenya</option>
            <option value="South Africa">South Africa</option>
            <option value="China">China</option>
          </select>

          <Button type="submit">
            {tr("adminRecruiters.filters.search", "Search")}
          </Button>
        </form>

        <div style={directoryStyle}>
          <div style={tableHeaderStyle}>
            <span>{tr("adminRecruiters.table.recruiter", "Recruiter")}</span>
            <span>{tr("adminRecruiters.table.location", "Location")}</span>
            <span>{tr("adminRecruiters.table.talent", "Talent")}</span>
            <span>{tr("adminRecruiters.table.recommendations", "Recommendations")}</span>
            <span>{tr("adminRecruiters.table.avgMatch", "Avg Match")}</span>
            <span>{tr("adminRecruiters.table.success", "Success")}</span>
            <span>{tr("adminRecruiters.table.status", "Status")}</span>
            <span>{tr("adminRecruiters.table.actions", "Actions")}</span>
          </div>

          {loading ? (
            <div style={emptyStyle}>
              {tr("adminRecruiters.directory.loading", "Loading recruiters...")}
            </div>
          ) : recruiters.length === 0 ? (
            <div style={emptyStyle}>
              {tr("adminRecruiters.directory.empty", "No recruiters found.")}
            </div>
          ) : (
            recruiters.map((recruiter) => (
              <div key={recruiter.recruiter_id} style={rowStyle}>
                <div style={recruiterCellStyle}>
                  <RecruiterAvatar recruiter={recruiter} />

                  <div style={{ minWidth: 0 }}>
                    <strong style={nameStyle}>
                      {recruiter.name ||
                        tr("adminRecruiters.fallback.unnamed", "Unnamed recruiter")}
                    </strong>
                    <div style={mutedStyle}>{recruiter.email}</div>
                    <div style={mutedStyle}>
                      {recruiter.professional_title ||
                        tr("adminRecruiters.fallback.recruiter", "Recruiter")}
                    </div>
                  </div>
                </div>

                <div style={cellStyle}>
                  {recruiter.city && recruiter.country
                    ? `${recruiter.city}, ${recruiter.country}`
                    : recruiter.country ||
                      recruiter.city ||
                      tr("adminRecruiters.fallback.notSpecified", "Not specified")}
                </div>

                <div style={cellStyle}>
                  <strong>{recruiter.assigned_talent || 0}</strong>
                </div>

                <div style={cellStyle}>
                  <strong>{recruiter.recommendations || 0}</strong>
                </div>

                <div style={cellStyle}>
                  <strong>{Number(recruiter.avg_match_score || 0)}%</strong>
                </div>

                <div style={cellStyle}>
                  <span style={successPillStyle}>
                    {getSuccessRate(recruiter)}%
                  </span>
                </div>

                <div style={cellStyle}>
                  <span
                    style={
                      recruiter.availability_status === "suspended"
                        ? dangerPillStyle
                        : statusPillStyle
                    }
                  >
                    {recruiter.availability_status || "available"}
                  </span>
                </div>

                <div style={actionGroupStyle}>
                  <button
                    type="button"
                    style={detailsButtonStyle}
                    onClick={() => fetchRecruiterDetails(recruiter)}
                  >
                    {tr("adminRecruiters.actions.viewDetails", "View")}
                  </button>

                  <button
                    type="button"
                    style={editButtonStyle}
                    onClick={() => setEditingRecruiter(recruiter)}
                  >
                    {tr("adminRecruiters.actions.edit", "Edit")}
                  </button>

                  <button
                    type="button"
                    style={assignButtonStyle}
                    onClick={() => openAssignModal(recruiter)}
                  >
                    {tr("adminRecruiters.actions.assignTalent", "Assign")}
                  </button>

                  {recruiter.availability_status === "suspended" ? (
                    <button
                      type="button"
                      style={activateButtonStyle}
                        onClick={() =>
                        setConfirmAction({
                            type: "activate",
                            recruiter,
                        })
                        }                    >
                      {tr("adminRecruiters.actions.activate", "Activate")}
                    </button>
                  ) : (
                    <button
                      type="button"
                      style={suspendButtonStyle}
                        onClick={() =>
                        setConfirmAction({
                            type: "suspend",
                            recruiter,
                        })
                        }                    >
                      {tr("adminRecruiters.actions.suspend", "Suspend")}
                    </button>
                  )}

                  <button
                    type="button"
                    style={deleteButtonStyle}
                    onClick={() =>
                    setConfirmAction({
                        type: "delete",
                        recruiter,
                    })
                    }>
                    {tr("adminRecruiters.actions.delete", "Delete")}
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
            {tr("adminRecruiters.actions.previous", "Previous")}
          </Button>

          <span style={pageTextStyle}>
            {tr("adminRecruiters.actions.page", "Page {{page}} of {{total}}")
              .replace("{{page}}", page)
              .replace("{{total}}", totalPages)}
          </span>

          <Button
            variant="secondary"
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          >
            {tr("adminRecruiters.actions.next", "Next")}
          </Button>
        </div>
      </Card>

      {selectedRecruiter && (
        <RecruiterDetailsModal
          recruiter={selectedRecruiter}
          details={details}
          loading={detailsLoading}
          t={t}
          onAssign={() => openAssignModal(selectedRecruiter)}
          onEdit={() => {
            setEditingRecruiter(selectedRecruiter);
            setSelectedRecruiter(null);
          }}
        onDelete={() =>
        setConfirmAction({
            type: "delete",
            recruiter: selectedRecruiter,
        })
        }
        onStatusChange={(action) =>
        setConfirmAction({
            type: action,
            recruiter: selectedRecruiter,
        })
        }
          onClose={() => {
            setSelectedRecruiter(null);
            setDetails(null);
          }}
        />
      )}

      {editingRecruiter && (
        <RecruiterEditModal
          recruiter={editingRecruiter}
          t={t}
          saving={saving}
          onClose={() => setEditingRecruiter(null)}
          onSave={(payload) =>
            updateRecruiter(editingRecruiter.recruiter_id, payload)
          }
        />
      )}

      {assigningRecruiter && (
        <AssignCandidatesModal
          recruiter={assigningRecruiter}
          candidates={candidateOptions}
          candidateSearch={candidateSearch}
          setCandidateSearch={setCandidateSearch}
          fetchCandidateOptions={fetchCandidateOptions}
          selectedCandidateIds={selectedCandidateIds}
          toggleCandidateSelection={toggleCandidateSelection}
          assignmentNotes={assignmentNotes}
          setAssignmentNotes={setAssignmentNotes}
          loading={assignmentLoading}
          t={t}
          onClose={() => setAssigningRecruiter(null)}
          onAssign={assignCandidatesToRecruiter}
        />
      )}
      {confirmAction && (
        <ConfirmActionModal
            action={confirmAction}
            t={t}
            onClose={() => setConfirmAction(null)}
            onConfirm={() => {
            if (confirmAction.type === "delete") {
                deleteRecruiter(confirmAction.recruiter);
            } else {
                updateRecruiterStatus(
                confirmAction.recruiter,
                confirmAction.type
                );
            }
            }}
        />
        )}

        
    </DashboardLayout>
  );
}

function ConfirmActionModal({ action, t, onClose, onConfirm }) {
  const tr = (key, fallback) => t(key) || fallback;

  const recruiterName =
    action.recruiter?.name ||
    tr("adminRecruiters.fallback.recruiter", "Recruiter");

  const config = {
    activate: {
      title: tr("adminRecruiters.confirm.activateTitle", "Activate recruiter"),
      message: tr(
        "adminRecruiters.confirm.activateMessage",
        "This recruiter will become available for new assignments."
      ),
      button: tr("adminRecruiters.actions.activate", "Activate"),
      style: activateButtonStyle,
    },
    suspend: {
      title: tr("adminRecruiters.confirm.suspendTitle", "Suspend recruiter"),
      message: tr(
        "adminRecruiters.confirm.suspendMessage",
        "This recruiter will be paused and should not receive new assignments."
      ),
      button: tr("adminRecruiters.actions.suspend", "Suspend"),
      style: suspendButtonStyle,
    },
    delete: {
      title: tr("adminRecruiters.confirm.deleteTitle", "Delete recruiter"),
      message: tr(
        "adminRecruiters.confirm.deleteMessage",
        "This action will remove the recruiter account and related recruiter records. This cannot be undone."
      ),
      button: tr("adminRecruiters.actions.delete", "Delete"),
      style: deleteButtonStyle,
    },
  };

  const current = config[action.type] || config.suspend;

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={confirmModalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <div>
            <h2 style={modalTitleStyle}>{current.title}</h2>
            <p style={modalSubtitleStyle}>
              {recruiterName}
            </p>
          </div>

          <button type="button" onClick={onClose} style={closeButtonStyle}>
            ×
          </button>
        </div>

        <div style={confirmBodyStyle}>
          <p style={descriptionTextStyle}>{current.message}</p>
        </div>

        <div style={modalFooterStyle}>
          <Button variant="secondary" type="button" onClick={onClose}>
            {tr("adminRecruiters.actions.cancel", "Cancel")}
          </Button>

          <button type="button" style={current.style} onClick={onConfirm}>
            {current.button}
          </button>
        </div>
      </div>
    </div>
  );
}

function RecruiterDetailsModal({
  recruiter,
  details,
  loading,
  t,
  onClose,
  onAssign,
  onEdit,
  onDelete,
  onStatusChange,
}) {
  const tr = (key, fallback) => t(key) || fallback;
  const profile = details?.recruiter || recruiter;
  const talent = details?.talent || [];
  const recommendations = details?.recommendations || [];

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <div style={recruiterCellStyle}>
            <RecruiterAvatar recruiter={profile} />
            <div>
              <h2 style={modalTitleStyle}>{profile.name || "Recruiter"}</h2>
              <p style={modalSubtitleStyle}>
                {profile.professional_title || "Recruiter"} ·{" "}
                {profile.country || "No location"}
              </p>
            </div>
          </div>

          <button type="button" onClick={onClose} style={closeButtonStyle}>
            ×
          </button>
        </div>

        {loading ? (
          <div style={emptyStyle}>Loading recruiter details...</div>
        ) : (
          <>
            <div style={modalGridStyle}>
              <DetailItem label="Recruiter ID" value={profile.recruiter_id || profile.id || "N/A"} />
              <DetailItem label="User ID" value={profile.user_id || "N/A"} />
              <DetailItem label="Email" value={profile.email || "N/A"} />
              <DetailItem label="Phone" value={profile.phone || "N/A"} />
              <DetailItem label="Country" value={profile.country || "N/A"} />
              <DetailItem label="City" value={profile.city || "N/A"} />
              <DetailItem label="Availability" value={profile.availability_status || "available"} />
              <DetailItem label="Joined" value={formatDate(profile.created_at)} />
            </div>

            <div style={descriptionBoxStyle}>
              <h3 style={sectionTitleStyle}>Recruiter Bio</h3>
              <p style={descriptionTextStyle}>
                {profile.recruiter_bio || "No recruiter bio has been added yet."}
              </p>
            </div>

            <div style={sectionWrapStyle}>
              <div style={sectionHeaderStyle}>
                <h3 style={sectionTitleStyle}>Recent Assigned Talent</h3>
                <button type="button" style={assignButtonStyle} onClick={onAssign}>
                  {tr("adminRecruiters.actions.assignTalent", "Assign Talent")}
                </button>
              </div>

              <div style={miniDirectoryStyle}>
                {talent.length === 0 ? (
                  <div style={emptyMiniStyle}>No assigned talent yet.</div>
                ) : (
                  talent.map((item) => (
                    <div key={item.id} style={miniRowStyle}>
                      <div>
                        <strong style={nameStyle}>{item.name}</strong>
                        <div style={mutedStyle}>{item.email}</div>
                      </div>
                      <div style={cellStyle}>{item.professional_title || "Not specified"}</div>
                      <span style={statusPillStyle}>{item.status || "assigned"}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={sectionWrapStyle}>
              <h3 style={sectionTitleStyle}>Recent Recommendations</h3>
              <div style={miniDirectoryStyle}>
                {recommendations.length === 0 ? (
                  <div style={emptyMiniStyle}>No recommendations yet.</div>
                ) : (
                  recommendations.map((item) => (
                    <div key={item.id} style={miniRowStyle}>
                      <div>
                        <strong style={nameStyle}>
                          {item.candidate_name || "Candidate"}
                        </strong>
                        <div style={mutedStyle}>
                          {item.job_title || "Job"} · {item.company_name || "Company"}
                        </div>
                      </div>
                      <div style={cellStyle}>
                        <strong>{item.match_score || 0}%</strong>
                      </div>
                      <span style={statusPillStyle}>{item.status || "recommended"}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={modalFooterStyle}>
              <button type="button" style={editButtonStyle} onClick={onEdit}>
                {tr("adminRecruiters.actions.edit", "Edit")}
              </button>

              {profile.availability_status === "suspended" ? (
                <button
                  type="button"
                  style={activateButtonStyle}
                  onClick={() => onStatusChange("activate")}
                >
                  {tr("adminRecruiters.actions.activate", "Activate")}
                </button>
              ) : (
                <button
                  type="button"
                  style={suspendButtonStyle}
                  onClick={() => onStatusChange("suspend")}
                >
                  {tr("adminRecruiters.actions.suspend", "Suspend")}
                </button>
              )}

              <button type="button" style={deleteButtonStyle} onClick={onDelete}>
                {tr("adminRecruiters.actions.delete", "Delete")}
              </button>

              <Button variant="secondary" onClick={onClose}>
                {tr("adminRecruiters.actions.close", "Close")}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function RecruiterEditModal({ recruiter, t, saving, onClose, onSave }) {
  const tr = (key, fallback) => t(key) || fallback;

  const [form, setForm] = useState({
    name: recruiter.name || "",
    email: recruiter.email || "",
    phone: recruiter.phone || "",
    country: recruiter.country || "",
    city: recruiter.city || "",
    professional_title: recruiter.professional_title || "",
    recruiter_bio: recruiter.recruiter_bio || "",
    availability_status: recruiter.availability_status || "available",
    preferred_industries: formatEditValue(recruiter.preferred_industries),
    preferred_countries: formatEditValue(recruiter.preferred_countries),
    specialization_skills: formatEditValue(recruiter.specialization_skills),
  });

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submit = (e) => {
    e.preventDefault();

    onSave({
      ...form,
      preferred_industries: form.preferred_industries,
      preferred_countries: form.preferred_countries,
      specialization_skills: form.specialization_skills,
    });
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <form style={editModalStyle} onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <div style={modalHeaderStyle}>
          <div>
            <h2 style={modalTitleStyle}>
              {tr("adminRecruiters.edit.title", "Edit Recruiter")}
            </h2>
            <p style={modalSubtitleStyle}>
              {tr("adminRecruiters.edit.subtitle", "Update recruiter profile and availability.")}
            </p>
          </div>

          <button type="button" onClick={onClose} style={closeButtonStyle}>
            ×
          </button>
        </div>

        <div style={editBodyStyle}>
          <div style={formGridStyle}>
            <FormInput label="Name" value={form.name} onChange={(v) => updateField("name", v)} />
            <FormInput label="Email" value={form.email} onChange={(v) => updateField("email", v)} />
            <FormInput label="Phone" value={form.phone} onChange={(v) => updateField("phone", v)} />
            <FormInput label="Country" value={form.country} onChange={(v) => updateField("country", v)} />
            <FormInput label="City" value={form.city} onChange={(v) => updateField("city", v)} />
            <FormInput label="Professional Title" value={form.professional_title} onChange={(v) => updateField("professional_title", v)} />

            <FormSelect
              label="Availability"
              value={form.availability_status}
              onChange={(v) => updateField("availability_status", v)}
              options={[
                { value: "available", label: "Available" },
                { value: "busy", label: "Busy" },
                { value: "inactive", label: "Inactive" },
                { value: "suspended", label: "Suspended" },
              ]}
            />

            <FormInput label="Preferred Industries" value={form.preferred_industries} onChange={(v) => updateField("preferred_industries", v)} />
            <FormInput label="Preferred Countries" value={form.preferred_countries} onChange={(v) => updateField("preferred_countries", v)} />
            <FormInput label="Specialization Skills" value={form.specialization_skills} onChange={(v) => updateField("specialization_skills", v)} />

            <FormTextarea label="Recruiter Bio" value={form.recruiter_bio} onChange={(v) => updateField("recruiter_bio", v)} />
          </div>
        </div>

        <div style={modalFooterStyle}>
          <Button variant="secondary" type="button" onClick={onClose}>
            {tr("adminRecruiters.actions.cancel", "Cancel")}
          </Button>

          <button type="submit" style={saveButtonStyle} disabled={saving}>
            {saving
              ? tr("adminRecruiters.actions.saving", "Saving...")
              : tr("adminRecruiters.actions.save", "Save Changes")}
          </button>
        </div>
      </form>
    </div>
  );
}

function AssignCandidatesModal({
  recruiter,
  candidates,
  candidateSearch,
  setCandidateSearch,
  fetchCandidateOptions,
  selectedCandidateIds,
  toggleCandidateSelection,
  assignmentNotes,
  setAssignmentNotes,
  loading,
  t,
  onClose,
  onAssign,
}) {
  const tr = (key, fallback) => t(key) || fallback;

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={assignModalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <div>
            <h2 style={modalTitleStyle}>
              {tr("adminRecruiters.assign.title", "Assign Talent")}
            </h2>
            <p style={modalSubtitleStyle}>
              {tr("adminRecruiters.assign.subtitle", "Assign one or more candidates to")}{" "}
              <strong>{recruiter.name}</strong>
            </p>
          </div>

          <button type="button" onClick={onClose} style={closeButtonStyle}>
            ×
          </button>
        </div>

        <div style={assignBodyStyle}>
          <div style={assignSearchStyle}>
            <input
              type="text"
              value={candidateSearch}
              onChange={(e) => setCandidateSearch(e.target.value)}
              placeholder={tr(
                "adminRecruiters.assign.searchPlaceholder",
                "Search candidates by name, email, role, or country"
              )}
              style={inputStyle}
            />
            <Button type="button" onClick={() => fetchCandidateOptions(candidateSearch)}>
              {tr("adminRecruiters.filters.search", "Search")}
            </Button>
          </div>

          <div style={selectedCountStyle}>
            {tr("adminRecruiters.assign.selected", "{{count}} candidates selected").replace(
              "{{count}}",
              selectedCandidateIds.length
            )}
          </div>

          <div style={candidatePickerStyle}>
            {candidates.map((candidate) => {
              const checked = selectedCandidateIds.includes(candidate.id);

              return (
                <button
                  key={candidate.id}
                  type="button"
                  style={{
                    ...candidateOptionStyle,
                    background: checked ? "#eff6ff" : "#ffffff",
                    borderColor: checked ? "#2563eb" : "#e2e8f0",
                  }}
                  onClick={() => toggleCandidateSelection(candidate.id)}
                >
                  <input type="checkbox" checked={checked} readOnly />
                  <div>
                    <strong style={nameStyle}>{candidate.name}</strong>
                    <div style={mutedStyle}>{candidate.email}</div>
                    <div style={mutedStyle}>
                      {candidate.professional_title || candidate.desired_job_title || "Not specified"} ·{" "}
                      {candidate.country || "No location"}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <label style={fieldStyle}>
            <span style={fieldLabelStyle}>
              {tr("adminRecruiters.assign.notes", "Assignment Notes")}
            </span>
            <textarea
              value={assignmentNotes}
              onChange={(e) => setAssignmentNotes(e.target.value)}
              rows={4}
              style={fieldTextareaStyle}
              placeholder={tr(
                "adminRecruiters.assign.notesPlaceholder",
                "Optional notes for this assignment..."
              )}
            />
          </label>
        </div>

        <div style={modalFooterStyle}>
          <Button variant="secondary" onClick={onClose}>
            {tr("adminRecruiters.actions.cancel", "Cancel")}
          </Button>

          <button
            type="button"
            style={saveButtonStyle}
            onClick={onAssign}
            disabled={loading || selectedCandidateIds.length === 0}
          >
            {loading
              ? tr("adminRecruiters.assign.assigning", "Assigning...")
              : tr("adminRecruiters.assign.assign", "Assign Candidates")}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormInput({ label, value, onChange, type = "text" }) {
  return (
    <label style={fieldStyle}>
      <span style={fieldLabelStyle}>{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} style={fieldInputStyle} />
    </label>
  );
}

function FormTextarea({ label, value, onChange }) {
  return (
    <label style={{ ...fieldStyle, gridColumn: "1 / -1" }}>
      <span style={fieldLabelStyle}>{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={5} style={fieldTextareaStyle} />
    </label>
  );
}

function FormSelect({ label, value, onChange, options }) {
  return (
    <label style={fieldStyle}>
      <span style={fieldLabelStyle}>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={fieldInputStyle}>
        {options.map((item) => (
          <option key={item.value} value={item.value}>{item.label}</option>
        ))}
      </select>
    </label>
  );
}

function StatCard({ title, value, subtitle, color }) {
  return (
    <Card title={title} subtitle={subtitle}>
      <div style={{ fontSize: "34px", fontWeight: 900, color }}>{value}</div>
    </Card>
  );
}

function RecruiterAvatar({ recruiter }) {
  const imageSrc =
    recruiter.profile_image && recruiter.profile_image.startsWith("/")
      ? recruiter.profile_image
      : "/images/avatar.jpg";

  return (
    <div style={avatarWrapStyle}>
      <img src={imageSrc} alt={recruiter.name || "Recruiter"} style={avatarImageStyle} />
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

function getSuccessRate(recruiter) {
  const recommendations = Number(recruiter.recommendations || 0);
  const accepted = Number(recruiter.accepted_recommendations || 0);
  if (!recommendations) return 0;
  return Math.round((accepted / recommendations) * 100);
}

function formatDate(date) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatEditValue(value) {
  if (!value) return "";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

const statsGridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "24px" };
const filterBarStyle = { display: "grid", gridTemplateColumns: "1fr 180px auto", gap: "12px", marginBottom: "22px", alignItems: "center" };
const inputStyle = { width: "100%", padding: "13px 15px", border: "1px solid #dbe3ef", borderRadius: "14px", fontSize: "14px", outline: "none", background: "#ffffff" };
const selectStyle = { padding: "13px 15px", border: "1px solid #dbe3ef", borderRadius: "14px", fontSize: "14px", outline: "none", background: "#ffffff" };
const directoryStyle = { border: "1px solid #e2e8f0", borderRadius: "18px", overflow: "hidden", background: "#ffffff" };
const tableHeaderStyle = { display: "grid", gridTemplateColumns: "1.6fr 1fr 0.6fr 0.9fr 0.7fr 0.7fr 0.8fr 2fr", gap: "12px", padding: "15px 18px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: "12px", fontWeight: 900, textTransform: "uppercase", color: "#64748b" };
const rowStyle = { display: "grid", gridTemplateColumns: "1.6fr 1fr 0.6fr 0.9fr 0.7fr 0.7fr 0.8fr 2fr", gap: "12px", padding: "16px 18px", borderBottom: "1px solid #f1f5f9", alignItems: "center", background: "#ffffff" };
const recruiterCellStyle = { display: "flex", alignItems: "center", gap: "12px", minWidth: 0 };
const avatarWrapStyle = { width: "44px", height: "44px", minWidth: "44px", borderRadius: "14px", overflow: "hidden", border: "1px solid #e2e8f0", background: "#f8fafc" };
const avatarImageStyle = { width: "100%", height: "100%", objectFit: "cover", display: "block" };
const nameStyle = { color: "#0f172a", fontSize: "15px", fontWeight: 900, display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
const mutedStyle = { marginTop: "3px", fontSize: "12px", color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" };
const cellStyle = { fontSize: "14px", color: "#334155" };
const actionGroupStyle = { display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" };
const detailsButtonStyle = { padding: "8px 12px", borderRadius: "999px", border: "1px solid #dbe3ef", background: "#ffffff", color: "#0f172a", fontWeight: 800, cursor: "pointer", fontSize: "12px" };
const editButtonStyle = { padding: "8px 12px", borderRadius: "999px", border: "none", background: "#0f172a", color: "#ffffff", fontWeight: 800, cursor: "pointer", fontSize: "12px" };
const assignButtonStyle = { padding: "8px 12px", borderRadius: "999px", border: "none", background: "#2563eb", color: "#ffffff", fontWeight: 800, cursor: "pointer", fontSize: "12px" };
const activateButtonStyle = { padding: "8px 12px", borderRadius: "999px", border: "none", background: "#16a34a", color: "#ffffff", fontWeight: 800, cursor: "pointer", fontSize: "12px" };
const suspendButtonStyle = { padding: "8px 12px", borderRadius: "999px", border: "none", background: "#f59e0b", color: "#ffffff", fontWeight: 800, cursor: "pointer", fontSize: "12px" };
const deleteButtonStyle = { padding: "8px 12px", borderRadius: "999px", border: "none", background: "#dc2626", color: "#ffffff", fontWeight: 800, cursor: "pointer", fontSize: "12px" };
const statusPillStyle = { display: "inline-flex", padding: "6px 10px", borderRadius: "999px", background: "#ecfdf5", color: "#047857", fontSize: "12px", fontWeight: 900, textTransform: "capitalize" };
const dangerPillStyle = { ...statusPillStyle, background: "#fef2f2", color: "#dc2626" };
const successPillStyle = { display: "inline-flex", padding: "6px 10px", borderRadius: "999px", background: "#eff6ff", color: "#1d4ed8", fontSize: "12px", fontWeight: 900 };
const paginationStyle = { marginTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" };
const pageTextStyle = { fontSize: "14px", fontWeight: 800, color: "#475569" };
const emptyStyle = { padding: "42px", textAlign: "center", color: "#64748b", fontSize: "14px" };
const modalOverlayStyle = { position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.55)", zIndex: 5000, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" };
const modalStyle = { width: "100%", maxWidth: "980px", maxHeight: "90vh", overflowY: "auto", background: "#ffffff", borderRadius: "24px", boxShadow: "0 30px 80px rgba(15, 23, 42, 0.35)" };
const assignModalStyle = { ...modalStyle, maxWidth: "900px" };
const editModalStyle = { ...modalStyle, maxWidth: "940px" };
const modalHeaderStyle = { padding: "24px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" };
const modalTitleStyle = { margin: 0, fontSize: "22px", fontWeight: 900, color: "#0f172a" };
const modalSubtitleStyle = { margin: "4px 0 0", fontSize: "14px", color: "#64748b" };
const closeButtonStyle = { width: "34px", height: "34px", borderRadius: "999px", border: "1px solid #e2e8f0", background: "#f8fafc", color: "#0f172a", fontSize: "22px", cursor: "pointer", lineHeight: 1 };
const modalGridStyle = { padding: "24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px" };
const detailItemStyle = { padding: "14px", border: "1px solid #e2e8f0", borderRadius: "16px", background: "#f8fafc" };
const detailLabelStyle = { display: "block", fontSize: "12px", fontWeight: 800, color: "#64748b", textTransform: "uppercase", marginBottom: "6px" };
const detailValueStyle = { fontSize: "14px", color: "#0f172a" };
const descriptionBoxStyle = { margin: "0 24px 24px", padding: "18px", borderRadius: "18px", background: "#f8fafc", border: "1px solid #e2e8f0" };
const sectionWrapStyle = { padding: "0 24px 24px" };
const sectionHeaderStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "12px" };
const sectionTitleStyle = { margin: "0 0 12px", fontSize: "15px", fontWeight: 900, color: "#0f172a" };
const descriptionTextStyle = { margin: 0, color: "#475569", fontSize: "14px", lineHeight: 1.7 };
const miniDirectoryStyle = { border: "1px solid #e2e8f0", borderRadius: "18px", overflow: "hidden", background: "#ffffff" };
const miniRowStyle = { display: "grid", gridTemplateColumns: "1.5fr 1fr auto", gap: "14px", padding: "14px 16px", borderBottom: "1px solid #f1f5f9", alignItems: "center" };
const emptyMiniStyle = { padding: "24px", textAlign: "center", color: "#64748b", fontSize: "14px" };
const modalFooterStyle = { padding: "18px 24px", borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: "10px", flexWrap: "wrap" };
const assignBodyStyle = { padding: "24px", display: "grid", gap: "18px" };
const assignSearchStyle = { display: "grid", gridTemplateColumns: "1fr auto", gap: "12px", alignItems: "center" };
const candidatePickerStyle = { maxHeight: "360px", overflowY: "auto", display: "grid", gap: "10px" };
const candidateOptionStyle = { width: "100%", padding: "14px", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", gap: "12px", alignItems: "flex-start", textAlign: "left", cursor: "pointer" };
const selectedCountStyle = { padding: "12px 14px", borderRadius: "14px", background: "#f8fafc", border: "1px solid #e2e8f0", color: "#475569", fontSize: "14px", fontWeight: 800 };
const editBodyStyle = { padding: "24px" };
const formGridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" };
const fieldStyle = { display: "grid", gap: "6px" };
const fieldLabelStyle = { fontSize: "12px", fontWeight: 800, color: "#64748b", textTransform: "uppercase" };
const fieldInputStyle = { padding: "11px 12px", border: "1px solid #dbe3ef", borderRadius: "12px", fontSize: "14px", outline: "none" };
const fieldTextareaStyle = { padding: "11px 12px", border: "1px solid #dbe3ef", borderRadius: "12px", fontSize: "14px", outline: "none", resize: "vertical" };
const saveButtonStyle = { padding: "10px 14px", borderRadius: "10px", border: "none", background: "#16a34a", color: "#ffffff", fontWeight: 800, cursor: "pointer" };
const confirmModalStyle = {
  width: "100%",
  maxWidth: "520px",
  background: "#ffffff",
  borderRadius: "24px",
  boxShadow: "0 30px 80px rgba(15, 23, 42, 0.35)",
};

const confirmBodyStyle = {
  padding: "24px",
};
export default AdminRecruiters;


