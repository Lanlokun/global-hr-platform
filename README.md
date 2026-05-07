# Global HR Platform

A comprehensive, full-stack Human Resources management platform connecting employers with candidates globally. Built with modern web technologies, this platform provides role-based access for administrators, employers, and candidates with features for job management, applications, candidate evaluations, and more.

## 🚀 Features

### For Administrators
- **Dashboard Overview**: Real-time statistics on users, companies, jobs, and applications
- **User Management**: View, search, filter, and manage all platform users
- **Company Management**: Oversee registered companies and their activities
- **Job Management**: Monitor all posted jobs and listings across the platform
- **Application Tracking**: Track job applications and hiring pipeline status
- **Candidate Directory**: Manage candidate profiles and activities
- **System Health Monitoring**: View platform status and operational metrics

### For Employers/Companies
- **Company Profile**: Create and manage company profiles with logo, description, and details
- **Job Posting**: Create, edit, and manage job listings with detailed requirements
- **Candidate Discovery**: Browse and search for candidates based on skills, location, and experience
- **Application Management**: Review and manage job applications with status tracking
- **Candidate Evaluation**: Rate candidates on technical, communication, problem-solving, and culture fit
- **Messaging System**: Communicate directly with candidates
- **Talent Pool**: Access recommended candidates based on job requirements
- **Analytics**: View job performance metrics and candidate engagement

### For Candidates
- **Profile Management**: Comprehensive profile with experience, education, certifications, and skills
- **Job Search**: Browse and search for jobs by location, type, and requirements
- **Application Tracking**: Track application status and history
- **Opportunities**: View recommended jobs based on profile and preferences
- **Messaging**: Communicate with employers
- **Resume Upload**: Upload and manage resume documents

### Public Features
- **Landing Page**: Interactive world map showing job opportunities by country
- **Country Pages**: Detailed country-specific job listings and talent information
- **User Registration**: Multi-step signup with email verification
- **Password Recovery**: Secure password reset functionality

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19.2.4
- **Routing**: React Router DOM 7.14.0
- **HTTP Client**: Axios 1.15.0
- **UI Components**: Lucide React 1.14.0, React Icons 5.6.0
- **Animations**: Framer Motion 12.38.0
- **Charts**: Recharts 3.8.1
- **Maps**: @vnedyalk0v/react19-simple-maps 2.0.7
- **Notifications**: React Hot Toast 2.6.0
- **Build Tool**: Create React App (React Scripts 5.0.1)

### Backend
- **Runtime**: Node.js
- **Framework**: Express 5.2.1
- **Database**: PostgreSQL 8.20.0 (pg)
- **Authentication**: JWT (jsonwebtoken 9.0.3)
- **Password Hashing**: bcrypt 6.0.0, bcryptjs 3.0.3
- **Email**: Nodemailer 8.0.7
- **File Upload**: Multer 2.1.1
- **Environment**: dotenv 17.4.1
- **CORS**: cors 2.8.6
- **Development**: nodemon 3.1.14

### Database
- **Type**: PostgreSQL
- **Features**: JSONB support for flexible data structures
- **Indexes**: Optimized indexes on frequently queried fields
- **Tables**: users, companies, jobs, applications, candidate_evaluations

## 📁 Project Structure

```
global-hr-platform/
├── backend/
│   ├── config/
│   │   └── db.js                 # Database configuration
│   ├── controllers/              # Business logic handlers
│   │   ├── adminController.js
│   │   ├── applicationController.js
│   │   ├── authController.js
│   │   ├── candidateEvaluationController.js
│   │   ├── candidateManagementController.js
│   │   ├── companyController.js
│   │   ├── employerController.js
│   │   ├── jobController.js
│   │   ├── messageController.js
│   │   ├── notificationController.js
│   │   ├── publicCountryController.js
│   │   ├── recommendationController.js
│   │   ├── userController.js
│   │   └── userProfileController.js
│   ├── middleware/               # Custom middleware
│   │   ├── authMiddleware.js     # JWT authentication
│   │   ├── roleMiddleware.js     # Role-based access control
│   │   └── upload.js             # File upload configuration
│   ├── routes/                   # API route definitions
│   │   ├── adminRoutes.js
│   │   ├── applicationRoutes.js
│   │   ├── authRoutes.js
│   │   ├── candidateManagementRoutes.js
│   │   ├── companyRoutes.js
│   │   ├── employerRoutes.js
│   │   ├── jobRoutes.js
│   │   ├── messageRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── publicRoutes.js
│   │   ├── recommendationRoutes.js
│   │   ├── uploadRoutes.js
│   │   ├── userProfileRoutes.js
│   │   └── userRoutes.js
│   ├── services/                 # External service integrations
│   ├── uploads/                  # Static file storage
│   ├── api.js
│   ├── app.js
│   └── server.js                 # Express server entry point
├── frontend/
│   ├── public/                   # Static assets
│   ├── src/
│   │   ├── components/           # Reusable components
│   │   │   ├── auth/             # Authentication components
│   │   │   ├── marketing/        # Landing page components
│   │   │   └── ui/               # UI components (Card, Badge, Button, Input)
│   │   ├── context/              # React context providers
│   │   │   └── LanguageContext.js
│   │   ├── data/                 # Static data
│   │   ├── i18n/                 # Internationalization
│   │   ├── layouts/              # Page layouts
│   │   │   └── DashboardLayout.js
│   │   ├── pages/                # Page components
│   │   │   ├── admin/            # Admin dashboard pages
│   │   │   ├── auth/             # Authentication pages
│   │   │   ├── candidate/        # Candidate dashboard pages
│   │   │   ├── employer/         # Employer dashboard pages
│   │   │   ├── messages/         # Messaging pages
│   │   │   └── public/           # Public pages
│   │   ├── routes/               # Route protection components
│   │   │   ├── AdminRoute.js
│   │   │   ├── ProtectedRoute.js
│   │   │   └── index.js
│   │   ├── services/             # API service layer
│   │   ├── styles/               # Global styles
│   │   ├── utils/                # Utility functions
│   │   ├── App.js                # Main app component with routing
│   │   └── index.js              # React entry point
│   └── package.json
├── database/
│   ├── migrations/               # Database migrations
│   ├── schema/
│   │   ├── schema.sql            # Database schema
│   │   ├── seed.sql              # Seed data
│   │   └── new.sql               # New schema changes
│   └── seeds/                    # Seed scripts
├── .env                          # Environment variables (not in git)
├── .gitignore
├── docker-compose.yml
├── package.json                  # Root package.json
└── README.md
```

## 🗄️ Database Schema

### Tables

#### `users`
Stores user information including candidates and employers.
- **Key Fields**: id, name, email, password, role, company_id
- **Profile**: country, phone, city, address, date_of_birth, gender, profile_image
- **Professional**: professional_title, years_of_experience, professional_summary, skills, languages
- **Structured Data**: experience (JSONB), education (JSONB), certifications (JSONB)
- **Preferences**: desired_job_title, preferred_employment_type, preferred_work_mode, expected_salary, availability
- **Links**: linkedin_url, github_url, portfolio_url, resume_url

#### `companies`
Stores company/employer information.
- **Key Fields**: id, name, industry, country, city, address
- **Details**: description, website, logo, size, founded_year

#### `jobs`
Stores job postings.
- **Key Fields**: id, company_id, title, description, location
- **Requirements**: employment_type, experience_level, required_skills
- **Compensation**: salary_range, salary_min, salary_max, currency
- **Status**: remote, status, expires_at

#### `applications`
Stores job applications.
- **Key Fields**: id, job_id, user_id, status
- **Details**: cover_letter, resume_url, recruiter_notes

#### `candidate_evaluations`
Stores employer evaluations of candidates.
- **Scores**: technical, communication, problem_solving, culture_fit, experience_relevance, confidence, overall
- **Recommendation**: hold, hire, reject
- **Notes**: interview_notes

## 🔧 Installation

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Backend Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd global-hr-platform
```

2. **Install root dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=global_hr_platform
DB_USER=your_username
DB_PASSWORD=your_password
DATABASE_URL=postgresql://your_username:your_password@localhost:5432/global_hr_platform

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_jwt_secret_key

# Email (for password reset/verification)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

4. **Set up the database**
```bash
# Create the database
createdb global_hr_platform

# Run the schema
psql -U your_username -d global_hr_platform -f database/schema/schema.sql

# Run seed data (optional)
psql -U your_username -d global_hr_platform -f database/schema/seed.sql
```

5. **Start the backend server**
```bash
npm run dev
# or
npm start
```

The backend API will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to the frontend directory**
```bash
cd frontend
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the `frontend` directory:
```env
REACT_APP_API_URL=http://localhost:5000
```

4. **Start the React development server**
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## 🌐 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `POST /verify-email` - Email verification
- `POST /forgot-password` - Request password reset
- `POST /reset-password` - Reset password

### Users (`/api/users`)
- `GET /` - Get all users (admin)
- `GET /:id` - Get user by ID
- `PUT /:id` - Update user profile
- `DELETE /:id` - Delete user (admin)

### Companies (`/api/companies`)
- `GET /` - Get all companies
- `GET /:id` - Get company by ID
- `POST /` - Create company
- `PUT /:id` - Update company
- `DELETE /:id` - Delete company

### Jobs (`/api/jobs`)
- `GET /` - Get all jobs
- `GET /:id` - Get job by ID
- `POST /` - Create job
- `PUT /:id` - Update job
- `DELETE /:id` - Delete job
- `GET /company/:companyId` - Get jobs by company

### Applications (`/api/applications`)
- `GET /` - Get all applications
- `GET /:id` - Get application by ID
- `POST /` - Submit application
- `PUT /:id` - Update application status
- `DELETE /:id` - Delete application
- `GET /user/:userId` - Get user applications
- `GET /job/:jobId` - Get job applications

### Candidates (`/api/candidates`)
- `GET /` - Get all candidates
- `GET /:id` - Get candidate by ID
- `GET /recommend/:jobId` - Get recommended candidates for job
- `POST /evaluate` - Evaluate candidate

### Admin (`/api/admin`)
- `GET /users/stats` - Get user statistics
- `GET /companies/stats` - Get company statistics
- `GET /jobs/stats` - Get job statistics
- `GET /applications/stats` - Get application statistics
- `GET /candidates/stats` - Get candidate statistics
- `GET /users` - Get all users (admin)
- `GET /companies` - Get all companies (admin)
- `GET /jobs` - Get all jobs (admin)
- `GET /applications` - Get all applications (admin)
- `GET /candidates` - Get all candidates (admin)

### Messages (`/api/messages`)
- `GET /` - Get messages
- `POST /` - Send message
- `GET /:userId` - Get conversation with user

### Notifications (`/api/notifications`)
- `GET /` - Get user notifications
- `PUT /:id/read` - Mark notification as read

### Public (`/api/public`)
- `GET /countries` - Get countries with job counts
- `GET /country/:country/jobs` - Get jobs by country
- `GET /country/:country/candidates` - Get candidates by country

### Uploads (`/api/uploads`)
- `POST /resume` - Upload resume
- `POST /logo` - Upload company logo

## 👥 User Roles

### Admin
- Full access to all platform data
- Manage users, companies, jobs, applications
- View platform statistics and health metrics
- Access to admin dashboard at `/admin`

### Employer
- Create and manage company profile
- Post and manage job listings
- Browse and evaluate candidates
- Review applications
- Message candidates
- Access to employer dashboard at `/dashboard/employer`

### Candidate
- Create and manage profile
- Browse and apply to jobs
- Track application status
- View recommended opportunities
- Message employers
- Access to candidate dashboard at `/dashboard/candidate`

## 🔐 Authentication & Security

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Role-Based Access Control**: Middleware to enforce role permissions
- **CORS Configuration**: Restricted to allowed origins only
- **Email Verification**: Required for account activation
- **Password Reset**: Secure password recovery via email

## 🚀 Deployment

### Backend Deployment

1. **Set environment variables** on your hosting platform
2. **Build and start** the server:
```bash
npm start
```

### Frontend Deployment

1. **Build the React app**:
```bash
cd frontend
npm run build
```

2. **Deploy** the `build` folder to your hosting platform (Vercel, Netlify, etc.)

### Database

- Use a managed PostgreSQL service (Supabase, Neon, AWS RDS, etc.)
- Run schema migrations on production database
- Set up regular backups

## 📝 Scripts

### Root Scripts
- `npm run dev` - Start backend server with nodemon
- `npm start` - Start backend server

### Frontend Scripts
- `npm start` - Start React development server
- `npm run build` - Build React app for production
- `npm test` - Run tests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

ISC

## 📧 Contact

For questions or support, please open an issue in the repository.

## 🙏 Acknowledgments

- Built with modern web technologies
- Inspired by the need for a global HR platform
- Designed to connect employers with talent worldwide
