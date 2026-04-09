import { useState } from "react";
import { Mail } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import AuthInput from "../../components/auth/AuthInput";
import AuthButton from "../../components/auth/AuthButton";
import AuthFooter from "../../components/auth/AuthFooter";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    setMessage("Password reset link sent. Check your email.");
  };

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email and we will send you a secure reset link."
    >
      {message && <div className="auth-alert success">{message}</div>}

      <AuthInput
        label="Email"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        icon={<Mail size={18} />}
      />

      <AuthButton onClick={handleSubmit}>Send reset link</AuthButton>

     <AuthFooter text="Remembered your password?" linkText="Back to login" to="/login" />
    </AuthLayout>
  );
}

export default ForgotPassword;