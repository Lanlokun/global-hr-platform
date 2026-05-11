import { useEffect, useMemo, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  Save,
  RotateCcw,
  ShieldCheck,
  Bell,
  User,
  Settings2,
  Upload,
  Brain,
  Lock,
  Briefcase,
  Globe2,
  Clock3,
  CheckCircle2,
  TrendingUp,
  Activity,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import api from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";

const defaultSettings = {
  name: "",
  email: "",
  phone: "",
  city: "",
  country: "",
  professional_title: "",
  recruiter_bio: "",
  profile_image: "",

  preferred_industries: [],
  preferred_candidate_countries: [],
  preferred_job_types: [],
  preferred_work_mode: [],
  seniority_focus: "All",
  specialization_skills: [],

  default_candidate_message:
    "Hello, I reviewed your profile and believe you may be suitable for new opportunities on our platform.",

  default_employer_message:
    "Hello, I would like to recommend a candidate who may be a strong fit for your role.",

  auto_signature: "Best regards,\nRecruitment Team",
  availability_status: "Available",

  notifications_candidate_assigned: true,
  notifications_employer_replies: true,
  notifications_recommendation_reviewed: true,
  notifications_candidate_messages: true,
  notifications_job_match_alerts: true,
  notifications_weekly_summary: true,

  default_recommendation_note:
    "Recommended based on skills, experience, and role alignment.",

  auto_include_ai_notes: true,
  auto_notify_employer: true,
  follow_up_days: 3,
};

function RecruiterSettings() {
  const { t } = useLanguage();

  const tt = (key, fallback) => {
    const value = t(key);
    return value === key ? fallback : value;
  };

  const fileInputRef = useRef(null);

  const [settings, setSettings] = useState(defaultSettings);
  const [initialSettings, setInitialSettings] = useState(defaultSettings);

  const [stats, setStats] = useState({
    recommendations: 0,
    accepted: 0,
    avgMatch: 0,
    responseTime: 0,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);

      const [settingsRes, overviewRes] = await Promise.allSettled([
        api.get("/api/recruiter/settings"),
        api.get("/api/recruiter/overview"),
      ]);

      if (settingsRes.status === "fulfilled") {
        const merged = {
          ...defaultSettings,
          ...(settingsRes.value.data || {}),
        };

        setSettings(merged);
        setInitialSettings(merged);
      }

      if (overviewRes.status === "fulfilled") {
        setStats({
          recommendations:
            overviewRes.value.data?.recommendations || 0,
          accepted:
            overviewRes.value.data?.acceptedRecommendations || 0,
          avgMatch:
            overviewRes.value.data?.averageMatch || 0,
          responseTime:
            overviewRes.value.data?.averageResponseTime || 0,
        });
      }
    } catch (err) {
      console.error("Failed to load recruiter settings:", err);

      toast.error(
        tt(
          "recruiterSettings.alerts.failedLoadSettings",
          "Failed to load recruiter settings."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = async (file) => {
    try {
      if (!file.type.startsWith("image/")) {
        toast.error(
          tt(
            "recruiterSettings.alerts.invalidImage",
            "Please upload a valid image file."
          )
        );
        return;
      }

      setUploadingImage(true);

      const formData = new FormData();
      formData.append("image", file);

      const res = await api.post(
        "/api/upload/profile-image",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      updateField("profile_image", res.data?.url);

      toast.success(
        tt(
          "recruiterSettings.alerts.imageUploaded",
          "Profile image uploaded."
        )
      );
    } catch (err) {
      console.error("Failed to upload image:", err);

      toast.error(
        err.response?.data?.error ||
          tt(
            "recruiterSettings.alerts.failedUploadImage",
            "Failed to upload image."
          )
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      await api.put("/api/recruiter/settings", settings);

      setInitialSettings(settings);

      toast.success(
        tt(
          "recruiterSettings.alerts.settingsSaved",
          "Recruiter settings saved successfully."
        )
      );
    } catch (err) {
      console.error("Failed to save recruiter settings:", err);

      toast.error(
        err.response?.data?.error ||
          tt(
            "recruiterSettings.alerts.failedSaveSettings",
            "Failed to save settings."
          )
      );
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(initialSettings);

    toast(
      tt(
        "recruiterSettings.alerts.changesReset",
        "Changes reset."
      )
    );
  };

  const hasChanges = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(initialSettings),
    [settings, initialSettings]
  );

  return (
    <DashboardLayout
      title={tt(
        "recruiterSettings.title",
        "Recruiter Settings"
      )}
      subtitle={tt(
        "recruiterSettings.subtitle",
        "Manage your profile, recruiter preferences, messaging templates, workflow defaults, and security settings."
      )}
    >
      <Toaster position="top-right" />

      {loading ? (
        <div style={styles.emptyState}>
          {tt(
            "recruiterSettings.states.loadingSettings",
            "Loading recruiter settings..."
          )}
        </div>
      ) : (
        <>
          <div style={styles.pageHeader}>
            <div>
              <h2 style={styles.pageTitle}>
                {tt(
                  "recruiterSettings.header.title",
                  "Workspace Configuration"
                )}
              </h2>

              <p style={styles.pageSubtitle}>
                {tt(
                  "recruiterSettings.header.subtitle",
                  "Customize how you work with candidates, employers, and recommendations."
                )}
              </p>
            </div>

            <div style={styles.headerActions}>
              <button
                type="button"
                style={styles.secondaryButton}
                onClick={handleReset}
              >
                <RotateCcw size={16} />
                {tt("recruiterSettings.actions.reset", "Reset")}
              </button>

              <Button
                onClick={handleSave}
                disabled={!hasChanges || saving}
              >
                <Save size={16} />
                {saving
                  ? tt(
                      "recruiterSettings.actions.saving",
                      "Saving..."
                    )
                  : tt(
                      "recruiterSettings.actions.saveChanges",
                      "Save Changes"
                    )}
              </Button>
            </div>
          </div>

          <div style={styles.statsGrid}>
            <StatCard
              icon={<Briefcase size={24} />}
              title={tt(
                "recruiterSettings.stats.recommendations",
                "Recommendations"
              )}
              value={stats.recommendations}
              subtext={tt(
                "recruiterSettings.stats.totalSubmitted",
                "Total submitted"
              )}
              color="#4f46e5"
              bg="#eef2ff"
            />

            <StatCard
              icon={<CheckCircle2 size={24} />}
              title={tt(
                "recruiterSettings.stats.accepted",
                "Accepted"
              )}
              value={stats.accepted}
              subtext={tt(
                "recruiterSettings.stats.employerAccepted",
                "Employer accepted"
              )}
              color="#16a34a"
              bg="#dcfce7"
            />

            <StatCard
              icon={<TrendingUp size={24} />}
              title={tt(
                "recruiterSettings.stats.avgMatch",
                "Avg Match"
              )}
              value={`${stats.avgMatch}%`}
              subtext={tt(
                "recruiterSettings.stats.recommendationQuality",
                "Recommendation quality"
              )}
              color="#2563eb"
              bg="#dbeafe"
            />

            <StatCard
              icon={<Activity size={24} />}
              title={tt(
                "recruiterSettings.stats.responseTime",
                "Response Time"
              )}
              value={`${stats.responseTime}h`}
              subtext={tt(
                "recruiterSettings.stats.averageRecruiterResponse",
                "Average recruiter response"
              )}
              color="#f97316"
              bg="#ffedd5"
            />
          </div>

          <div style={styles.layout}>
            <div style={styles.mainColumn}>
              <SettingsPanel
                icon={<User size={18} />}
                title={tt(
                  "recruiterSettings.profile.title",
                  "Profile Settings"
                )}
                subtitle={tt(
                  "recruiterSettings.profile.subtitle",
                  "Your public recruiter identity and contact information."
                )}
              >
                <div style={styles.profileHeader}>
                  <img
                    src={
                      settings.profile_image ||
                      "/images/avatar.jpg"
                    }
                    alt={
                      settings.name ||
                      tt(
                        "recruiterSettings.defaults.recruiter",
                        "Recruiter"
                      )
                    }
                    style={styles.avatar}
                  />

                  <div>
                    <button
                      type="button"
                      style={styles.uploadButton}
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                    >
                      <Upload size={15} />

                      {uploadingImage
                        ? tt(
                            "recruiterSettings.actions.uploading",
                            "Uploading..."
                          )
                        : tt(
                            "recruiterSettings.actions.uploadProfileImage",
                            "Upload Profile Image"
                          )}
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                    />
                  </div>
                </div>

                <div style={styles.formGrid}>
                  <Input
                    label={tt(
                      "recruiterSettings.fields.fullName",
                      "Full Name"
                    )}
                    value={settings.name}
                    onChange={(v) =>
                      updateField("name", v)
                    }
                  />

                  <Input
                    label={tt(
                      "recruiterSettings.fields.email",
                      "Email"
                    )}
                    value={settings.email}
                    onChange={(v) =>
                      updateField("email", v)
                    }
                  />

                  <Input
                    label={tt(
                      "recruiterSettings.fields.phone",
                      "Phone"
                    )}
                    value={settings.phone}
                    onChange={(v) =>
                      updateField("phone", v)
                    }
                  />

                  <Input
                    label={tt(
                      "recruiterSettings.fields.professionalTitle",
                      "Professional Title"
                    )}
                    value={settings.professional_title}
                    placeholder={tt(
                      "recruiterSettings.placeholders.professionalTitle",
                      "Senior Talent Recruiter"
                    )}
                    onChange={(v) =>
                      updateField(
                        "professional_title",
                        v
                      )
                    }
                  />

                  <Input
                    label={tt(
                      "recruiterSettings.fields.city",
                      "City"
                    )}
                    value={settings.city}
                    onChange={(v) =>
                      updateField("city", v)
                    }
                  />

                  <Input
                    label={tt(
                      "recruiterSettings.fields.country",
                      "Country"
                    )}
                    value={settings.country}
                    onChange={(v) =>
                      updateField("country", v)
                    }
                  />
                </div>

                <Textarea
                  label={tt(
                    "recruiterSettings.fields.recruiterBio",
                    "Recruiter Bio"
                  )}
                  value={settings.recruiter_bio}
                  placeholder={tt(
                    "recruiterSettings.placeholders.recruiterBio",
                    "Write a short introduction about your recruiting focus."
                  )}
                  onChange={(v) =>
                    updateField("recruiter_bio", v)
                  }
                />
              </SettingsPanel>

              <SettingsPanel
                icon={<Globe2 size={18} />}
                title={tt(
                  "recruiterSettings.preferences.title",
                  "Recruiter Preferences"
                )}
                subtitle={tt(
                  "recruiterSettings.preferences.subtitle",
                  "Define the roles, countries, and candidate profiles you focus on."
                )}
              >
                <TagInput
                  label={tt(
                    "recruiterSettings.fields.preferredIndustries",
                    "Preferred Industries"
                  )}
                  value={settings.preferred_industries}
                  onChange={(v) =>
                    updateField(
                      "preferred_industries",
                      v
                    )
                  }
                />

                <TagInput
                  label={tt(
                    "recruiterSettings.fields.preferredCountries",
                    "Preferred Candidate Countries"
                  )}
                  value={
                    settings.preferred_candidate_countries
                  }
                  onChange={(v) =>
                    updateField(
                      "preferred_candidate_countries",
                      v
                    )
                  }
                />

                <TagInput
                  label={tt(
                    "recruiterSettings.fields.preferredJobTypes",
                    "Preferred Job Types"
                  )}
                  value={settings.preferred_job_types}
                  onChange={(v) =>
                    updateField(
                      "preferred_job_types",
                      v
                    )
                  }
                />

                <MultiSelect
                  label={tt(
                    "recruiterSettings.fields.preferredWorkMode",
                    "Preferred Work Mode"
                  )}
                  value={settings.preferred_work_mode}
                  options={[
                    tt(
                      "recruiterSettings.options.remote",
                      "Remote"
                    ),
                    tt(
                      "recruiterSettings.options.hybrid",
                      "Hybrid"
                    ),
                    tt(
                      "recruiterSettings.options.onsite",
                      "Onsite"
                    ),
                  ]}
                  onChange={(v) =>
                    updateField(
                      "preferred_work_mode",
                      v
                    )
                  }
                />

                <Select
                  label={tt(
                    "recruiterSettings.fields.seniorityFocus",
                    "Seniority Focus"
                  )}
                  value={settings.seniority_focus}
                  options={[
                    tt(
                      "recruiterSettings.options.junior",
                      "Junior"
                    ),
                    tt(
                      "recruiterSettings.options.midLevel",
                      "Mid-level"
                    ),
                    tt(
                      "recruiterSettings.options.senior",
                      "Senior"
                    ),
                    tt(
                      "recruiterSettings.options.executive",
                      "Executive"
                    ),
                    tt(
                      "recruiterSettings.options.all",
                      "All"
                    ),
                  ]}
                  onChange={(v) =>
                    updateField(
                      "seniority_focus",
                      v
                    )
                  }
                />

                <TagInput
                  label={tt(
                    "recruiterSettings.fields.specializationSkills",
                    "Specialization Skills"
                  )}
                  value={
                    settings.specialization_skills
                  }
                  onChange={(v) =>
                    updateField(
                      "specialization_skills",
                      v
                    )
                  }
                />
              </SettingsPanel>

              <SettingsPanel
                icon={<Brain size={18} />}
                title={tt(
                  "recruiterSettings.messaging.title",
                  "Messaging Templates"
                )}
                subtitle={tt(
                  "recruiterSettings.messaging.subtitle",
                  "Set reusable messages for candidates and employers."
                )}
              >
                <Textarea
                  label={tt(
                    "recruiterSettings.fields.defaultCandidateMessage",
                    "Default Candidate Message"
                  )}
                  value={
                    settings.default_candidate_message
                  }
                  onChange={(v) =>
                    updateField(
                      "default_candidate_message",
                      v
                    )
                  }
                />

                <Textarea
                  label={tt(
                    "recruiterSettings.fields.defaultEmployerMessage",
                    "Default Employer Follow-up Message"
                  )}
                  value={
                    settings.default_employer_message
                  }
                  onChange={(v) =>
                    updateField(
                      "default_employer_message",
                      v
                    )
                  }
                />

                <Textarea
                  label={tt(
                    "recruiterSettings.fields.autoSignature",
                    "Auto Signature"
                  )}
                  value={settings.auto_signature}
                  onChange={(v) =>
                    updateField(
                      "auto_signature",
                      v
                    )
                  }
                />

                <Select
                  label={tt(
                    "recruiterSettings.fields.availabilityStatus",
                    "Availability Status"
                  )}
                  value={settings.availability_status}
                  options={[
                    tt(
                      "recruiterSettings.options.available",
                      "Available"
                    ),
                    tt(
                      "recruiterSettings.options.busy",
                      "Busy"
                    ),
                    tt(
                      "recruiterSettings.options.away",
                      "Away"
                    ),
                  ]}
                  onChange={(v) =>
                    updateField(
                      "availability_status",
                      v
                    )
                  }
                />
              </SettingsPanel>
            </div>

            <div style={styles.sideColumn}>
              <SettingsPanel
                icon={<Bell size={18} />}
                title={tt(
                  "recruiterSettings.notifications.title",
                  "Notifications"
                )}
                subtitle={tt(
                  "recruiterSettings.notifications.subtitle",
                  "Choose what updates you want to receive."
                )}
              >
                <Toggle
                  label={tt(
                    "recruiterSettings.notifications.candidateAssigned",
                    "New candidate assigned"
                  )}
                  checked={
                    settings.notifications_candidate_assigned
                  }
                  onChange={(v) =>
                    updateField(
                      "notifications_candidate_assigned",
                      v
                    )
                  }
                />

                <Toggle
                  label={tt(
                    "recruiterSettings.notifications.employerReplies",
                    "Employer replies"
                  )}
                  checked={
                    settings.notifications_employer_replies
                  }
                  onChange={(v) =>
                    updateField(
                      "notifications_employer_replies",
                      v
                    )
                  }
                />

                <Toggle
                  label={tt(
                    "recruiterSettings.notifications.recommendationReviewed",
                    "Recommendation reviewed"
                  )}
                  checked={
                    settings.notifications_recommendation_reviewed
                  }
                  onChange={(v) =>
                    updateField(
                      "notifications_recommendation_reviewed",
                      v
                    )
                  }
                />

                <Toggle
                  label={tt(
                    "recruiterSettings.notifications.candidateMessages",
                    "Candidate messages"
                  )}
                  checked={
                    settings.notifications_candidate_messages
                  }
                  onChange={(v) =>
                    updateField(
                      "notifications_candidate_messages",
                      v
                    )
                  }
                />

                <Toggle
                  label={tt(
                    "recruiterSettings.notifications.jobMatchAlerts",
                    "Job match alerts"
                  )}
                  checked={
                    settings.notifications_job_match_alerts
                  }
                  onChange={(v) =>
                    updateField(
                      "notifications_job_match_alerts",
                      v
                    )
                  }
                />

                <Toggle
                  label={tt(
                    "recruiterSettings.notifications.weeklySummary",
                    "Weekly performance summary"
                  )}
                  checked={
                    settings.notifications_weekly_summary
                  }
                  onChange={(v) =>
                    updateField(
                      "notifications_weekly_summary",
                      v
                    )
                  }
                />
              </SettingsPanel>

              <SettingsPanel
                icon={<Settings2 size={18} />}
                title={tt(
                  "recruiterSettings.defaults.title",
                  "Recommendation Defaults"
                )}
                subtitle={tt(
                  "recruiterSettings.defaults.subtitle",
                  "Configure how recommendations are prepared."
                )}
              >
                <Textarea
                  label={tt(
                    "recruiterSettings.fields.defaultRecommendationNote",
                    "Default Recommendation Note"
                  )}
                  value={
                    settings.default_recommendation_note
                  }
                  onChange={(v) =>
                    updateField(
                      "default_recommendation_note",
                      v
                    )
                  }
                />

                <Toggle
                  label={tt(
                    "recruiterSettings.defaults.autoIncludeAiNotes",
                    "Auto-include AI notes"
                  )}
                  checked={
                    settings.auto_include_ai_notes
                  }
                  onChange={(v) =>
                    updateField(
                      "auto_include_ai_notes",
                      v
                    )
                  }
                />

                <Toggle
                  label={tt(
                    "recruiterSettings.defaults.autoNotifyEmployer",
                    "Auto-notify employer"
                  )}
                  checked={
                    settings.auto_notify_employer
                  }
                  onChange={(v) =>
                    updateField(
                      "auto_notify_employer",
                      v
                    )
                  }
                />

                <Input
                  type="number"
                  label={tt(
                    "recruiterSettings.fields.followUpDays",
                    "Follow-up reminder interval, days"
                  )}
                  value={settings.follow_up_days}
                  onChange={(v) =>
                    updateField(
                      "follow_up_days",
                      v
                    )
                  }
                />
              </SettingsPanel>

              <SettingsPanel
                icon={<Lock size={18} />}
                title={tt(
                  "recruiterSettings.security.title",
                  "Security"
                )}
                subtitle={tt(
                  "recruiterSettings.security.subtitle",
                  "Account security and access controls."
                )}
              >
                <SecurityRow
                  label={tt(
                    "recruiterSettings.security.password",
                    "Password"
                  )}
                  value={tt(
                    "recruiterSettings.security.passwordManaged",
                    "Managed from account security"
                  )}
                />

                <SecurityRow
                  label={tt(
                    "recruiterSettings.security.twoFactor",
                    "Two-factor authentication"
                  )}
                  value={tt(
                    "recruiterSettings.security.notEnabled",
                    "Not enabled"
                  )}
                />

                <SecurityRow
                  label={tt(
                    "recruiterSettings.security.activeSessions",
                    "Active sessions"
                  )}
                  value={tt(
                    "recruiterSettings.security.currentSession",
                    "Current browser session"
                  )}
                />

                <Button
                  variant="secondary"
                  onClick={() =>
                    toast(
                      tt(
                        "recruiterSettings.alerts.securityComingSoon",
                        "Security settings will be available soon."
                      )
                    )
                  }
                >
                  <ShieldCheck size={15} />

                  {tt(
                    "recruiterSettings.actions.manageSecurity",
                    "Manage Security"
                  )}
                </Button>
              </SettingsPanel>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

function SettingsPanel({
  icon,
  title,
  subtitle,
  children,
}) {
  return (
    <Card style={styles.panel}>
      <div style={styles.panelHeader}>
        <div style={styles.panelIcon}>
          {icon}
        </div>

        <div>
          <h3 style={styles.panelTitle}>
            {title}
          </h3>
          <p style={styles.panelSubtitle}>
            {subtitle}
          </p>
        </div>
      </div>

      <div style={styles.panelBody}>
        {children}
      </div>
    </Card>
  );
}

function StatCard({
  icon,
  title,
  value,
  subtext,
  color,
  bg,
}) {
  return (
    <div style={styles.statCard}>
      <div
        style={{
          ...styles.statIcon,
          background: bg,
          color,
        }}
      >
        {icon}
      </div>

      <div>
        <p style={styles.statTitle}>
          {title}
        </p>

        <h2 style={styles.statValue}>
          {value}
        </h2>

        <span style={styles.statSubtext}>
          {subtext}
        </span>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <label style={styles.field}>
      <span>{label}</span>

      <input
        type={type}
        value={value || ""}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(e.target.value)
        }
        style={styles.input}
      />
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
  placeholder,
}) {
  return (
    <label style={styles.field}>
      <span>{label}</span>

      <textarea
        value={value || ""}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(e.target.value)
        }
        style={styles.textarea}
      />
    </label>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}) {
  return (
    <label style={styles.field}>
      <span>{label}</span>

      <select
        value={value || ""}
        onChange={(e) =>
          onChange(e.target.value)
        }
        style={styles.input}
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function MultiSelect({ label, value, options, onChange }) {
  const safeValue = Array.isArray(value)
    ? value
    : typeof value === "string" && value.trim()
    ? value.split(",").map((v) => v.trim()).filter(Boolean)
    : [];

  const toggle = (option) => {
    if (safeValue.includes(option)) {
      onChange(safeValue.filter((v) => v !== option));
    } else {
      onChange([...safeValue, option]);
    }
  };

  return (
    <div style={styles.field}>
      <span>{label}</span>

      <div style={styles.tagWrap}>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => toggle(option)}
            style={{
              ...styles.tag,
              ...(safeValue.includes(option) ? styles.tagActive : {}),
            }}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function TagInput({ label, value, onChange }) {
  const safeValue = Array.isArray(value)
    ? value
    : typeof value === "string" && value.trim()
    ? value.split(",").map((v) => v.trim()).filter(Boolean)
    : [];

  return (
    <label style={styles.field}>
      <span>{label}</span>

      <input
        value={safeValue.join(", ")}
        onChange={(e) =>
          onChange(
            e.target.value
              .split(",")
              .map((v) => v.trim())
              .filter(Boolean)
          )
        }
        style={styles.input}
      />
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}) {
  return (
    <div style={styles.toggleRow}>
      <span>{label}</span>

      <button
        type="button"
        style={{
          ...styles.toggle,
          ...(checked
            ? styles.toggleActive
            : {}),
        }}
        onClick={() =>
          onChange(!checked)
        }
      >
        <div
          style={{
            ...styles.toggleCircle,
            ...(checked
              ? styles.toggleCircleActive
              : {}),
          }}
        />
      </button>
    </div>
  );
}

function SecurityRow({
  label,
  value,
}) {
  return (
    <div style={styles.securityRow}>
      <div>
        <strong>{label}</strong>
        <p>{value}</p>
      </div>
    </div>
  );
}

const styles = {
  emptyState: {
    padding: 80,
    textAlign: "center",
    color: "#64748b",
    fontWeight: 700,
  },

  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    flexWrap: "wrap",
    marginBottom: 22,
  },

  pageTitle: {
    margin: 0,
    color: "#0f172a",
  },

  pageSubtitle: {
    marginTop: 6,
    color: "#64748b",
  },

  headerActions: {
    display: "flex",
    gap: 12,
    alignItems: "center",
  },

  secondaryButton: {
    height: 46,
    borderRadius: 14,
    border: "1px solid #dbe3ef",
    background: "#fff",
    padding: "0 16px",
    display: "flex",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
    fontWeight: 700,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: 18,
    marginBottom: 24,
  },

  statCard: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 24,
    padding: 20,
    display: "flex",
    gap: 16,
    alignItems: "center",
  },

  statIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  statTitle: {
    margin: 0,
    color: "#64748b",
    fontWeight: 700,
  },

  statValue: {
    margin: "5px 0",
    fontSize: 28,
    color: "#0f172a",
  },

  statSubtext: {
    color: "#94a3b8",
    fontSize: 13,
  },

  layout: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0,1.5fr) minmax(320px,0.9fr)",
    gap: 20,
  },

  mainColumn: {
    display: "grid",
    gap: 20,
  },

  sideColumn: {
    display: "grid",
    gap: 20,
    alignSelf: "start",
  },

  panel: {
    borderRadius: 26,
    border: "1px solid #e5e7eb",
  },

  panelHeader: {
    display: "flex",
    gap: 14,
    marginBottom: 18,
  },

  panelIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  panelTitle: {
    margin: 0,
    color: "#0f172a",
  },

  panelSubtitle: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: 14,
  },

  panelBody: {
    display: "grid",
    gap: 18,
  },

  profileHeader: {
    display: "flex",
    alignItems: "center",
    gap: 18,
  },

  avatar: {
    width: 88,
    height: 88,
    borderRadius: 26,
    objectFit: "cover",
    background: "#eef2ff",
  },

  uploadButton: {
    height: 42,
    borderRadius: 12,
    border: "1px solid #dbe3ef",
    background: "#fff",
    padding: "0 14px",
    display: "flex",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
    fontWeight: 700,
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: 16,
  },

  field: {
    display: "grid",
    gap: 7,
    fontWeight: 700,
    color: "#334155",
  },

  input: {
    height: 48,
    borderRadius: 14,
    border: "1px solid #dbe3ef",
    background: "#fff",
    padding: "0 14px",
    fontSize: 14,
    outline: "none",
  },

  textarea: {
    minHeight: 120,
    borderRadius: 16,
    border: "1px solid #dbe3ef",
    background: "#fff",
    padding: 14,
    fontSize: 14,
    resize: "vertical",
    outline: "none",
  },

  tagWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
  },

  tag: {
    border: "1px solid #dbe3ef",
    background: "#fff",
    color: "#475569",
    borderRadius: 999,
    padding: "8px 14px",
    cursor: "pointer",
    fontWeight: 700,
  },

  tagActive: {
    background: "#2563eb",
    borderColor: "#2563eb",
    color: "#fff",
  },

  toggleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    border: "1px solid #edf2f7",
    borderRadius: 16,
    padding: 14,
  },

  toggle: {
    width: 56,
    height: 30,
    borderRadius: 999,
    border: "none",
    background: "#cbd5e1",
    position: "relative",
    cursor: "pointer",
    transition: "0.2s",
  },

  toggleActive: {
    background: "#2563eb",
  },

  toggleCircle: {
    width: 24,
    height: 24,
    borderRadius: "50%",
    background: "#fff",
    position: "absolute",
    top: 3,
    left: 3,
    transition: "0.2s",
  },

  toggleCircleActive: {
    left: 29,
  },

  securityRow: {
    border: "1px solid #edf2f7",
    borderRadius: 16,
    padding: 14,
  },
};

export default RecruiterSettings;