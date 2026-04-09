import "./ui.css";

function PageHeader({ title, subtitle, action }) {
  return (
    <div className="ui-page-header">
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

export default PageHeader;