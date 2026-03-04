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
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 500;
          padding: 16px;
          animation: fadeIn var(--transition-normal) ease-out;
        }

        .modal-container {
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border-primary);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-2xl);
          width: 100%;
          max-width: 480px;
          overflow: hidden;
          animation: slideUp var(--transition-normal) cubic-bezier(0.16, 1, 0.3, 1);
          max-height: calc(100vh - 32px);
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 28px 18px;
          border-bottom: 1px solid var(--color-border-secondary);
          background: var(--color-bg-tertiary);
        }

        .modal-header-title {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .modal-header-title h2 {
          font-size: 20px;
          font-weight: 800;
          color: var(--color-text-primary);
          letter-spacing: -0.5px;
        }

        .modal-icon.conflict {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          background: var(--color-warning-light);
          color: var(--color-warning);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-sm);
        }

        .modal-close {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
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
          padding: 28px;
        }

        .modal-message {
          font-size: 16px;
          color: var(--color-text-primary);
          margin-bottom: 14px;
          line-height: 1.6;
          font-weight: 500;
        }

        .modal-hint-large {
          font-size: 14px;
          color: var(--color-text-secondary);
          line-height: 1.6;
          padding: 16px;
          background: var(--color-bg-tertiary);
          border-radius: var(--radius-md);
          border-left: 4px solid var(--color-warning);
        }

        .modal-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          padding: 20px 28px 28px;
          background: var(--color-bg-tertiary);
          border-top: 1px solid var(--color-border-secondary);
        }

        .modal-btn {
          padding: 12px 24px;
          border-radius: var(--radius-lg);
          font-size: 14px;
          font-weight: 700;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: all var(--transition-fast);
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .modal-btn.secondary {
          background: var(--color-bg-secondary);
          color: var(--color-text-secondary);
          border: 1px solid var(--color-border-primary);
        }

        .modal-btn.secondary:hover {
          background: var(--color-bg-hover);
          color: var(--color-text-primary);
        }

        .modal-btn.primary.conflict {
          background: var(--color-accent);
          color: white;
          box-shadow: 0 4px 12px var(--color-accent-glow);
        }

        .modal-btn.primary.conflict:hover {
          background: var(--color-accent-hover);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px var(--color-accent-glow);
        }
      `}</style>
    </div>
  );
}