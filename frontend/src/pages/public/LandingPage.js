import { motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  Building2,
  Globe2,
  ShieldCheck,
  Users,
  Workflow,
} from "lucide-react";
import { Link } from "react-router-dom";
import "../../components/marketing/landing.css";

function LandingPage() {
  const features = [
    {
      icon: <Globe2 size={22} />,
      title: "Global hiring",
      text: "Hire across borders with a unified workflow for talent sourcing, onboarding, and collaboration.",
    },
    {
      icon: <ShieldCheck size={22} />,
      title: "Secure access",
      text: "Protect company and candidate data with role-based access and trusted account flows.",
    },
    {
      icon: <Workflow size={22} />,
      title: "Streamlined workflows",
      text: "Move from signup to jobs, applications, and hiring decisions in one modern workspace.",
    },
    {
      icon: <Building2 size={22} />,
      title: "Employer workspace",
      text: "Create companies, publish jobs, and manage hiring from a premium operational dashboard.",
    },
    {
      icon: <Briefcase size={22} />,
      title: "Candidate journey",
      text: "Explore opportunities, apply quickly, and manage the job journey with clarity.",
    },
    {
      icon: <Users size={22} />,
      title: "Unified people ops",
      text: "Build the foundation for payroll, compliance, performance, and workforce analytics.",
    },
  ];

  return (
    <div className="landing-page">
      <div className="landing-container">
        <nav className="landing-nav">
          <div className="landing-brand">GlobalHR</div>

          <div className="landing-nav-links">
            <Link className="landing-link" to="/login">Sign in</Link>
            <Link className="landing-btn" to="/signup">
              Get started <ArrowRight size={16} />
            </Link>
          </div>
        </nav>

        <section className="landing-hero">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="landing-badge">Built for modern global teams</div>
            <h1 className="landing-title">
              The premium HR platform for hiring and managing talent worldwide
            </h1>
            <p className="landing-subtitle">
              GlobalHR helps employers and candidates connect through a secure,
              polished, end-to-end platform for hiring, applications, and workforce operations.
            </p>

            <div className="landing-hero-actions">
              <Link className="landing-btn" to="/signup">
                Create account <ArrowRight size={16} />
              </Link>
              <Link className="landing-btn-outline" to="/login">
                Sign in
              </Link>
            </div>

            <div className="landing-trust">
              <span>Role-based access</span>
              <span>Premium auth flow</span>
              <span>Employer and candidate dashboards</span>
            </div>
          </motion.div>

          <motion.div
            className="landing-visual"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.45 }}
          >
            <div className="landing-window">
              <div className="landing-window-top">
                <div className="landing-dot"></div>
                <div className="landing-dot"></div>
                <div className="landing-dot"></div>
              </div>

              <h3 style={{ marginTop: 0, marginBottom: 8 }}>Global workforce command center</h3>
              <p style={{ marginTop: 0, color: "#cbd5e1", lineHeight: 1.7 }}>
                Create jobs, review applications, and manage global talent from one refined workspace.
              </p>

              <div className="landing-stat-grid">
                <div className="landing-stat-card">
                  <span>Open roles</span>
                  <strong>24</strong>
                </div>
                <div className="landing-stat-card">
                  <span>Applications</span>
                  <strong>186</strong>
                </div>
                <div className="landing-stat-card">
                  <span>Regions</span>
                  <strong>12</strong>
                </div>
                <div className="landing-stat-card">
                  <span>Hiring flow</span>
                  <strong>Live</strong>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <section className="landing-section">
          <div className="landing-section-header">
            <h2>Everything you need to launch a modern HR product</h2>
            <p>
              Start with premium authentication, protected workspaces, and role-aware dashboards,
              then scale into a full workforce operating system.
            </p>
          </div>

          <div className="landing-feature-grid">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="landing-feature-card"
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div className="landing-feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="landing-cta">
          <div className="landing-cta-box">
            <div>
              <h2>Start building your global workforce</h2>
              <p>
                Create a secure account, access a premium dashboard, and begin shaping the future of global HR.
              </p>
            </div>

            <Link className="landing-btn" to="/signup">
              Get started <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default LandingPage;