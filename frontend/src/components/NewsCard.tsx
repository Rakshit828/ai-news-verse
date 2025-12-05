import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { Card, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import type { NewsItem } from '../types/news.types';
import { formatId } from '../lib/formatters';

interface NewsCardProps {
  item: NewsItem;
  onRemove: (id: number) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ item }) => {
  const categoryLabel = item.category ? formatId(item.category) : null;
  const subcategoryLabel = item.subcategory ? formatId(item.subcategory) : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="h-56 sm:h-64 w-full"
    >
      <Card className="h-full bg-slate-700/40 border-slate-600/50 hover:border-blue-600/50 transition-all hover:shadow-lg hover:shadow-blue-600/20 flex flex-col backdrop-blur-sm group overflow-hidden">
        {/* ===== SECTION 1: TITLE ===== */}
        <div className="px-4 pt-4 pb-3 flex-1 overflow-hidden">
          <CardTitle className="text-sm font-semibold text-slate-100 group-hover:text-blue-300 transition-colors leading-snug">
            {item.title}
          </CardTitle>
        </div>

        {/* ===== SECTION 2: CATEGORY & SUBCATEGORY ===== */}
        <div className="px-4 pb-3">
          <div className="flex flex-wrap gap-2">
            {categoryLabel && (
              <Badge
                variant="outline"
                className="text-xs font-medium px-2 py-0.5 bg-blue-600/20 border-blue-600/50 text-blue-200"
              >
                {categoryLabel}
              </Badge>
            )}
            {subcategoryLabel && (
              <Badge
                variant="outline"
                className="text-xs font-medium px-2 py-0.5 bg-cyan-600/20 border-cyan-600/50 text-cyan-200"
              >
                {subcategoryLabel}
              </Badge>
            )}
          </div>
        </div>

        {/* ===== SECTION 3: FOOTER (COMPACT) ===== */}
        <div className="px-4 pb-3 border-t border-slate-600/40">
          <Button
            asChild
            className="w-full h-7 text-xs bg-linear-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-md shadow-sm hover:shadow-md transition"
          >
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 no-underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Read Article
            </a>
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};

export default NewsCard;