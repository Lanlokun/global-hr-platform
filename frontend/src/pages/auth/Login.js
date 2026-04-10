import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthInput from "../../components/auth/AuthInput";
import PasswordInput from "../../components/auth/PasswordInput";
import AuthButton from "../../components/auth/AuthButton";
import AuthDivider from "../../components/auth/AuthDivider";
import SocialAuthButtons from "../../components/auth/SocialAuthButtons";
import AuthFooter from "../../components/auth/AuthFooter";
import "../../components/auth/itss-auth.css";

function Login() {
  const navigate = useNavigate();

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
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.password.trim()) newErrors.password = "Password is required";
    return newErrors;
  };

  const handleLogin = async () => {
    const validationErrors = validate();
    setErrors(validationErrors);
    setMessage("");

    if (Object.keys(validationErrors).length > 0) return;

    try {
      setLoading(true);
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        email: form.email,
        password: form.password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (error) {
      setMessage(error.response?.data?.error || "Login failed");
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
          <Link className="itss-auth-nav-link" to="/signup">
            Create account
          </Link>
        </div>
      </nav>

      <div className="itss-auth-shell">
        <div className="itss-auth-left">
          <div className="itss-auth-badge">Pan-African talent access</div>
          <h1 className="itss-auth-title">
            Welcome back to International Talent Space Station
          </h1>
          <p className="itss-auth-subtitle">
            Sign in to connect with talent, manage hiring pipelines, and explore
            workforce opportunities across Africa from one platform.
          </p>

          <div className="itss-auth-feature-list">
            <div className="itss-auth-feature">Cross-border talent discovery</div>
            <div className="itss-auth-feature">Employer and candidate access</div>
            <div className="itss-auth-feature">Unified hiring workflows</div>
          </div>
        </div>

        <div className="itss-auth-card">
          <div className="itss-auth-card-header">
            <h2>Sign in</h2>
            <p>Access your account and continue your hiring journey.</p>
          </div>

          {message && <p className="itss-auth-message">{message}</p>}

          <AuthInput
            label="Email"
            name="email"
            type="email"
            placeholder="you@company.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={errors.email}
          />

          <PasswordInput
            label="Password"
            name="password"
            placeholder="Enter your password"
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
              <span>Remember me</span>
            </label>

            <Link className="itss-auth-forgot" to="/forgot-password">
              Forgot password?
            </Link>
          </div>

          <AuthButton onClick={handleLogin} loading={loading}>
            Sign in
          </AuthButton>

          <AuthDivider />
          <SocialAuthButtons />

          <AuthFooter
            text="Do not have an account?"
            linkText="Create account"
            to="/signup"
          />
        </div>
      </div>
    </div>
  );
}

export default Login;