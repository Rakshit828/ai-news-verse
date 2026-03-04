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
          background: var(--gradient-card);
          border: 1px solid var(--color-border-primary);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-card);
          transition: all var(--transition-normal);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          animation: cardEntrance 0.4s ease-out backwards;
        }

        @keyframes cardEntrance {
          from {
            opacity: 0;
            transform: scale(0.98) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .category-card:hover {
          box-shadow: var(--shadow-card-hover);
          transform: translateY(-2px);
        }

        .category-card.custom {
          border-color: var(--color-custom);
          border-width: 1.5px;
        }

        .category-card.custom::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--color-custom), var(--color-accent));
          border-radius: var(--radius-lg) var(--radius-lg) 0 0;
        }

        .category-card.custom {
          position: relative;
        }

        .category-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 20px 14px;
          border-bottom: 1px solid var(--color-border-secondary);
        }

        .category-card-title-group {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .category-card-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--color-text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .category-custom-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: var(--radius-full);
          background: var(--color-custom-light);
          color: var(--color-custom);
          white-space: nowrap;
          flex-shrink: 0;
        }

        .category-action-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .category-delete-btn {
          width: 26px;
          height: 26px;
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

        .category-delete-btn:hover {
          background: var(--color-error-light);
          color: var(--color-error);
        }

        .category-card-count {
          font-size: 12px;
          font-weight: 600;
          color: var(--color-text-tertiary);
          background: var(--color-bg-tertiary);
          padding: 4px 10px;
          border-radius: var(--radius-full);
          white-space: nowrap;
          flex-shrink: 0;
        }

        .category-card-body {
          padding: 8px 8px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
          max-height: 320px;
          overflow-y: auto;
        }

        .category-empty {
          padding: 20px 12px;
          text-align: center;
          font-size: 13px;
          color: var(--color-text-tertiary);
        }

        .category-card-footer {
          padding: 8px 12px 14px;
          border-top: 1px solid var(--color-border-secondary);
        }
      `}</style>
    </div>
  );
}
