import "./ui.css";
import Button from "./Button";

function ConfirmModal({
  open,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="ui-modal-overlay">
      <div className="ui-modal">
        <h3 className="ui-modal-title">{title}</h3>
        <p className="ui-modal-text">{message}</p>

        <div className="ui-modal-actions">
          <Button variant="secondary" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;