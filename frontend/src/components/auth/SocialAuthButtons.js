import { FcGoogle } from "react-icons/fc";
import { FaLinkedin } from "react-icons/fa";

function SocialAuthButtons() {
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
    </div>
  );
}

export default SocialAuthButtons;