import { Link } from "react-router-dom";

function AuthFooter({ text, linkText, to }) {
  return (
    <p className="auth-footer">
      {text} <Link to={to}>{linkText}</Link>
    </p>
  );
}

export default AuthFooter;