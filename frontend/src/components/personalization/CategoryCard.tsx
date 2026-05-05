import type { Category, SubCategory } from "@/types/news.types";
import SubcategoryItem from "./SubcategoryItem";
import { formatCategoryName } from "@/utils/format";

interface CategoryCardProps {
  category: Category;
  selectedSubcategoryIds: string[];
  onToggleSubcategory: (
    categoryId: string,
    subcategoryId: string,
    checked: boolean
  ) => void;
}

export default function CategoryCard({
  category,
  selectedSubcategoryIds,
  onToggleSubcategory,
}: CategoryCardProps) {
  const subcategories: SubCategory[] = category.subcategories ?? [];
  const selectedCount = subcategories.filter((sc) =>
    selectedSubcategoryIds.includes(sc.id)
  ).length;

  return (
    <div className="category-card">
      {/* ── Header ── */}
      <div className="category-card-header">
        <div className="category-card-title-group">
          <h3 className="category-card-title">{formatCategoryName(category.name)}</h3>
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
            key={sc.id}
            id={sc.id}
            title={sc.name}
            checked={selectedSubcategoryIds.includes(sc.id)}
            onToggle={(id, checked) =>
              onToggleSubcategory(category.id, id, checked)
            }
          />
        ))}

        {subcategories.length === 0 && (
          <p className="category-empty">
            No subcategories available.
          </p>
        )}
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
        }
      `}</style>
    </div>
  );
}