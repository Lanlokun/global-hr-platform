import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";

import AuthInput from "../../components/auth/AuthInput";
import AuthButton from "../../components/auth/AuthButton";
import AuthFooter from "../../components/auth/AuthFooter";
import LanguageSwitcher from "../../components/ui/LanguageSwitcher";
import { useLanguage } from "../../context/LanguageContext";
import { useNavigate } from "react-router-dom";

import "../../components/auth/itss-auth.css";

function ForgotPassword() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    setMessage(t("passwordResetSent"));
  };

  setTimeout(() => navigate("/login"), 1500);

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
          <div className="itss-auth-badge">{t("accountRecovery")}</div>

          <h1 className="itss-auth-title">
            {t("forgotHeroTitle")}
          </h1>

          <p className="itss-auth-subtitle">
            {t("forgotHeroSubtitle")}
          </p>

          <div className="itss-auth-feature-list">
            <div className="itss-auth-feature">{t("secureRecoveryProcess")}</div>
            <div className="itss-auth-feature">{t("fastAccessRestoration")}</div>
            <div className="itss-auth-feature">{t("protectedIdentityVerification")}</div>
          </div>
        </div>

        <div className="itss-auth-card">
          <div className="itss-auth-card-header">
            <h2>{t("forgotPassword")}</h2>
            <p>{t("forgotCardSubtitle")}</p>
          </div>

          {message && (
            <div className="itss-auth-success">
              {message}
            </div>
          )}

          <AuthInput
            label={t("email")}
            type="email"
            placeholder={t("emailExample")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={18} />}
          />

          <AuthButton onClick={handleSubmit}>
            {t("sendResetLink")}
          </AuthButton>

          <AuthFooter
            text={t("rememberedPassword")}
            linkText={t("backToLogin")}
            to="/login"
          />
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;