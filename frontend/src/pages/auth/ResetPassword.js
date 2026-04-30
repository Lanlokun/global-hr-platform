import { useState } from "react";
import { Lock } from "lucide-react";

import AuthLayout from "../../components/auth/AuthLayout";
import PasswordInput from "../../components/auth/PasswordInput";
import AuthButton from "../../components/auth/AuthButton";

import { useLanguage } from "../../context/LanguageContext";

function ResetPassword() {
  const { t } = useLanguage();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleReset = () => {
    setSuccess(false);

    if (!password || !confirmPassword) {
      setMessage(t("fillAllFields"));
      return;
    }

    if (password !== confirmPassword) {
      setMessage(t("passwordsDoNotMatch"));
      return;
    }

    setSuccess(true);
    setMessage(t("passwordResetSuccess"));
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

      <AuthButton onClick={handleReset}>
        {t("resetPassword")}
      </AuthButton>
    </AuthLayout>
  );
}

export default ResetPassword;