import { Link, useNavigate } from "react-router-dom";

import AuthButton from "../../components/auth/AuthButton";
import LanguageSwitcher from "../../components/ui/LanguageSwitcher";
import { useLanguage } from "../../context/LanguageContext";

import "../../components/auth/itss-auth.css";

function VerifyEmail() {
  const navigate = useNavigate();
  const { t } = useLanguage();

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

          <h1 className="itss-auth-title">
            {t("verifyEmailHeroTitle")}
          </h1>

          <p className="itss-auth-subtitle">
            {t("verifyEmailHeroSubtitle")}
          </p>

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
            <h2>{t("checkYourInbox")}</h2>
            <p>{t("verifyEmailCardSubtitle")}</p>
          </div>

          <div className="itss-verify-note">
            {t("verifyEmailNote")}
          </div>

          <div className="itss-verify-actions">
            <AuthButton onClick={() => alert(t("verificationEmailResent"))}>
              {t("resendEmail")}
            </AuthButton>

            <div className="itss-verify-divider">
              <span>{t("or")}</span>
            </div>

            <AuthButton variant="secondary" onClick={() => navigate("/login")}>
              {t("loginNow")}
            </AuthButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;