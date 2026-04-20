import { motion } from "framer-motion";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import "../../components/marketing/landing.css";
import countryData, { countryAliases } from "../../data/countryData";

const API_URL = process.env.REACT_APP_API_URL || "";

function CountryPage() {
  const { country } = useParams();
  const navigate = useNavigate();

  const [viewerType, setViewerType] = useState("applicant");
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingCandidates, setLoadingCandidates] = useState(true);

  const resolvedSlug = useMemo(() => {
    if (!country) return "";
    return countryData[country] ? country : countryAliases[country] || "";
  }, [country]);

  const countryInfo = resolvedSlug ? countryData[resolvedSlug] : null;

  useEffect(() => {
    if (!countryInfo) {
      navigate("/");
    }
  }, [countryInfo, navigate]);

  useEffect(() => {
    if (!countryInfo) return;

    const fetchApplicantData = async () => {
      try {
        setLoadingJobs(true);

        const jobsRes = await fetch(
          `${API_URL}/api/jobs?country=${encodeURIComponent(countryInfo.name)}`
        );

        if (!jobsRes.ok) {
          throw new Error("Failed to fetch jobs");
        }

        const jobsData = await jobsRes.json();
        const jobsList = Array.isArray(jobsData.jobs) ? jobsData.jobs : [];

        setJobs(jobsList);

        const uniqueCompanies = Array.from(
          new Map(
            jobsList
              .filter((job) => job.company)
              .map((job) => [
                job.company,
                {
                  name: job.company,
                  industry: job.industry || "General",
                  location: job.location || countryInfo.name,
                },
              ])
          ).values()
        );

        setCompanies(uniqueCompanies);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setJobs([]);
        setCompanies([]);
      } finally {
        setLoadingJobs(false);
      }
    };

    const fetchCompanyData = async () => {
      try {
        setLoadingCandidates(true);

        const candidatesRes = await fetch(
          `${API_URL}/api/candidates?country=${encodeURIComponent(countryInfo.name)}`
        );

        if (!candidatesRes.ok) {
          throw new Error("Failed to fetch candidates");
        }

        const candidatesData = await candidatesRes.json();
        setCandidates(
          Array.isArray(candidatesData.candidates) ? candidatesData.candidates : []
        );
      } catch (error) {
        console.error("Error fetching candidates:", error);
        setCandidates([]);
      } finally {
        setLoadingCandidates(false);
      }
    };

    fetchApplicantData();
    fetchCompanyData();
  }, [countryInfo]);

  if (!countryInfo) {
    return null;
  }

  return (
    <>
      <div className="itss-page">
        <nav className="itss-nav">
          <div className="itss-brand">International Talent Space Station</div>
          <div className="itss-nav-actions">
            <Link className="itss-link" to="/login">
              Sign in
            </Link>
            <Link className="itss-btn" to="/signup">
              Get Started
            </Link>
          </div>
        </nav>

        <motion.section
          className="itss-country-hero"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="itss-country-header">
            <Link to="/" className="itss-back-link">
              &larr; Back to World Map
            </Link>

            <div className="itss-country-title">
              <h1 className="itss-title">
                {countryInfo.flag} {countryInfo.name}
              </h1>
              <p className="itss-country-description">{countryInfo.description}</p>
            </div>
          </div>

            <div className="itss-view-toggle-wrap">
            <div className="itss-view-toggle">
              <button
                type="button"
                className={`itss-toggle-btn ${
                  viewerType === "applicant" ? "active" : ""
                }`}
                onClick={() => setViewerType("applicant")}
              >
                <span className="itss-toggle-kicker">For Talent</span>
                <span className="itss-toggle-title">Looking for a job</span>
                <span className="itss-toggle-text">
                  Browse hiring companies and open roles
                </span>
              </button>

              <button
                type="button"
                className={`itss-toggle-btn ${
                  viewerType === "company" ? "active" : ""
                }`}
                onClick={() => setViewerType("company")}
              >
                <span className="itss-toggle-kicker">For Employers</span>
                <span className="itss-toggle-title">I am hiring</span>
                <span className="itss-toggle-text">
                  Explore candidates and local talent pools
                </span>
              </button>
            </div>
          </div>

          <div className="itss-country-content">
            <div className="itss-country-info">
              <div className="itss-info-card">
                <h3>Key Cities</h3>
                <div className="itss-city-grid">
                  {countryInfo.keyCities.map((city) => (
                    <div key={city} className="itss-city-item">
                      {city}
                    </div>
                  ))}
                </div>
              </div>

              <div className="itss-info-card">
                <h3>Top Industries</h3>
                <div className="itss-industry-grid">
                  {countryInfo.topIndustries.map((industry) => (
                    <div key={industry} className="itss-industry-item">
                      {industry}
                    </div>
                  ))}
                </div>
              </div>

              <div className="itss-info-card">
                <h3>Talent Highlights</h3>
                <p className="itss-talent-highlights">{countryInfo.talentHighlights}</p>
              </div>

              <div className="itss-info-card">
                <h3>Talent Pool</h3>
                <div className="itss-industry-grid">
                  {countryInfo.talentPool.map((talent) => (
                    <div key={talent} className="itss-industry-item">
                      {talent}
                    </div>
                  ))}
                </div>
              </div>

              <div className="itss-info-card">
                <h3>Need to Knows</h3>
                <ul className="itss-need-list">
                  {countryInfo.needToKnows.map((item) => (
                    <li key={item} className="itss-need-item">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="itss-info-card">
                <h3>Market Snapshot</h3>
                <div className="itss-market-grid">
                  <div className="itss-market-item">
                    <span className="itss-market-label">Timezone</span>
                    <span className="itss-market-value">
                      {countryInfo.marketInfo.timezone}
                    </span>
                  </div>
                  <div className="itss-market-item">
                    <span className="itss-market-label">Language</span>
                    <span className="itss-market-value">
                      {countryInfo.marketInfo.language}
                    </span>
                  </div>
                  <div className="itss-market-item">
                    <span className="itss-market-label">Hiring Outlook</span>
                    <span className="itss-market-value">
                      {countryInfo.marketInfo.hiringOutlook}
                    </span>
                  </div>
                  <div className="itss-market-item">
                    <span className="itss-market-label">Employment Types</span>
                    <span className="itss-market-value">
                      {countryInfo.marketInfo.commonEmploymentTypes.join(", ")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="itss-info-card">
                <h3>Salary Snapshot</h3>
                <div className="itss-salary-table">
                  <div className="itss-salary-head">
                    <span>Role</span>
                    <span>Typical Range</span>
                    <span>Availability</span>
                  </div>

                  {countryInfo.salarySnapshot.map((item) => (
                    <div key={item.role} className="itss-salary-row">
                      <span>{item.role}</span>
                      <span>{item.range}</span>
                      <span>{item.availability}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="itss-country-jobs">
              {viewerType === "applicant" ? (
                <>
                  <div className="itss-jobs-header">
                    <h2>Hiring Companies in {countryInfo.name}</h2>
                    <Link className="itss-btn" to="/signup">
                      Create Profile
                    </Link>
                  </div>

                  {loadingJobs ? (
                    <div className="itss-loading">Loading companies and jobs...</div>
                  ) : (
                    <>
                      {companies.length > 0 ? (
                        <div className="itss-jobs-grid">
                          {companies.map((company) => (
                            <div key={company.name} className="itss-job-card">
                              <h3>{company.name}</h3>
                              <p className="itss-job-company">{company.industry}</p>
                              <p className="itss-job-location">{company.location}</p>
                              <Link className="itss-job-link" to="/signup">
                                Explore Opportunities
                              </Link>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="itss-no-jobs">
                          <h3>No hiring companies listed yet</h3>
                          <p>Check back soon for employers actively hiring in {countryInfo.name}.</p>
                        </div>
                      )}

                      <div className="itss-jobs-header" style={{ marginTop: "20px" }}>
                        <h2>Available Jobs in {countryInfo.name}</h2>
                      </div>

                      {jobs.length > 0 ? (
                        <div className="itss-jobs-grid">
                          {jobs.map((job) => (
                            <div key={job.id || job._id} className="itss-job-card">
                              <h3>{job.title}</h3>
                              <p className="itss-job-company">{job.company}</p>
                              <p className="itss-job-location">
                                {job.location || countryInfo.name}
                              </p>
                              <p className="itss-job-type">{job.type || "Full-time"}</p>
                              {job.salary && <p className="itss-job-type">{job.salary}</p>}
                              <Link
                                className="itss-job-link"
                                to={`/login?job=${job.id || job._id}`}
                              >
                                Apply / View Details
                              </Link>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="itss-no-jobs">
                          <h3>No jobs available yet</h3>
                          <p>There are currently no live roles in {countryInfo.name}.</p>
                        </div>
                      )}
                    </>
                  )}
                </>
              ) : (
                <>
                  <div className="itss-jobs-header">
                    <h2>Available Talent in {countryInfo.name}</h2>
                    <Link className="itss-btn" to="/signup">
                      Post a Job
                    </Link>
                  </div>

                  {loadingCandidates ? (
                    <div className="itss-loading">Loading candidate profiles...</div>
                  ) : candidates.length > 0 ? (
                    <div className="itss-jobs-grid">
                      {candidates.map((candidate) => (
                        <div
                          key={candidate.id || candidate._id}
                          className="itss-job-card"
                        >
                          <h3>{candidate.name || "Candidate Profile"}</h3>
                          <p className="itss-job-company">
                            {candidate.title || "Professional"}
                          </p>
                          <p className="itss-job-location">
                            {candidate.country || countryInfo.name}
                          </p>
                          <p className="itss-job-type">
                            {Array.isArray(candidate.skills)
                              ? candidate.skills.join(", ")
                              : candidate.skills || "Skills available on profile"}
                          </p>
                          <Link className="itss-job-link" to="/login">
                            View Candidate
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="itss-no-jobs">
                      <h3>No candidate profiles available yet</h3>
                      <p>
                        Talent profiles for {countryInfo.name} will appear here as
                        candidates join the platform.
                      </p>
                      <div className="itss-hero-actions">
                        <Link className="itss-btn" to="/signup">
                          Post a Job
                        </Link>
                        <Link className="itss-btn-secondary" to="/login">
                          Sign in as Employer
                        </Link>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.section>
      </div>

      <footer className="itss-footer">
        <div className="itss-footer-bottom">
          © {new Date().getFullYear()} International Talent Space Station. All
          rights reserved.
        </div>
      </footer>
    </>
  );
}

export default CountryPage;