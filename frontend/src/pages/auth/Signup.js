import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthInput from "../../components/auth/AuthInput";
import PasswordInput from "../../components/auth/PasswordInput";
import AuthButton from "../../components/auth/AuthButton";
import AuthFooter from "../../components/auth/AuthFooter";
import "../../components/auth/itss-auth.css";

function Signup() {
  const navigate = useNavigate();

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
          ? "Company name is required"
          : "Full name is required";
    }

    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.password.trim()) newErrors.password = "Password is required";
    if (form.password && form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!form.country.trim()) newErrors.country = "Country is required";

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
      setMessage(error.response?.data?.error || "Signup failed");
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
          <div className="itss-auth-badge">Pan-African talent access</div>
          <h1 className="itss-auth-title">
            Join International Talent Space Station
          </h1>
          <p className="itss-auth-subtitle">
            Create your account to connect companies with talent across Africa
            through one secure, modern platform for hiring and workforce
            discovery.
          </p>

          <div className="itss-auth-feature-list">
            <div className="itss-auth-feature">Talent discovery across Africa</div>
            <div className="itss-auth-feature">Company and individual access</div>
            <div className="itss-auth-feature">Secure onboarding and hiring workflows</div>
          </div>
        </div>

        <div className="itss-auth-card">
          <div className="itss-auth-card-header">
            <h2>Create account</h2>
            <p>Choose how you want to join the platform.</p>
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
              Individual
            </button>

            <button
              type="button"
              className={`itss-role-tab ${
                form.role === "employer" ? "active" : ""
              }`}
              onClick={() => setRole("employer")}
            >
              Company
            </button>
          </div>

          <AuthInput
            label={form.role === "employer" ? "Company name" : "Full name"}
            name="name"
            placeholder={
              form.role === "employer" ? "International Talent Ltd" : "Ma Shifu"
            }
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name}
          />

          <AuthInput
            label="Email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
          />

          <PasswordInput
            label="Password"
            name="password"
            placeholder="Create a strong password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={errors.password}
          />

          <AuthInput
            label="Country"
            name="country"
            placeholder={form.role === "employer" ? "Kenya" : "Japan"}
            value={form.country}
            onChange={(e) => setForm({ ...form, country: e.target.value })}
            error={errors.country}
          />

          <AuthButton onClick={handleSignup} loading={loading}>
            Create account
          </AuthButton>

          <AuthFooter
            text="Already have an account?"
            linkText="Sign in"
            to="/login"
          />
        </div>
      </div>
    </div>
  );
}

export default Signup;