import React from 'react';
import { Button } from './ui/button';
import { Filter, X } from 'lucide-react';

interface FilterBarProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  filters: { label: string; value: string }[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  activeFilter,
  onFilterChange,
  filters,
}) => {
  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-2">
      <Filter className="h-4 w-4 text-slate-400 shrink-0" />
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant={activeFilter === filter.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange(filter.value)}
          className={`shrink-0 transition-all ${
            activeFilter === filter.value
              ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'
              : 'bg-slate-700/30 hover:bg-slate-600/50 text-slate-300 border-slate-600/50'
          }`}
        >
          {filter.label}
        </Button>
      ))}
      {activeFilter !== 'all' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFilterChange('all')}
          className="text-slate-400 hover:text-slate-300"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};