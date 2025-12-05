import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import type { CategoriesData } from "../types/news.types";
import { Badge } from "./ui/badge";

export const SelectionSummary: React.FC<{
  selectedSubcategories: string[];
  categoriesData: CategoriesData;
  onClearAll: () => void;
}> = ({ selectedSubcategories, categoriesData, onClearAll }) => {
  if (selectedSubcategories.length === 0) return null;

  const getSubcategoryTitle = (id: string) => {
    for (const category of categoriesData.categories) {
      const subcategory = category.subcategories.find((sub) => sub.subcategory_id === id);
      if (subcategory) return subcategory.title;
    }
    return id;
  };

  return (
    <Card className="bg-slate-700 border-slate-600 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-slate-100">Your Selection</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearAll}
            className="text-slate-300 hover:text-slate-100 hover:bg-slate-600"
          >
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent className="border-t border-slate-600 pt-4">
        <div className="flex flex-wrap gap-2">
          {selectedSubcategories.map((id) => (
            <Badge 
              key={id} 
              className="bg-blue-600 hover:bg-blue-700 text-white border-blue-500 font-medium"
            >
              {getSubcategoryTitle(id)}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};