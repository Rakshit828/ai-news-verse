import { useState, useMemo } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Loader2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useCategory } from '../context/CategoryContext';
import type {
  CategoriesData,
  SetCategoriesUsers,
  SetCategorySchema,
} from '../types/news.types';
import { ErrorAlert } from '../components/ErrorAlert';
import { SelectionSummary } from '../components/SelectionSummary';
import { StatusBanner } from '../components/StatusBanner';
import { CategoryCard } from '../components/CategoryCard';
const categoriesData: CategoriesData = {
  categories: [
    {
      category_id: 'core-ai-news',
      title: 'Core AI News',
      subcategories: [
        { subcategory_id: 'ai-industry', title: 'AI Industry' },
        { subcategory_id: 'ai-research', title: 'AI Research' },
        {
          subcategory_id: 'ai-policy-regulation',
          title: 'AI Policy & Regulation',
        },
        { subcategory_id: 'ai-threats', title: 'AI Threats' },
        {
          subcategory_id: 'ai-product-launches',
          title: 'AI New Product Releases',
        },
      ],
    },
    {
      category_id: 'technical-ai',
      title: 'Technical AI',
      subcategories: [
        { subcategory_id: 'llms', title: 'LLMs' },
        { subcategory_id: 'computer-vision', title: 'Computer Vision' },
        { subcategory_id: 'agentic-ai', title: 'Agentic AI' },
        { subcategory_id: 'generative-ai', title: 'Generative AI' },
        { subcategory_id: 'robotics', title: 'Robotics & Control' },
        {
          subcategory_id: 'ai-optimization-algorithms',
          title: 'AI Optimization/Algorithms',
        },
      ],
    },
    {
      category_id: 'developer-tools',
      title: 'Developer Tools',
      subcategories: [
        { subcategory_id: 'code-generation', title: 'AI Code Generation' },
        { subcategory_id: 'mlops', title: 'MLOps' },
        { subcategory_id: 'ai-infrastructure', title: 'AI Infrastructure' },
        {
          subcategory_id: 'ai-evaluation-testing',
          title: 'AI Model Evaluation & Testing',
        },
      ],
    },
    {
      category_id: 'sectors',
      title: 'Sectors',
      subcategories: [
        { subcategory_id: 'ai-healthcare', title: 'AI Healthcare' },
        { subcategory_id: 'ai-finance', title: 'AI Finance' },
        { subcategory_id: 'ai-education', title: 'AI-Education' },
        { subcategory_id: 'ai-entertainment', title: 'AI-Entertainment' },
      ],
    },
  ],
};

export default function CategoriesPage() {
  // Local UI state
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(
    [],
  );
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    'core-ai-news',
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Get categories from context
  const {
    categories: userCategories,
    setCategories,
    updateCategories,
    loading,
    error,
    clearError: contextClearError,
  } = useCategory();

  const { showToast } = useToast();

  // Determine if we have existing categories
  const hasExistingCategories = userCategories && userCategories.length > 0;

  // Process user categories from context to pre-fill selections
  const processedCategories = useMemo(() => {
    if (!userCategories || userCategories.length === 0) return [];

    const allSelectedSubcategories: string[] = [];
    userCategories.forEach((category) => {
      if (category.subcategories && category.subcategories.length > 0) {
        category.subcategories.forEach((subcategory) => {
          allSelectedSubcategories.push(subcategory.subcategory_id);
        });
      }
    });

    return allSelectedSubcategories;
  }, [userCategories]);

  // Auto-populate selections when user categories are loaded
  useMemo(() => {
    if (processedCategories.length > 0 && selectedSubcategories.length === 0) {
      setSelectedSubcategories(processedCategories);
    }
  }, [processedCategories]);

  // ========================================================================
  // Helper function to find category for a subcategory
  // ========================================================================
  const findCategoryForSubcategory = (subcategoryId: string): string | null => {
    for (const category of categoriesData.categories) {
      if (
        category.subcategories.some(
          (sub) => sub.subcategory_id === subcategoryId,
        )
      ) {
        return category.category_id;
      }
    }
    return null;
  };

  // ========================================================================
  // Compute the formatted data matching API schema
  // ========================================================================
  const formattedData: SetCategoriesUsers = useMemo(() => {
    const categoryMap = new Map<string, string[]>();

    selectedSubcategories.forEach((subId) => {
      const categoryId = findCategoryForSubcategory(subId);
      if (categoryId) {
        if (!categoryMap.has(categoryId)) {
          categoryMap.set(categoryId, []);
        }
        categoryMap.get(categoryId)!.push(subId);
      }
    });

    const categories_data: SetCategorySchema[] = Array.from(
      categoryMap.entries(),
    ).map(([category_id, subcategories]) => ({
      category_id,
      subcategories,
    }));

    return { categories_data };
  }, [selectedSubcategories]);

  // ========================================================================
  // Event Handlers
  // ========================================================================
  const handleSubcategoryToggle = (subcategoryId: string) => {
    setSelectedSubcategories((prev) =>
      prev.includes(subcategoryId)
        ? prev.filter((id) => id !== subcategoryId)
        : [...prev, subcategoryId],
    );
    setLocalError(null);
  };

  const handleCategoryExpand = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const handleClearAll = () => {
    setSelectedSubcategories([]);
    setLocalError(null);
  };

  // ========================================================================
  // Handle Initial Setting of Categories
  // ========================================================================
  const handleSetCategories = async () => {
    if (selectedSubcategories.length === 0) {
      showToast('Please select at least one category', 'error');
      return;
    }

    setIsSubmitting(true);
    setLocalError(null);

    try {
      await setCategories(formattedData);
      showToast('Categories set successfully!', 'success');
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to set categories';
      setLocalError(errorMsg);
      showToast(errorMsg, 'error');
      console.error('Error setting categories:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========================================================================
  // Handle Updating Categories
  // ========================================================================
  const handleUpdateCategories = async () => {
    if (selectedSubcategories.length === 0) {
      showToast('Please select at least one category', 'error');
      return;
    }

    setIsSubmitting(true);
    setLocalError(null);

    try {
      await updateCategories(formattedData);
      showToast('Categories updated successfully!', 'success');
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to update categories';
      setLocalError(errorMsg);
      showToast(errorMsg, 'error');
      console.error('Error updating categories:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ========================================================================
  // Determine which action button to show
  // ========================================================================
  const showActionButtons = selectedSubcategories.length > 0;
  const isInitialSetup = !hasExistingCategories;

  return (
    <div className="min-h-screen bg-slate-800 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-4xl font-bold bg-linear-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            AI News Verse
          </h1>
          <p className="text-slate-300">
            Select topics you're interested in to get personalized AI news
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <Card className="bg-slate-700 border-slate-600 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                <p className="text-sm text-slate-300">
                  Loading your categories...
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Alert */}
        <ErrorAlert
          error={localError || error}
          onDismiss={() => {
            setLocalError(null);
            contextClearError();
          }}
        />

        {/* Status Banner - Shows if categories exist or not */}
        {!loading && (
          <StatusBanner hasExistingCategories={!!hasExistingCategories} />
        )}

        {/* Selection Summary */}
        <SelectionSummary
          selectedSubcategories={selectedSubcategories}
          categoriesData={categoriesData}
          onClearAll={handleClearAll}
        />

        {/* Category Cards */}
        <div className="grid gap-4">
          {categoriesData.categories.map((category) => (
            <CategoryCard
              key={category.category_id}
              category={category}
              selectedSubcategories={selectedSubcategories}
              onSubcategoryToggle={handleSubcategoryToggle}
              isExpanded={expandedCategories.includes(category.category_id)}
              onExpandToggle={() => handleCategoryExpand(category.category_id)}
            />
          ))}
        </div>

        {/* Action Buttons */}
        {showActionButtons && (
          <div className="flex justify-center gap-4 pt-6">
            {isInitialSetup ? (
              // Initial setup mode - Only "Set Categories" button
              <Button
                size="lg"
                onClick={handleSetCategories}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 font-semibold shadow-lg transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Setting...
                  </>
                ) : (
                  <>Set Categories ({selectedSubcategories.length} topics)</>
                )}
              </Button>
            ) : (
              // Update mode - "Clear Selection" and "Update Categories" buttons
              <>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleClearAll}
                  disabled={isSubmitting}
                  className="px-8 font-semibold bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:text-slate-100"
                >
                  Clear Selection
                </Button>
                <Button
                  size="lg"
                  onClick={handleUpdateCategories}
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 font-semibold shadow-lg transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      Update Categories ({selectedSubcategories.length} topics)
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        )}

        {/* Empty State - No categories selected and not initialized */}
        {!loading &&
          !hasExistingCategories &&
          selectedSubcategories.length === 0 && (
            <Card className="bg-slate-700 border-slate-600 text-center py-12 shadow-lg">
              <CardContent>
                <p className="text-slate-300 mb-4">
                  No categories selected yet. Start by selecting topics above to
                  begin receiving personalized AI news.
                </p>
                <Button
                  variant="outline"
                  onClick={() => handleCategoryExpand('core')}
                  className="bg-slate-600 border-slate-500 text-slate-100 hover:bg-slate-500 hover:text-white"
                >
                  Select Your First Category
                </Button>
              </CardContent>
            </Card>
          )}

        {/* State when categories exist but none are currently selected */}
        {!loading &&
          hasExistingCategories &&
          selectedSubcategories.length === 0 && (
            <Card className="bg-slate-700 border-slate-600 text-center py-12 shadow-lg">
              <CardContent>
                <p className="text-slate-300 mb-4">
                  You can modify your category selection below. Your current
                  categories will remain active until you save changes.
                </p>
                <Button
                  variant="outline"
                  onClick={() => handleCategoryExpand('core')}
                  className="bg-slate-600 border-slate-500 text-slate-100 hover:bg-slate-500 hover:text-white"
                >
                  View Categories
                </Button>
              </CardContent>
            </Card>
          )}
      </div>
    </div>
  );
}
