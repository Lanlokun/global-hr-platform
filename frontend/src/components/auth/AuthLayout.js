import { motion } from "framer-motion";
import "./auth.css";

function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-shell">
      <div className="auth-brand-panel">
        <div className="auth-orb" />
        <div className="auth-grid" />

        <div className="auth-brand-top">
          <div className="auth-badge">Global HR Platform</div>
          <h1 className="auth-brand-title">GlobalHR</h1>
          <p className="auth-brand-subtitle">
            A premium platform to hire, manage, and grow distributed teams across borders.
          </p>
        </div>

        <div className="auth-hero-card">
          <h2>Secure access for modern global teams</h2>
          <p>
            Employers and candidates get a clean, trusted, enterprise-grade experience from signup to hiring.
          </p>

          <div className="auth-stats">
            <div className="auth-stat">
              <strong>150+</strong>
              <span>Countries supported</span>
            </div>
            <div className="auth-stat">
              <strong>24/7</strong>
              <span>Workforce access</span>
            </div>
            <div className="auth-stat">
              <strong>1 hub</strong>
              <span>Unified HR workflow</span>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-form-panel">
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="auth-card-header">
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          {children}
        </motion.div>
      </div>
    </div>
  );
}

export default AuthLayout;