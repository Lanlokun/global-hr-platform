import { useState } from "react";
import { Lock } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import PasswordInput from "../../components/auth/PasswordInput";
import AuthButton from "../../components/auth/AuthButton";

function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleReset = () => {
    setSuccess(false);

    if (!password || !confirmPassword) {
      setMessage("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setSuccess(true);
    setMessage("Password reset successful. You can now log in.");
  };

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Create a new secure password for your account."
    >
      {message && (
        <div className={`auth-alert ${success ? "success" : "error"}`}>
          {message}
        </div>
      )}

      <PasswordInput
        label="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter new password"
        icon={<Lock size={18} />}
      />

      <PasswordInput
        label="Confirm password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirm new password"
        icon={<Lock size={18} />}
      />

      <AuthButton onClick={handleReset}>Reset password</AuthButton>
    </AuthLayout>
  );
}

export default ResetPassword;