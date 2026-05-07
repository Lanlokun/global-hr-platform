import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

import AuthButton from "../../components/auth/AuthButton";
import LanguageSwitcher from "../../components/ui/LanguageSwitcher";
import { useLanguage } from "../../context/LanguageContext";

import "../../components/auth/itss-auth.css";

function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();

  const token = searchParams.get("token");
  const initialEmail = location.state?.email || "";

  const [email, setEmail] = useState(initialEmail);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(Boolean(token));
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) return;

      try {
        setLoading(true);
        setMessage("");

        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/auth/verify-email?token=${token}`
        );

        setSuccess(true);
        setMessage(res.data?.message || "Email verified successfully");

        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } catch (error) {
        setSuccess(false);
        setMessage(
          error.response?.data?.error || "Invalid or expired verification link"
        );
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [token, navigate]);

  const resendEmail = async () => {
    if (!email.trim()) {
      setSuccess(false);
      setMessage("Please enter your email address first.");
      return;
    }

    try {
      setResending(true);
      setMessage("");

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/resend-verification`,
        { email }
      );

      setSuccess(true);
      setMessage(res.data?.message || "Verification email sent.");
    } catch (error) {
      setSuccess(false);
      setMessage(
        error.response?.data?.error || "Failed to resend verification email"
      );
    } finally {
      setResending(false);
    }
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
          <LanguageSwitcher />

          <Link className="itss-auth-nav-link" to="/login">
            {t("signIn")}
          </Link>
        </div>
      </nav>

      <div className="itss-auth-shell">
        <div className="itss-auth-left">
          <div className="itss-auth-badge">{t("accountVerification")}</div>

          <h1 className="itss-auth-title">{t("verifyEmailHeroTitle")}</h1>

          <p className="itss-auth-subtitle">{t("verifyEmailHeroSubtitle")}</p>

          <div className="itss-auth-feature-list">
            <div className="itss-auth-feature">
              {t("secureAccountActivation")}
            </div>
            <div className="itss-auth-feature">
              {t("trustedEmployerTalentAccess")}
            </div>
            <div className="itss-auth-feature">
              {t("panAfricanWorkforceDiscovery")}
            </div>
          </div>
        </div>

        <div className="itss-auth-card">
          <div className="itss-auth-card-header">
            <h2>{token ? "Verifying email" : t("checkYourInbox")}</h2>
            <p>{t("verifyEmailCardSubtitle")}</p>
          </div>

          {message && (
            <div className={success ? "itss-auth-success" : "itss-auth-message"}>
              {message}
            </div>
          )}

          {!token && (
            <>
              <div className="itss-verify-note">{t("verifyEmailNote")}</div>

              <input
                type="email"
                className="itss-auth-input"
                placeholder="Enter your email to resend verification"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <div className="itss-verify-actions">
                <AuthButton onClick={resendEmail} loading={resending}>
                  {t("resendEmail")}
                </AuthButton>

                <div className="itss-verify-divider">
                  <span>{t("or")}</span>
                </div>

                <AuthButton variant="secondary" onClick={() => navigate("/login")}>
                  {t("loginNow")}
                </AuthButton>
              </div>
            </>
          )}

          {token && loading && (
            <div className="itss-verify-note">Please wait while we verify your email.</div>
          )}

          {token && !loading && (
            <AuthButton variant="secondary" onClick={() => navigate("/login")}>
              {t("loginNow")}
            </AuthButton>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;