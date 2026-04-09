import AuthLayout from "../../components/auth/AuthLayout";
import AuthButton from "../../components/auth/AuthButton";

function VerifyEmail() {
  return (
    <AuthLayout
      title="Verify your email"
      subtitle="We sent a verification link to your email address."
    >
      <div className="auth-note-box">
        Please check your inbox and click the verification link to activate your account.
        Once verified, you can continue to your dashboard and start using the platform.
      </div>

      <AuthButton onClick={() => alert("Verification email resent")}>
        Resend email
      </AuthButton>
    </AuthLayout>
  );
}

export default VerifyEmail;