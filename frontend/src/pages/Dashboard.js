import { Routes, Route } from "react-router-dom";

import EmployerOverview from "./employer/EmployerOverview";
import EmployerCompanies from "./employer/EmployerCompanies";
import EmployerJobs from "./employer/EmployerJobs";
import EmployerApplications from "./employer/EmployerApplications";
import EmployerCandidates from "./employer/EmployerCandidates";
import EmployerCandidateDetail from "./employer/EmployerCandidateDetail";

import CandidateOverview from "./candidate/CandidateOverview";
import CandidateOpportunities from "./candidate/CandidateOpportunities";
import CandidateApplications from "./candidate/CandidateApplications";
import CandidateProfile from "./candidate/CandidateProfile";

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (user.role === "employer") {
    return (
      <Routes>
        <Route path="/" element={<EmployerOverview />} />
        <Route path="/companies" element={<EmployerCompanies />} />
        <Route path="/jobs" element={<EmployerJobs />} />
        <Route path="/applications" element={<EmployerApplications />} />
        <Route path="/candidates" element={<EmployerCandidates />} />
        <Route path="/candidates/:id" element={<EmployerCandidateDetail />} />
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

  return <div>No dashboard available</div>;
}

export default Dashboard;