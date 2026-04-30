import { Routes, Route, Navigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

import EmployerOverview from "./employer/EmployerOverview";
import EmployerCompany from "./employer/EmployerCompany";
import EmployerJobs from "./employer/EmployerJobs";
import EmployerApplicants from "./employer/EmployerApplicants";
import EmployerTalent from "./employer/EmployerTalent";
import EmployerSettings from "./employer/EmployerSettings";

import CandidateOverview from "./candidate/CandidateOverview";
import CandidateOpportunities from "./candidate/CandidateOpportunities";
import CandidateApplications from "./candidate/CandidateApplications";
import CandidateProfile from "./candidate/CandidateProfile";

function Dashboard() {
  const { t } = useLanguage();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (user.role === "employer") {
    return (
      <Routes>
        <Route path="/" element={<EmployerOverview />} />
        <Route path="/company" element={<EmployerCompany />} />
        <Route path="/jobs" element={<EmployerJobs />} />
        <Route path="/applicants" element={<EmployerApplicants />} />
        <Route path="/talent" element={<EmployerTalent />} />
        <Route path="/settings" element={<EmployerSettings />} />
      </Routes>
    );
  }

  if (user.role === "candidate") {
    return (
      <Routes>
        <Route path="/" element={<CandidateOverview />} />
        <Route path="/opportunities" element={<CandidateOpportunities />} />
        <Route path="/applications" element={<CandidateApplications />} />
        <Route path="/profile" element={<CandidateProfile />} />
      </Routes>
    );
  }

  if (user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return <div>{t("noDashboard") || "No dashboard available"}</div>;
}

export default Dashboard;