function AuthInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  name,
  icon,
}) {
  return (
    <div className="auth-field">
      <label className="auth-label">{label}</label>
      <div className="auth-input-wrap">
        {icon && <span className="auth-icon-left">{icon}</span>}
        <input
          className={`auth-input ${icon ? "has-icon" : ""}`}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      </div>
      {error && <p className="auth-field-error">{error}</p>}
    </div>
  );
}

export default AuthInput;