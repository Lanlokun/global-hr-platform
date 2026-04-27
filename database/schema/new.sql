CREATE TABLE IF NOT EXISTS company_team_members (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(150),
  email VARCHAR(150) NOT NULL,
  role VARCHAR(50) DEFAULT 'Recruiter',
  status VARCHAR(50) DEFAULT 'Invited',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(company_id, email)
);

CREATE TABLE IF NOT EXISTS company_settings (
  id SERIAL PRIMARY KEY,
  company_id INTEGER UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
  workspace_name VARCHAR(150),
  default_country VARCHAR(100),
  company_size VARCHAR(50),
  new_application_alerts BOOLEAN DEFAULT TRUE,
  status_update_alerts BOOLEAN DEFAULT TRUE,
  weekly_summary BOOLEAN DEFAULT TRUE,
  public_profile BOOLEAN DEFAULT TRUE,
  two_factor_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);