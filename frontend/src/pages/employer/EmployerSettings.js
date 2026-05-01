import { useMemo, useState } from "react";
import {
  Bell,
  Building2,
  Globe2,
  Lock,
  Mail,
  ShieldCheck,
  Users,
  UserPlus,
  Trash2,
  Settings2,
  KeyRound,
} from "lucide-react";
import { toast } from "react-hot-toast";

import DashboardLayout from "../../layouts/DashboardLayout";
import PageHeader from "../../components/ui/PageHeader";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import { useLanguage } from "../../context/LanguageContext";

function EmployerSettings() {
  const { t } = useLanguage();

  const [inviteForm, setInviteForm] = useState({
    name: "",
    email: "",
    role: "Recruiter",
  });

  const [workspace, setWorkspace] = useState({
    workspace_name: "AfriTalent Solutions",
    website: "https://afritalent.com",
    default_country: "Nigeria",
    company_size: "11-50",
    new_application_alerts: true,
    status_update_alerts: true,
    weekly_summary: true,
    public_profile: true,
    two_factor_required: false,
  });

  const [teamMembers, setTeamMembers] = useState([
    {
      id: 1,
      name: "Amina Bello",
      email: "amina@afritalent.com",
      role: "Owner",
      status: "Active",
    },
    {
      id: 2,
      name: "Samuel Okoro",
      email: "samuel@afritalent.com",
      role: "Recruiter",
      status: "Active",
    },
    {
      id: 3,
      name: "Mariam Sani",
      email: "mariam@afritalent.com",
      role: "Hiring Manager",
      status: "Invited",
    },
  ]);

  const rolePermissions = useMemo(
    () => [
      {
        role: "Owner",
        description: t("ownerRoleDesc"),
        permissions: [
          t("permissionManageCompanyProfile"),
          t("permissionCreateDeleteJobs"),
          t("permissionReviewAllApplicants"),
          t("permissionInviteTeamMembers"),
          t("permissionManagePermissions"),
          t("permissionAccessBillingSecurity"),
        ],
      },
      {
        role: "Admin",
        description: t("adminRoleDesc"),
        permissions: [
          t("permissionManageJobs"),
          t("permissionReviewApplicants"),
          t("permissionInviteRecruiters"),
          t("permissionUpdateCompanyProfile"),
        ],
      },
      {
        role: "Recruiter",
        description: t("recruiterRoleDesc"),
        permissions: [
          t("permissionViewApplicants"),
          t("permissionUpdateApplicationStatus"),
          t("permissionAddRecruiterNotes"),
          t("permissionBrowseTalentDirectory"),
        ],
      },
      {
        role: "Hiring Manager",
        description: t("hiringManagerRoleDesc"),
        permissions: [
          t("permissionViewAssignedJobs"),
          t("permissionReviewApplicants"),
          t("permissionScoreCandidates"),
          t("permissionLeaveInterviewFeedback"),
        ],
      },
    ],
    [t]
  );

  const updateWorkspace = (field, value) => {
    setWorkspace((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const inviteMember = () => {
    if (!inviteForm.email.trim()) {
      toast.error(t("emailRequired"));
      return;
    }

    const exists = teamMembers.some(
      (member) => member.email.toLowerCase() === inviteForm.email.toLowerCase()
    );

    if (exists) {
      toast.error(t("teamMemberExists"));
      return;
    }

    setTeamMembers((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: inviteForm.name || t("pendingUser"),
        email: inviteForm.email,
        role: inviteForm.role,
        status: "Invited",
      },
    ]);

    setInviteForm({
      name: "",
      email: "",
      role: "Recruiter",
    });

    toast.success(t("teamInvitationAdded"));
  };

  const removeMember = (id) => {
    setTeamMembers((prev) => prev.filter((member) => member.id !== id));
    toast.success(t("teamMemberRemoved"));
  };

  const saveSettings = () => {
    toast.success(t("workspaceSettingsSaved"));
  };

  return (
    <DashboardLayout title={t("settings")} subtitle={t("settingsSubtitle")}>
      <PageHeader
        action={<Badge variant="default">{t("employerWorkspace")}</Badge>}
      />

      <div style={styles.grid}>
        <div style={styles.main}>
          <Card
            title={t("workspaceSettings")}
            subtitle={t("workspaceSettingsSubtitle")}
          >
            <SectionHeader
              icon={<Building2 size={20} />}
              title={t("companyWorkspace")}
              text={t("companyWorkspaceDesc")}
            />

            <div style={styles.formGrid}>
              <Input
                label={t("workspaceName")}
                placeholder="AfriTalent Solutions"
                value={workspace.workspace_name}
                onChange={(e) =>
                  updateWorkspace("workspace_name", e.target.value)
                }
              />

              <Input
                label={t("companyWebsite")}
                placeholder="https://company.com"
                value={workspace.website}
                onChange={(e) => updateWorkspace("website", e.target.value)}
              />

              <Input
                label={t("defaultHiringCountry")}
                placeholder="Nigeria"
                value={workspace.default_country}
                onChange={(e) =>
                  updateWorkspace("default_country", e.target.value)
                }
              />

              <Input
                label={t("companySize")}
                placeholder={t("companySizePlaceholder")}
                value={workspace.company_size}
                onChange={(e) =>
                  updateWorkspace("company_size", e.target.value)
                }
              />
            </div>

            <div style={styles.divider} />

            <SectionHeader
              icon={<Bell size={20} />}
              title={t("notifications")}
              text={t("notificationsDesc")}
            />

            <div style={styles.preferenceList}>
              <Preference
                checked={workspace.new_application_alerts}
                onChange={(value) =>
                  updateWorkspace("new_application_alerts", value)
                }
                title={t("newApplicationAlerts")}
                text={t("newApplicationAlertsDesc")}
              />

              <Preference
                checked={workspace.status_update_alerts}
                onChange={(value) =>
                  updateWorkspace("status_update_alerts", value)
                }
                title={t("candidateStatusUpdates")}
                text={t("candidateStatusUpdatesDesc")}
              />

              <Preference
                checked={workspace.weekly_summary}
                onChange={(value) => updateWorkspace("weekly_summary", value)}
                title={t("weeklyHiringSummary")}
                text={t("weeklyHiringSummaryDesc")}
              />
            </div>

            <div style={styles.divider} />

            <SectionHeader
              icon={<Lock size={20} />}
              title={t("securityAndVisibility")}
              text={t("securityAndVisibilityDesc")}
            />

            <div style={styles.preferenceList}>
              <Preference
                checked={workspace.public_profile}
                onChange={(value) => updateWorkspace("public_profile", value)}
                title={t("publicEmployerProfile")}
                text={t("publicEmployerProfileDesc")}
              />

              <Preference
                checked={workspace.two_factor_required}
                onChange={(value) =>
                  updateWorkspace("two_factor_required", value)
                }
                title={t("requireTwoFactor")}
                text={t("requireTwoFactorDesc")}
              />
            </div>

            <div style={styles.actions}>
              <Button variant="secondary">{t("cancel")}</Button>
              <Button onClick={saveSettings}>{t("saveSettings")}</Button>
            </div>
          </Card>

          <div style={{ height: 20 }} />

          <Card title={t("teamMembers")} subtitle={t("teamMembersSubtitle")}>
            <SectionHeader
              icon={<UserPlus size={20} />}
              title={t("inviteTeamMember")}
              text={t("inviteTeamMemberDesc")}
            />

            <div style={styles.inviteGrid}>
              <Input
                label={t("name")}
                placeholder={t("teamMemberNamePlaceholder")}
                value={inviteForm.name}
                onChange={(e) =>
                  setInviteForm({ ...inviteForm, name: e.target.value })
                }
              />

              <Input
                label={t("email")}
                type="email"
                placeholder="name@company.com"
                value={inviteForm.email}
                onChange={(e) =>
                  setInviteForm({ ...inviteForm, email: e.target.value })
                }
              />

              <Input
                label={t("role")}
                as="select"
                value={inviteForm.role}
                onChange={(e) =>
                  setInviteForm({ ...inviteForm, role: e.target.value })
                }
                options={[
                  { value: "Admin", label: t("admin") },
                  { value: "Recruiter", label: t("recruiter") },
                  { value: "Hiring Manager", label: t("hiringManager") },
                ]}
              />

              <div style={styles.inviteButtonWrap}>
                <Button onClick={inviteMember}>
                  <UserPlus size={16} />
                  {t("invite")}
                </Button>
              </div>
            </div>

            <div style={styles.teamList}>
              {teamMembers.map((member) => (
                <div key={member.id} style={styles.teamMember}>
                  <div style={styles.memberAvatar}>
                    {member.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>

                  <div style={{ flex: 1 }}>
                    <strong style={styles.memberName}>{member.name}</strong>
                    <p style={styles.memberEmail}>{member.email}</p>
                  </div>

                  <Badge
                    variant={member.status === "Active" ? "success" : "warning"}
                  >
                    {t(member.status.toLowerCase())}
                  </Badge>

                  <Badge variant="default">{t(roleKey(member.role))}</Badge>

                  {member.role !== "Owner" && (
                    <button
                      type="button"
                      style={styles.iconButton}
                      onClick={() => removeMember(member.id)}
                      aria-label={t("removeTeamMember")}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <div style={{ height: 20 }} />

          <Card
            title={t("rolePermissions")}
            subtitle={t("rolePermissionsSubtitle")}
          >
            <div style={styles.permissionsGrid}>
              {rolePermissions.map((role) => (
                <div key={role.role} style={styles.permissionCard}>
                  <div style={styles.permissionHeader}>
                    <KeyRound size={18} />
                    <div>
                      <strong>{t(roleKey(role.role))}</strong>
                      <p>{role.description}</p>
                    </div>
                  </div>

                  <div style={styles.permissionList}>
                    {role.permissions.map((permission) => (
                      <span key={permission}>{permission}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div style={styles.side}>
          <Card
            title={t("workspaceStatus")}
            subtitle={t("workspaceStatusSubtitle")}
          >
            <div style={styles.statusBox}>
              <ShieldCheck size={28} />
              <div>
                <strong>{t("activeWorkspace")}</strong>
                <p>{t("activeWorkspaceDesc")}</p>
              </div>
            </div>

            <div style={styles.statList}>
              <Stat label={t("workspace")} value={workspace.workspace_name} />
              <Stat label={t("teamMembers")} value={teamMembers.length} />
              <Stat label={t("accessLevel")} value={t("companyLevel")} />
              <Stat label={t("security")} value={t("standard")} />
            </div>
          </Card>

          <div style={{ height: 18 }} />

          <Card title={t("settingsAreas")} subtitle={t("settingsAreasSubtitle")}>
            <div style={styles.featureList}>
              <Feature icon={<Users size={18} />} title={t("teamMembers")} />
              <Feature icon={<Lock size={18} />} title={t("rolePermissions")} />
              <Feature icon={<Mail size={18} />} title={t("notifications")} />
              <Feature icon={<Globe2 size={18} />} title={t("publicVisibility")} />
              <Feature
                icon={<Settings2 size={18} />}
                title={t("workspaceDefaults")}
              />
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

function roleKey(role) {
  const map = {
    Owner: "owner",
    Admin: "admin",
    Recruiter: "recruiter",
    "Hiring Manager": "hiringManager",
  };

  return map[role] || role;
}

function SectionHeader({ icon, title, text }) {
  return (
    <div style={styles.sectionHeader}>
      <div style={styles.sectionIcon}>{icon}</div>
      <div>
        <h3>{title}</h3>
        <p>{text}</p>
      </div>
    </div>
  );
}

function Preference({ checked, onChange, title, text }) {
  return (
    <label style={styles.preferenceItem}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div>
        <strong>{title}</strong>
        <p>{text}</p>
      </div>
    </label>
  );
}

function Stat({ label, value }) {
  return (
    <div style={styles.statItem}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function Feature({ icon, title }) {
  return (
    <div style={styles.featureItem}>
      {icon}
      <span>{title}</span>
    </div>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) 340px",
    gap: 20,
    alignItems: "start",
  },
  main: {
    minWidth: 0,
  },
  side: {
    minWidth: 0,
  },
  sectionHeader: {
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
    marginBottom: 18,
  },
  sectionIcon: {
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
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 14,
  },
  inviteGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 220px auto",
    gap: 14,
    alignItems: "end",
  },
  inviteButtonWrap: {
    display: "flex",
    alignItems: "end",
  },
  divider: {
    height: 1,
    background: "#e5e7eb",
    margin: "26px 0",
  },
  preferenceList: {
    display: "grid",
    gap: 12,
  },
  preferenceItem: {
    display: "flex",
    gap: 12,
    padding: 14,
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    background: "#f9fafb",
    cursor: "pointer",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 28,
  },
  teamList: {
    display: "grid",
    gap: 12,
    marginTop: 22,
  },
  teamMember: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 18,
    border: "1px solid #e5e7eb",
    background: "#fff",
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    background: "linear-gradient(135deg, #111827, #2563eb)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    flexShrink: 0,
  },
  memberName: {
    display: "block",
    color: "#111827",
  },
  memberEmail: {
    margin: "4px 0 0",
    color: "#6b7280",
    fontSize: 14,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    border: "1px solid #fee2e2",
    background: "#fef2f2",
    color: "#dc2626",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  permissionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 14,
  },
  permissionCard: {
    padding: 16,
    borderRadius: 18,
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
  },
  permissionHeader: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    marginBottom: 12,
  },
  permissionList: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },
  statusBox: {
    display: "flex",
    gap: 12,
    padding: 14,
    borderRadius: 18,
    background: "#ecfdf5",
    color: "#065f46",
  },
  statList: {
    display: "grid",
    gap: 12,
    marginTop: 18,
  },
  statItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    paddingBottom: 10,
    borderBottom: "1px solid #e5e7eb",
  },
  featureList: {
    display: "grid",
    gap: 12,
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    background: "#f9fafb",
    color: "#374151",
    fontWeight: 600,
  },
};

export default EmployerSettings;