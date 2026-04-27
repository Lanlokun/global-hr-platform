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

function EmployerSettings() {
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
        description: "Full workspace control.",
        permissions: [
          "Manage company profile",
          "Create and delete jobs",
          "Review all applicants",
          "Invite team members",
          "Manage permissions",
          "Access billing and security",
        ],
      },
      {
        role: "Admin",
        description: "Can manage most hiring operations.",
        permissions: [
          "Manage jobs",
          "Review applicants",
          "Invite recruiters",
          "Update company profile",
        ],
      },
      {
        role: "Recruiter",
        description: "Can manage candidates and applications.",
        permissions: [
          "View applicants",
          "Update application status",
          "Add recruiter notes",
          "Browse talent directory",
        ],
      },
      {
        role: "Hiring Manager",
        description: "Can review candidates for assigned roles.",
        permissions: [
          "View assigned jobs",
          "Review applicants",
          "Score candidates",
          "Leave interview feedback",
        ],
      },
    ],
    []
  );

  const updateWorkspace = (field, value) => {
    setWorkspace((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const inviteMember = () => {
    if (!inviteForm.email.trim()) {
      toast.error("Email is required");
      return;
    }

    const exists = teamMembers.some(
      (member) => member.email.toLowerCase() === inviteForm.email.toLowerCase()
    );

    if (exists) {
      toast.error("This team member already exists");
      return;
    }

    setTeamMembers((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: inviteForm.name || "Pending user",
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

    toast.success("Team invitation added");
  };

  const removeMember = (id) => {
    setTeamMembers((prev) => prev.filter((member) => member.id !== id));
    toast.success("Team member removed");
  };

  const saveSettings = () => {
    toast.success("Workspace settings saved");
  };

  return (
    <DashboardLayout
      title="Settings"
      subtitle="Manage team access, permissions, notifications, and workspace preferences."
    >
      <PageHeader
        action={<Badge variant="default">Employer Workspace</Badge>}
      />

      <div style={styles.grid}>
        <div style={styles.main}>
          <Card
            title="Workspace Settings"
            subtitle="Control your company workspace identity and hiring defaults."
          >
            <SectionHeader
              icon={<Building2 size={20} />}
              title="Company Workspace"
              text="Basic workspace information used across your employer dashboard."
            />

            <div style={styles.formGrid}>
              <Input
                label="Workspace name"
                placeholder="AfriTalent Solutions"
                value={workspace.workspace_name}
                onChange={(e) =>
                  updateWorkspace("workspace_name", e.target.value)
                }
              />

              <Input
                label="Company website"
                placeholder="https://company.com"
                value={workspace.website}
                onChange={(e) => updateWorkspace("website", e.target.value)}
              />

              <Input
                label="Default hiring country"
                placeholder="Nigeria"
                value={workspace.default_country}
                onChange={(e) =>
                  updateWorkspace("default_country", e.target.value)
                }
              />

              <Input
                label="Company size"
                placeholder="11-50 employees"
                value={workspace.company_size}
                onChange={(e) =>
                  updateWorkspace("company_size", e.target.value)
                }
              />
            </div>

            <div style={styles.divider} />

            <SectionHeader
              icon={<Bell size={20} />}
              title="Notifications"
              text="Choose what your hiring team should be alerted about."
            />

            <div style={styles.preferenceList}>
              <Preference
                checked={workspace.new_application_alerts}
                onChange={(value) =>
                  updateWorkspace("new_application_alerts", value)
                }
                title="New application alerts"
                text="Notify the team when a candidate applies to one of your jobs."
              />

              <Preference
                checked={workspace.status_update_alerts}
                onChange={(value) =>
                  updateWorkspace("status_update_alerts", value)
                }
                title="Candidate status updates"
                text="Notify team members when an application status changes."
              />

              <Preference
                checked={workspace.weekly_summary}
                onChange={(value) => updateWorkspace("weekly_summary", value)}
                title="Weekly hiring summary"
                text="Receive a weekly overview of jobs, applicants, and hiring activity."
              />
            </div>

            <div style={styles.divider} />

            <SectionHeader
              icon={<Lock size={20} />}
              title="Security and Visibility"
              text="Control access and public visibility for this employer workspace."
            />

            <div style={styles.preferenceList}>
              <Preference
                checked={workspace.public_profile}
                onChange={(value) => updateWorkspace("public_profile", value)}
                title="Public employer profile"
                text="Allow candidates to see your company profile and active jobs."
              />

              <Preference
                checked={workspace.two_factor_required}
                onChange={(value) =>
                  updateWorkspace("two_factor_required", value)
                }
                title="Require two-factor authentication"
                text="Require team members to use stronger account protection."
              />
            </div>

            <div style={styles.actions}>
              <Button variant="secondary">Cancel</Button>
              <Button onClick={saveSettings}>Save Settings</Button>
            </div>
          </Card>

          <div style={{ height: 20 }} />

          <Card
            title="Team Members"
            subtitle="Invite and manage people who can access this employer workspace."
          >
            <SectionHeader
              icon={<UserPlus size={20} />}
              title="Invite Team Member"
              text="Add recruiters, admins, and hiring managers to your workspace."
            />

            <div style={styles.inviteGrid}>
              <Input
                label="Name"
                placeholder="Team member name"
                value={inviteForm.name}
                onChange={(e) =>
                  setInviteForm({ ...inviteForm, name: e.target.value })
                }
              />

              <Input
                label="Email"
                type="email"
                placeholder="name@company.com"
                value={inviteForm.email}
                onChange={(e) =>
                  setInviteForm({ ...inviteForm, email: e.target.value })
                }
              />

              <Input
                label="Role"
                as="select"
                value={inviteForm.role}
                onChange={(e) =>
                  setInviteForm({ ...inviteForm, role: e.target.value })
                }
                options={[
                  { value: "Admin", label: "Admin" },
                  { value: "Recruiter", label: "Recruiter" },
                  { value: "Hiring Manager", label: "Hiring Manager" },
                ]}
              />

              <div style={styles.inviteButtonWrap}>
                <Button onClick={inviteMember}>
                  <UserPlus size={16} />
                  Invite
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
                    {member.status}
                  </Badge>

                  <Badge variant="default">{member.role}</Badge>

                  {member.role !== "Owner" && (
                    <button
                      type="button"
                      style={styles.iconButton}
                      onClick={() => removeMember(member.id)}
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
            title="Role Permissions"
            subtitle="Understand what each workspace role can access."
          >
            <div style={styles.permissionsGrid}>
              {rolePermissions.map((role) => (
                <div key={role.role} style={styles.permissionCard}>
                  <div style={styles.permissionHeader}>
                    <KeyRound size={18} />
                    <div>
                      <strong>{role.role}</strong>
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
          <Card title="Workspace Status" subtitle="Current setup overview.">
            <div style={styles.statusBox}>
              <ShieldCheck size={28} />
              <div>
                <strong>Active workspace</strong>
                <p>Your employer account is ready to manage hiring.</p>
              </div>
            </div>

            <div style={styles.statList}>
              <Stat label="Workspace" value={workspace.workspace_name} />
              <Stat label="Team Members" value={teamMembers.length} />
              <Stat label="Access Level" value="Company-level" />
              <Stat label="Security" value="Standard" />
            </div>
          </Card>

          <div style={{ height: 18 }} />

          <Card title="Settings Areas" subtitle="What you can manage here.">
            <div style={styles.featureList}>
              <Feature icon={<Users size={18} />} title="Team members" />
              <Feature icon={<Lock size={18} />} title="Role permissions" />
              <Feature icon={<Mail size={18} />} title="Notifications" />
              <Feature icon={<Globe2 size={18} />} title="Public visibility" />
              <Feature icon={<Settings2 size={18} />} title="Workspace defaults" />
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
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