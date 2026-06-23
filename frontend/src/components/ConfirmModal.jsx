import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = "Xác nhận", cancelText = "Hủy", danger = false }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onCancel?.();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" role="presentation" onClick={(e) => e.target === e.currentTarget && onCancel?.()}>
      <div className="confirm-modal" role="dialog" aria-modal="true">
        <div className="confirm-icon">
          {danger ? <AlertTriangle size={28} /> : <div className="confirm-icon-circle" />}
        </div>
        {title && <h3>{title}</h3>}
        <p>{message}</p>
        <div className="confirm-actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel}>{cancelText}</button>
          <button type="button" className={`btn ${danger ? "btn-danger" : "btn-primary"}`} onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
