import React from 'react';
import { AnimatePresence } from 'framer-motion';
import type { NewsItem } from '../types/news.types';
import { NewsCard } from './NewsCard';

interface NewsSectionProps {
  title: string;
  news: NewsItem[];
  onRemove: (id: number, url?: string) => void;
  icon?: React.ReactNode;
}

export const NewsSection: React.FC<NewsSectionProps> = ({
  title,
  news,
  onRemove,
  icon,
}) => {
  if (news.length === 0) return null;

  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center space-x-2 px-2">
        {icon && <div className="text-blue-400">{icon}</div>}
        <h2 className="text-lg font-bold text-blue-300">{title}</h2>
        <span className="ml-auto text-xs font-semibold px-2 py-1 rounded-full bg-blue-600/20 text-blue-300">
          {news.length}
        </span>
      </div>

      <AnimatePresence initial={false}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {news.map((item) => (
            <NewsCard
              key={item.id}
              item={item}
              onRemove={() => onRemove(item.id, item.url)}
            />
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
};