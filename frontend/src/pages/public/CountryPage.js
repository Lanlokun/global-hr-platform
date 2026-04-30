import { motion } from "framer-motion";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import "../../components/marketing/landing.css";
import "../../components/marketing/country.css";

import countryData, { countryAliases } from "../../data/countryData";
import { useLanguage } from "../../context/LanguageContext";
import LanguageSwitcher from "../../components/ui/LanguageSwitcher";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const ITEMS_PER_PAGE = 8;

function Pagination({ currentPage, totalPages, onPageChange }) {
  const { t } = useLanguage();

  if (!totalPages || totalPages <= 1) return null;

  return (
    <div className="itss-pagination">
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        {t("previous")}
      </button>

      <span>
        {t("page")} {currentPage} / {totalPages}
      </span>

      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        {t("next")}
      </button>
    </div>
  );
}

function CountryPage() {
  const { country } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [viewerType, setViewerType] = useState("candidate");

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

  const translatedCountry = countryInfo
    ? t(`countryDetails.${resolvedSlug}`)
    : null;

  const countryView =
    translatedCountry && typeof translatedCountry === "object"
      ? translatedCountry
      : countryInfo;

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

  const paginatedCompanies = useMemo(
    () => paginate(companies, companiesPage),
    [companies, companiesPage]
  );

  const paginatedJobs = useMemo(
    () => paginate(jobs, jobsPage),
    [jobs, jobsPage]
  );

  const paginatedCandidates = useMemo(
    () => paginate(candidates, candidatesPage),
    [candidates, candidatesPage]
  );

  const companiesTotalPages = Math.ceil(companies.length / ITEMS_PER_PAGE);
  const jobsTotalPages = Math.ceil(jobs.length / ITEMS_PER_PAGE);
  const candidatesTotalPages = Math.ceil(candidates.length / ITEMS_PER_PAGE);

  if (!countryInfo || !countryView) {
    return <div className="itss-loading">{t("loading")}</div>;
  }

  return (
    <>
      <div className="itss-page itss-country-page">
        <nav className="itss-nav">
          <Link to="/" className="itss-brand">
            SGET International Talent Space Station
          </Link>

          <div className="itss-nav-actions">
            <LanguageSwitcher />

            <Link className="itss-link" to="/login">
              {t("signIn")}
            </Link>

            <Link className="itss-btn itss-btn-small" to="/signup">
              {t("getStarted")}
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
              &larr; {t("backToMap")}
            </Link>

            <div className="itss-country-title">
              <span className="itss-country-kicker">
                {t("countryMarket")}
              </span>

              <h1 className="itss-title">
                {countryInfo.flag} {countryView.name}
              </h1>

              <p className="itss-country-description">
                {countryView.description}
              </p>
            </div>
          </div>

          <div className="itss-view-toggle-wrap">
            <div className="itss-view-toggle">
              <button
                type="button"
                className={`itss-toggle-btn ${
                  viewerType === "candidate" ? "active" : ""
                }`}
                onClick={() => setViewerType("candidate")}
              >
                <span className="itss-toggle-kicker">{t("forTalent")}</span>
                <span className="itss-toggle-title">{t("lookingForJob")}</span>
                <span className="itss-toggle-text">{t("browseCompanies")}</span>
              </button>

              <button
                type="button"
                className={`itss-toggle-btn ${
                  viewerType === "company" ? "active" : ""
                }`}
                onClick={() => setViewerType("company")}
              >
                <span className="itss-toggle-kicker">{t("forEmployers")}</span>
                <span className="itss-toggle-title">{t("iAmHiring")}</span>
                <span className="itss-toggle-text">{t("exploreTalent")}</span>
              </button>
            </div>
          </div>

          <div className="itss-country-content">
            <main className="itss-country-main">
              {viewerType === "candidate" ? (
                <>
                  <section className="itss-section-block">
                    <div className="itss-jobs-header">
                      <div>
                        <h2>
                          {t("hiringCompanies")} {countryView.name}
                        </h2>
                        <p>
                          {companies.length} {t("companiesListed")}{" "}
                          {countryView.name}.
                        </p>
                      </div>

                      <Link className="itss-btn" to="/signup">
                        {t("createProfile")}
                      </Link>
                    </div>

                    {loading ? (
                      <div className="itss-loading">
                        {t("loadingCompanies")}
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
                                      alt={company.name || t("company")}
                                    />
                                  ) : (
                                    <span>
                                      {company.name?.charAt(0)?.toUpperCase() ||
                                        "C"}
                                    </span>
                                  )}
                                </div>

                                <div>
                                  <h3>{company.name || t("company")}</h3>
                                  <p>
                                    {company.industry || t("industryNotSet")}
                                  </p>
                                </div>
                              </div>

                              <div className="itss-listing-meta">
                                <span>
                                  {company.city
                                    ? `${company.city}, ${
                                        company.country || countryView.name
                                      }`
                                    : company.country || countryView.name}
                                </span>

                                <span>{company.size || t("sizeNotSet")}</span>

                                <span>
                                  {company.job_count || 0} {t("openRoles")}
                                </span>
                              </div>

                              <Link className="itss-job-link" to="/signup">
                                {t("exploreOpportunities")}
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
                        <h3>{t("noCompanies")}</h3>
                        <p>
                          {t("checkBackCompanies")} {countryView.name}.
                        </p>
                      </div>
                    )}
                  </section>

                  <section className="itss-section-block">
                    <div className="itss-jobs-header">
                      <div>
                        <h2>
                          {t("availableJobs")} {countryView.name}
                        </h2>
                        <p>
                          {jobs.length} {t("openRolesAvailable")}
                        </p>
                      </div>
                    </div>

                    {loading ? (
                      <div className="itss-loading">{t("loadingJobs")}</div>
                    ) : jobs.length > 0 ? (
                      <>
                        <div className="itss-jobs-grid">
                          {paginatedJobs.map((job) => (
                            <article
                              key={job.id || job._id}
                              className="itss-job-card"
                            >
                              <h3>{job.title || t("untitledRole")}</h3>

                              <p className="itss-job-company">
                                {job.company_name || t("companyNotListed")}
                              </p>

                              <p className="itss-job-location">
                                {job.location || countryView.name}
                              </p>

                              <p className="itss-job-type">
                                {job.employment_type || t("fullTime")} •{" "}
                                {job.work_mode || t("remote")}
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
                                {t("apply")}
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
                        <h3>{t("noJobs")}</h3>
                        <p>
                          {t("noLiveRoles")} {countryView.name}.
                        </p>
                      </div>
                    )}
                  </section>
                </>
              ) : (
                <section className="itss-section-block">
                  <div className="itss-jobs-header">
                    <div>
                      <h2>
                        {t("availableTalent")} {countryView.name}
                      </h2>
                      <p>
                        {candidates.length} {t("candidateProfilesAvailable")}
                      </p>
                    </div>

                    <Link className="itss-btn" to="/signup">
                      {t("postJob")}
                    </Link>
                  </div>

                  {loading ? (
                    <div className="itss-loading">
                      {t("loadingCandidates")}
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
                                    alt={candidate.name || t("candidate")}
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
                                <h3>
                                  {candidate.name || t("candidateProfile")}
                                </h3>
                                <p>
                                  {candidate.professional_title ||
                                    t("professional")}
                                </p>
                              </div>
                            </div>

                            <div className="itss-listing-meta">
                              <span>
                                {candidate.city
                                  ? `${candidate.city}, ${
                                      candidate.country || countryView.name
                                    }`
                                  : candidate.country || countryView.name}
                              </span>

                              <span>
                                {candidate.years_of_experience
                                  ? `${candidate.years_of_experience} ${t(
                                      "yearsExperience"
                                    )}`
                                  : t("experienceNotSet")}
                              </span>

                              <span>
                                {candidate.preferred_work_mode ||
                                  candidate.work_mode ||
                                  t("workModeOpen")}
                              </span>
                            </div>

                            <p className="itss-listing-skills">
                              {Array.isArray(candidate.skills)
                                ? candidate.skills.join(", ")
                                : candidate.skills || t("skillsAvailable")}
                            </p>

                            <Link className="itss-job-link" to="/login">
                              {t("viewCandidate")}
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
                      <h3>{t("noCandidates")}</h3>
                      <p>
                        {t("talentProfilesAppear")} {countryView.name}.
                      </p>

                      <div className="itss-hero-actions">
                        <Link className="itss-btn" to="/signup">
                          {t("postJob")}
                        </Link>
                        <Link className="itss-btn-secondary" to="/login">
                          {t("signInEmployer")}
                        </Link>
                      </div>
                    </div>
                  )}
                </section>
              )}
            </main>

            <aside className="itss-country-info">
              <div className="itss-info-card">
                <h3>{t("keyCities")}</h3>
                <div className="itss-chip-grid">
                  {countryView.keyCities.map((city, index) => (
                    <span key={`${city}-${index}`} className="itss-chip">
                      {city}
                    </span>
                  ))}
                </div>
              </div>

              <div className="itss-info-card">
                <h3>{t("topIndustries")}</h3>
                <div className="itss-chip-grid">
                  {countryView.topIndustries.map((industry, index) => (
                    <span key={`${industry}-${index}`} className="itss-chip">
                      {industry}
                    </span>
                  ))}
                </div>
              </div>

              <div className="itss-info-card">
                <h3>{t("talentHighlights")}</h3>
                <p className="itss-card-text">
                  {countryView.talentHighlights}
                </p>
              </div>

              <div className="itss-info-card">
                <h3>{t("talentPool")}</h3>
                <div className="itss-chip-grid">
                  {countryView.talentPool.map((talent, index) => (
                    <span key={`${talent}-${index}`} className="itss-chip">
                      {talent}
                    </span>
                  ))}
                </div>
              </div>

              <div className="itss-info-card">
                <h3>{t("needToKnow")}</h3>
                <ul className="itss-need-list">
                  {countryView.needToKnows.map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="itss-info-card">
                <h3>{t("marketSnapshot")}</h3>

                <div className="itss-market-grid">
                  <div className="itss-market-item">
                    <span>{t("timezone")}</span>
                    <strong>{countryView.marketInfo.timezone}</strong>
                  </div>

                  <div className="itss-market-item">
                    <span>{t("language")}</span>
                    <strong>{countryView.marketInfo.language}</strong>
                  </div>

                  <div className="itss-market-item">
                    <span>{t("hiringOutlook")}</span>
                    <strong>{countryView.marketInfo.hiringOutlook}</strong>
                  </div>

                  <div className="itss-market-item">
                    <span>{t("employmentTypes")}</span>
                    <strong>
                      {countryView.marketInfo.commonEmploymentTypes.join(", ")}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="itss-info-card">
                <h3>{t("salarySnapshot")}</h3>

                <div className="itss-salary-table">
                  {countryView.salarySnapshot.map((item, index) => (
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
          © {new Date().getFullYear()} SGET International Talent Space Station.{" "}
          {t("allRightsReserved")}
        </div>
      </footer>
    </>
  );
}

export default CountryPage;