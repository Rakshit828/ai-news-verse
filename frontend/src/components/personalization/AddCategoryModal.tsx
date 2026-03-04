// src/components/personalization/AddCategoryModal.tsx
import { useState, useEffect, useRef } from "react";
import { X, Loader2, FolderPlus } from "lucide-react";

interface AddCategoryModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (title: string) => void;
    isLoading?: boolean;
}

export default function AddCategoryModal({
    open,
    onClose,
    onSubmit,
    isLoading = false,
}: AddCategoryModalProps) {
    const [value, setValue] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            setValue("");
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [open]);

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape" && open) onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [open, onClose]);

    if (!open) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = value.trim();
        if (!trimmed) return;
        onSubmit(trimmed);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-header-title">
                        <div className="modal-icon">
                            <FolderPlus size={20} />
                        </div>
                        <h2>Create Custom Category</h2>
                    </div>
                    <button
                        className="modal-close"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <label className="modal-label" htmlFor="category-name">
                            Category Name
                        </label>
                        <input
                            ref={inputRef}
                            id="category-name"
                            type="text"
                            className="modal-input"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder="e.g. Quantum Computing, Robotics..."
                            disabled={isLoading}
                        />
                        <p className="modal-hint">
                            This will create a new category visible only to you. You can add
                            subcategories to it later.
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
                            type="submit"
                            className="modal-btn primary"
                            disabled={isLoading || !value.trim()}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={14} className="spinner" />
                                    Creating...
                                </>
                            ) : (
                                "Create Category"
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: var(--color-bg-overlay);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
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
          max-width: 460px;
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

        .modal-icon {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-md);
          background: var(--color-accent-light);
          color: var(--color-accent);
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
          padding: 20px 24px;
        }

        .modal-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--color-text-secondary);
          margin-bottom: 8px;
        }

        .modal-input {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid var(--color-border-primary);
          border-radius: var(--radius-md);
          background: var(--color-bg-input);
          color: var(--color-text-primary);
          font-size: 14px;
          font-family: var(--font-sans);
          outline: none;
          transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
        }

        .modal-input:focus {
          border-color: var(--color-accent);
          box-shadow: 0 0 0 3px var(--color-accent-glow);
        }

        .modal-input::placeholder {
          color: var(--color-text-tertiary);
        }

        .modal-hint {
          font-size: 12px;
          color: var(--color-text-tertiary);
          margin-top: 10px;
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

        .modal-btn.primary {
          background: var(--color-accent);
          color: white;
        }

        .modal-btn.primary:hover:not(:disabled) {
          background: var(--color-accent-hover);
        }

        .modal-btn.primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .spinner {
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}
