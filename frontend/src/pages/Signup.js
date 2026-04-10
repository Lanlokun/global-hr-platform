import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User2, Globe2 } from "lucide-react";
import axios from "axios";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthInput from "../../components/auth/AuthInput";
import PasswordInput from "../../components/auth/PasswordInput";
import AuthButton from "../../components/auth/AuthButton";
import AuthDivider from "../../components/auth/AuthDivider";
import SocialAuthButtons from "../../components/auth/SocialAuthButtons";
import AuthFooter from "../../components/auth/AuthFooter";

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
    const next = {};
    if (!form.name.trim()) next.name = "Full name is required";
    if (!form.email.trim()) next.email = "Email is required";
    if (!form.password.trim()) next.password = "Password is required";
    if (form.password.length < 6) next.password = "Password must be at least 6 characters";
    if (!form.country.trim()) next.country = "Country is required";
    return next;
  };

  const handleSignup = async () => {
    const nextErrors = validate();
    setErrors(nextErrors);
    setMessage("");
    if (Object.keys(nextErrors).length > 0) return;

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

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start hiring globally or applying to jobs with one secure workspace."
    >
      {message && <div className="auth-alert error">{message}</div>}

      <AuthInput
        label="Full name"
        name="name"
        placeholder="Ma Shifu"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        error={errors.name}
        icon={<User2 size={18} />}
      />

      <AuthInput
        label="Email"
        name="email"
        type="email"
        placeholder="you@example.com"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        error={errors.email}
        icon={<Mail size={18} />}
      />

      <PasswordInput
        label="Password"
        name="password"
        placeholder="Create a strong password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        error={errors.password}
        icon={<Lock size={18} />}
      />

      <div className="auth-field">
        <label className="auth-label">Account type</label>
        <select
          className="auth-select"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        >
          <option value="candidate">Candidate</option>
          <option value="employer">Employer</option>
        </select>
      </div>

      <AuthInput
        label="Country"
        name="country"
        placeholder="Japan"
        value={form.country}
        onChange={(e) => setForm({ ...form, country: e.target.value })}
        error={errors.country}
        icon={<Globe2 size={18} />}
      />

      <AuthButton onClick={handleSignup} loading={loading}>
        Create account
      </AuthButton>

      <AuthDivider />
      <SocialAuthButtons />

      <AuthFooter
        text="Already have an account?"
        linkText="Sign in"
        to="/"
      />
    </AuthLayout>
  );
}

export default Signup;