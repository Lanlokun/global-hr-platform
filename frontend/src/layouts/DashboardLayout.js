import {
  Briefcase,
  Building2,
  FileText,
  LayoutDashboard,
  UserCircle2,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import "./../components/ui/dashboard.css";
import { Users } from "lucide-react";

function DashboardLayout({ title, subtitle, children }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const navClass = ({ isActive }) =>
    `dashboard-nav-item ${isActive ? "active" : ""}`;

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <h2>GlobalHR</h2>
          <p>Enterprise workforce platform for modern global teams.</p>
        </div>

        <nav className="dashboard-nav">
          {user.role === "employer" && (
            <>
              <NavLink to="/dashboard" end className={navClass}>
                <LayoutDashboard size={18} />
                Overview
              </NavLink>

              <NavLink to="/dashboard/companies" className={navClass}>
                <Building2 size={18} />
                Companies
              </NavLink>

              <NavLink to="/dashboard/jobs" className={navClass}>
                <Briefcase size={18} />
                Jobs
              </NavLink>

              <NavLink to="/dashboard/applications" className={navClass}>
                <FileText size={18} />
                Applications
              </NavLink>
            <NavLink to="/dashboard/candidates" className={navClass}>
              <Users size={18} />
              Candidates
            </NavLink>
            </>

          )}

          {user.role === "candidate" && (
            <>
              <NavLink to="/dashboard" end className={navClass}>
                <LayoutDashboard size={18} />
                Overview
              </NavLink>

              <NavLink to="/dashboard/opportunities" className={navClass}>
                <Briefcase size={18} />
                Opportunities
              </NavLink>

              <NavLink to="/dashboard/applications" className={navClass}>
                <FileText size={18} />
                Applications
              </NavLink>

              <NavLink to="/dashboard/profile" className={navClass}>
                <UserCircle2 size={18} />
                Profile
              </NavLink>
            </>
          )}
        </nav>

        <div className="dashboard-user-card">
          <strong>{user.name || "User"}</strong>
          <span>{user.role || "Account"}</span>
          <button className="dashboard-logout" onClick={logout}>
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
            {user.role === "employer" ? "Employer Workspace" : "Candidate Workspace"}
          </div>
        </div>

        <div className="dashboard-content">{children}</div>
      </main>
    </div>
  );
}

export default DashboardLayout;