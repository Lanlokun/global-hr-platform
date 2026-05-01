-- =========================
-- COMPANIES
-- =========================

ALTER TABLE companies
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

TRUNCATE TABLE
  candidate_evaluations,
  applications,
  jobs,
  users,
  companies
RESTART IDENTITY CASCADE;   

CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    industry VARCHAR(100),
    country VARCHAR(100),
    city VARCHAR(100),
    address TEXT,
    description TEXT,
    website TEXT,
    logo TEXT,
    size VARCHAR(50),
    founded_year INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_companies_country ON companies(country);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry);


-- =========================
-- USERS
-- =========================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255),
    role VARCHAR(50),
    company_id INTEGER REFERENCES companies(id) ON DELETE SET NULL,

    -- basic info
    country VARCHAR(100),
    phone VARCHAR(50),
    city VARCHAR(100),
    address TEXT,
    date_of_birth DATE,
    gender VARCHAR(30),
    profile_image TEXT,

    -- professional
    professional_title VARCHAR(150),
    years_of_experience INTEGER,
    professional_summary TEXT,
    skills TEXT,
    languages TEXT,

    -- structured JSON fields
    experience JSONB DEFAULT '[]'::jsonb,
    education JSONB DEFAULT '[]'::jsonb,
    certifications JSONB DEFAULT '[]'::jsonb,

    -- job preferences
    desired_job_title VARCHAR(150),
    preferred_employment_type VARCHAR(50),
    preferred_work_mode VARCHAR(50),
    expected_salary NUMERIC(12,2),
    salary_currency VARCHAR(10) DEFAULT 'USD',
    notice_period VARCHAR(100),
    availability VARCHAR(100),
    work_authorization VARCHAR(150),
    willing_to_relocate BOOLEAN DEFAULT FALSE,

    -- links/files
    linkedin_url TEXT,
    github_url TEXT,
    portfolio_url TEXT,
    resume_url TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_country ON users(country);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_professional_title ON users(professional_title);


-- =========================
-- JOBS
-- =========================

CREATE TABLE IF NOT EXISTS jobs (
    id SERIAL PRIMARY KEY,
    company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,

    title VARCHAR(150) NOT NULL,
    description TEXT,
    location VARCHAR(150),

    employment_type VARCHAR(50),
    experience_level VARCHAR(50),
    required_skills TEXT,

    salary_range VARCHAR(100),
    salary_min NUMERIC(12,2),
    salary_max NUMERIC(12,2),
    currency VARCHAR(10) DEFAULT 'USD',

    remote BOOLEAN DEFAULT TRUE,
    status VARCHAR(50) DEFAULT 'active',

    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);
CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_employment_type ON jobs(employment_type);
CREATE INDEX IF NOT EXISTS idx_jobs_experience_level ON jobs(experience_level);
CREATE INDEX IF NOT EXISTS idx_jobs_remote ON jobs(remote);


-- =========================
-- APPLICATIONS
-- =========================

CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,

    status VARCHAR(50) DEFAULT 'pending',
    cover_letter TEXT,
    resume_url TEXT,
    recruiter_notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(job_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);


-- =========================
-- CANDIDATE EVALUATIONS
-- =========================

CREATE TABLE IF NOT EXISTS candidate_evaluations (
    id SERIAL PRIMARY KEY,

    candidate_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    technical_score INTEGER DEFAULT 0,
    communication_score INTEGER DEFAULT 0,
    problem_solving_score INTEGER DEFAULT 0,
    culture_fit_score INTEGER DEFAULT 0,
    experience_relevance_score INTEGER DEFAULT 0,
    confidence_score INTEGER DEFAULT 0,
    overall_score INTEGER DEFAULT 0,

    recommendation VARCHAR(50) DEFAULT 'hold',
    interview_notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(candidate_id, employer_id)
);

CREATE INDEX IF NOT EXISTS idx_candidate_evaluations_candidate_id
ON candidate_evaluations(candidate_id);

CREATE INDEX IF NOT EXISTS idx_candidate_evaluations_employer_id
ON candidate_evaluations(employer_id);

CREATE INDEX IF NOT EXISTS idx_candidate_evaluations_overall_score
ON candidate_evaluations(overall_score);