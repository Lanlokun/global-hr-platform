TRUNCATE TABLE
  candidate_evaluations,
  applications,
  jobs,
  users,
  companies
RESTART IDENTITY CASCADE;

-- bcrypt hash for: password123
-- Use this if your backend uses bcrypt.compare()
-- Login password is still: password123

-- =========================
-- COMPANIES
-- =========================

INSERT INTO companies (
  name,
  industry,
  country,
  city,
  description,
  website,
  size,
  founded_year
)
VALUES
(
  'AfriTalent Solutions',
  'HR Technology',
  'Nigeria',
  'Lagos',
  'A platform connecting African talent with global companies.',
  'https://afritalent.com',
  '11-50',
  2022
),
(
  'Kora Digital Labs',
  'Software Development',
  'Ghana',
  'Accra',
  'Building scalable digital products for startups and enterprises.',
  'https://koralabs.com',
  '51-200',
  2018
),
(
  'Savanna AI Group',
  'Artificial Intelligence',
  'Kenya',
  'Nairobi',
  'AI-driven solutions for hiring, analytics, and automation.',
  'https://savannaai.com',
  '11-50',
  2021
);

-- =========================
-- USERS
-- =========================

INSERT INTO users (
  name,
  email,
  password,
  role,
  country,
  city,
  company_id,
  professional_title,
  years_of_experience,
  skills,
  professional_summary
)
VALUES
(
  'Amina Bello',
  'amina@afritalent.com',
  '$2b$10$3nOAI6yUKkRrysp39DkcIurVqCAL9kYp9oMdog04UY2277JpfzVCy',
  'employer',
  'Nigeria',
  'Lagos',
  (SELECT id FROM companies WHERE name = 'AfriTalent Solutions'),
  'HR Director',
  NULL,
  NULL,
  NULL
),
(
  'Kwame Mensah',
  'kwame@koralabs.com',
  '$2b$10$3nOAI6yUKkRrysp39DkcIurVqCAL9kYp9oMdog04UY2277JpfzVCy',
  'employer',
  'Ghana',
  'Accra',
  (SELECT id FROM companies WHERE name = 'Kora Digital Labs'),
  'Engineering Manager',
  NULL,
  NULL,
  NULL
),
(
  'Daniel Otieno',
  'daniel@savannaai.com',
  '$2b$10$3nOAI6yUKkRrysp39DkcIurVqCAL9kYp9oMdog04UY2277JpfzVCy',
  'employer',
  'Kenya',
  'Nairobi',
  (SELECT id FROM companies WHERE name = 'Savanna AI Group'),
  'AI Lead',
  NULL,
  NULL,
  NULL
),
(
  'Fatou Jallow',
  'fatou@gmail.com',
  '$2b$10$3nOAI6yUKkRrysp39DkcIurVqCAL9kYp9oMdog04UY2277JpfzVCy',
  'candidate',
  'Gambia',
  'Banjul',
  NULL,
  'Frontend Developer',
  3,
  'React, JavaScript, HTML, CSS',
  'Frontend developer with experience building responsive web apps.'
),
(
  'Ibrahim Diallo',
  'ibrahim@gmail.com',
  '$2b$10$3nOAI6yUKkRrysp39DkcIurVqCAL9kYp9oMdog04UY2277JpfzVCy',
  'candidate',
  'Senegal',
  'Dakar',
  NULL,
  'Backend Engineer',
  5,
  'Node.js, PostgreSQL, APIs',
  'Backend engineer focused on scalable API systems.'
),
(
  'Grace Njeri',
  'grace@gmail.com',
  '$2b$10$3nOAI6yUKkRrysp39DkcIurVqCAL9kYp9oMdog04UY2277JpfzVCy',
  'candidate',
  'Kenya',
  'Nairobi',
  NULL,
  'UI/UX Designer',
  4,
  'Figma, UX Research, Prototyping',
  'Designer focused on user-centered product design.'
);

-- =========================
-- JOBS
-- =========================

INSERT INTO jobs (
  company_id,
  title,
  description,
  location,
  employment_type,
  experience_level,
  required_skills,
  salary_range,
  salary_min,
  salary_max,
  currency,
  remote,
  expires_at
)
VALUES
(
  (SELECT id FROM companies WHERE name = 'AfriTalent Solutions'),
  'Senior Frontend Engineer',
  'Build modern web applications using React and TypeScript.',
  'Lagos, Nigeria',
  'Full-time',
  'Senior',
  'React, TypeScript, CSS',
  '$2000 - $3500',
  2000,
  3500,
  'USD',
  TRUE,
  NOW() + INTERVAL '45 days'
),
(
  (SELECT id FROM companies WHERE name = 'AfriTalent Solutions'),
  'Talent Acquisition Specialist',
  'Manage recruitment pipelines and candidate screening.',
  'Abuja, Nigeria',
  'Full-time',
  'Mid-level',
  'Recruitment, HR, Communication',
  '$900 - $1500',
  900,
  1500,
  'USD',
  FALSE,
  NOW() + INTERVAL '30 days'
),
(
  (SELECT id FROM companies WHERE name = 'Kora Digital Labs'),
  'Backend Engineer',
  'Develop APIs and manage database systems.',
  'Accra, Ghana',
  'Full-time',
  'Mid-level',
  'Node.js, PostgreSQL, APIs',
  '$1800 - $2800',
  1800,
  2800,
  'USD',
  TRUE,
  NOW() + INTERVAL '60 days'
),
(
  (SELECT id FROM companies WHERE name = 'Savanna AI Group'),
  'AI Engineer',
  'Build machine learning models for recommendation systems.',
  'Nairobi, Kenya',
  'Contract',
  'Senior',
  'Python, ML, NLP',
  '$3000 - $5000',
  3000,
  5000,
  'USD',
  TRUE,
  NOW() + INTERVAL '50 days'
);

-- =========================
-- APPLICATIONS
-- =========================

INSERT INTO applications (
  job_id,
  user_id,
  cover_letter,
  status
)
VALUES
(
  (SELECT id FROM jobs WHERE title = 'Senior Frontend Engineer'),
  (SELECT id FROM users WHERE email = 'fatou@gmail.com'),
  'I am very interested in this frontend role and believe my React experience makes me a strong fit.',
  'pending'
),
(
  (SELECT id FROM jobs WHERE title = 'Backend Engineer'),
  (SELECT id FROM users WHERE email = 'ibrahim@gmail.com'),
  'My experience building backend systems and APIs makes me a strong fit for this role.',
  'interview'
),
(
  (SELECT id FROM jobs WHERE title = 'AI Engineer'),
  (SELECT id FROM users WHERE email = 'grace@gmail.com'),
  'My product and technical background aligns well with this AI role.',
  'review'
);

-- =========================
-- CANDIDATE EVALUATIONS
-- =========================

INSERT INTO candidate_evaluations (
  candidate_id,
  employer_id,
  technical_score,
  communication_score,
  problem_solving_score,
  culture_fit_score,
  experience_relevance_score,
  confidence_score,
  overall_score,
  recommendation,
  interview_notes
)
VALUES
(
  (SELECT id FROM users WHERE email = 'fatou@gmail.com'),
  (SELECT id FROM users WHERE email = 'amina@afritalent.com'),
  80,
  75,
  78,
  82,
  85,
  80,
  80,
  'hire',
  'Strong frontend skills and good communication.'
),
(
  (SELECT id FROM users WHERE email = 'ibrahim@gmail.com'),
  (SELECT id FROM users WHERE email = 'kwame@koralabs.com'),
  85,
  70,
  88,
  75,
  90,
  78,
  81,
  'hire',
  'Excellent backend knowledge with strong API design experience.'
),
(
  (SELECT id FROM users WHERE email = 'grace@gmail.com'),
  (SELECT id FROM users WHERE email = 'daniel@savannaai.com'),
  78,
  85,
  80,
  88,
  82,
  90,
  84,
  'strong_hire',
  'Strong candidate with good product thinking and communication.'
);