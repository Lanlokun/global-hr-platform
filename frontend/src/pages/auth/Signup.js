import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthInput from "../../components/auth/AuthInput";
import PasswordInput from "../../components/auth/PasswordInput";
import AuthButton from "../../components/auth/AuthButton";
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
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Full name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    if (!form.password.trim()) newErrors.password = "Password is required";
    if (form.password.length < 6) newErrors.password = "Password must be at least 6 characters";
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
      await axios.post("http://localhost:5000/api/auth/signup", form);
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
      subtitle="Start hiring globally or apply to jobs with one secure account."
    >
      {message && <p style={styles.message}>{message}</p>}

      <AuthInput
        label="Full name"
        name="name"
        placeholder="Ma Shifu"
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

      <div style={{ marginBottom: "16px" }}>
        <label style={styles.label}>Account type</label>
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          style={styles.select}
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
      />

      <AuthButton onClick={handleSignup} loading={loading}>
        Create account
      </AuthButton>

      <AuthFooter text="Already have an account?" linkText="Sign in" to="/login" />
    </AuthLayout>
  );
}

const styles = {
  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#334155",
  },
  select: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "10px",
    border: "1px solid #dbe2ea",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
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

export default Signup;