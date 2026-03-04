// src/pages/PersonalizationPage.tsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { Settings2, Plus, Save, Loader2 } from "lucide-react";
import {
    useCategories,
    useUserCategories,
    useUpdateCategories,
    useSetCategories,
    useCreateCustomCategory,
    useCreateCustomSubcategory,
    useDeleteCustomCategory,
    useDeleteCustomSubcategory,
} from "@/hooks/useNews";
import type { SetCategoriesData } from "@/types/news.types";
import CategoryCard from "@/components/personalization/CategoryCard";
import AddCategoryModal from "@/components/personalization/AddCategoryModal";
import ConflictResolutionModal from "@/components/personalization/ConflictResolutionModal";
import DeleteConfirmModal from "@/components/personalization/DeleteConfirmModal";


export default function PersonalizationPage() {
    // ─── API hooks ──────────────────────────────────────────────────────────────
    const { data: categoriesData, isLoading: loadingCategories } = useCategories();
    const { data: userCategoriesData, isLoading: loadingUser } = useUserCategories();
    const setCategories = useSetCategories();
    const updateCategories = useUpdateCategories();
    const createCategory = useCreateCustomCategory();
    const createSubcategory = useCreateCustomSubcategory();
    const deleteCategory = useDeleteCustomCategory();
    const deleteSubcategory = useDeleteCustomSubcategory();

    // ─── Local state matching PUT request body shape ────────────────────────────
    // { categories_data: [{ category_id: string, subcategories: string[] }] }
    const [selectedCategories, setSelectedCategories] = useState<
        SetCategoriesData[]
    >([]);
    const [hasUserPreferences, setHasUserPreferences] = useState(false);
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);
    const [addingSubcategoryFor, setAddingSubcategoryFor] = useState<string | null>(null);

    // Track newly created IDs for immediate UI feedback before refetch completes
    const [optimisticCustomIds, setOptimisticCustomIds] = useState<Set<string>>(new Set());
    const [optimisticCustomSubIds, setOptimisticCustomSubIds] = useState<Record<string, Set<string>>>({});

    const [conflictData, setConflictData] = useState<{
        type: "category" | "subcategory";
        id: string;
        title: string;
        categoryId?: string; // only for subcategories
    } | null>(null);

    const [deleteConfirm, setDeleteConfirm] = useState<{
        type: "category" | "subcategory";
        id: string;
        title: string;
        categoryId?: string; // parent category
    } | null>(null);

    // ─── Initialize from user preferences ───────────────────────────────────────
    useEffect(() => {
        // Only initialize state from the backend if we haven't already set it up
        // This prevents refetches (e.g. after adding a custom category) from overwriting local selection
        if (userCategoriesData?.categories_data && !hasUserPreferences) {
            const data = userCategoriesData.categories_data;
            if (data.length > 0) {
                setHasUserPreferences(true);
                setSelectedCategories(
                    data.map((cat) => ({
                        category_id: cat.category_id,
                        subcategories: (cat.subcategories ?? []).map(
                            (sc) => sc.subcategory_id
                        ),
                    }))
                );
            }
        }
    }, [userCategoriesData, hasUserPreferences]);

    // ─── Memoized Category List (Merging Official + Custom) ────────────────────
    const { allCategories, customCategoryIds, customSubcategoryIds } = useMemo(() => {
        const official = categoriesData?.categories_data ?? [];
        const user = userCategoriesData?.categories_data ?? [];

        const categoriesMap = new Map<string, any>();
        const customCats = new Set<string>(optimisticCustomIds);
        const customSubs: Record<string, Set<string>> = { ...optimisticCustomSubIds };

        // 1. Add official categories
        official.forEach(cat => {
            categoriesMap.set(cat.category_id, {
                ...cat,
                subcategories: [...(cat.subcategories ?? [])]
            });
        });

        // 2. Merge user categories (contains custom ones)
        user.forEach(uCat => {
            const existing = categoriesMap.get(uCat.category_id);
            if (!existing) {
                // This is a custom category
                categoriesMap.set(uCat.category_id, {
                    ...uCat,
                    subcategories: [...(uCat.subcategories ?? [])]
                });
                customCats.add(uCat.category_id);
            } else {
                // Merge subcategories to find custom ones
                const officialSubIds = new Set((existing.subcategories as any[]).map(s => s.subcategory_id));
                const userSubs = uCat.subcategories ?? [];

                userSubs.forEach(s => {
                    if (!officialSubIds.has(s.subcategory_id)) {
                        // This is a custom subcategory
                        if (!customSubs[uCat.category_id]) customSubs[uCat.category_id] = new Set();
                        customSubs[uCat.category_id].add(s.subcategory_id);
                        existing.subcategories.push(s);
                    }
                });
            }
        });

        return {
            allCategories: Array.from(categoriesMap.values()),
            customCategoryIds: customCats,
            customSubcategoryIds: customSubs
        };
    }, [categoriesData, userCategoriesData, optimisticCustomIds, optimisticCustomSubIds]);

    // ─── Handlers ───────────────────────────────────────────────────────────────

    const handleSave = useCallback(
        (overrideCategories?: SetCategoriesData[]) => {
            const categoriesToSave = overrideCategories || selectedCategories;
            const payload = { categories_data: categoriesToSave };
            if (hasUserPreferences) {
                updateCategories.mutate(payload);
            } else {
                setCategories.mutate(payload, {
                    onSuccess: () => setHasUserPreferences(true),
                });
            }
        },
        [selectedCategories, hasUserPreferences, updateCategories, setCategories]
    );

    const handleConfirmConflict = useCallback(() => {
        if (!conflictData) return;

        const { type, id, categoryId } = conflictData;

        const getUpdatedCategories = (prev: SetCategoriesData[]) => {
            const current = [...prev];
            if (type === "category") {
                if (!current.some((c) => c.category_id === id)) {
                    current.push({ category_id: id, subcategories: [] });
                }
            } else if (type === "subcategory" && categoryId) {
                const existingCat = current.find((c) => c.category_id === categoryId);
                if (existingCat) {
                    if (!existingCat.subcategories.includes(id)) {
                        existingCat.subcategories = [
                            ...existingCat.subcategories,
                            id,
                        ];
                    }
                } else {
                    current.push({ category_id: categoryId, subcategories: [id] });
                }
            }
            return current;
        };

        const nextCategories = getUpdatedCategories(selectedCategories);
        setSelectedCategories(nextCategories);
        handleSave(nextCategories);
        setConflictData(null);
    }, [conflictData, selectedCategories, handleSave]);

    const handleToggleSubcategory = useCallback(
        (categoryId: string, subcategoryId: string, checked: boolean) => {
            setSelectedCategories((prev) => {
                const existing = prev.find((c) => c.category_id === categoryId);
                if (checked) {
                    if (existing) {
                        return prev.map((c) =>
                            c.category_id === categoryId
                                ? {
                                    ...c,
                                    subcategories: [...c.subcategories, subcategoryId],
                                }
                                : c
                        );
                    }
                    return [
                        ...prev,
                        { category_id: categoryId, subcategories: [subcategoryId] },
                    ];
                } else {
                    if (existing) {
                        const updated = existing.subcategories.filter(
                            (id) => id !== subcategoryId
                        );
                        if (updated.length === 0) {
                            return prev.filter((c) => c.category_id !== categoryId);
                        }
                        return prev.map((c) =>
                            c.category_id === categoryId
                                ? { ...c, subcategories: updated }
                                : c
                        );
                    }
                    return prev;
                }
            });
        },
        []
    );
    const handleDeleteSubcategory = useCallback(
        (categoryId: string, subcategoryId: string) => {
            // Find the subcategory title for the modal
            const cat = allCategories.find(c => c.category_id === categoryId);
            const sub = cat?.subcategories?.find((s: { subcategory_id: string; title: string }) => s.subcategory_id === subcategoryId);

            setDeleteConfirm({
                type: "subcategory",
                id: subcategoryId,
                title: sub?.title ?? "this subcategory",
                categoryId: categoryId
            });
        },
        [allCategories]
    );

    const handleConfirmDelete = useCallback(() => {
        if (!deleteConfirm) return;
        const { type, id, categoryId } = deleteConfirm;

        if (type === "subcategory" && categoryId) {
            deleteSubcategory.mutate(id, {
                onSuccess: () => {
                    setSelectedCategories((prev) =>
                        prev
                            .map((c) =>
                                c.category_id === categoryId
                                    ? {
                                        ...c,
                                        subcategories: c.subcategories.filter(
                                            (sid) => sid !== id
                                        ),
                                    }
                                    : c
                            )
                            .filter((c) => c.subcategories.length > 0)
                    );

                    setOptimisticCustomSubIds((prev) => {
                        const updated = { ...prev };
                        if (updated[categoryId]) {
                            const newSet = new Set(updated[categoryId]);
                            newSet.delete(id);
                            updated[categoryId] = newSet;
                        }
                        return updated;
                    });
                    setDeleteConfirm(null);
                }
            });
        } else if (type === "category") {
            deleteCategory.mutate(id, {
                onSuccess: () => {
                    setSelectedCategories((prev) => prev.filter(c => c.category_id !== id));
                    setOptimisticCustomIds((prev) => {
                        const updated = new Set(prev);
                        updated.delete(id);
                        return updated;
                    });
                    setDeleteConfirm(null);
                }
            });
        }
    }, [deleteConfirm, deleteSubcategory, deleteCategory]);

    const handleDeleteCategory = useCallback(
        (categoryId: string) => {
            const cat = allCategories.find(c => c.category_id === categoryId);
            setDeleteConfirm({
                type: "category",
                id: categoryId,
                title: cat?.title ?? "this category"
            });
        },
        [allCategories]
    );

    const handleAddCustomSubcategory = useCallback(
        (categoryId: string, title: string) => {
            setAddingSubcategoryFor(categoryId);
            createSubcategory.mutate(
                { title, category_id: categoryId },
                {
                    onSuccess: (res) => {
                        // Track the new subcategory as custom for visual distinction
                        let newSubId: string | null = null;

                        if ("categories_data" in res.data) {
                            // Full categories response — find by title
                            const updatedCat = (res.data as { categories_data: { category_id: string; subcategories?: { subcategory_id: string; title: string }[] | null }[] }).categories_data.find(
                                (c) => c.category_id === categoryId
                            );
                            const newSc = updatedCat?.subcategories?.find(
                                (sc) => sc.title.toLowerCase() === title.toLowerCase()
                            );
                            newSubId = newSc?.subcategory_id ?? null;
                        } else if ("subcategory_id" in res.data) {
                            // AlreadyExists or SimilarExists
                            const conflict = res.data as { subcategory_id: string; subcategory_title: string };
                            setConflictData({
                                type: "subcategory",
                                id: conflict.subcategory_id,
                                title: conflict.subcategory_title,
                                categoryId: categoryId
                            });
                        }

                        if (newSubId) {
                            const capturedId = newSubId;
                            setOptimisticCustomSubIds((prev) => ({
                                ...prev,
                                [categoryId]: new Set([...(prev[categoryId] ?? []), capturedId]),
                            }));

                            // AUTO-SELECT the newly created subcategory
                            setSelectedCategories((prev) => {
                                const existing = prev.find((c) => c.category_id === categoryId);
                                if (existing) {
                                    if (existing.subcategories.includes(capturedId)) return prev;
                                    return prev.map((c) =>
                                        c.category_id === categoryId
                                            ? { ...c, subcategories: [...c.subcategories, capturedId] }
                                            : c
                                    );
                                }
                                return [
                                    ...prev,
                                    { category_id: categoryId, subcategories: [capturedId] },
                                ];
                            });
                        }
                    },
                    onSettled: () => {
                        setAddingSubcategoryFor(null);
                    },
                }
            );
        },
        [createSubcategory]
    );

    const handleCreateCategory = useCallback(
        (title: string) => {
            createCategory.mutate(
                { title },
                {
                    onSuccess: (res) => {
                        // Track the new category as custom for visual distinction
                        if ("categories_data" in res.data) {
                            const knownIds = new Set(
                                allCategories.map((c) => c.category_id)
                            );
                            (res.data as { categories_data: { category_id: string }[] }).categories_data.forEach((c) => {
                                if (!knownIds.has(c.category_id)) {
                                    setOptimisticCustomIds((prev) => new Set([...prev, c.category_id]));
                                }
                            });
                        } else if ("category_id" in res.data) {
                            // AlreadyExists or SimilarExists
                            const conflict = res.data as { category_id: string; category_title: string };
                            setConflictData({
                                type: "category",
                                id: conflict.category_id,
                                title: conflict.category_title
                            });
                        }
                        setCategoryModalOpen(false);
                    },
                }
            );
        },
        [createCategory, allCategories]
    );



    const isSaving = updateCategories.isPending || setCategories.isPending;
    const isLoading = loadingCategories || loadingUser;

    // Get selected subcategory ids for a given category
    const getSelectedForCategory = (categoryId: string): string[] => {
        return (
            selectedCategories.find((c) => c.category_id === categoryId)
                ?.subcategories ?? []
        );
    };

    return (
        <div className="personalization-page">
            {/* ── Header ── */}
            <div className="page-header">
                <div className="page-title-group">
                    <Settings2 size={28} className="page-icon" />
                    <div>
                        <h1 className="page-title">Personalization</h1>
                        <p className="page-subtitle">
                            Choose the topics that interest you
                        </p>
                    </div>
                </div>

                <div className="page-actions">
                    <button
                        className="action-btn secondary"
                        onClick={() => setCategoryModalOpen(true)}
                    >
                        <Plus size={16} />
                        <span>New Category</span>
                    </button>
                    <button
                        className="action-btn primary"
                        onClick={() => handleSave()}
                        disabled={isSaving}
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

            {/* ── Loading State ── */}
            {isLoading && (
                <div className="categories-grid">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="category-skeleton">
                            <div className="skeleton-line s-title" />
                            <div className="skeleton-line s-sub" />
                            <div className="skeleton-line s-sub" />
                            <div className="skeleton-line s-sub short" />
                        </div>
                    ))}
                </div>
            )}

            {/* ── Categories Grid ── */}
            {!isLoading && (
                <div className="categories-grid">
                    {allCategories.map((cat) => (
                        <CategoryCard
                            key={cat.category_id}
                            category={cat}
                            selectedSubcategoryIds={getSelectedForCategory(cat.category_id)}
                            customSubcategoryIds={customSubcategoryIds[cat.category_id]}
                            onToggleSubcategory={handleToggleSubcategory}
                            onAddCustomSubcategory={handleAddCustomSubcategory}
                            onDeleteSubcategory={handleDeleteSubcategory}
                            onDeleteCategory={handleDeleteCategory}
                            isCustomCategory={customCategoryIds.has(cat.category_id)}
                            isAddingSubcategory={addingSubcategoryFor === cat.category_id}
                        />
                    ))}

                    {allCategories.length === 0 && (
                        <div className="empty-state">
                            <p className="empty-state-text">
                                No categories available. Click <strong>New Category</strong> to
                                create one.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* ── Add Category Modal ── */}
            <AddCategoryModal
                open={categoryModalOpen}
                onClose={() => setCategoryModalOpen(false)}
                onSubmit={handleCreateCategory}
                isLoading={createCategory.isPending}
            />

            {/* ── Conflict Resolution Modal ── */}
            <ConflictResolutionModal
                open={!!conflictData}
                onClose={() => setConflictData(null)}
                onConfirm={handleConfirmConflict}
                title={conflictData?.title ?? ""}
                type={conflictData?.type ?? "category"}
            />

            <DeleteConfirmModal
                open={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={handleConfirmDelete}
                title={deleteConfirm?.title ?? ""}
                type={deleteConfirm?.type ?? "subcategory"}
                isLoading={deleteSubcategory.isPending || deleteCategory.isPending}
            />

            <style>{`
        .personalization-page {
          max-width: 1400px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .page-title-group {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .page-icon {
          color: var(--color-accent);
        }

        .page-title {
          font-size: 28px;
          font-weight: 800;
          color: var(--color-text-primary);
          line-height: 1.2;
        }

        .page-subtitle {
          font-size: 14px;
          color: var(--color-text-secondary);
          margin-top: 2px;
        }

        .page-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .action-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: var(--radius-md);
          font-size: 13px;
          font-weight: 600;
          font-family: var(--font-sans);
          cursor: pointer;
          border: none;
          transition: all var(--transition-fast);
        }

        .action-btn.primary {
          background: var(--color-accent);
          color: white;
          box-shadow: 0 2px 8px var(--color-accent-glow);
        }

        .action-btn.primary:hover:not(:disabled) {
          background: var(--color-accent-hover);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px var(--color-accent-glow);
        }

        .action-btn.primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .action-btn.secondary {
          background: var(--color-bg-tertiary);
          color: var(--color-text-secondary);
          border: 1px solid var(--color-border-primary);
        }

        .action-btn.secondary:hover {
          background: var(--color-bg-hover);
          color: var(--color-text-primary);
          border-color: var(--color-accent);
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
          animation: fadeInGrid 300ms ease-out;
        }

        @keyframes fadeInGrid {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Skeleton */
        .category-skeleton {
          background: var(--gradient-card);
          border: 1px solid var(--color-border-primary);
          border-radius: var(--radius-lg);
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .skeleton-line {
          border-radius: var(--radius-sm);
          background: var(--color-bg-hover);
          animation: shimmer 1.5s infinite ease-in-out;
        }

        .s-title {
          width: 60%;
          height: 22px;
        }

        .s-sub {
          width: 100%;
          height: 16px;
        }

        .s-sub.short {
          width: 40%;
        }

        @keyframes shimmer {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }

        .spinner {
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .empty-state {
          grid-column: 1 / -1;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 60px 24px;
        }

        .empty-state-text {
          font-size: 15px;
          color: var(--color-text-secondary);
          text-align: center;
        }

        /* ── Mobile Responsive ── */
        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .page-title {
            font-size: 22px;
          }

          .page-subtitle {
            font-size: 13px;
          }

          .categories-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .page-actions {
            width: 100%;
          }

          .action-btn {
            flex: 1;
            justify-content: center;
            padding: 12px 16px;
            font-size: 14px;
          }
        }

        @media (max-width: 480px) {
          .page-title-group {
            gap: 10px;
          }

          .page-title {
            font-size: 20px;
          }

          .page-actions {
            flex-direction: column;
          }

          .action-btn {
            width: 100%;
          }
        }
      `}</style>
        </div>
    );
}