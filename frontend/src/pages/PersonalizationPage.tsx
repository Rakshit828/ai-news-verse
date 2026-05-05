// src/pages/PersonalizationPage.tsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { Settings2, Save, Loader2 } from "lucide-react";
import {
    useCategories,
    useUserCategories,
    useUpdateCategories,
    useSetCategories,
} from "@/hooks/useNews";
import CategoryCard from "@/components/personalization/CategoryCard";


export default function PersonalizationPage() {
    // ─── API hooks ──────────────────────────────────────────────────────────────
    const { data: categoriesData, isLoading: loadingCategories, isError: errorCategories, refetch: refetchCategories } = useCategories();
    const { data: userCategoriesData, isLoading: loadingUser, isError: errorUser, refetch: refetchUser } = useUserCategories();
    const setCategories = useSetCategories();
    const updateCategories = useUpdateCategories();

    // ─── Local state: Flat list of selected subcategory IDs ────────────────────────────
    const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<string[]>([]);
    const [hasUserPreferences, setHasUserPreferences] = useState(false);

    // ─── Initialize from user preferences ───────────────────────────────────────
    useEffect(() => {
        if (userCategoriesData?.categories && !hasUserPreferences) {
            const categories = userCategoriesData.categories;
            if (categories.length > 0) {
                setHasUserPreferences(true);
                // Extract all subcategory IDs from the nested structure
                const allSubIds = categories.flatMap(cat => 
                    (cat.subcategories ?? []).map(sc => sc.id)
                );
                setSelectedSubcategoryIds(allSubIds);
            }
        }
    }, [userCategoriesData, hasUserPreferences]);

    // ─── Memoized Category List ────────────────────
    const allCategories = useMemo(() => {
        return categoriesData?.categories ?? [];
    }, [categoriesData]);

    // ─── Handlers ───────────────────────────────────────────────────────────────

    const handleSave = useCallback(
        () => {
            const payload = { categories: selectedSubcategoryIds };
            if (hasUserPreferences) {
                updateCategories.mutate(payload);
            } else {
                setCategories.mutate(payload, {
                    onSuccess: () => setHasUserPreferences(true),
                });
            }
        },
        [selectedSubcategoryIds, hasUserPreferences, updateCategories, setCategories]
    );

    const handleToggleSubcategory = useCallback(
        (_categoryId: string, subcategoryId: string, checked: boolean) => {
            setSelectedSubcategoryIds((prev) => {
                if (checked) {
                    if (prev.includes(subcategoryId)) return prev;
                    return [...prev, subcategoryId];
                } else {
                    return prev.filter((id) => id !== subcategoryId);
                }
            });
        },
        []
    );

    const isSaving = updateCategories.isPending || setCategories.isPending;
    const isError = errorCategories || errorUser;
    const isLoading = (loadingCategories || loadingUser) && !isError;

    return (
        <div className="personalization-page animate-fade-in">
            {/* ── Header ── */}
            <div className="page-header">
                <div className="page-title-group">
                    <div className="page-icon-wrapper">
                        <Settings2 size={24} className="page-icon" />
                    </div>
                    <div>
                        <h1 className="page-title">Personalization</h1>
                        <p className="page-subtitle">
                            Curate your intelligence feed by selecting topics of interest
                        </p>
                    </div>
                </div>

                <div className="page-actions">
                    <button
                        className="action-btn primary"
                        onClick={() => handleSave()}
                        disabled={isSaving || isLoading || isError}
                    >
                        {isSaving ? (
                            <>
                                <Loader2 size={16} className="spinner" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                <span>Save Preferences</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* ── Error State ── */}
            {isError && (
              <div className="error-container glass animate-slide-up">
                <p>Failed to load personalization data. Please check your connection.</p>
                <button 
                  onClick={() => { refetchCategories(); refetchUser(); }}
                  className="retry-btn"
                >
                  Retry Connection
                </button>
              </div>
            )}

            {/* ── Categories Grid ── */}
            <div className="categories-grid">
                {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="category-skeleton">
                            <div className="skeleton-line s-title" />
                            <div className="skeleton-line s-sub" />
                            <div className="skeleton-line s-sub" />
                            <div className="skeleton-line s-sub short" />
                        </div>
                    ))
                ) : !isError && (
                    allCategories.map((cat) => (
                        <CategoryCard
                            key={cat.id}
                            category={cat}
                            selectedSubcategoryIds={selectedSubcategoryIds}
                            onToggleSubcategory={handleToggleSubcategory}
                        />
                    ))
                )}

                {!isLoading && !isError && allCategories.length === 0 && (
                    <div className="empty-state glass">
                        <p className="empty-state-text">
                            No categories available to follow at this time.
                        </p>
                    </div>
                )}
            </div>

            <style>{`
        .personalization-page {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 40px;
          padding-top: 20px;
        }

        .page-title-group {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .page-icon-wrapper {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          background: var(--color-accent-light);
          color: var(--color-accent);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-sm);
        }

        .page-title {
          font-size: 32px;
          font-weight: 850;
          color: var(--color-text-primary);
          line-height: 1.1;
          letter-spacing: -1px;
        }

        .page-subtitle {
          font-size: 15px;
          color: var(--color-text-secondary);
          margin-top: 4px;
          font-weight: 500;
        }

        .action-btn {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 12px 24px;
          border-radius: var(--radius-md);
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          border: none;
          transition: all var(--transition-fast);
        }

        .action-btn.primary {
          background: var(--color-accent);
          color: white;
          box-shadow: 0 4px 12px var(--color-accent-glow);
        }

        .action-btn.primary:hover:not(:disabled) {
          background: var(--color-accent-hover);
          transform: translateY(-1px);
        }

        .action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-container {
          grid-column: 1 / -1;
          padding: 40px;
          text-align: center;
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-error);
          background: rgba(239, 68, 68, 0.05);
          color: var(--color-error);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          margin-bottom: 30px;
        }

        .retry-btn {
          padding: 10px 24px;
          background: var(--color-error);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .retry-btn:hover {
          background: #dc2626;
          transform: translateY(-1px);
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 24px;
        }

        .category-skeleton {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border-primary);
          border-radius: var(--radius-lg);
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .skeleton-line {
          border-radius: var(--radius-sm);
          background: var(--color-bg-tertiary);
          animation: pulse 2s infinite;
        }

        .s-title { width: 60%; height: 24px; margin-bottom: 8px; }
        .s-sub { width: 100%; height: 32px; }
        .s-sub.short { width: 40%; }

        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .empty-state {
          grid-column: 1 / -1;
          padding: 80px 20px;
          text-align: center;
          border-radius: var(--radius-xl);
        }

        @media (max-width: 768px) {
          .page-header { flex-direction: column; align-items: flex-start; gap: 20px; }
          .page-title { font-size: 26px; }
          .action-btn { width: 100%; justify-content: center; }
        }
      `}</style>
        </div>
    );
}