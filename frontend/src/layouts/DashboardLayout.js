import {
  Briefcase,
  Building2,
  FileText,
  LayoutDashboard,
  UserCircle2,
  Users,
  LogOut,
  Globe2,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import "./../components/ui/dashboard.css";

function DashboardLayout({ title, subtitle, children }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const navClass = ({ isActive }) =>
    `dashboard-nav-item ${isActive ? "active" : ""}`;

  const workspaceLabel =
    user.role === "employer" ? "Company Workspace" : "Individual Workspace";

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <div className="dashboard-brand-icon">
            <Globe2 size={18} />
          </div>
          <div>
            <h2>International Talent Space Station</h2>
            <p>Connecting companies to talent across Africa.</p>
          </div>
        </div>

        <nav className="dashboard-nav">
          {user.role === "employer" && (
            <>
              <NavLink to="/dashboard" end className={navClass}>
                <LayoutDashboard size={18} />
                <span>Overview</span>
              </NavLink>

              <NavLink to="/dashboard/companies" className={navClass}>
                <Building2 size={18} />
                <span>Companies</span>
              </NavLink>

              <NavLink to="/dashboard/jobs" className={navClass}>
                <Briefcase size={18} />
                <span>Jobs</span>
              </NavLink>

              <NavLink to="/dashboard/applications" className={navClass}>
                <FileText size={18} />
                <span>Applications</span>
              </NavLink>

              <NavLink to="/dashboard/candidates" className={navClass}>
                <Users size={18} />
                <span>Candidates</span>
              </NavLink>
            </>
          )}

          {user.role === "candidate" && (
            <>
              <NavLink to="/dashboard" end className={navClass}>
                <LayoutDashboard size={18} />
                <span>Overview</span>
              </NavLink>

              <NavLink to="/dashboard/opportunities" className={navClass}>
                <Briefcase size={18} />
                <span>Opportunities</span>
              </NavLink>

              <NavLink to="/dashboard/applications" className={navClass}>
                <FileText size={18} />
                <span>Applications</span>
              </NavLink>

              <NavLink to="/dashboard/profile" className={navClass}>
                <UserCircle2 size={18} />
                <span>Profile</span>
              </NavLink>
            </>
          )}
        </nav>

        <div className="dashboard-user-card">
          <div className="dashboard-user-meta">
            <div className="dashboard-user-avatar">
              {(user.name || "U").charAt(0).toUpperCase()}
            </div>

            <div>
              <strong>{user.name || "User"}</strong>
              <span>{workspaceLabel}</span>
            </div>
          </div>

          <button className="dashboard-logout" onClick={logout}>
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-topbar">
          <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>

          <div className="dashboard-topbar-badge">
            {workspaceLabel}
          </div>
        </div>

        <div className="dashboard-content">{children}</div>
      </main>
    </div>
  );
}

export default DashboardLayout;