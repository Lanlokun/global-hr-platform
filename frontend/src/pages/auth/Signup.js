import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { getData } from "country-list";

import AuthInput from "../../components/auth/AuthInput";
import PasswordInput from "../../components/auth/PasswordInput";
import AuthButton from "../../components/auth/AuthButton";
import AuthFooter from "../../components/auth/AuthFooter";
import LanguageSwitcher from "../../components/ui/LanguageSwitcher";

import { useLanguage } from "../../context/LanguageContext";
import "../../components/auth/itss-auth.css";

function Signup() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const countries = useMemo(() => {
    return getData().sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    if (!form.email.trim()) {
      newErrors.email = t("emailRequired");
    }

    if (!form.password.trim()) {
      newErrors.password = t("passwordRequired");
    } else if (form.password.length < 6) {
      newErrors.password = t("passwordMinLength");
    }

    if (!form.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!form.country.trim()) {
      newErrors.country = t("countryRequired");
    }

    return newErrors;
  };

  const handleSignup = async () => {
    const validationErrors = validate();
    setErrors(validationErrors);
    setMessage("");

    if (Object.keys(validationErrors).length > 0) return;

    try {
      setLoading(true);

      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        country: form.country,
      };

      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/signup`,
        payload
      );

      navigate("/verify-email", {
        state: {
          email: form.email,
        },
      });
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

    setMessage("");
  };

  const getNameLabel = () => {
    if (form.role === "employer") return t("companyName");
    return t("fullName");
  };

  const getNamePlaceholder = () => {
    if (form.role === "employer") return t("companyNamePlaceholder");
    if (form.role === "recruiter") return "Senior Technical Recruiter";
    return t("fullNamePlaceholder");
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

          <h1 className="itss-auth-title">{t("signupHeroTitle")}</h1>

          <p className="itss-auth-subtitle">{t("signupHeroSubtitle")}</p>

          <div className="itss-auth-feature-list">
            <div className="itss-auth-feature">{t("signupFeature1")}</div>
            <div className="itss-auth-feature">{t("signupFeature2")}</div>
            <div className="itss-auth-feature">{t("signupFeature3")}</div>
          </div>
        </div>

        <div className="itss-auth-card">
          <div className="itss-auth-card-header">
            <h2>{t("createAccount")}</h2>
            <p>{t("signupCardSubtitle")}</p>
          </div>

          {message && <p className="itss-auth-message">{message}</p>}

          <div className="itss-role-tabs itss-role-tabs-inline">
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

            <button
              type="button"
              className={`itss-role-tab ${
                form.role === "recruiter" ? "active" : ""
              }`}
              onClick={() => setRole("recruiter")}
            >
              Recruiter
            </button>
          </div>

          <AuthInput
            label={getNameLabel()}
            name="name"
            placeholder={getNamePlaceholder()}
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
            error={errors.name}
          />

          <AuthInput
            label={t("email")}
            name="email"
            type="email"
            placeholder={t("emailExample")}
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
            error={errors.email}
          />

          <PasswordInput
            label={t("password")}
            name="password"
            placeholder={t("passwordCreate")}
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
            error={errors.password}
          />

          <PasswordInput
            label="Confirm Password"
            name="confirmPassword"
            placeholder="Re-enter your password"
            value={form.confirmPassword}
            onChange={(e) =>
              setForm({
                ...form,
                confirmPassword: e.target.value,
              })
            }
            error={errors.confirmPassword}
          />

          <label className="itss-auth-field">
            <span>{t("country")}</span>

            <select
              name="country"
              className={`itss-auth-input ${errors.country ? "error" : ""}`}
              value={form.country}
              onChange={(e) =>
                setForm({
                  ...form,
                  country: e.target.value,
                })
              }
            >
              <option value="">Select country</option>

              {countries.map((country) => (
                <option key={country.code} value={country.name}>
                  {country.name}
                </option>
              ))}
            </select>

            {errors.country && (
              <small className="itss-auth-error">{errors.country}</small>
            )}
          </label>

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