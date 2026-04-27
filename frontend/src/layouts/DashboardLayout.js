import { useMemo, useState } from "react";
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
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import "./../components/ui/dashboard.css";

function DashboardLayout({ title, subtitle, children }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const navClass = ({ isActive }) =>
    `dashboard-nav-item ${isActive ? "active" : ""}`;

  const workspaceLabel =
    user.role === "admin"
      ? "Admin Workspace"
      : user.role === "employer"
      ? "Company Workspace"
      : "Candidate Workspace";

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

  /* ================= NAV ================= */

  const candidateNav = [
    { to: "/dashboard", label: "Overview", icon: <LayoutDashboard size={18} />, end: true },
    { to: "/dashboard/opportunities", label: "Opportunities", icon: <Briefcase size={18} />, badge: "New" },
    { to: "/dashboard/applications", label: "Applications", icon: <FileText size={18} /> },
    { to: "/dashboard/profile", label: "Profile", icon: <UserCircle2 size={18} /> },
  ];

  const employerNav = [
    { to: "/dashboard", label: "Overview", icon: <LayoutDashboard size={18} />, end: true },
    { to: "/dashboard/company", label: "My Company", icon: <Building2 size={18} /> },
    { to: "/dashboard/jobs", label: "Jobs", icon: <Briefcase size={18} /> },
    { to: "/dashboard/applicants", label: "Applicants", icon: <FileText size={18} /> },
    { to: "/dashboard/talent", label: "Talent Directory", icon: <Users size={18} /> },
    { to: "/dashboard/settings", label: "Settings", icon: <Settings size={18} /> },
  ];

  const adminNav = [
    { to: "/admin", label: "Overview", icon: <LayoutDashboard size={18} />, end: true },
    { to: "/admin/users", label: "Users", icon: <UserCircle2 size={18} /> },
    { to: "/admin/companies", label: "Companies", icon: <Building2 size={18} /> },
    { to: "/admin/jobs", label: "Jobs", icon: <Briefcase size={18} /> },
    { to: "/admin/applications", label: "Applications", icon: <FileText size={18} /> },
    { to: "/admin/candidates", label: "Candidates", icon: <Users size={18} /> },
  ];

  const navItems =
    user.role === "admin"
      ? adminNav
      : user.role === "employer"
      ? employerNav
      : candidateNav;

  const searchPlaceholder =
    user.role === "admin"
      ? "Search users, companies, jobs..."
      : user.role === "employer"
      ? "Search jobs, applicants, talent..."
      : "Search jobs, applications...";

  return (
    <div className="dashboard-shell">
      {/* ================= SIDEBAR ================= */}
      <aside className={`dashboard-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="dashboard-sidebar-top">
          <div className="dashboard-brand">
            <div className="dashboard-brand-icon">
              {user.role === "admin" ? <Shield size={18} /> : <Globe2 size={18} />}
            </div>

            <div className="dashboard-brand-copy">
              {/* 🔥 BRAND UPDATED */}
              <h2>SGET International Talent Space Station</h2>
              <p>
                {user.role === "admin"
                  ? "SGET platform control and system oversight."
                  : "SGET connecting companies to talent across Africa."}
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

        {/* ================= WORKSPACE ================= */}
        <div className="dashboard-workspace-card">
          <div className="dashboard-workspace-icon">
            <Sparkles size={16} />
          </div>

          <div>
            <span className="dashboard-workspace-label">Active Workspace</span>
            <strong className="dashboard-workspace-title">
              {workspaceLabel}
            </strong>

            <p className="dashboard-workspace-text">
              {user.role === "admin"
                ? "Manage users, companies, jobs, and system operations."
                : user.role === "employer"
                ? "Manage your company, jobs, and discover talent."
                : "Track jobs, applications, and grow your profile."}
            </p>
          </div>
        </div>

        {/* ================= NAV ================= */}
        <div className="dashboard-nav-section">
          <span className="dashboard-nav-section-title">Navigation</span>

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

        {/* ================= FOOTER ================= */}
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
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* ================= BACKDROP ================= */}
      {sidebarOpen && (
        <button
          className="dashboard-sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ================= MAIN ================= */}
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
                <span>{user.role === "admin" ? "Admin" : "Dashboard"}</span>
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

            <button className="dashboard-icon-button">
              <HelpCircle size={18} />
            </button>

            <button className="dashboard-icon-button dashboard-notification-button">
              <Bell size={18} />
              <span className="dashboard-notification-dot" />
            </button>

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

export default DashboardLayout;