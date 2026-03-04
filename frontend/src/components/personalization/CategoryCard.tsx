// src/components/personalization/CategoryCard.tsx
import { Sparkles, Trash2 } from "lucide-react";
import type { Category, SubCategory } from "@/types/news.types";
import SubcategoryItem from "./SubcategoryItem";
import AddSubcategoryInput from "./AddSubcategoryInput";

interface CategoryCardProps {
  category: Category;
  selectedSubcategoryIds: string[];
  customSubcategoryIds?: Set<string>;
  onToggleSubcategory: (
    categoryId: string,
    subcategoryId: string,
    checked: boolean
  ) => void;
  onAddCustomSubcategory: (categoryId: string, title: string) => void;
  onDeleteSubcategory?: (categoryId: string, subcategoryId: string) => void;
  onDeleteCategory?: (categoryId: string) => void;
  isCustomCategory?: boolean;
  isAddingSubcategory?: boolean;
}

export default function CategoryCard({
  category,
  selectedSubcategoryIds,
  customSubcategoryIds,
  onToggleSubcategory,
  onAddCustomSubcategory,
  onDeleteSubcategory,
  onDeleteCategory,
  isCustomCategory = false,
  isAddingSubcategory = false,
}: CategoryCardProps) {
  const subcategories: SubCategory[] = category.subcategories ?? [];
  const selectedCount = subcategories.filter((sc) =>
    selectedSubcategoryIds.includes(sc.subcategory_id)
  ).length;

  return (
    <div className={`category-card ${isCustomCategory ? "custom" : ""}`}>
      {/* ── Header ── */}
      <div className="category-card-header">
        <div className="category-card-title-group">
          <h3 className="category-card-title">{category.title}</h3>
          {isCustomCategory && (
            <div className="category-action-group">
              <span className="category-custom-badge">
                <Sparkles size={11} />
                Custom
              </span>
              <button
                className="category-delete-btn"
                onClick={() => onDeleteCategory?.(category.category_id)}
                aria-label={`Delete category ${category.title}`}
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
        {subcategories.length > 0 && (
          <span className="category-card-count">
            {selectedCount}/{subcategories.length}
          </span>
        )}
      </div>

      {/* ── Subcategories ── */}
      <div className="category-card-body">
        {subcategories.map((sc) => (
          <SubcategoryItem
            key={sc.subcategory_id}
            id={sc.subcategory_id}
            title={sc.title}
            checked={selectedSubcategoryIds.includes(sc.subcategory_id)}
            isCustom={customSubcategoryIds?.has(sc.subcategory_id)}
            onToggle={(id, checked) =>
              onToggleSubcategory(category.category_id, id, checked)
            }
            onDelete={
              customSubcategoryIds?.has(sc.subcategory_id)
                ? (id) => onDeleteSubcategory?.(category.category_id, id)
                : undefined
            }
          />
        ))}

        {subcategories.length === 0 && (
          <p className="category-empty">
            No subcategories yet. Add one below.
          </p>
        )}
      </div>

      {/* ── Add Subcategory ── */}
      <div className="category-card-footer">
        <AddSubcategoryInput
          onSubmit={(title) =>
            onAddCustomSubcategory(category.category_id, title)
          }
          isLoading={isAddingSubcategory}
        />
      </div>

      <style>{`
        .category-card {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border-primary);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-card);
          transition: all var(--transition-normal);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          animation: slideUp 0.4s ease-out backwards;
          position: relative;
        }

        .category-card:hover {
          box-shadow: var(--shadow-card-hover);
          transform: translateY(-4px);
          border-color: var(--color-accent-glow);
        }

        .category-card.custom {
          border-color: var(--color-custom);
        }

        .category-card.custom::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--gradient-accent);
          opacity: 0.8;
        }

        .category-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 20px 16px;
          border-bottom: 1px solid var(--color-border-secondary);
          background: var(--color-bg-secondary);
        }

        .category-card-title-group {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .category-card-title {
          font-size: 18px;
          font-weight: 800;
          color: var(--color-text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          letter-spacing: -0.5px;
        }

        .category-custom-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: var(--radius-full);
          background: var(--color-bg-badge);
          color: var(--color-accent);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .category-action-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .category-delete-btn {
          width: 32px;
          height: 32px;
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

        .category-delete-btn:hover {
          background: var(--color-error-light);
          color: var(--color-error);
          transform: rotate(15deg);
        }

        .category-card-count {
          font-size: 12px;
          font-weight: 700;
          color: var(--color-text-secondary);
          background: var(--color-bg-tertiary);
          padding: 4px 12px;
          border-radius: var(--radius-full);
          white-space: nowrap;
          flex-shrink: 0;
        }

        .category-card-body {
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
          max-height: 360px;
          overflow-y: auto;
          scrollbar-width: thin;
        }

        .category-empty {
          padding: 32px 16px;
          text-align: center;
          font-size: 14px;
          color: var(--color-text-tertiary);
          font-weight: 500;
        }

        .category-card-footer {
          padding: 16px 20px 20px;
          border-top: 1px solid var(--color-border-secondary);
          background: var(--color-bg-secondary);
        }

        @media (max-width: 768px) {
          .category-card:hover {
            transform: none;
            box-shadow: var(--shadow-card);
          }
          .category-card-header {
            padding: 18px 16px 12px;
          }
          .category-card-title {
            font-size: 16px;
          }
          .category-card-body {
            padding: 10px;
            max-height: 280px;
          }
          .category-card-footer {
            padding: 12px 16px 16px;
          }
        }
      `}</style>
    </div>
  );
}