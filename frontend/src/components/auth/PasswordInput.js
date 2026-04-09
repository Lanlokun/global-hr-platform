import { useState } from "react";

function PasswordInput({
  label,
  value,
  onChange,
  error,
  name,
  placeholder,
  icon,
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="auth-field">
      <label className="auth-label">{label}</label>
      <div className="auth-input-wrap">
        {icon && <span className="auth-icon-left">{icon}</span>}
        <input
          className={`auth-input password ${icon ? "has-icon" : ""}`}
          name={name}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
        <button
          type="button"
          className="auth-toggle-btn"
          onClick={() => setShow(!show)}
        >
          {show ? "Hide" : "Show"}
        </button>
      </div>
      {error && <p className="auth-field-error">{error}</p>}
    </div>
  );
}

export default PasswordInput;