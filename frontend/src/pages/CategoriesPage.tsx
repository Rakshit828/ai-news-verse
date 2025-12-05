import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  ChevronRight,
  Sparkles,
  Code,
  Users,
  Briefcase,
  Building2,
} from "lucide-react";
import type {
  CategoriesData,
  Subcategory,
  Category,
  SetCategoriesUsers,
  SetCategorySchema,
} from "../types/news.types";



// Data
const categoriesData: CategoriesData = {
  categories: [
    {
      id: "core",
      title: "Core AI News",
      subcategories: [
        { id: "ai-industry", title: "Industry News" },
        { id: "ai-research", title: "Research" },
        { id: "ai-policy", title: "Policy & Regulation" },
        { id: "ai-saftey", title: "AI Saftey" },
        { id: "ai-product-launches", title: "Recent AI products" },
      ],
    },
    {
      id: "technical",
      title: "Technical Part of AI",
      subcategories: [
        { id: "llm", title: "LLMs" },
        { id: "cv", title: "Computer Vision" },
        { id: "genai", title: "Generative AI" },
      ],
    },
    {
      id: "general_user_usecases",
      title: "AI Tools for General Users",
      subcategories: [
        { id: "ai-writing", title: "Writing Tools" },
        { id: "ai-productivity", title: "Productivity" },
        { id: "ai-media-tools", title: "Image/Video/Audio Tools" },
      ],
    },
    {
      id: "developer_usecases",
      title: "AI Tools for Developers",
      subcategories: [
        { id: "ai-coding", title: "Code Generation" },
        { id: "mlops", title: "MLOps" },
        { id: "infra", title: "Infrastructure" },
      ],
    },
    {
      id: "sectors",
      title: "Sector-Specific",
      subcategories: [
        { id: "ai-healthcare", title: "Healthcare" },
        { id: "ai-finance", title: "Finance" },
        { id: "ai-education", title: "Education" },
      ],
    },
  ],
};

// Icon mapping
const categoryIcons: Record<string, React.ReactNode> = {
  core: <Sparkles className="w-5 h-5" />,
  technical: <Code className="w-5 h-5" />,
  general_user_usecases: <Users className="w-5 h-5" />,
  developer_usecases: <Briefcase className="w-5 h-5" />,
  sectors: <Building2 className="w-5 h-5" />,
};

// Components
const SubcategoryBadge: React.FC<{
  subcategory: Subcategory;
  isSelected: boolean;
  onClick: () => void;
}> = ({ subcategory, isSelected, onClick }) => {
  return (
    <Badge
      variant={isSelected ? "default" : "outline"}
      className={`cursor-pointer transition-all hover:scale-105 ${
        isSelected ? "bg-blue-600 hover:bg-blue-700" : "hover:bg-gray-100"
      }`}
      onClick={onClick}
    >
      {subcategory.title}
    </Badge>
  );
};

const CategoryCard: React.FC<{
  category: Category;
  selectedSubcategories: string[];
  onSubcategoryToggle: (subcategoryId: string) => void;
  isExpanded: boolean;
  onExpandToggle: () => void;
}> = ({
  category,
  selectedSubcategories,
  onSubcategoryToggle,
  isExpanded,
  onExpandToggle,
}) => {
  const selectedCount = category.subcategories.filter((sub) =>
    selectedSubcategories.includes(sub.id)
  ).length;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="cursor-pointer" onClick={onExpandToggle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              {categoryIcons[category.id]}
            </div>
            <div>
              <CardTitle className="text-lg">{category.title}</CardTitle>
              <CardDescription className="text-sm mt-1">
                {selectedCount > 0
                  ? `${selectedCount} selected`
                  : `${category.subcategories.length} topics`}
              </CardDescription>
            </div>
          </div>
          <ChevronRight
            className={`w-5 h-5 transition-transform ${
              isExpanded ? "rotate-90" : ""
            }`}
          />
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {category.subcategories.map((subcategory) => (
              <SubcategoryBadge
                key={subcategory.id}
                subcategory={subcategory}
                isSelected={selectedSubcategories.includes(subcategory.id)}
                onClick={() => onSubcategoryToggle(subcategory.id)}
              />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

const SelectionSummary: React.FC<{
  selectedSubcategories: string[];
  categoriesData: CategoriesData;
  onClearAll: () => void;
}> = ({ selectedSubcategories, categoriesData, onClearAll }) => {
  if (selectedSubcategories.length === 0) return null;

  const getSubcategoryTitle = (id: string) => {
    for (const category of categoriesData.categories) {
      const subcategory = category.subcategories.find((sub) => sub.id === id);
      if (subcategory) return subcategory.title;
    }
    return id;
  };

  return (
    <Card className="bg-linear-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Your Selection</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClearAll}>
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {selectedSubcategories.map((id) => (
            <Badge key={id} variant="default" className="bg-blue-600">
              {getSubcategoryTitle(id)}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};


export default function CategoriesPage() {
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(
    []
  );
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    "core",
  ]);

  // Helper function to find category for a subcategory
  const findCategoryForSubcategory = (subcategoryId: string): string | null => {
    for (const category of categoriesData.categories) {
      if (category.subcategories.some((sub) => sub.id === subcategoryId)) {
        return category.id;
      }
    }
    return null;
  };

  // Compute the formatted data matching Python schema
  const formattedData: SetCategoriesUsers = useMemo(() => {
    // Group subcategories by their parent category
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

    // Convert to the required format
    const categories_data: SetCategorySchema[] = Array.from(
      categoryMap.entries()
    ).map(([category_id, subcategories]) => ({
      category_id,
      subcategories,
    }));

    return { categories_data };
  }, [selectedSubcategories]);

  const handleSubcategoryToggle = (subcategoryId: string) => {
    setSelectedSubcategories((prev) =>
      prev.includes(subcategoryId)
        ? prev.filter((id) => id !== subcategoryId)
        : [...prev, subcategoryId]
    );
  };

  const handleCategoryExpand = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleClearAll = () => {
    setSelectedSubcategories([]);
  };

  const handleSetCategories = async () => {
    console.log("Formatted Data for API:", formattedData);

    // Example API call (uncomment and modify for your endpoint)
    /*
    try {
      const response = await fetch('/api/set-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Success:', result);
        // Navigate to news page or show success message
      } else {
        console.error('API Error:', response.statusText);
      }
    } catch (error) {
      console.error('Network Error:', error);
    }
    */

    // For demo purposes
    console.log("THe data for API is : ", formattedData)
    alert(`Data ready to send:\n${JSON.stringify(formattedData, null, 2)}`);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            AI News System
          </h1>
          <p className="text-gray-600">
            Select topics you're interested in to get personalized AI news
          </p>
        </div>

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
              key={category.id}
              category={category}
              selectedSubcategories={selectedSubcategories}
              onSubcategoryToggle={handleSubcategoryToggle}
              isExpanded={expandedCategories.includes(category.id)}
              onExpandToggle={() => handleCategoryExpand(category.id)}
            />
          ))}
        </div>

        {/* Action Button */}
        {selectedSubcategories.length > 0 && (
          <div className="flex justify-center pt-4">
            <Button
              size="lg"
              onClick={handleSetCategories}
              className="bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8"
            >
              Set ({selectedSubcategories.length} topics)
            </Button>
          </div>
        )}




        {/* Debug Panel - Remove in production */}
        {/* {selectedSubcategories.length > 0 && (
          <Card className="bg-gray-50 border-gray-300">
            <CardHeader>
              <CardTitle className="text-sm font-mono">
                Debug: API Payload
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs overflow-auto bg-white p-4 rounded border">
                {JSON.stringify(formattedData, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )} */}
      </div>
    </div>
  );
}
