import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthInput from "../../components/auth/AuthInput";
import PasswordInput from "../../components/auth/PasswordInput";
import AuthButton from "../../components/auth/AuthButton";
import AuthFooter from "../../components/auth/AuthFooter";
import "../../components/auth/itss-auth.css";
import { useLanguage } from "../../context/LanguageContext";
import LanguageSwitcher from "../../components/ui/LanguageSwitcher";


function Signup() {

  const navigate = useNavigate();
  const { t } = useLanguage();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "candidate",
    country: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name =
        form.role === "employer"
          ? t("companyNameRequired")
          : t("fullNameRequired");
    }

    if (!form.email.trim()) newErrors.email = t("emailRequired");

    if (!form.password.trim()) {
      newErrors.password = t("passwordRequired");
    } else if (form.password.length < 6) {
      newErrors.password = t("passwordMinLength");
    }

    if (!form.country.trim()) newErrors.country = t("countryRequired");

    return newErrors;
  };

  const handleSignup = async () => {
    const validationErrors = validate();
    setErrors(validationErrors);
    setMessage("");

    if (Object.keys(validationErrors).length > 0) return;

    try {
      setLoading(true);
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/signup`, form);
      navigate("/verify-email");
    } catch (error) {
      setMessage(error.response?.data?.error || t("signupFailed"));
    } finally {
      setLoading(false);
    }
  };

  const setRole = (role) => {
    setForm((prev) => ({
      ...prev,
      role,
      name: "",
    }));
    setErrors((prev) => ({
      ...prev,
      name: "",
    }));
  };

  return (
    <div className="itss-auth-page">
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
          <div className="itss-auth-badge">{t("panAfricanAccess")}</div>

          <h1 className="itss-auth-title">
            {t("signupHeroTitle")}
          </h1>

          <p className="itss-auth-subtitle">
            {t("signupHeroSubtitle")}
          </p>

          <div className="itss-auth-feature-list">
            <div className="itss-auth-feature">
              {t("signupFeature1")}
            </div>
            <div className="itss-auth-feature">
              {t("signupFeature2")}
            </div>
            <div className="itss-auth-feature">
              {t("signupFeature3")}
            </div>
          </div>
        </div>

        <div className="itss-auth-card">
          <div className="itss-auth-card-header">
            <h2>{t("createAccount")}</h2>
            <p>{t("signupCardSubtitle")}</p>
          </div>

          {message && <p className="itss-auth-message">{message}</p>}

          <div className="itss-role-tabs">
            <button
              type="button"
              className={`itss-role-tab ${
                form.role === "candidate" ? "active" : ""
              }`}
              onClick={() => setRole("candidate")}
            >
              {t("individual")}
            </button>

            <button
              type="button"
              className={`itss-role-tab ${
                form.role === "employer" ? "active" : ""
              }`}
              onClick={() => setRole("employer")}
            >
              {t("company")}
            </button>
          </div>

          <AuthInput
            label={form.role === "employer" ? t("companyName") : t("fullName")}
            name="name"
            placeholder={
              form.role === "employer"
                ? t("companyNamePlaceholder")
                : t("fullNamePlaceholder")
            }
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name}
          />

          <AuthInput
            label={t("email")}
            name="email"
            type="email"
            placeholder={t("emailExample")}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
          />

          <PasswordInput
            label={t("password")}
            name="password"
            placeholder={t("passwordCreate")}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={errors.password}
          />

          <AuthInput
            label={t("country")}
            name="country"
            placeholder={form.role === "employer" ? "Kenya" : "Japan"}
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
            error={errors.country}
          />

          <AuthButton onClick={handleSignup} loading={loading}>
            {t("createAccount")}
          </AuthButton>

          <AuthFooter
            text={t("alreadyHaveAccount")}
            linkText={t("signIn")}
            to="/login"
          />
        </div>
      </div>
    </div>
  );
}


export default Signup;