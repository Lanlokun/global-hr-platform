import { useEffect, useState } from "react";

import api from "../../services/api";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { useLanguage } from "../../context/LanguageContext";

function AdminUsers() {
  const { t } = useLanguage();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [resettingUser, setResettingUser] = useState(null);
  const [creatingUser, setCreatingUser] = useState(false);

  const [summary, setSummary] = useState({
    users: 0,
    admins: 0,
    employers: 0,
    candidates: 0,
  });

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchSummary = async () => {
    try {
      const res = await api.get("/api/admin/stats");

      setSummary({
        users: res.data.users || 0,
        admins: res.data.admins || 0,
        employers: res.data.employers || 0,
        candidates: res.data.candidates || 0,
      });
    } catch (error) {
      console.error("Failed to fetch summary:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const res = await api.get("/api/admin/users", {
        params: {
          search,
          role,
          page,
          limit,
        },
      });

      setUsers(res.data.users || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      alert(error.response?.data?.error || t("adminUsers.errors.fetchUsers"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, role]);

  const refresh = async () => {
    await fetchUsers();
    await fetchSummary();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleCreateUser = async (payload) => {
    try {
      await api.post("/api/admin/users", payload);

      setCreatingUser(false);
      await refresh();
    } catch (error) {
      console.error("Failed to create user:", error);
      alert(error.response?.data?.error || t("adminUsers.errors.createUser"));
    }
  };

  const handleUpdateUser = async (userId, payload) => {
    try {
      await api.patch(`/api/admin/users/${userId}`, payload);

      setEditingUser(null);
      setSelectedUser(null);
      await refresh();
    } catch (error) {
      console.error("Failed to update user:", error);
      alert(error.response?.data?.error || t("adminUsers.errors.updateUser"));
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/api/admin/users/${userId}/role`, {
        role: newRole,
      });

      await refresh();
    } catch (error) {
      console.error("Failed to update role:", error);
      alert(error.response?.data?.error || t("adminUsers.errors.updateRole"));
    }
  };

  const handleResetPassword = async (userId, password) => {
    try {
      await api.patch(`/api/admin/users/${userId}/password`, {
        password,
      });

      setResettingUser(null);
      alert(t("adminUsers.success.passwordReset"));
    } catch (error) {
      console.error("Failed to reset password:", error);
      alert(error.response?.data?.error || t("adminUsers.errors.resetPassword"));
    }
  };

  const handleDeleteUser = async (userId) => {
    const confirmed = window.confirm(t("adminUsers.confirm.deleteUser"));

    if (!confirmed) return;

    try {
      await api.delete(`/api/admin/users/${userId}`);

      setSelectedUser(null);
      setEditingUser(null);
      setResettingUser(null);

      await refresh();
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert(error.response?.data?.error || t("adminUsers.errors.deleteUser"));
    }
  };

  return (
    <DashboardLayout
      title={t("adminUsers.title")}
      subtitle={t("adminUsers.subtitle")}
    >
      <div style={statsGridStyle}>
        <StatCard
          title={t("adminUsers.stats.totalUsers")}
          value={summary.users}
          subtitle={t("adminUsers.stats.usersRegistered").replace(
            "{{count}}",
            summary.users
          )}
          color="#0f172a"
        />

        <StatCard
          title={t("adminUsers.stats.admins")}
          value={summary.admins}
          subtitle={t("adminUsers.stats.adminAccounts").replace(
            "{{count}}",
            summary.admins
          )}
          color="#dc2626"
        />

        <StatCard
          title={t("adminUsers.stats.employers")}
          value={summary.employers}
          subtitle={t("adminUsers.stats.employerAccounts").replace(
            "{{count}}",
            summary.employers
          )}
          color="#2563eb"
        />

        <StatCard
          title={t("adminUsers.stats.candidates")}
          value={summary.candidates}
          subtitle={t("adminUsers.stats.candidateProfiles").replace(
            "{{count}}",
            summary.candidates
          )}
          color="#16a34a"
        />
      </div>

      <Card
        title={t("adminUsers.directory.title")}
        subtitle={t("adminUsers.directory.subtitle")}
      >
        <div style={topActionsStyle}>
          <form onSubmit={handleSearch} style={filterBarStyle}>
            <input
              type="text"
              placeholder={t("adminUsers.directory.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={inputStyle}
            />

            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setPage(1);
              }}
              style={selectStyle}
            >
              <option value="all">{t("adminUsers.roles.allRoles")}</option>
              <option value="admin">{t("adminUsers.roles.admin")}</option>
              <option value="employer">{t("adminUsers.roles.employer")}</option>
              <option value="candidate">{t("adminUsers.roles.candidate")}</option>
            </select>

            <Button type="submit">{t("adminUsers.directory.search")}</Button>
          </form>

          <button
            type="button"
            style={createButtonStyle}
            onClick={() => setCreatingUser(true)}
          >
            {t("adminUsers.directory.addUser")}
          </button>
        </div>

        <div style={roleTabsStyle}>
          {[
            {
              value: "all",
              label: t("adminUsers.roles.all"),
              count: summary.users,
            },
            {
              value: "admin",
              label: t("adminUsers.roles.admins"),
              count: summary.admins,
            },
            {
              value: "employer",
              label: t("adminUsers.roles.employers"),
              count: summary.employers,
            },
            {
              value: "candidate",
              label: t("adminUsers.roles.candidates"),
              count: summary.candidates,
            },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => {
                setRole(item.value);
                setPage(1);
              }}
              style={{
                ...roleTabStyle,
                ...(role === item.value ? activeRoleTabStyle : {}),
              }}
            >
              {item.label}
              <span
                style={{
                  ...roleTabCountStyle,
                  ...(role === item.value ? activeRoleTabCountStyle : {}),
                }}
              >
                {item.count}
              </span>
            </button>
          ))}
        </div>

        <div style={directoryStyle}>
          <div style={tableHeaderStyle}>
            <span>{t("adminUsers.table.user")}</span>
            <span>{t("adminUsers.table.email")}</span>
            <span>{t("adminUsers.table.role")}</span>
            <span>{t("adminUsers.table.joined")}</span>
            <span>{t("adminUsers.table.manageRole")}</span>
            <span>{t("adminUsers.table.actions")}</span>
          </div>

          {loading ? (
            <div style={emptyStyle}>{t("adminUsers.directory.loading")}</div>
          ) : users.length === 0 ? (
            <div style={emptyStyle}>{t("adminUsers.directory.noUsers")}</div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                style={rowStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f8fafc";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#ffffff";
                }}
              >
                <div style={userCellStyle}>
                  <UserAvatar user={user} t={t} />

                  <div style={{ minWidth: 0 }}>
                    <strong style={nameStyle}>
                      {user.name || t("adminUsers.fallback.unnamedUser")}
                    </strong>
                    <div style={mutedStyle}>
                      {t("adminUsers.fallback.id")}: {user.id}
                    </div>
                  </div>
                </div>

                <div style={cellStyle}>
                  {user.email || t("adminUsers.fallback.noEmail")}
                </div>

                <div>
                  <RolePill role={user.role} t={t} />
                </div>

                <div style={cellStyle}>{formatDate(user.created_at)}</div>

                <div>
                  <select
                    value={user.role || "candidate"}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    style={smallSelectStyle}
                  >
                    <option value="admin">{t("adminUsers.roles.admin")}</option>
                    <option value="employer">
                      {t("adminUsers.roles.employer")}
                    </option>
                    <option value="candidate">
                      {t("adminUsers.roles.candidate")}
                    </option>
                  </select>
                </div>

                <div style={actionGroupStyle}>
                  <button
                    type="button"
                    style={detailsButtonStyle}
                    onClick={() => setSelectedUser(user)}
                  >
                    {t("adminUsers.actions.view")}
                  </button>

                  <button
                    type="button"
                    style={resetButtonStyle}
                    onClick={() => setResettingUser(user)}
                  >
                    {t("adminUsers.actions.reset")}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteUser(user.id)}
                    style={smallDeleteButtonStyle}
                  >
                    {t("adminUsers.actions.delete")}
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
            {t("adminUsers.actions.previous")}
          </Button>

            <span style={pageTextStyle}>
              {t("adminUsers.actions.page")
                .replace("{{page}}", page)
                .replace("{{total}}", totalPages)}
            </span>

          <Button
            variant="secondary"
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          >
            {t("adminUsers.actions.next")}
          </Button>
        </div>
      </Card>

      {creatingUser && (
        <UserFormModal
          mode="create"
          t={t}
          onClose={() => setCreatingUser(false)}
          onSubmit={handleCreateUser}
        />
      )}

      {selectedUser && (
        <UserDetailsModal
          user={selectedUser}
          t={t}
          onClose={() => setSelectedUser(null)}
          onEdit={() => {
            setEditingUser(selectedUser);
            setSelectedUser(null);
          }}
          onResetPassword={() => {
            setResettingUser(selectedUser);
            setSelectedUser(null);
          }}
          onDelete={() => handleDeleteUser(selectedUser.id)}
        />
      )}

      {editingUser && (
        <UserFormModal
          mode="edit"
          user={editingUser}
          t={t}
          onClose={() => setEditingUser(null)}
          onSubmit={(payload) => handleUpdateUser(editingUser.id, payload)}
        />
      )}

      {resettingUser && (
        <PasswordResetModal
          user={resettingUser}
          t={t}
          onClose={() => setResettingUser(null)}
          onSubmit={(password) => handleResetPassword(resettingUser.id, password)}
        />
      )}
    </DashboardLayout>
  );
}

function UserDetailsModal({ user, t, onClose, onEdit, onResetPassword, onDelete }) {
  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <div style={userCellStyle}>
            <UserAvatar user={user} t={t} />

            <div>
              <h2 style={modalTitleStyle}>
                {user.name || t("adminUsers.fallback.unnamedUser")}
              </h2>
              <p style={modalSubtitleStyle}>
                {user.email || t("adminUsers.fallback.noEmail")}
              </p>
            </div>
          </div>

          <button type="button" onClick={onClose} style={closeButtonStyle}>
            ×
          </button>
        </div>

        <div style={modalStatusBarStyle}>
          <span style={modalStatusTextStyle}>
            {t("adminUsers.details.accessLevel")}
          </span>
          <RolePill role={user.role} t={t} />
        </div>

        <div style={modalGridStyle}>
          <DetailItem label={t("adminUsers.details.userId")} value={user.id} t={t} />
          <DetailItem
            label={t("adminUsers.details.name")}
            value={user.name || t("adminUsers.fallback.notAvailable")}
            t={t}
          />
          <DetailItem
            label={t("adminUsers.details.email")}
            value={user.email || t("adminUsers.fallback.notAvailable")}
            t={t}
          />
          <DetailItem
            label={t("adminUsers.details.role")}
            value={formatRole(user.role, t)}
            t={t}
          />
          <DetailItem
            label={t("adminUsers.details.created")}
            value={formatDate(user.created_at)}
            t={t}
          />
          <DetailItem
            label={t("adminUsers.details.updated")}
            value={formatDate(user.updated_at)}
            t={t}
          />
        </div>

        <div style={descriptionBoxStyle}>
          <h3 style={sectionTitleStyle}>
            {t("adminUsers.details.managementNotes")}
          </h3>
          <p style={descriptionTextStyle}>
            {t("adminUsers.details.managementNotesText")}
          </p>
        </div>

        <div style={modalFooterStyle}>
          <button type="button" style={editButtonStyle} onClick={onEdit}>
            {t("adminUsers.modals.editUser")}
          </button>

          <button
            type="button"
            style={resetButtonLargeStyle}
            onClick={onResetPassword}
          >
            {t("adminUsers.modals.resetPassword")}
          </button>

          <button type="button" style={deleteButtonStyle} onClick={onDelete}>
            {t("adminUsers.actions.delete")}
          </button>

          <Button variant="secondary" onClick={onClose}>
            {t("adminUsers.modals.close")}
          </Button>
        </div>
      </div>
    </div>
  );
}

function UserFormModal({ mode, user, t, onClose, onSubmit }) {
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "candidate",
    password: "",
  });

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const submit = (e) => {
    e.preventDefault();

    if (!form.email || !form.role) {
      alert(t("adminUsers.validation.emailRoleRequired"));
      return;
    }

    if (!isEdit && !form.password) {
      alert(t("adminUsers.validation.passwordRequired"));
      return;
    }

    const payload = {
      name: form.name,
      email: form.email,
      role: form.role,
    };

    if (!isEdit) {
      payload.password = form.password;
    }

    onSubmit(payload);
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <form
        style={formModalStyle}
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
      >
        <div style={modalHeaderStyle}>
          <div>
            <h2 style={modalTitleStyle}>
              {isEdit
                ? t("adminUsers.modals.editUser")
                : t("adminUsers.modals.addNewUser")}
            </h2>
            <p style={modalSubtitleStyle}>
              {isEdit
                ? t("adminUsers.modals.editUserSubtitle")
                : t("adminUsers.modals.addUserSubtitle")}
            </p>
          </div>

          <button type="button" onClick={onClose} style={closeButtonStyle}>
            ×
          </button>
        </div>

        <div style={formBodyStyle}>
          <div style={formGridStyle}>
            <FormInput
              label={t("adminUsers.form.fullName")}
              value={form.name}
              onChange={(value) => updateField("name", value)}
            />

            <FormInput
              label={t("adminUsers.form.email")}
              type="email"
              value={form.email}
              onChange={(value) => updateField("email", value)}
            />

            <FormSelect
              label={t("adminUsers.form.role")}
              value={form.role}
              onChange={(value) => updateField("role", value)}
              options={[
                { value: "admin", label: t("adminUsers.roles.admin") },
                { value: "employer", label: t("adminUsers.roles.employer") },
                { value: "candidate", label: t("adminUsers.roles.candidate") },
              ]}
            />

            {!isEdit && (
              <FormInput
                label={t("adminUsers.form.password")}
                type="password"
                value={form.password}
                onChange={(value) => updateField("password", value)}
              />
            )}
          </div>

          {!isEdit && (
            <div style={infoBoxStyle}>{t("adminUsers.form.newUserInfo")}</div>
          )}
        </div>

        <div style={modalFooterStyle}>
          <Button variant="secondary" type="button" onClick={onClose}>
            {t("adminUsers.modals.cancel")}
          </Button>

          <button type="submit" style={saveButtonStyle}>
            {isEdit
              ? t("adminUsers.modals.saveChanges")
              : t("adminUsers.modals.createUser")}
          </button>
        </div>
      </form>
    </div>
  );
}

function PasswordResetModal({ user, t, onClose, onSubmit }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const submit = (e) => {
    e.preventDefault();

    if (password.length < 6) {
      alert(t("adminUsers.validation.passwordLength"));
      return;
    }

    if (password !== confirmPassword) {
      alert(t("adminUsers.validation.passwordMismatch"));
      return;
    }

    onSubmit(password);
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <form
        style={formModalStyle}
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
      >
        <div style={modalHeaderStyle}>
          <div>
            <h2 style={modalTitleStyle}>
              {t("adminUsers.modals.resetPassword")}
            </h2>
            <p style={modalSubtitleStyle}>
              {t("adminUsers.modals.resetPasswordSubtitle", {
                user: user.name || user.email,
              })}
            </p>
          </div>

          <button type="button" onClick={onClose} style={closeButtonStyle}>
            ×
          </button>
        </div>

        <div style={formBodyStyle}>
          <div style={formGridStyle}>
            <FormInput
              label={t("adminUsers.form.newPassword")}
              type="password"
              value={password}
              onChange={setPassword}
            />

            <FormInput
              label={t("adminUsers.form.confirmPassword")}
              type="password"
              value={confirmPassword}
              onChange={setConfirmPassword}
            />
          </div>

          <div style={warningBoxStyle}>
            {t("adminUsers.modals.passwordWarning")}
          </div>
        </div>

        <div style={modalFooterStyle}>
          <Button variant="secondary" type="button" onClick={onClose}>
            {t("adminUsers.modals.cancel")}
          </Button>

          <button type="submit" style={resetSubmitButtonStyle}>
            {t("adminUsers.modals.resetPassword")}
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

function UserAvatar({ user, t }) {
  const image = user.profile_image || "/images/avatar.jpg";

  if (image) {
    return (
      <div style={avatarWrapStyle}>
        <img
          src={image}
          alt={user.name || t("adminUsers.fallback.user")}
          style={avatarImageStyle}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/images/avatar.jpg";
          }}
        />
      </div>
    );
  }

  return <div style={avatarFallbackStyle}>{getInitials(user.name, user.email)}</div>;
}

function RolePill({ role, t }) {
  const normalized = role || "candidate";

  const styles = {
    admin: {
      background: "#fee2e2",
      color: "#b91c1c",
      border: "1px solid #fecaca",
    },
    employer: {
      background: "#dbeafe",
      color: "#1d4ed8",
      border: "1px solid #bfdbfe",
    },
    candidate: {
      background: "#dcfce7",
      color: "#15803d",
      border: "1px solid #bbf7d0",
    },
  };

  return (
    <span style={{ ...rolePillStyle, ...(styles[normalized] || styles.candidate) }}>
      {formatRole(normalized, t)}
    </span>
  );
}

function DetailItem({ label, value, t }) {
  return (
    <div style={detailItemStyle}>
      <span style={detailLabelStyle}>{label}</span>
      <strong style={detailValueStyle}>
        {value || t("adminUsers.fallback.notAvailable")}
      </strong>
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

function getInitials(name, email) {
  const source = name || email || "U";

  return source
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatRole(role, t) {
  if (!role) return t("adminUsers.roles.unknown");

  const roleMap = {
    admin: t("adminUsers.roles.admin"),
    employer: t("adminUsers.roles.employer"),
    candidate: t("adminUsers.roles.candidate"),
  };

  return roleMap[role] || role;
}

function formatDate(date) {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "20px",
  marginBottom: "24px",
};

const topActionsStyle = {
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: "12px",
  marginBottom: "18px",
  alignItems: "center",
};

const filterBarStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 180px auto",
  gap: "12px",
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

const createButtonStyle = {
  padding: "12px 16px",
  borderRadius: "14px",
  border: "none",
  background: "#0f172a",
  color: "#ffffff",
  fontWeight: 900,
  cursor: "pointer",
};

const roleTabsStyle = {
  display: "flex",
  gap: "10px",
  marginBottom: "18px",
  flexWrap: "wrap",
};

const roleTabStyle = {
  padding: "8px 14px",
  borderRadius: "999px",
  border: "1px solid #e2e8f0",
  background: "#ffffff",
  color: "#334155",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: 800,
  display: "inline-flex",
  alignItems: "center",
  gap: "8px",
};

const activeRoleTabStyle = {
  background: "#0f172a",
  color: "#ffffff",
  borderColor: "#0f172a",
};

const roleTabCountStyle = {
  minWidth: "22px",
  height: "22px",
  padding: "0 7px",
  borderRadius: "999px",
  background: "#f1f5f9",
  color: "#334155",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "12px",
  fontWeight: 900,
};

const activeRoleTabCountStyle = {
  background: "rgba(255,255,255,0.16)",
  color: "#ffffff",
};

const directoryStyle = {
  border: "1px solid #e2e8f0",
  borderRadius: "18px",
  overflow: "hidden",
  background: "#ffffff",
};

const tableHeaderStyle = {
  display: "grid",
  gridTemplateColumns: "1.7fr 1.5fr 0.9fr 0.9fr 1fr 1.35fr",
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
  gridTemplateColumns: "1.7fr 1.5fr 0.9fr 0.9fr 1fr 1.35fr",
  gap: "14px",
  padding: "16px 18px",
  borderBottom: "1px solid #f1f5f9",
  alignItems: "center",
  background: "#ffffff",
  transition: "background 0.2s ease",
};

const userCellStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  minWidth: 0,
};

const avatarWrapStyle = {
  width: "42px",
  height: "42px",
  minWidth: "42px",
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

const cellStyle = {
  fontSize: "14px",
  color: "#334155",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const smallSelectStyle = {
  padding: "9px 11px",
  border: "1px solid #cbd5e1",
  borderRadius: "10px",
  fontSize: "13px",
  background: "#ffffff",
};

const actionGroupStyle = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
  alignItems: "center",
};

const detailsButtonStyle = {
  padding: "8px 13px",
  borderRadius: "999px",
  border: "1px solid #dbe3ef",
  background: "#ffffff",
  color: "#0f172a",
  fontWeight: 800,
  cursor: "pointer",
  fontSize: "12px",
};

const resetButtonStyle = {
  padding: "8px 13px",
  borderRadius: "999px",
  border: "none",
  background: "#2563eb",
  color: "#ffffff",
  fontWeight: 800,
  cursor: "pointer",
  fontSize: "12px",
};

const smallDeleteButtonStyle = {
  padding: "8px 13px",
  border: "none",
  borderRadius: "999px",
  background: "#dc2626",
  color: "#ffffff",
  cursor: "pointer",
  fontWeight: 800,
  fontSize: "12px",
};

const rolePillStyle = {
  padding: "6px 10px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: 900,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
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
  maxWidth: "820px",
  maxHeight: "90vh",
  overflowY: "auto",
  background: "#ffffff",
  borderRadius: "24px",
  boxShadow: "0 30px 80px rgba(15, 23, 42, 0.35)",
};

const formModalStyle = {
  width: "100%",
  maxWidth: "720px",
  maxHeight: "90vh",
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

const modalStatusBarStyle = {
  padding: "14px 24px",
  background: "#f8fafc",
  borderBottom: "1px solid #e2e8f0",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const modalStatusTextStyle = {
  fontSize: "13px",
  fontWeight: 800,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
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

const formBodyStyle = {
  padding: "24px",
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

const infoBoxStyle = {
  marginTop: "18px",
  padding: "14px",
  borderRadius: "14px",
  background: "#eff6ff",
  color: "#1d4ed8",
  fontSize: "14px",
  lineHeight: 1.6,
};

const warningBoxStyle = {
  marginTop: "18px",
  padding: "14px",
  borderRadius: "14px",
  background: "#fef3c7",
  color: "#92400e",
  fontSize: "14px",
  lineHeight: 1.6,
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

const resetButtonLargeStyle = {
  padding: "10px 14px",
  borderRadius: "10px",
  border: "none",
  background: "#2563eb",
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

const resetSubmitButtonStyle = {
  padding: "10px 14px",
  borderRadius: "10px",
  border: "none",
  background: "#2563eb",
  color: "#ffffff",
  fontWeight: 800,
  cursor: "pointer",
};

export default AdminUsers;