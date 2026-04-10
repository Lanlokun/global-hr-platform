import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import AuthInput from "../../components/auth/AuthInput";
import AuthButton from "../../components/auth/AuthButton";
import AuthFooter from "../../components/auth/AuthFooter";
import "../../components/auth/itss-auth.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    setMessage("Password reset link sent. Check your email.");
  };

  return (
    <div className="itss-auth-page">
      <div className="itss-auth-glow itss-auth-glow-1"></div>
      <div className="itss-auth-glow itss-auth-glow-2"></div>

      <nav className="itss-auth-nav">
        <Link to="/" className="itss-auth-brand">
          International Talent Space Station
        </Link>

        <div className="itss-auth-nav-actions">
          <Link className="itss-auth-nav-link" to="/login">
            Sign in
          </Link>
        </div>
      </nav>

      <div className="itss-auth-shell">
        {/* LEFT SIDE */}
        <div className="itss-auth-left">
          <div className="itss-auth-badge">Account recovery</div>

          <h1 className="itss-auth-title">
            Reset your password securely
          </h1>

          <p className="itss-auth-subtitle">
            Enter your email address and we will send you a secure link to reset
            your password and regain access to your account.
          </p>

          <div className="itss-auth-feature-list">
            <div className="itss-auth-feature">Secure recovery process</div>
            <div className="itss-auth-feature">Fast account access restoration</div>
            <div className="itss-auth-feature">Protected identity verification</div>
          </div>
        </div>

        {/* RIGHT CARD */}
        <div className="itss-auth-card">
          <div className="itss-auth-card-header">
            <h2>Forgot password</h2>
            <p>We will send a reset link to your email.</p>
          </div>

          {message && (
            <div className="itss-auth-success">
              {message}
            </div>
          )}

          <AuthInput
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={18} />}
          />

          <AuthButton onClick={handleSubmit}>
            Send reset link
          </AuthButton>

          <AuthFooter
            text="Remembered your password?"
            linkText="Back to login"
            to="/login"
          />
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;