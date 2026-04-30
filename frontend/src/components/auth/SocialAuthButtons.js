import { FcGoogle } from "react-icons/fc";
import { FaLinkedin } from "react-icons/fa";

import { useLanguage } from "../../context/LanguageContext";

function SocialAuthButtons() {
  const { t } = useLanguage();
  return (
    <div className="auth-socials">
      <button className="auth-social-btn" type="button">
        <FcGoogle size={18} />
        Google
      </button>
      <button className="auth-social-btn" type="button">
        <FaLinkedin size={18} />
        LinkedIn
      </button>
      <button
        className="itss-wechat-btn"
        onClick={() => {
          window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/wechat`;
        }}
      >
        {t("continueWithWeChat")}
      </button>

    </div>
  );
}

export default SocialAuthButtons;