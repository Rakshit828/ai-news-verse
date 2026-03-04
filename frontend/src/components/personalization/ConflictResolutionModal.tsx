// src/components/personalization/ConflictResolutionModal.tsx
import { X, AlertCircle } from "lucide-react";

interface ConflictResolutionModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    type: "category" | "subcategory";
}

export default function ConflictResolutionModal({
    open,
    onClose,
    onConfirm,
    title,
    type,
}: ConflictResolutionModalProps) {
    if (!open) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-header-title conflict">
                        <div className="modal-icon conflict">
                            <AlertCircle size={20} />
                        </div>
                        <h2>{type === "category" ? "Category" : "Subcategory"} Already Exists</h2>
                    </div>
                    <button
                        className="modal-close"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="modal-body">
                    <p className="modal-message">
                        A similar {type} named "<strong>{title}</strong>" already exists.
                    </p>
                    <p className="modal-hint-large">
                        You can select this existing {type} instead of creating a new one.
                    </p>
                </div>

                <div className="modal-footer">
                    <button
                        type="button"
                        className="modal-btn secondary"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="modal-btn primary conflict"
                        onClick={onConfirm}
                    >
                        Confirm & Select
                    </button>
                </div>
            </div>

            <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: var(--color-bg-overlay);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 110;
          padding: 16px;
          animation: fadeIn 150ms ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-container {
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border-primary);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-lg);
          width: 100%;
          max-width: 440px;
          animation: slideUp 200ms ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px 16px;
          border-bottom: 1px solid var(--color-border-secondary);
        }

        .modal-header-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .modal-header-title h2 {
          font-size: 17px;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .modal-icon.conflict {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-md);
          background: var(--color-warning-light);
          color: var(--color-warning);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-close {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          border: none;
          background: transparent;
          color: var(--color-text-tertiary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
        }

        .modal-close:hover {
          background: var(--color-bg-hover);
          color: var(--color-text-primary);
        }

        .modal-body {
          padding: 24px;
        }

        .modal-message {
          font-size: 15px;
          color: var(--color-text-primary);
          margin-bottom: 12px;
          line-height: 1.5;
        }

        .modal-hint-large {
          font-size: 14px;
          color: var(--color-text-secondary);
          line-height: 1.5;
        }

        .modal-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          padding: 16px 24px 20px;
          border-top: 1px solid var(--color-border-secondary);
        }

        .modal-btn {
          padding: 9px 20px;
          border-radius: var(--radius-md);
          font-size: 13px;
          font-weight: 600;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: all var(--transition-fast);
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .modal-btn.secondary {
          background: var(--color-bg-tertiary);
          color: var(--color-text-secondary);
        }

        .modal-btn.secondary:hover {
          background: var(--color-bg-hover);
          color: var(--color-text-primary);
        }

        .modal-btn.primary.conflict {
          background: var(--color-accent);
          color: white;
        }

        .modal-btn.primary.conflict:hover {
          background: var(--color-accent-hover);
        }
      `}</style>
        </div>
    );
}
