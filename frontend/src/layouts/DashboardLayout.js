import { useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  Building2,
  FileText,
  LayoutDashboard,
  UserCircle2,
  Users,
  LogOut,
  Globe2,
  Bell,
  Search,
  Menu,
  X,
  HelpCircle,
  ChevronRight,
  Sparkles,
  Shield,
  Settings,
  MessageCircle,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

import { useLanguage } from "../context/LanguageContext";
import LanguageSwitcher from "../components/ui/LanguageSwitcher";
import api from "../services/api";

import "./../components/ui/dashboard.css";

function DashboardLayout({ title, subtitle, children }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  useEffect(() => {
  const fetchNotifications = async () => {
    try {
      const res = await api.get("/api/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  };

  fetchNotifications();
}, []);

  const unreadCount = notifications.filter((item) => !item.is_read).length;

  const markNotificationsRead = async () => {
  try {
    await api.patch("/api/notifications/read");

    setNotifications((prev) =>
      prev.map((item) => ({
        ...item,
        is_read: true,
      }))
    );
  } catch (err) {
    console.error("Failed to mark notifications as read", err);
  }
};

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const navClass = ({ isActive }) =>
    `dashboard-nav-item ${isActive ? "active" : ""}`;

  const workspaceLabel =
    user.role === "admin"
      ? t("adminWorkspace")
      : user.role === "employer"
      ? t("companyWorkspace")
      : t("candidateWorkspace");

  const firstName =
    user?.first_name ||
    user?.name?.split(" ")?.[0] ||
    user?.full_name?.split(" ")?.[0] ||
    "User";

  const pageName = useMemo(() => {
    const parts = location.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] || "dashboard";
  }, [location.pathname]);

  const formattedPageName =
    pageName.charAt(0).toUpperCase() +
    pageName.slice(1).replace(/-/g, " ");

  const candidateNav = [
    {
      to: "/dashboard",
      label: t("overview"),
      icon: <LayoutDashboard size={18} />,
      end: true,
    },
    {
      to: "/dashboard/opportunities",
      label: t("opportunities"),
      icon: <Briefcase size={18} />,
      badge: "New",
    },
    {
      to: "/dashboard/applications",
      label: t("applications"),
      icon: <FileText size={18} />,
    },
    {
      to: "/dashboard/messages",
      label: t("messages"),
      icon: <MessageCircle size={18} />,
    },
    {
      to: "/dashboard/profile",
      label: t("profile"),
      icon: <UserCircle2 size={18} />,
    },
  ];

  const employerNav = [
    {
      to: "/dashboard",
      label: t("overview"),
      icon: <LayoutDashboard size={18} />,
      end: true,
    },
    {
      to: "/dashboard/company",
      label: t("myCompany"),
      icon: <Building2 size={18} />,
    },
    {
      to: "/dashboard/jobs",
      label: t("jobs"),
      icon: <Briefcase size={18} />,
    },
    {
      to: "/dashboard/applicants",
      label: t("applicants"),
      icon: <FileText size={18} />,
    },
    {
      to: "/dashboard/talent",
      label: t("talentDirectory"),
      icon: <Users size={18} />,
    },
    {
      to: "/dashboard/messages",
      label: t("messages"),
      icon: <MessageCircle size={18} />,
    },
    {
      to: "/dashboard/settings",
      label: t("settings"),
      icon: <Settings size={18} />,
    },
  ];

  const adminNav = [
    {
      to: "/admin",
      label: t("overview"),
      icon: <LayoutDashboard size={18} />,
      end: true,
    },
    {
      to: "/admin/users",
      label: t("users"),
      icon: <UserCircle2 size={18} />,
    },
    {
      to: "/admin/companies",
      label: t("companies"),
      icon: <Building2 size={18} />,
    },
    {
      to: "/admin/jobs",
      label: t("jobs"),
      icon: <Briefcase size={18} />,
    },
    {
      to: "/admin/applications",
      label: t("applications"),
      icon: <FileText size={18} />,
    },
    {
      to: "/admin/candidates",
      label: t("candidates"),
      icon: <Users size={18} />,
    },
  ];

  const navItems =
    user.role === "admin"
      ? adminNav
      : user.role === "employer"
      ? employerNav
      : candidateNav;

  const searchPlaceholder =
    user.role === "admin"
      ? t("searchPlaceholderAdmin")
      : user.role === "employer"
      ? t("searchPlaceholderEmployer")
      : t("searchPlaceholderCandidate");

  const handleNotificationClick = async (notification) => {
    if (notification.action_url) {
      setNotificationsOpen(false);
      navigate(notification.action_url);
    }
  };

  return (
    <div className="dashboard-shell">
      <aside className={`dashboard-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="dashboard-sidebar-top">
          <div className="dashboard-brand">
            <div className="dashboard-brand-icon">
              {user.role === "admin" ? (
                <Shield size={18} />
              ) : (
                <Globe2 size={18} />
              )}
            </div>

            <div className="dashboard-brand-copy">
              <h2>SGET International Talent Space Station</h2>
              <p>
                {user.role === "admin"
                  ? t("adminBrandSubtitle") ||
                    "SGET platform control and system oversight."
                  : t("brandSubtitle") ||
                    "SGET connecting companies to talent across Africa."}
              </p>
            </div>
          </div>

          <button
            className="dashboard-sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <div className="dashboard-workspace-card">
          <div className="dashboard-workspace-icon">
            <Sparkles size={16} />
          </div>

          <div>
            <span className="dashboard-workspace-label">
              {t("activeWorkspace")}
            </span>

            <strong className="dashboard-workspace-title">
              {workspaceLabel}
            </strong>

            <p className="dashboard-workspace-text">
              {user.role === "admin"
                ? t("adminWorkspaceDesc") ||
                  "Manage users, companies, jobs, and system operations."
                : user.role === "employer"
                ? t("employerWorkspaceDesc") ||
                  "Manage your company, jobs, and discover talent."
                : t("candidateWorkspaceDesc") ||
                  "Track jobs, applications, and grow your profile."}
            </p>
          </div>
        </div>

        <div className="dashboard-nav-section">
          <span className="dashboard-nav-section-title">
            {t("navigation") || "Navigation"}
          </span>

          <nav className="dashboard-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={navClass}
                onClick={() => setSidebarOpen(false)}
              >
                <div className="dashboard-nav-item-left">
                  {item.icon}
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span className="dashboard-nav-badge">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="dashboard-sidebar-footer">
          <div className="dashboard-user-card">
            <div className="dashboard-user-meta">
              <div className="dashboard-user-avatar">
                {(user.name || user.full_name || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="dashboard-user-copy">
                <strong>{user.name || user.full_name || "User"}</strong>
                <span>{workspaceLabel}</span>
              </div>
            </div>

            <button className="dashboard-logout" onClick={logout}>
              <LogOut size={16} />
              {t("logout")}
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          className="dashboard-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <div className="dashboard-topbar-left">
            <button
              className="dashboard-menu-toggle"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={18} />
            </button>

            <div className="dashboard-page-heading">
              <div className="dashboard-breadcrumbs">
                <span>
                  {user.role === "admin" ? t("admin") : t("dashboard")}
                </span>
                <ChevronRight size={14} />
                <span>{formattedPageName}</span>
              </div>

              <h1>{title}</h1>
              <p>{subtitle}</p>
            </div>
          </div>

          <div className="dashboard-topbar-right">
            <div className="dashboard-search">
              <Search size={16} />
              <input type="text" placeholder={searchPlaceholder} />
            </div>

            <LanguageSwitcher />

            <button className="dashboard-icon-button">
              <HelpCircle size={18} />
            </button>

            <div style={styles.notificationWrap}>
              <button
                className="dashboard-icon-button dashboard-notification-button"
                onClick={() => {
                  setNotificationsOpen((prev) => !prev);
                  markNotificationsRead();
                }}
              >
                <Bell size={18} />

                {unreadCount > 0 && (
                  <span style={styles.notificationCount}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div style={styles.notificationPanel}>
                  <div style={styles.notificationHeader}>
                    <div>
                      <strong>{t("notifications")}</strong>
                      <p style={styles.notificationSubtext}>
                        {unreadCount > 0
                          ? `${unreadCount} ${t("unreadNotifications")}`
                          : t("allCaughtUp")}
                      </p>
                    </div>

                    <span style={styles.notificationTotal}>
                      {notifications.length}
                    </span>
                  </div>

                  {notifications.length === 0 ? (
                    <p style={styles.emptyNotifications}>
                      {t("noNotifications")}
                    </p>
                  ) : (
                    <div style={styles.notificationList}>
                      {notifications.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleNotificationClick(item)}
                          style={{
                            ...styles.notificationItem,
                            cursor: item.action_url ? "pointer" : "default",
                            borderLeft:
                              item.type === "warning"
                                ? "4px solid #f59e0b"
                                : item.type === "success"
                                ? "4px solid #16a34a"
                                : item.type === "danger"
                                ? "4px solid #dc2626"
                                : "4px solid #2563eb",
                            opacity: item.is_read ? 0.78 : 1,
                          }}
                        >
                          <div style={styles.notificationTopRow}>
                            <strong>{item.title}</strong>

                            {!item.is_read && (
                              <span style={styles.unreadPill}>
                                {t("new")}
                              </span>
                            )}
                          </div>

                          <p>{item.message}</p>

                          <div style={styles.notificationFooter}>
                            <small>
                              {new Date(item.created_at).toLocaleString()}
                            </small>

                            {item.action_url && (
                              <span style={styles.openLink}>
                                {t("open")}
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="dashboard-topbar-user">
              <div className="dashboard-topbar-avatar">
                {(firstName || "U").charAt(0).toUpperCase()}
              </div>

              <div className="dashboard-topbar-user-copy">
                <strong>{firstName}</strong>
                <span>{workspaceLabel}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-content">{children}</div>
      </main>
    </div>
  );
}

const styles = {
  notificationWrap: {
    position: "relative",
  },
  notificationPanel: {
    position: "absolute",
    right: 0,
    top: 44,
    width: 350,
    maxHeight: 430,
    overflowY: "auto",
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 18,
    boxShadow: "0 24px 60px rgba(15, 23, 42, 0.18)",
    zIndex: 3000,
    padding: 14,
  },
  notificationHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
    borderBottom: "1px solid #e5e7eb",
    color: "#111827",
  },
  notificationList: {
    display: "grid",
    gap: 10,
    marginTop: 12,
  },
  notificationItem: {
    width: "100%",
    textAlign: "left",
    padding: 12,
    borderRadius: 14,
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
  },
  emptyNotifications: {
    color: "#6b7280",
    fontSize: 14,
    margin: "14px 0 0",
  },

  notificationCount: {
  position: "absolute",
  top: -6,
  right: -6,
  minWidth: 18,
  height: 18,
  padding: "0 5px",
  borderRadius: 999,
  background: "#dc2626",
  color: "#fff",
  fontSize: 11,
  fontWeight: 800,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "2px solid #fff",
},

notificationSubtext: {
  margin: "3px 0 0",
  color: "#6b7280",
  fontSize: 12,
},

notificationTotal: {
  minWidth: 28,
  height: 28,
  borderRadius: 999,
  background: "#eff6ff",
  color: "#2563eb",
  fontSize: 13,
  fontWeight: 800,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
},

notificationTopRow: {
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  alignItems: "center",
},

unreadPill: {
  padding: "3px 7px",
  borderRadius: 999,
  background: "#dbeafe",
  color: "#1d4ed8",
  fontSize: 11,
  fontWeight: 800,
},

notificationFooter: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 10,
  marginTop: 8,
},

openLink: {
  color: "#2563eb",
  fontSize: 12,
  fontWeight: 800,
},
};

export default DashboardLayout;