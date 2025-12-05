import { Badge } from './ui/badge';
import type { Subcategory } from '../types/news.types';

export const SubcategoryBadge: React.FC<{
  subcategory: Subcategory;
  isSelected: boolean;
  onClick: () => void;
}> = ({ subcategory, isSelected, onClick }) => {
  return (
    <Badge
      variant={isSelected ? 'default' : 'outline'}
      className={`cursor-pointer transition-all hover:scale-105 font-medium ${
        isSelected 
          ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500' 
          : 'bg-slate-600 hover:bg-slate-500 text-slate-100 border-slate-500 hover:border-slate-400'
      }`}
      onClick={onClick}
    >
      {subcategory.title}
    </Badge>
  );
};