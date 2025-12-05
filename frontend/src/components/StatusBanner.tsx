import { Card, CardContent } from "./ui/card";
import { CheckCircle2, AlertCircle } from "lucide-react";

export const StatusBanner: React.FC<{ 
  hasExistingCategories: boolean; 
}> = ({ hasExistingCategories }) => {
  if (hasExistingCategories) {
    return (
      <Card className="bg-slate-700 border-slate-600 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-slate-100 mb-1">
                Categories Already Set
              </p>
              <p className="text-sm text-slate-300">
                You can update your category preferences below. Your changes will be saved immediately.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-700 border-slate-600 shadow-lg">
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-slate-100 mb-1">
              Initialize Your Categories
            </p>
            <p className="text-sm text-slate-300">
              Select the topics you're interested in to get started with personalized AI news.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};