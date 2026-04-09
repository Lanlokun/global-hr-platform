import "./ui.css";

function Card({ title, subtitle, children }) {
  return (
    <div className="ui-card">
      {title && <h3 className="ui-card-title">{title}</h3>}
      {subtitle && <p className="ui-card-subtitle">{subtitle}</p>}
      {children}
    </div>
  );
}

export default Card;