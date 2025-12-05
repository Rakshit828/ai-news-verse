import React from 'react';
import { motion } from 'framer-motion';
import { X, ExternalLink, Share2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import type { NewsItem } from '../types/news.types';

interface NewsCardProps {
  item: NewsItem;
  onRemove: (id: number) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({ item, onRemove }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <Card className="bg-slate-700/40 border-slate-600/50 hover:border-blue-600/50 transition-all hover:shadow-lg hover:shadow-blue-600/20 h-full flex flex-col backdrop-blur-sm group">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="text-base line-clamp-2 text-slate-100 group-hover:text-blue-300 transition-colors">
                {item.title}
              </CardTitle>
              <CardDescription className="text-xs text-slate-400 mt-1">
                {item.subcategory}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(item.id)}
              className="text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded-full shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pb-4 flex-1 flex flex-col">
          <p className="text-sm text-slate-400 line-clamp-3 flex-1">
            {item.description}
          </p>

          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-600/50">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="flex-1 bg-slate-700/50 border-slate-600/50 text-slate-300 hover:bg-blue-600/20 hover:text-blue-300 transition-all"
            >
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3 mr-1" />
                Read More
              </a>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-slate-200 hover:bg-slate-600/50 rounded-full"
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};