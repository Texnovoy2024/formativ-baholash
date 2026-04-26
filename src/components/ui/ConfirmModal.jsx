import { useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Trash2
} from "lucide-react";
import "./ConfirmModal.css";

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Davom etish",
  cancelText = "Bekor qilish",
  confirmVariant = "danger", // danger | primary | success | warning
  showIcon = true,
  closeOnOverlay = true
}) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onCancel();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (confirmVariant) {
      case "danger":
        return <Trash2 size={28} />;
      case "success":
        return <CheckCircle2 size={28} />;
      case "warning":
        return <AlertTriangle size={28} />;
      default:
        return <Info size={28} />;
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={() => closeOnOverlay && onCancel()}
    >
      <div
        className="modal-box"
        onClick={(e) => e.stopPropagation()}
      >
        {showIcon && (
          <div className={`modal-icon ${confirmVariant}`}>
            {getIcon()}
          </div>
        )}

        <h3>{title}</h3>
        <p>{message}</p>

        <div className="modal-actions">
          <button className="cancel-btn" onClick={onCancel}>
            {cancelText}
          </button>

          <button
            className={`confirm-btn ${confirmVariant}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}