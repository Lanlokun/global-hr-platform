import { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  User,
  Bell,
  MessageCircle,
  ShieldCheck,
  Briefcase,
  Save,
  RotateCcw,
  Camera,
  Globe2,
  Mail,
  Phone,
  MapPin,
  Star,
  TrendingUp,
  CheckCircle2,
  Clock,
  Upload,
} from "lucide-react";

import DashboardLayout from "../../layouts/DashboardLayout";
import Button from "../../components/ui/Button";
import api from "../../services/api";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const defaultSettings = {
  name: "",
  email: "",
  phone: "",
  country: "",
  city: "",
  profile_image: "",
  professional_title: "",
  recruiter_bio: "",

  preferred_industries: "",
  preferred_countries: "",
  preferred_job_types: "",
  preferred_work_mode: "Remote",
  seniority_focus: "Mid-level",
  specialization_skills: "",

  default_candidate_message:
    "Hello, I reviewed your profile and believe you may be suitable for new opportunities on our platform.",
  default_employer_message:
    "Hello, I would like to recommend a candidate who may be a strong fit for your role.",
  auto_signature: "Best regards,\nRecruitment Team",
  availability_status: "Available",

  notify_candidate_assigned: true,
  notify_employer_replies: true,
  notify_recommendation_reviewed: true,
  notify_candidate_messages: true,
  notify_job_match_alerts: true,
  notify_weekly_summary: true,

  default_recommendation_note:
    "Recommended based on skills, experience, and role alignment.",
  auto_include_ai_notes: true,
  auto_notify_employer: true,
  follow_up_days: 3,
};

function RecruiterSettings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [initialSettings, setInitialSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [performance, setPerformance] = useState({
    totalRecommendations: 0,
    acceptedRecommendations: 0,
    averageMatchScore: 0,
    employerResponseRate: 0,
    averageResponseTime: 0,
  });

  const getImageSrc = (imagePath) => {
     return imagePath || "";
    };
  const loadSettings = async () => {
    try {
      setLoading(true);

      const [settingsRes, recommendationsRes] = await Promise.allSettled([
        api.get("/api/recruiter/settings"),
        api.get("/api/recruiter/recommendations"),
      ]);

      if (settingsRes.status === "fulfilled") {
        const data = settingsRes.value.data || {};
        const merged = {
          ...defaultSettings,
          ...data,
        };

        setSettings(merged);
        setInitialSettings(merged);
      }

      if (recommendationsRes.status === "fulfilled") {
        const data = Array.isArray(recommendationsRes.value.data)
          ? recommendationsRes.value.data
          : recommendationsRes.value.data?.recommendations || [];

        const total = data.length;
        const accepted = data.filter(
          (item) => item.status === "accepted"
        ).length;
        const viewed = data.filter((item) => item.employer_viewed).length;

        const avgScore =
          total > 0
            ? Math.round(
                data.reduce(
                  (sum, item) => sum + Number(item.match_score || 0),
                  0
                ) / total
              )
            : 0;

        const avgResponse =
          total > 0
            ? Math.round(
                data.reduce(
                  (sum, item) =>
                    sum + Number(item.recruiter_response_time_hours || 0),
                  0
                ) / total
              )
            : 0;

        setPerformance({
          totalRecommendations: total,
          acceptedRecommendations: accepted,
          averageMatchScore: avgScore,
          employerResponseRate:
            total > 0 ? Math.round((viewed / total) * 100) : 0,
          averageResponseTime: avgResponse,
        });
      }
    } catch (err) {
      console.error("Failed to load recruiter settings:", err);
      toast.error("Failed to load recruiter settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const hasChanges = useMemo(() => {
    return JSON.stringify(settings) !== JSON.stringify(initialSettings);
  }, [settings, initialSettings]);

  const updateField = (name, value) => {
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleField = (name) => {
    setSettings((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

const uploadProfileImage = async (file) => {
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    toast.error("Please upload a valid image file.");
    return;
  }

  try {
    setUploadingImage(true);

    const formData = new FormData();
    formData.append("image", file);

    const res = await api.post("/api/uploads/profile-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    updateField("profile_image", res.data.url);
    toast.success("Profile image uploaded.");
  } catch (err) {
    console.error("Image upload failed:", err);
    toast.error(err.response?.data?.error || "Failed to upload image.");
  } finally {
    setUploadingImage(false);
  }
};

  const saveSettings = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const res = await api.patch("/api/recruiter/settings", settings);
      const updated = {
        ...settings,
        ...(res.data || {}),
      };

      setSettings(updated);
      setInitialSettings(updated);
      toast.success("Recruiter settings saved successfully.");
    } catch (err) {
      console.error("Failed to save recruiter settings:", err);
      toast.error(err.response?.data?.error || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const resetChanges = () => {
    setSettings(initialSettings);
    toast("Changes reset.");
  };

  return (
    <DashboardLayout
      title="Recruiter Settings"
      subtitle="Manage your profile, recruiter preferences, messaging templates, workflow defaults, and security settings."
    >
      <Toaster position="top-right" />

      <form onSubmit={saveSettings} style={styles.page}>
        <div style={styles.headerActions}>
          <div>
            <h2 style={styles.pageTitle}>Workspace Configuration</h2>
            <p style={styles.pageSubtitle}>
              Customize how you work with candidates, employers, and
              recommendations.
            </p>
          </div>

          <div style={styles.actionButtons}>
            <button
              type="button"
              style={styles.secondaryButton}
              onClick={resetChanges}
              disabled={!hasChanges || saving}
            >
              <RotateCcw size={16} />
              Reset
            </button>

            <Button type="submit" disabled={!hasChanges || saving}>
              <Save size={16} />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        {loading ? (
          <div style={styles.emptyState}>Loading recruiter settings...</div>
        ) : (
          <>
            <div style={styles.statsGrid}>
              <StatCard
                icon={<Star size={24} />}
                title="Recommendations"
                value={performance.totalRecommendations}
                subtext="Total submitted"
                color="#4f46e5"
                bg="#eef2ff"
              />

              <StatCard
                icon={<CheckCircle2 size={24} />}
                title="Accepted"
                value={performance.acceptedRecommendations}
                subtext="Employer accepted"
                color="#16a34a"
                bg="#dcfce7"
              />

              <StatCard
                icon={<TrendingUp size={24} />}
                title="Avg Match"
                value={`${performance.averageMatchScore}%`}
                subtext="Recommendation quality"
                color="#2563eb"
                bg="#dbeafe"
              />

              <StatCard
                icon={<Clock size={24} />}
                title="Response Time"
                value={`${performance.averageResponseTime}h`}
                subtext="Average recruiter response"
                color="#f97316"
                bg="#ffedd5"
              />
            </div>

            <div style={styles.layout}>
              <section style={styles.mainColumn}>
                <SettingsPanel
                  icon={<User size={20} />}
                  title="Profile Settings"
                  subtitle="Your public recruiter identity and contact information."
                >
                  <div style={styles.profileTop}>
                    <div style={styles.avatarWrap}>
                      {settings.profile_image ? (
                        <img
                          src={getImageSrc(settings.profile_image)}
                          alt={settings.name || "Recruiter"}
                          style={styles.avatar}
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div style={styles.avatarFallback}>
                          {(settings.name || "R").charAt(0).toUpperCase()}
                        </div>
                      )}

                      <label style={styles.cameraBadge}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            uploadProfileImage(e.target.files?.[0])
                          }
                          style={{ display: "none" }}
                        />
                        <Camera size={14} />
                      </label>
                    </div>

                    <div style={styles.profileFields}>
                      <label style={styles.uploadBox}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            uploadProfileImage(e.target.files?.[0])
                          }
                          style={{ display: "none" }}
                        />

                        <Upload size={16} />

                        <span>
                          {uploadingImage
                            ? "Uploading..."
                            : "Upload Profile Image"}
                        </span>
                      </label>

                      {settings.profile_image && (
                        <p style={styles.imageHint}>
                          {settings.profile_image}
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={styles.formGrid}>
                    <InputField
                      icon={<User size={15} />}
                      label="Full Name"
                      name="name"
                      value={settings.name}
                      onChange={updateField}
                    />

                    <InputField
                      icon={<Mail size={15} />}
                      label="Email"
                      name="email"
                      value={settings.email}
                      onChange={updateField}
                      disabled
                    />

                    <InputField
                      icon={<Phone size={15} />}
                      label="Phone"
                      name="phone"
                      value={settings.phone}
                      onChange={updateField}
                    />

                    <InputField
                      icon={<Briefcase size={15} />}
                      label="Professional Title"
                      name="professional_title"
                      value={settings.professional_title}
                      onChange={updateField}
                      placeholder="Senior Talent Recruiter"
                    />

                    <InputField
                      icon={<MapPin size={15} />}
                      label="City"
                      name="city"
                      value={settings.city}
                      onChange={updateField}
                    />

                    <InputField
                      icon={<Globe2 size={15} />}
                      label="Country"
                      name="country"
                      value={settings.country}
                      onChange={updateField}
                    />
                  </div>

                  <TextAreaField
                    label="Recruiter Bio"
                    name="recruiter_bio"
                    value={settings.recruiter_bio}
                    onChange={updateField}
                    placeholder="Write a short introduction about your recruiting focus."
                  />
                </SettingsPanel>

                <SettingsPanel
                  icon={<Briefcase size={20} />}
                  title="Recruiter Preferences"
                  subtitle="Define the roles, countries, and candidate profiles you focus on."
                >
                  <div style={styles.formGrid}>
                    <InputField
                      label="Preferred Industries"
                      name="preferred_industries"
                      value={settings.preferred_industries}
                      onChange={updateField}
                      placeholder="Technology, Finance, Healthcare"
                    />

                    <InputField
                      label="Preferred Candidate Countries"
                      name="preferred_countries"
                      value={settings.preferred_countries}
                      onChange={updateField}
                      placeholder="Nigeria, Ghana, Kenya, Gambia"
                    />

                    <InputField
                      label="Preferred Job Types"
                      name="preferred_job_types"
                      value={settings.preferred_job_types}
                      onChange={updateField}
                      placeholder="Software, Product, Operations"
                    />

                    <SelectField
                      label="Preferred Work Mode"
                      name="preferred_work_mode"
                      value={settings.preferred_work_mode}
                      onChange={updateField}
                      options={["Remote", "Hybrid", "Onsite"]}
                    />

                    <SelectField
                      label="Seniority Focus"
                      name="seniority_focus"
                      value={settings.seniority_focus}
                      onChange={updateField}
                      options={[
                        "Junior",
                        "Mid-level",
                        "Senior",
                        "Executive",
                        "All",
                      ]}
                    />

                    <InputField
                      label="Specialization Skills"
                      name="specialization_skills"
                      value={settings.specialization_skills}
                      onChange={updateField}
                      placeholder="React, Node.js, AI, Data, Sales"
                    />
                  </div>
                </SettingsPanel>

                <SettingsPanel
                  icon={<MessageCircle size={20} />}
                  title="Messaging Templates"
                  subtitle="Set reusable messages for candidates and employers."
                >
                  <TextAreaField
                    label="Default Candidate Message"
                    name="default_candidate_message"
                    value={settings.default_candidate_message}
                    onChange={updateField}
                  />

                  <TextAreaField
                    label="Default Employer Follow-up Message"
                    name="default_employer_message"
                    value={settings.default_employer_message}
                    onChange={updateField}
                  />

                  <TextAreaField
                    label="Auto Signature"
                    name="auto_signature"
                    value={settings.auto_signature}
                    onChange={updateField}
                  />

                  <SelectField
                    label="Availability Status"
                    name="availability_status"
                    value={settings.availability_status}
                    onChange={updateField}
                    options={["Available", "Busy", "Away"]}
                  />
                </SettingsPanel>
              </section>

              <aside style={styles.sideColumn}>
                <SettingsPanel
                  icon={<Bell size={20} />}
                  title="Notifications"
                  subtitle="Choose what updates you want to receive."
                >
                  <ToggleRow
                    label="New candidate assigned"
                    checked={settings.notify_candidate_assigned}
                    onClick={() => toggleField("notify_candidate_assigned")}
                  />

                  <ToggleRow
                    label="Employer replies"
                    checked={settings.notify_employer_replies}
                    onClick={() => toggleField("notify_employer_replies")}
                  />

                  <ToggleRow
                    label="Recommendation reviewed"
                    checked={settings.notify_recommendation_reviewed}
                    onClick={() =>
                      toggleField("notify_recommendation_reviewed")
                    }
                  />

                  <ToggleRow
                    label="Candidate messages"
                    checked={settings.notify_candidate_messages}
                    onClick={() => toggleField("notify_candidate_messages")}
                  />

                  <ToggleRow
                    label="Job match alerts"
                    checked={settings.notify_job_match_alerts}
                    onClick={() => toggleField("notify_job_match_alerts")}
                  />

                  <ToggleRow
                    label="Weekly performance summary"
                    checked={settings.notify_weekly_summary}
                    onClick={() => toggleField("notify_weekly_summary")}
                  />
                </SettingsPanel>

                <SettingsPanel
                  icon={<ShieldCheck size={20} />}
                  title="Recommendation Defaults"
                  subtitle="Configure how recommendations are prepared."
                >
                  <TextAreaField
                    label="Default Recommendation Note"
                    name="default_recommendation_note"
                    value={settings.default_recommendation_note}
                    onChange={updateField}
                  />

                  <ToggleRow
                    label="Auto-include AI notes"
                    checked={settings.auto_include_ai_notes}
                    onClick={() => toggleField("auto_include_ai_notes")}
                  />

                  <ToggleRow
                    label="Auto-notify employer"
                    checked={settings.auto_notify_employer}
                    onClick={() => toggleField("auto_notify_employer")}
                  />

                  <InputField
                    label="Follow-up reminder interval, days"
                    name="follow_up_days"
                    type="number"
                    value={settings.follow_up_days}
                    onChange={updateField}
                  />
                </SettingsPanel>

                <SettingsPanel
                  icon={<ShieldCheck size={20} />}
                  title="Security"
                  subtitle="Account security and access controls."
                >
                  <SecurityItem
                    label="Password"
                    value="Managed from account security"
                  />
                  <SecurityItem
                    label="Two-factor authentication"
                    value="Not enabled"
                  />
                  <SecurityItem
                    label="Active sessions"
                    value="Current browser session"
                  />

                    <button
                    type="button"
                    style={styles.securityButton}
                    onClick={() => toast("Security settings will be available soon.")}
                    >
                    Manage Security
                    </button>
                </SettingsPanel>
              </aside>
            </div>
          </>
        )}
      </form>
    </DashboardLayout>
  );
}

function SettingsPanel({ icon, title, subtitle, children }) {
  return (
    <div style={styles.panel}>
      <div style={styles.panelHeader}>
        <div style={styles.panelIcon}>{icon}</div>

        <div>
          <h3 style={styles.panelTitle}>{title}</h3>
          <p style={styles.panelSubtitle}>{subtitle}</p>
        </div>
      </div>

      <div style={styles.panelBody}>{children}</div>
    </div>
  );
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

function InputField({
  icon,
  label,
  name,
  value,
  onChange,
  placeholder,
  disabled,
  type = "text",
}) {
  return (
    <label style={styles.field}>
      <span style={styles.fieldLabel}>{label}</span>

      <div style={styles.inputWrap}>
        {icon && <span style={styles.inputIcon}>{icon}</span>}

        <input
          type={type}
          name={name}
          value={value || ""}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => onChange(name, e.target.value)}
          style={{
            ...styles.input,
            paddingLeft: icon ? 38 : 14,
            opacity: disabled ? 0.65 : 1,
          }}
        />
      </div>
    </label>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <label style={styles.field}>
      <span style={styles.fieldLabel}>{label}</span>

      <select
        name={name}
        value={value || ""}
        onChange={(e) => onChange(name, e.target.value)}
        style={styles.select}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextAreaField({ label, name, value, onChange, placeholder }) {
  return (
    <label style={styles.field}>
      <span style={styles.fieldLabel}>{label}</span>

      <textarea
        name={name}
        value={value || ""}
        placeholder={placeholder}
        onChange={(e) => onChange(name, e.target.value)}
        style={styles.textarea}
      />
    </label>
  );
}

function ToggleRow({ label, checked, onClick }) {
  return (
    <button type="button" style={styles.toggleRow} onClick={onClick}>
      <span>{label}</span>

      <span
        style={{
          ...styles.toggleTrack,
          background: checked ? "#2563eb" : "#cbd5e1",
        }}
      >
        <span
          style={{
            ...styles.toggleDot,
            transform: checked ? "translateX(20px)" : "translateX(0)",
          }}
        />
      </span>
    </button>
  );
}

function SecurityItem({ label, value }) {
  return (
    <div style={styles.securityItem}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

const styles = {
  page: {
    display: "grid",
    gap: 22,
  },

  headerActions: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "center",
    flexWrap: "wrap",
  },

  pageTitle: {
    margin: 0,
    color: "#0f172a",
  },

  pageSubtitle: {
    margin: "6px 0 0",
    color: "#64748b",
  },

  actionButtons: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  secondaryButton: {
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

  emptyState: {
    padding: 60,
    textAlign: "center",
    color: "#64748b",
    fontWeight: 700,
    background: "#fff",
    borderRadius: 24,
    border: "1px solid #e5e7eb",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 18,
  },

  statCard: {
    minHeight: 112,
    background: "#fff",
    border: "1px solid #e8edf5",
    borderRadius: 24,
    padding: 20,
    display: "flex",
    gap: 16,
    alignItems: "center",
    boxShadow: "0 20px 50px rgba(15, 23, 42, 0.06)",
  },

  statIcon: {
    width: 58,
    height: 58,
    borderRadius: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  statTitle: {
    margin: 0,
    color: "#475569",
    fontSize: 14,
    fontWeight: 700,
  },

  statValue: {
    margin: "6px 0 2px",
    fontSize: 28,
    color: "#0f172a",
    lineHeight: 1,
  },

  statSubtext: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: 600,
  },

  layout: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.4fr) minmax(320px, 0.8fr)",
    gap: 20,
    alignItems: "start",
  },

  mainColumn: {
    display: "grid",
    gap: 20,
  },

  sideColumn: {
    display: "grid",
    gap: 20,
  },

  panel: {
    background: "#fff",
    border: "1px solid #e8edf5",
    borderRadius: 24,
    padding: 20,
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.055)",
  },

  panelHeader: {
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
    marginBottom: 18,
    paddingBottom: 16,
    borderBottom: "1px solid #eef2f7",
  },

  panelIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  panelTitle: {
    margin: 0,
    color: "#0f172a",
    fontSize: 18,
  },

  panelSubtitle: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: 13,
  },

  panelBody: {
    display: "grid",
    gap: 16,
  },

  profileTop: {
    display: "grid",
    gridTemplateColumns: "96px 1fr",
    gap: 18,
    alignItems: "center",
  },

  avatarWrap: {
    width: 86,
    height: 86,
    position: "relative",
  },

  avatar: {
    width: 86,
    height: 86,
    borderRadius: 26,
    objectFit: "cover",
    border: "1px solid #e5e7eb",
    background: "#eef2ff",
  },

  avatarFallback: {
    width: 86,
    height: 86,
    borderRadius: 26,
    background: "linear-gradient(135deg, #2563eb, #4f46e5)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 30,
    fontWeight: 900,
  },

  cameraBadge: {
    position: "absolute",
    right: -4,
    bottom: -4,
    width: 30,
    height: 30,
    borderRadius: "50%",
    background: "#0f172a",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "3px solid #fff",
    cursor: "pointer",
  },

  profileFields: {
    minWidth: 0,
    display: "grid",
    gap: 8,
  },

  uploadBox: {
    height: 46,
    border: "1px dashed #94a3b8",
    borderRadius: 14,
    background: "#f8fafc",
    color: "#334155",
    fontWeight: 800,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "0 16px",
  },

  imageHint: {
    margin: 0,
    color: "#64748b",
    fontSize: 12,
    wordBreak: "break-all",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
    gap: 14,
  },

  field: {
    display: "grid",
    gap: 7,
  },

  fieldLabel: {
    color: "#334155",
    fontSize: 13,
    fontWeight: 800,
  },

  inputWrap: {
    position: "relative",
  },

  inputIcon: {
    position: "absolute",
    left: 13,
    top: "50%",
    transform: "translateY(-50%)",
    color: "#64748b",
    display: "flex",
  },

  input: {
    width: "100%",
    height: 46,
    border: "1px solid #dbe3ef",
    borderRadius: 14,
    outline: "none",
    color: "#0f172a",
    background: "#fff",
    fontWeight: 600,
  },

  select: {
    width: "100%",
    height: 46,
    border: "1px solid #dbe3ef",
    borderRadius: 14,
    outline: "none",
    color: "#0f172a",
    background: "#fff",
    padding: "0 12px",
    fontWeight: 700,
  },

  textarea: {
    width: "100%",
    minHeight: 110,
    border: "1px solid #dbe3ef",
    borderRadius: 14,
    outline: "none",
    color: "#0f172a",
    background: "#fff",
    padding: 12,
    resize: "vertical",
    lineHeight: 1.6,
    fontWeight: 600,
  },

  toggleRow: {
    width: "100%",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    background: "#fff",
    padding: 14,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    cursor: "pointer",
    color: "#334155",
    fontWeight: 800,
    textAlign: "left",
  },

  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 999,
    padding: 2,
    transition: "0.2s ease",
    flexShrink: 0,
  },

  toggleDot: {
    width: 20,
    height: 20,
    borderRadius: "50%",
    background: "#fff",
    display: "block",
    transition: "0.2s ease",
  },

  securityItem: {
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 14,
    display: "grid",
    gap: 4,
    color: "#64748b",
  },

  securityButton: {
    height: 42,
    border: "none",
    borderRadius: 13,
    background: "#0f172a",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
};

export default RecruiterSettings;