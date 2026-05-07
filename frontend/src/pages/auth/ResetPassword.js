import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Lock } from "lucide-react";
import axios from "axios";

import AuthLayout from "../../components/auth/AuthLayout";
import PasswordInput from "../../components/auth/PasswordInput";
import AuthButton from "../../components/auth/AuthButton";

import { useLanguage } from "../../context/LanguageContext";

function ResetPassword() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setSuccess(false);
    setMessage("");

    if (!token) {
      setMessage("Reset token is missing or invalid.");
      return;
    }

    if (!password || !confirmPassword) {
      setMessage(t("fillAllFields"));
      return;
    }

    if (password !== confirmPassword) {
      setMessage(t("passwordsDoNotMatch"));
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/reset-password`,
        {
          token,
          password,
        }
      );

      setSuccess(true);
      setMessage(res.data?.message || t("passwordResetSuccess"));

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setSuccess(false);
      setMessage(error.response?.data?.error || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={t("resetPassword")}
      subtitle={t("resetPasswordSubtitle")}
    >
      {message && (
        <div className={`auth-alert ${success ? "success" : "error"}`}>
          {message}
        </div>
      )}

      <PasswordInput
        label={t("newPassword")}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={t("enterNewPassword")}
        icon={<Lock size={18} />}
      />

      <PasswordInput
        label={t("confirmPassword")}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder={t("confirmNewPassword")}
        icon={<Lock size={18} />}
      />

      <AuthButton onClick={handleReset} loading={loading}>
        {t("resetPassword")}
      </AuthButton>
    </AuthLayout>
  );
}

export default ResetPassword;