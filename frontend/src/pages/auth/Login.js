import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import AuthInput from "../../components/auth/AuthInput";
import PasswordInput from "../../components/auth/PasswordInput";
import AuthButton from "../../components/auth/AuthButton";
import AuthDivider from "../../components/auth/AuthDivider";
import SocialAuthButtons from "../../components/auth/SocialAuthButtons";
import AuthFooter from "../../components/auth/AuthFooter";
import LanguageSwitcher from "../../components/ui/LanguageSwitcher";

import { useLanguage } from "../../context/LanguageContext";
import "../../components/auth/itss-auth.css";

function Login() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!form.email.trim()) newErrors.email = t("emailRequired");
    if (!form.password.trim()) newErrors.password = t("passwordRequired");

    return newErrors;
  };

  const handleLogin = async () => {
    const validationErrors = validate();
    setErrors(validationErrors);
    setMessage("");

    if (Object.keys(validationErrors).length > 0) return;

    try {
      setLoading(true);

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/login`,
        {
          email: form.email,
          password: form.password,
        }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (error) {
      setMessage(error.response?.data?.error || t("loginFailed"));
    } finally {
      setLoading(false);
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

          <Link className="itss-auth-nav-link" to="/signup">
            {t("createAccount")}
          </Link>
        </div>
      </nav>

      <div className="itss-auth-shell">
        <div className="itss-auth-left">
          <div className="itss-auth-badge">
            {t("panAfricanAccess")}
          </div>

          <h1 className="itss-auth-title">
            {t("loginHeroTitle")}
          </h1>

          <p className="itss-auth-subtitle">
            {t("loginHeroSubtitle")}
          </p>

          <div className="itss-auth-feature-list">
            <div className="itss-auth-feature">
              {t("crossBorderTalentDiscovery")}
            </div>
            <div className="itss-auth-feature">
              {t("employerCandidateAccess")}
            </div>
            <div className="itss-auth-feature">
              {t("unifiedHiringWorkflows")}
            </div>
          </div>
        </div>

        <div className="itss-auth-card">
          <div className="itss-auth-card-header">
            <h2>{t("signIn")}</h2>
            <p>{t("loginCardSubtitle")}</p>
          </div>

          {message && <p className="itss-auth-message">{message}</p>}

          <AuthInput
            label={t("email")}
            name="email"
            type="email"
            placeholder={t("emailPlaceholder")}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
          />

          <PasswordInput
            label={t("password")}
            name="password"
            placeholder={t("passwordPlaceholder")}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={errors.password}
          />

          <div className="itss-auth-row">
            <label className="itss-auth-checkbox">
              <input
                type="checkbox"
                checked={form.remember}
                onChange={(e) =>
                  setForm({ ...form, remember: e.target.checked })
                }
              />
              <span>{t("rememberMe")}</span>
            </label>

            <Link className="itss-auth-forgot" to="/forgot-password">
              {t("forgotPassword")}
            </Link>
          </div>

          <AuthButton onClick={handleLogin} loading={loading}>
            {t("signIn")}
          </AuthButton>

          <AuthDivider />
          <SocialAuthButtons />

          <AuthFooter
            text={t("noAccount")}
            linkText={t("createAccount")}
            to="/signup"
          />
        </div>
      </div>
    </div>
  );
}

export default Login;