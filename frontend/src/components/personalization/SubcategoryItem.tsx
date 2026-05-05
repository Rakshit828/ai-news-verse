// src/components/personalization/SubcategoryItem.tsx
import { formatCategoryName } from "@/utils/format";

interface SubcategoryItemProps {
  id: string;
  title: string;
  checked: boolean;
  onToggle: (id: string, checked: boolean) => void;
}

export default function SubcategoryItem({
  id,
  title,
  checked,
  onToggle,
}: SubcategoryItemProps) {
  return (
    <div className={`subcategory-item ${checked ? "checked" : ""}`}>
      <label className="subcategory-label">
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
        <span className="subcategory-text">{formatCategoryName(title)}</span>
      </label>

      <style>{`
        .subcategory-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
          border: 1px solid transparent;
        }

        .subcategory-item:hover {
          background: var(--color-bg-hover);
          transform: translateX(4px);
          border-color: var(--color-border-secondary);
        }

        .subcategory-item.checked {
          background: var(--color-accent-light);
          border-color: var(--color-accent-glow);
        }

        .subcategory-label {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          flex: 1;
          min-width: 0;
          font-size: 14px;
          color: var(--color-text-primary);
          user-select: none;
          font-weight: 500;
        }

        .subcategory-checkbox {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
          pointer-events: none;
        }

        .subcategory-check-custom {
          width: 22px;
          height: 22px;
          border-radius: 6px;
          border: 2px solid var(--color-border-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all var(--transition-fast);
          background: var(--color-bg-secondary);
        }

        .check-icon {
          width: 14px;
          height: 12px;
          color: white;
          opacity: 0;
          transform: scale(0.5) rotate(-15deg);
          transition: all var(--transition-fast);
        }

        .subcategory-checkbox:checked + .subcategory-check-custom {
          background: var(--color-accent);
          border-color: var(--color-accent);
          box-shadow: 0 4px 12px var(--color-accent-glow);
        }

        .subcategory-checkbox:checked + .subcategory-check-custom .check-icon {
          opacity: 1;
          transform: scale(1) rotate(0);
        }

        .subcategory-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: color var(--transition-fast);
        }

        .subcategory-item.checked .subcategory-text {
          color: var(--color-accent);
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}