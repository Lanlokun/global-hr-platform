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

import RecruiterOverview from "./recruiter/RecruiterOverview";
import RecruiterTalent from "./recruiter/RecruiterTalent";
import RecruiterJobs from "./recruiter/RecruiterJobs";
import RecruiterRecommendations from "./recruiter/RecruiterRecommendations";
import RecruiterSettings from "./recruiter/RecruiterSettings";

import Messages from "./messages/Messages";

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
        <Route path="/messages" element={<Messages />} />
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
        <Route path="/messages" element={<Messages />} />
      </Routes>
    );
  }

  if (user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  if (user.role === "recruiter") {
    return (
      <Routes>
        <Route path="/" element={<Navigate to="overview" replace />} />
        <Route path="/overview" element={<RecruiterOverview />} />
        <Route path="/talent" element={<RecruiterTalent />} />
        <Route path="/jobs" element={<RecruiterJobs />} />
        <Route path="/recommendations" element={<RecruiterRecommendations />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/settings" element={<RecruiterSettings />} />
      </Routes>
    );
  }

  return <div>{t("noDashboard") || "No dashboard available"}</div>;
}

export default Dashboard;