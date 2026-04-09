import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
      subtitle="Login to manage your workforce and hiring pipeline."
    >
      {message && <p style={styles.message}>{message}</p>}

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

      <div style={styles.row}>
        <label style={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={form.remember}
            onChange={(e) => setForm({ ...form, remember: e.target.checked })}
          />{" "}
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

      <AuthFooter text="Do not have an account?" linkText="Create account" to="/signup" />
      
    </AuthLayout>
  );
}

const styles = {
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  checkboxLabel: {
    fontSize: "14px",
    color: "#475569",
  },
  link: {
    fontSize: "14px",
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: "600",
  },
  message: {
    background: "#fef2f2",
    color: "#b91c1c",
    padding: "12px",
    borderRadius: "10px",
    fontSize: "14px",
    marginBottom: "16px",
  },
};

export default Login;