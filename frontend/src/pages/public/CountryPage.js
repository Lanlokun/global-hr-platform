import { motion } from "framer-motion";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import "../../components/marketing/landing.css";
import "../../components/marketing/country.css";
import countryData, { countryAliases } from "../../data/countryData";

const API_URL = process.env.REACT_APP_API_URL || "";
const ITEMS_PER_PAGE = 8;

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <div className="itss-pagination">
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Previous
      </button>

      <span>
        Page {currentPage} of {totalPages}
      </span>

      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
}

function CountryPage() {
  const { country } = useParams();
  const navigate = useNavigate();

  const [viewerType, setViewerType] = useState("applicant");

  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [candidates, setCandidates] = useState([]);

  const [loading, setLoading] = useState(true);

  const [jobsPage, setJobsPage] = useState(1);
  const [companiesPage, setCompaniesPage] = useState(1);
  const [candidatesPage, setCandidatesPage] = useState(1);

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

    const fetchCountryMarket = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `${API_URL}/api/public/country-market?country=${encodeURIComponent(
            countryInfo.name
          )}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch country market data");
        }

        const data = await response.json();

        setJobs(Array.isArray(data.jobs) ? data.jobs : []);
        setCompanies(Array.isArray(data.companies) ? data.companies : []);
        setCandidates(Array.isArray(data.candidates) ? data.candidates : []);
      } catch (error) {
        console.error("Error fetching country market:", error);
        setJobs([]);
        setCompanies([]);
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCountryMarket();
  }, [countryInfo]);

  useEffect(() => {
    setJobsPage(1);
    setCompaniesPage(1);
    setCandidatesPage(1);
  }, [countryInfo, viewerType]);

  const paginate = (items, page) => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return items.slice(start, start + ITEMS_PER_PAGE);
  };

  const paginatedCompanies = paginate(companies, companiesPage);
  const paginatedJobs = paginate(jobs, jobsPage);
  const paginatedCandidates = paginate(candidates, candidatesPage);

  const companiesTotalPages = Math.ceil(companies.length / ITEMS_PER_PAGE);
  const jobsTotalPages = Math.ceil(jobs.length / ITEMS_PER_PAGE);
  const candidatesTotalPages = Math.ceil(candidates.length / ITEMS_PER_PAGE);

  if (!countryInfo) return null;

  return (
    <>
      <div className="itss-page itss-country-page">
        <nav className="itss-nav">
          <Link to="/" className="itss-brand">
            International Talent Space Station
          </Link>

          <div className="itss-nav-actions">
            <Link className="itss-link" to="/login">
              Sign in
            </Link>
            <Link className="itss-btn itss-btn-small" to="/signup">
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
              <span className="itss-country-kicker">Country Talent Market</span>
              <h1 className="itss-title">
                {countryInfo.flag} {countryInfo.name}
              </h1>
              <p className="itss-country-description">
                {countryInfo.description}
              </p>
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
                  Browse hiring companies and open roles.
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
                  Explore candidates and local talent pools.
                </span>
              </button>
            </div>
          </div>

          <div className="itss-country-content">
            <main className="itss-country-main">
              {viewerType === "applicant" ? (
                <>
                  <section className="itss-section-block">
                    <div className="itss-jobs-header">
                      <div>
                        <h2>Hiring Companies in {countryInfo.name}</h2>
                        <p>
                          {companies.length} companies currently listed in this
                          market.
                        </p>
                      </div>

                      <Link className="itss-btn" to="/signup">
                        Create Profile
                      </Link>
                    </div>

                    {loading ? (
                      <div className="itss-loading">
                        Loading companies and jobs...
                      </div>
                    ) : companies.length > 0 ? (
                      <>
                        <div className="itss-jobs-grid">
                          {paginatedCompanies.map((company, index) => (
                            <article
                              key={company.id || `${company.name}-${index}`}
                              className="itss-listing-card"
                            >
                              <div className="itss-listing-top">
                                <div className="itss-listing-logo">
                                  {company.logo ? (
                                    <img
                                      src={company.logo}
                                      alt={company.name || "Company logo"}
                                    />
                                  ) : (
                                    <span>
                                      {company.name
                                        ?.charAt(0)
                                        ?.toUpperCase() || "C"}
                                    </span>
                                  )}
                                </div>

                                <div>
                                  <h3>{company.name || "Company"}</h3>
                                  <p>{company.industry || "Industry not set"}</p>
                                </div>
                              </div>

                              <div className="itss-listing-meta">
                                <span>
                                  {company.city
                                    ? `${company.city}, ${
                                        company.country || countryInfo.name
                                      }`
                                    : company.country || countryInfo.name}
                                </span>
                                <span>{company.size || "Size not set"}</span>
                                <span>{company.job_count || 0} open roles</span>
                              </div>

                              <Link className="itss-job-link" to="/signup">
                                Explore Opportunities
                              </Link>
                            </article>
                          ))}
                        </div>

                        <Pagination
                          currentPage={companiesPage}
                          totalPages={companiesTotalPages}
                          onPageChange={setCompaniesPage}
                        />
                      </>
                    ) : (
                      <div className="itss-no-jobs">
                        <h3>No hiring companies listed yet</h3>
                        <p>
                          Check back soon for employers actively hiring in{" "}
                          {countryInfo.name}.
                        </p>
                      </div>
                    )}
                  </section>

                  <section className="itss-section-block">
                    <div className="itss-jobs-header">
                      <div>
                        <h2>Available Jobs in {countryInfo.name}</h2>
                        <p>{jobs.length} open roles available.</p>
                      </div>
                    </div>

                    {loading ? (
                      <div className="itss-loading">Loading jobs...</div>
                    ) : jobs.length > 0 ? (
                      <>
                        <div className="itss-jobs-grid">
                          {paginatedJobs.map((job) => (
                            <article
                              key={job.id || job._id}
                              className="itss-job-card"
                            >
                              <h3>{job.title || "Untitled Role"}</h3>

                              <p className="itss-job-company">
                                {job.company_name || "Company not listed"}
                              </p>

                              <p className="itss-job-location">
                                {job.location || countryInfo.name}
                              </p>

                              <p className="itss-job-type">
                                {job.employment_type || "Full-time"} •{" "}
                                {job.work_mode || "Remote"}
                              </p>

                              {job.salary_range && (
                                <p className="itss-job-salary">
                                  {job.salary_range}
                                </p>
                              )}

                              <Link
                                className="itss-job-link"
                                to={`/login?job=${job.id || job._id}`}
                              >
                                Apply / View Details
                              </Link>
                            </article>
                          ))}
                        </div>

                        <Pagination
                          currentPage={jobsPage}
                          totalPages={jobsTotalPages}
                          onPageChange={setJobsPage}
                        />
                      </>
                    ) : (
                      <div className="itss-no-jobs">
                        <h3>No jobs available yet</h3>
                        <p>
                          There are currently no live roles in{" "}
                          {countryInfo.name}.
                        </p>
                      </div>
                    )}
                  </section>
                </>
              ) : (
                <section className="itss-section-block">
                  <div className="itss-jobs-header">
                    <div>
                      <h2>Available Talent in {countryInfo.name}</h2>
                      <p>
                        {candidates.length} candidate profiles available for
                        employers.
                      </p>
                    </div>

                    <Link className="itss-btn" to="/signup">
                      Post a Job
                    </Link>
                  </div>

                  {loading ? (
                    <div className="itss-loading">
                      Loading candidate profiles...
                    </div>
                  ) : candidates.length > 0 ? (
                    <>
                      <div className="itss-jobs-grid">
                        {paginatedCandidates.map((candidate) => (
                          <article
                            key={candidate.id || candidate._id}
                            className="itss-listing-card"
                          >
                            <div className="itss-listing-top">
                              <div className="itss-listing-logo">
                                {candidate.profile_image ? (
                                  <img
                                    src={candidate.profile_image}
                                    alt={candidate.name || "Candidate"}
                                  />
                                ) : (
                                  <span>
                                    {candidate.name
                                      ?.charAt(0)
                                      ?.toUpperCase() || "T"}
                                  </span>
                                )}
                              </div>

                              <div>
                                <h3>{candidate.name || "Candidate Profile"}</h3>
                                <p>
                                  {candidate.professional_title ||
                                    "Professional"}
                                </p>
                              </div>
                            </div>

                            <div className="itss-listing-meta">
                              <span>
                                {candidate.city
                                  ? `${candidate.city}, ${
                                      candidate.country || countryInfo.name
                                    }`
                                  : candidate.country || countryInfo.name}
                              </span>

                              <span>
                                {candidate.years_of_experience
                                  ? `${candidate.years_of_experience} years experience`
                                  : "Experience not set"}
                              </span>

                              <span>
                                {candidate.preferred_work_mode ||
                                  candidate.work_mode ||
                                  "Work mode open"}
                              </span>
                            </div>

                            <p className="itss-listing-skills">
                              {Array.isArray(candidate.skills)
                                ? candidate.skills.join(", ")
                                : candidate.skills ||
                                  "Skills available on profile"}
                            </p>

                            <Link className="itss-job-link" to="/login">
                              View Candidate
                            </Link>
                          </article>
                        ))}
                      </div>

                      <Pagination
                        currentPage={candidatesPage}
                        totalPages={candidatesTotalPages}
                        onPageChange={setCandidatesPage}
                      />
                    </>
                  ) : (
                    <div className="itss-no-jobs">
                      <h3>No candidate profiles available yet</h3>
                      <p>
                        Talent profiles for {countryInfo.name} will appear here
                        as candidates join the platform.
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
                </section>
              )}
            </main>

            <aside className="itss-country-info">
              <div className="itss-info-card">
                <h3>Key Cities</h3>
                <div className="itss-chip-grid">
                  {countryInfo.keyCities.map((city, index) => (
                    <span key={`${city}-${index}`} className="itss-chip">
                      {city}
                    </span>
                  ))}
                </div>
              </div>

              <div className="itss-info-card">
                <h3>Top Industries</h3>
                <div className="itss-chip-grid">
                  {countryInfo.topIndustries.map((industry, index) => (
                    <span key={`${industry}-${index}`} className="itss-chip">
                      {industry}
                    </span>
                  ))}
                </div>
              </div>

              <div className="itss-info-card">
                <h3>Talent Highlights</h3>
                <p className="itss-card-text">
                  {countryInfo.talentHighlights}
                </p>
              </div>

              <div className="itss-info-card">
                <h3>Talent Pool</h3>
                <div className="itss-chip-grid">
                  {countryInfo.talentPool.map((talent, index) => (
                    <span key={`${talent}-${index}`} className="itss-chip">
                      {talent}
                    </span>
                  ))}
                </div>
              </div>

              <div className="itss-info-card">
                <h3>Need to Knows</h3>
                <ul className="itss-need-list">
                  {countryInfo.needToKnows.map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="itss-info-card">
                <h3>Market Snapshot</h3>

                <div className="itss-market-grid">
                  <div className="itss-market-item">
                    <span>Timezone</span>
                    <strong>{countryInfo.marketInfo.timezone}</strong>
                  </div>

                  <div className="itss-market-item">
                    <span>Language</span>
                    <strong>{countryInfo.marketInfo.language}</strong>
                  </div>

                  <div className="itss-market-item">
                    <span>Hiring Outlook</span>
                    <strong>{countryInfo.marketInfo.hiringOutlook}</strong>
                  </div>

                  <div className="itss-market-item">
                    <span>Employment Types</span>
                    <strong>
                      {countryInfo.marketInfo.commonEmploymentTypes.join(", ")}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="itss-info-card">
                <h3>Salary Snapshot</h3>

                <div className="itss-salary-table">
                  {countryInfo.salarySnapshot.map((item, index) => (
                    <div
                      key={`${item.role || "salary"}-${index}`}
                      className="itss-salary-row"
                    >
                      <span>{item.role}</span>
                      <strong>{item.range}</strong>
                      <em>{item.availability}</em>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
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