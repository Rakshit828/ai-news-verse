// src/components/personalization/DeleteConfirmModal.tsx
import { X, Trash2, AlertTriangle } from "lucide-react";

interface DeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  type: "category" | "subcategory";
  isLoading?: boolean;
}

export default function DeleteConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  type,
  isLoading = false,
}: DeleteConfirmModalProps) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container delete-themed" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-title delete">
            <div className="modal-icon delete">
              <Trash2 size={20} />
            </div>
            <h2>Delete {type === "category" ? "Category" : "Subcategory"}</h2>
          </div>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
            disabled={isLoading}
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="delete-warning-box">
            <AlertTriangle size={18} className="warning-icon" />
            <div className="warning-content">
              <p className="modal-message">
                Are you sure you want to delete "<strong>{title}</strong>"?
              </p>
              <p className="modal-hint-delete">
                This will remove it from your personalized feed. This action cannot be undone.
              </p>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="modal-btn secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Keep It
          </button>
          <button
            type="button"
            className="modal-btn primary delete-action"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner-inline" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={14} />
                Delete Permanently
              </>
            )}
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

        .modal-container.delete-themed {
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

        .modal-icon.delete {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          background: var(--color-error-light);
          color: var(--color-error);
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

        .modal-close:hover:not(:disabled) {
          background: var(--color-bg-hover);
          color: var(--color-text-primary);
        }

        .modal-body {
          padding: 28px;
        }

        .delete-warning-box {
          display: flex;
          gap: 20px;
          padding: 20px;
          background: var(--color-error-light);
          border: 1px solid var(--color-error-glow);
          border-radius: var(--radius-lg);
          opacity: 0.9;
        }

        .warning-icon {
          color: var(--color-error);
          flex-shrink: 0;
          margin-top: 4px;
        }

        .warning-content {
          flex: 1;
        }

        .modal-message {
          font-size: 16px;
          font-weight: 700;
          color: var(--color-text-primary);
          margin-bottom: 10px;
          line-height: 1.5;
        }

        .modal-hint-delete {
          font-size: 14px;
          color: var(--color-text-secondary);
          line-height: 1.6;
          font-weight: 500;
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

        .modal-btn.secondary:hover:not(:disabled) {
          background: var(--color-bg-hover);
          color: var(--color-text-primary);
        }

        .modal-btn.primary.delete-action {
          background: var(--color-error);
          color: white;
          box-shadow: 0 4px 12px var(--color-error-glow);
        }

        .modal-btn.primary.delete-action:hover:not(:disabled) {
          background: #dc2626;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px var(--color-error-glow);
        }

        .modal-btn.primary.delete-action:active:not(:disabled) {
          transform: translateY(0);
        }

        .modal-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .loading-spinner-inline {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}