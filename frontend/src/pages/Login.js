import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import axios from "axios";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthInput from "../../components/auth/AuthInput";
import PasswordInput from "../../components/auth/PasswordInput";
import AuthButton from "../../components/auth/AuthButton";
import AuthDivider from "../../components/auth/AuthDivider";
import SocialAuthButtons from "../../components/auth/SocialAuthButtons";
import AuthFooter from "../../components/auth/AuthFooter";

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
    const next = {};
    if (!form.email.trim()) next.email = "Email is required";
    if (!form.password.trim()) next.password = "Password is required";
    return next;
  };

  const handleLogin = async () => {
    const nextErrors = validate();
    setErrors(nextErrors);
    setMessage("");
    if (Object.keys(nextErrors).length > 0) return;

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/api/auth/login", {
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
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to manage hiring, workforce records, and global HR workflows."
    >
      {message && <div className="auth-alert error">{message}</div>}

      <AuthInput
        label="Email"
        name="email"
        type="email"
        placeholder="you@company.com"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        error={errors.email}
        icon={<Mail size={18} />}
      />

      <PasswordInput
        label="Password"
        name="password"
        placeholder="Enter your password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        error={errors.password}
        icon={<Lock size={18} />}
      />

      <div className="auth-row">
        <label className="auth-checkbox">
          <input
            type="checkbox"
            checked={form.remember}
            onChange={(e) => setForm({ ...form, remember: e.target.checked })}
          />
          Remember me
        </label>

        <Link className="auth-link" to="/forgot-password">
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
    </AuthLayout>
  );
}

export default Login;