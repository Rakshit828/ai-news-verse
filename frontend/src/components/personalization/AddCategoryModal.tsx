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

        .modal-icon {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          background: var(--color-accent-light);
          color: var(--color-accent);
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
          transform: rotate(90deg);
        }

        .modal-body {
          padding: 28px;
        }

        .modal-label {
          display: block;
          font-size: 14px;
          font-weight: 700;
          color: var(--color-text-secondary);
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .modal-input {
          width: 100%;
          padding: 14px 18px;
          border: 1px solid var(--color-border-primary);
          border-radius: var(--radius-lg);
          background: var(--color-bg-primary);
          color: var(--color-text-primary);
          font-size: 16px;
          font-family: var(--font-sans);
          outline: none;
          transition: all var(--transition-fast);
        }

        .modal-input:focus {
          border-color: var(--color-accent);
          box-shadow: 0 0 0 4px var(--color-accent-glow);
          transform: translateY(-1px);
        }

        .modal-hint {
          font-size: 13px;
          color: var(--color-text-tertiary);
          margin-top: 14px;
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

        .modal-btn.primary {
          background: var(--color-accent);
          color: white;
          box-shadow: 0 4px 12px var(--color-accent-glow);
        }

        .modal-btn.primary:hover:not(:disabled) {
          background: var(--color-accent-hover);
          transform: translateY(-2px);
          box-shadow: 0 6px 16px var(--color-accent-glow);
        }

        .modal-btn.primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          box-shadow: none;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}