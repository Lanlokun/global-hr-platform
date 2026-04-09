import "./ui.css";

function Input({
  label,
  helper,
  error,
  as = "input",
  options = [],
  children,
  dangerouslySetInnerHTML,
  ...props
}) {
  return (
    <div className="ui-input-group">
      {label && <label className="ui-label">{label}</label>}

      {as === "select" ? (
        <select className="ui-select" {...props}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : as === "textarea" ? (
        <textarea className="ui-textarea" {...props} />
      ) : (
        <input className="ui-input" {...props} />
      )}

      {error ? (
        <span className="ui-error">{error}</span>
      ) : helper ? (
        <span className="ui-helper">{helper}</span>
      ) : null}
    </div>
  );
}

export default Input;