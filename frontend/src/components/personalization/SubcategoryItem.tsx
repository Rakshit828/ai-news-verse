// src/components/personalization/SubcategoryItem.tsx
import { Trash2, Sparkles } from "lucide-react";

interface SubcategoryItemProps {
  id: string;
  title: string;
  checked: boolean;
  isCustom?: boolean;
  onToggle: (id: string, checked: boolean) => void;
  onDelete?: (id: string) => void;
}

export default function SubcategoryItem({
  id,
  title,
  checked,
  isCustom = false,
  onToggle,
  onDelete,
}: SubcategoryItemProps) {
  return (
    <div className={`subcategory-item ${checked ? "checked" : ""}`}>
      <label className={`subcategory-label ${isCustom ? "no-checkbox" : ""}`}>
        {!isCustom && (
          <>
            <input
              type="checkbox"
              checked={checked}
              onChange={(e) => onToggle(id, e.target.checked)}
              className="subcategory-checkbox"
            />
            <span className="subcategory-check-custom">
              <svg viewBox="0 0 12 10" fill="none" className="check-icon">
                <path
                  d="M1 5L4.5 8.5L11 1.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </>
        )}
        <span className="subcategory-text">{title}</span>
        {isCustom && (
          <span className="custom-badge">
            <Sparkles size={10} />
            Custom
          </span>
        )}
      </label>
      {isCustom && onDelete && (
        <button
          className="subcategory-delete"
          onClick={() => onDelete(id)}
          aria-label={`Delete subcategory ${title}`}
        >
          <Trash2 size={14} />
        </button>
      )}

      <style>{`
        .subcategory-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }

        .subcategory-item:hover {
          background: var(--color-bg-hover);
        }

        .subcategory-item {
          animation: slideInSub 0.3s ease-out;
        }

        @keyframes slideInSub {
          from {
            opacity: 0;
            transform: translateX(-5px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .subcategory-item.checked {
          background: var(--color-accent-light);
          transform: scale(1.02);
          box-shadow: 0 2px 8px rgba(var(--color-accent-rgb), 0.1);
        }

        .subcategory-label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          flex: 1;
          min-width: 0;
          font-size: 13.5px;
          color: var(--color-text-primary);
          user-select: none;
        }

        .subcategory-label.no-checkbox {
          cursor: default;
          padding-left: 4px;
        }

        .subcategory-checkbox {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
          pointer-events: none;
        }

        .subcategory-check-custom {
          width: 20px;
          height: 20px;
          border-radius: var(--radius-sm);
          border: 2px solid var(--color-border-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all var(--transition-fast);
          background: var(--color-bg-secondary);
        }

        .check-icon {
          width: 12px;
          height: 10px;
          color: white;
          opacity: 0;
          transform: scale(0.5);
          transition: all var(--transition-fast);
        }

        .subcategory-checkbox:checked + .subcategory-check-custom {
          background: var(--color-accent);
          border-color: var(--color-accent);
          box-shadow: 0 2px 6px var(--color-accent-glow);
        }

        .subcategory-checkbox:checked + .subcategory-check-custom .check-icon {
          opacity: 1;
          transform: scale(1);
        }

        .subcategory-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .custom-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: var(--radius-full);
          background: var(--color-custom-light);
          color: var(--color-custom);
          white-space: nowrap;
          flex-shrink: 0;
        }

        .subcategory-delete {
          width: 28px;
          height: 28px;
          border-radius: var(--radius-sm);
          border: none;
          background: transparent;
          color: var(--color-text-tertiary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all var(--transition-fast);
          flex-shrink: 0;
          margin-left: 4px;
        }

        .subcategory-delete:hover {
          background: var(--color-error-light);
          color: var(--color-error);
        }
      `}</style>
    </div>
  );
}
