// src/components/personalization/AddSubcategoryInput.tsx
import { useState, useEffect } from "react";
import { Plus, Loader2, X } from "lucide-react";

interface AddSubcategoryInputProps {
  onSubmit: (title: string) => void;
  isLoading?: boolean;
}

export default function AddSubcategoryInput({
  onSubmit,
  isLoading = false,
}: AddSubcategoryInputProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  // Clear and close when parent finishes loading
  useEffect(() => {
    if (!isLoading && value && open) {
      setValue("");
      setOpen(false);
    }
  }, [isLoading]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
    // We don't clear or close immediately if we want to show loading
    // The parent (PersonalizationPage) will trigger a re-render or we can clear on success if we had local success state
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit();
    if (e.key === "Escape") {
      setOpen(false);
      setValue("");
    }
  };

  if (!open) {
    return (
      <button
        className="add-subcategory-trigger"
        onClick={() => setOpen(true)}
        aria-label="Add custom subcategory"
      >
        <Plus size={14} />
        <span>Add subcategory</span>

        <style>{`
          .add-subcategory-trigger {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 12px;
            border: 1px dashed var(--color-border-primary);
            border-radius: var(--radius-md);
            background: transparent;
            color: var(--color-text-tertiary);
            font-size: 13px;
            font-family: var(--font-sans);
            cursor: pointer;
            width: 100%;
            transition: all var(--transition-fast);
          }

          .add-subcategory-trigger:hover {
            border-color: var(--color-accent);
            color: var(--color-accent);
            background: var(--color-accent-light);
          }
        `}</style>
      </button>
    );
  }

  return (
    <div className="add-subcategory-form">
      <input
        type="text"
        className="add-subcategory-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Subcategory name..."
        autoFocus
        disabled={isLoading}
      />
      <button
        className="add-subcategory-btn submit"
        onClick={handleSubmit}
        disabled={isLoading || !value.trim()}
        aria-label="Submit"
      >
        {isLoading ? <Loader2 size={14} className="spinner" /> : <Plus size={14} />}
      </button>
      <button
        className="add-subcategory-btn cancel"
        onClick={() => {
          setOpen(false);
          setValue("");
        }}
        aria-label="Cancel"
      >
        <X size={14} />
      </button>

      <style>{`
        .add-subcategory-form {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px;
          animation: slideDown 150ms ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .add-subcategory-input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid var(--color-border-primary);
          border-radius: var(--radius-md);
          background: var(--color-bg-input);
          color: var(--color-text-primary);
          font-size: 13px;
          font-family: var(--font-sans);
          outline: none;
          transition: border-color var(--transition-fast);
        }

        .add-subcategory-input:focus {
          border-color: var(--color-accent);
          box-shadow: 0 0 0 3px var(--color-accent-glow);
        }

        .add-subcategory-input::placeholder {
          color: var(--color-text-tertiary);
        }

        .add-subcategory-btn {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
          flex-shrink: 0;
        }

        .add-subcategory-btn.submit {
          background: var(--color-accent);
          color: white;
        }

        .add-subcategory-btn.submit:hover:not(:disabled) {
          background: var(--color-accent-hover);
        }

        .add-subcategory-btn.submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .add-subcategory-btn.cancel {
          background: var(--color-bg-hover);
          color: var(--color-text-secondary);
        }

        .add-subcategory-btn.cancel:hover {
          background: var(--color-error-light);
          color: var(--color-error);
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
