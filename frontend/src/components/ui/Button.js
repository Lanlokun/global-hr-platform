import "./ui.css";

function Button({
  children,
  variant = "primary",
  fullWidth = false,
  onClick,
  type = "button",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`ui-btn ui-btn-${variant} ${fullWidth ? "ui-btn-full" : ""}`}
    >
      {children}
    </button>
  );
}

export default Button;