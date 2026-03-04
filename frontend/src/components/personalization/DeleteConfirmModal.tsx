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
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 150;
          padding: 16px;
          backdrop-filter: blur(4px);
          animation: fadeIn 200ms ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-container.delete-themed {
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border-primary);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-2xl);
          width: 100%;
          max-width: 440px;
          overflow: hidden;
          animation: slideUpDelete 300ms cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUpDelete {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.96);
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
          margin: 0;
        }

        .modal-icon.delete {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-md);
          background: var(--color-error-light);
          color: var(--color-error);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 15px rgba(var(--color-error-rgb), 0.1);
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
          transition: all 0.2s;
        }

        .modal-close:hover:not(:disabled) {
          background: var(--color-bg-hover);
          color: var(--color-text-primary);
        }

        .modal-body {
          padding: 24px;
        }

        .delete-warning-box {
          display: flex;
          gap: 16px;
          padding: 16px;
          background: rgba(var(--color-error-rgb), 0.03);
          border: 1px solid rgba(var(--color-error-rgb), 0.1);
          border-radius: var(--radius-lg);
        }

        .warning-icon {
          color: var(--color-error);
          flex-shrink: 0;
          margin-top: 2px;
        }

        .warning-content {
          flex: 1;
        }

        .modal-message {
          font-size: 15px;
          font-weight: 500;
          color: var(--color-text-primary);
          margin: 0 0 8px 0;
          line-height: 1.5;
        }

        .modal-hint-delete {
          font-size: 13px;
          color: var(--color-text-tertiary);
          margin: 0;
          line-height: 1.4;
        }

        .modal-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px 20px;
          border-top: 1px solid var(--color-border-secondary);
        }

        .modal-btn {
          padding: 10px 20px;
          border-radius: var(--radius-md);
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .modal-btn.secondary {
          background: var(--color-bg-tertiary);
          color: var(--color-text-secondary);
        }

        .modal-btn.secondary:hover:not(:disabled) {
          background: var(--color-bg-hover);
          color: var(--color-text-primary);
        }

        .modal-btn.primary.delete-action {
          background: var(--color-error);
          color: white;
          box-shadow: 0 4px 12px rgba(var(--color-error-rgb), 0.25);
        }

        .modal-btn.primary.delete-action:hover:not(:disabled) {
          background: #dc2626;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(var(--color-error-rgb), 0.35);
        }

        .modal-btn.primary.delete-action:active:not(:disabled) {
          transform: translateY(0);
        }

        .modal-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .loading-spinner-inline {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}
