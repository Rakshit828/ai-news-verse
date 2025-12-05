import { Sparkles, Code, Users, Briefcase, Building2, ChevronRight } from "lucide-react";
import type { Category } from "../types/news.types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { SubcategoryBadge } from "./SubcategoryBadge";


const categoryIcons: Record<string, React.ReactNode> = {
  core: <Sparkles className="w-5 h-5" />,
  technical: <Code className="w-5 h-5" />,
  general_user_usecases: <Users className="w-5 h-5" />,
  developer_usecases: <Briefcase className="w-5 h-5" />,
  sectors: <Building2 className="w-5 h-5" />,
};

export const CategoryCard: React.FC<{
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
    selectedSubcategories.includes(sub.subcategory_id),
  ).length;

  return (
    <Card className="hover:shadow-lg transition-all duration-200 bg-slate-700 border-slate-600 hover:border-slate-500">
      <CardHeader className="cursor-pointer hover:bg-slate-650 transition-colors" onClick={onExpandToggle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-600 rounded-lg text-blue-400">
              {categoryIcons[category.category_id]}
            </div>
            <div>
              <CardTitle className="text-lg text-slate-100">{category.title}</CardTitle>
              <CardDescription className="text-sm mt-1 text-slate-400">
                {selectedCount > 0
                  ? `${selectedCount} selected`
                  : `${category.subcategories.length} topics`}
              </CardDescription>
            </div>
          </div>
          <ChevronRight
            className={`w-5 h-5 text-slate-400 transition-transform ${
              isExpanded ? 'rotate-90' : ''
            }`}
          />
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="bg-slate-750 border-t border-slate-600 pt-4">
          <div className="flex flex-wrap gap-2">
            {category.subcategories.map((subcategory) => (
              <SubcategoryBadge
                key={subcategory.subcategory_id}
                subcategory={subcategory}
                isSelected={selectedSubcategories.includes(subcategory.subcategory_id)}
                onClick={() => onSubcategoryToggle(subcategory.subcategory_id)}
              />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};