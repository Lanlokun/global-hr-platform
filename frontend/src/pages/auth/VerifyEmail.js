import { Link, useNavigate } from "react-router-dom";
import AuthButton from "../../components/auth/AuthButton";
import "../../components/auth/itss-auth.css";

function VerifyEmail() {
  const navigate = useNavigate();

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
        <div className="itss-auth-left">
          <div className="itss-auth-badge">Account verification</div>
          <h1 className="itss-auth-title">
            Verify your email to activate your account
          </h1>
          <p className="itss-auth-subtitle">
            We sent a verification link to your email address. Confirm your email
            to continue exploring opportunities and hiring across Africa through
            International Talent Space Station.
          </p>

          <div className="itss-auth-feature-list">
            <div className="itss-auth-feature">Secure account activation</div>
            <div className="itss-auth-feature">Trusted employer and talent access</div>
            <div className="itss-auth-feature">Pan-African workforce discovery</div>
          </div>
        </div>

        <div className="itss-auth-card">
          <div className="itss-auth-card-header">
            <h2>Check your inbox</h2>
            <p>Complete verification to unlock your account.</p>
          </div>

          <div className="itss-verify-note">
            Please check your inbox and click the verification link to activate
            your account. Once verified, you can sign in and continue to your
            dashboard.
          </div>

          <div className="itss-verify-actions">
            <AuthButton onClick={() => alert("Verification email resent")}>
              Resend email
            </AuthButton>

            <div className="itss-verify-divider">
              <span>or</span>
            </div>

            <AuthButton variant="secondary" onClick={() => navigate("/login")}>
              Login now
            </AuthButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;