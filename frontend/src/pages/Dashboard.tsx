import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Sparkles, Zap, Loader, AlertCircle } from 'lucide-react';
import { FloatingNavBar } from '../components/FloatingNavbar';
import { NewsSection } from '../components/NewsSection';
import { EmptyState } from '../components/EmptyState';
import { StatsCard } from '../components/StatsCard';
import { FilterBar } from '../components/FilterBar';
import { useNews } from '../hooks/useNews';
import { Card, CardContent } from '../components/ui/card';
import { useCategory } from '../context/CategoryContext';
import type { BaseArticleResponse } from '../types/api.types';

// Map source names to colors and icons
const sourceConfig = {
  'Google News': {
    color: 'from-blue-600 to-blue-400',
    icon: <TrendingUp className="h-5 w-5" />,
    label: 'Google News',
  },
  Anthropic: {
    color: 'from-purple-600 to-purple-400',
    icon: <Sparkles className="h-5 w-5" />,
    label: 'Anthropic',
  },
  Openai: {
    color: 'from-emerald-600 to-emerald-400',
    icon: <Zap className="h-5 w-5" />,
    label: 'OpenAI',
  },
  Hackernoon: {
    color: 'from-emerald-600 to-emerald-400',
    icon: <Zap className="h-5 w-5" />,
    label: 'Hackernoon',
  },
};

interface NewsArticleWithSource extends BaseArticleResponse {
  news_from: 'Google News' | 'Anthropic' | 'Openai' | 'Hackernoon';
}

interface GroupedNews {
  [key: string]: NewsArticleWithSource[];
}

const filters = [
  { label: 'All News', value: 'all' },
  { label: 'Google News', value: 'Google News' },
  { label: 'Anthropic', value: 'Anthropic' },
  { label: 'OpenAI', value: 'Openai' },
  { label: 'Hackernoon', value: 'Hackernoon' },
];

export const Dashboard: React.FC = () => {
  const {
    news,
    loading: newsLoading,
    error: newsError,
    getTodayNews,
  } = useNews();

  // Get categories from context (already fetched automatically)
  const { categories } = useCategory();
  const [activeFilter, setActiveFilter] = useState('all');
  const [removedArticles, setRemovedArticles] = useState<Set<string>>(
    new Set(),
  );

  // Flatten and filter news articles
  const allArticles = useMemo(() => {
    if (!news) return [];

    const articles: NewsArticleWithSource[] = [];

    // Combine all news from different sources
    if (news.google && Array.isArray(news.google)) {
      articles.push(
        ...news.google.map((item) => ({
          ...item,
          news_from: 'Google News' as const,
        })),
      );
    }

    if (news.anthropic && Array.isArray(news.anthropic)) {
      articles.push(
        ...news.anthropic.map((item) => ({
          ...item,
          news_from: 'Anthropic' as const,
        })),
      );
    }

    if (news.openai && Array.isArray(news.openai)) {
      articles.push(
        ...news.openai.map((item) => ({
          ...item,
          news_from: 'Openai' as const,
        })),
      );
    }

    if (news.hackernoon && Array.isArray(news.hackernoon)) {
      articles.push(
        ...news.hackernoon.map((item) => ({
          ...item,
          news_from: 'Hackernoon' as const,
        })),
      );
    }

    // Filter out removed articles
    return articles.filter((article) => !removedArticles.has(article.url));
  }, [news, removedArticles]);

  // Filter articles based on active filter
  const filteredArticles = useMemo(() => {
    if (activeFilter === 'all') return allArticles;
    return allArticles.filter((article) => article.news_from === activeFilter);
  }, [allArticles, activeFilter]);

  // Group articles by source
  const groupedNews: GroupedNews = useMemo(() => {
    const groups: GroupedNews = {};

    filteredArticles.forEach((article) => {
      const source = article.news_from;
      if (!groups[source]) {
        groups[source] = [];
      }
      groups[source].push(article);
    });

    return groups;
  }, [filteredArticles]);

  const handleRemoveArticle = (url: string) => {
    setRemovedArticles((prev) => new Set(prev).add(url));
  };

  // Determine which empty state to show
  const getEmptyStateType = () => {
    // If categories are not set, show "no-categories"
    if (!categories || categories.length === 0) {
      return 'no-categories';
    }

    // If error occurred while fetching news, show "error"
    if (newsError) {
      return 'error';
    }

    // If categories are set but no news available, show "no-news"
    return 'no-news';
  };

  // Calculate stats
  const stats = [
    {
      icon: <TrendingUp className="h-5 w-5" />,
      label: 'Total Articles',
      value: allArticles.length,
      color: 'blue' as const,
    },
    {
      icon: <Sparkles className="h-5 w-5" />,
      label: 'Sources',
      value: Object.keys(groupedNews).length,
      color: 'cyan' as const,
    },
    {
      icon: <Zap className="h-5 w-5" />,
      label: 'Live Updates',
      value: 'Deactive',
      color: 'amber' as const,
    },
  ];

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Floating NavBar */}
      <FloatingNavBar />

      {/* Main Content */}
      <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold bg-linear-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
              Your AI News Feed
            </h1>
            <p className="text-slate-400">
              Stay updated with the latest breakthroughs in artificial
              intelligence
            </p>
          </motion.div>

          {/* Loading State */}
          {newsLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8 p-6 bg-blue-600/10 border border-blue-600/30 rounded-lg backdrop-blur-sm flex items-center space-x-3"
            >
              <Loader className="h-5 w-5 text-blue-400 animate-spin" />
              <p className="text-blue-300">
                Loading your personalized news feed...
              </p>
            </motion.div>
          )}

          {/* Error Banner (separate from empty state) */}
          {!newsLoading && newsError && allArticles.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8"
            >
              <Card className="bg-yellow-900/20 border-yellow-700/50">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-yellow-300 font-semibold">
                        Note: Could not fetch news
                      </p>
                      <p className="text-yellow-400/80 text-sm mt-1">
                        {newsError.message}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Stats Grid - Only show when there are articles */}
          {!newsLoading && allArticles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <StatsCard {...stat} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Filter Bar - Only show when there are articles */}
          {!newsLoading && allArticles.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8 p-4 bg-slate-800/40 border border-slate-700/50 rounded-lg backdrop-blur-sm"
            >
              <FilterBar
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                filters={filters}
              />
            </motion.div>
          )}

          {/* News Feed */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {!newsLoading && allArticles.length === 0 ? (
              <EmptyState type={getEmptyStateType()} onRetry={getTodayNews} />
            ) : (
              <div>
                {Object.entries(groupedNews).map(
                  ([source, articles], index) => {
                    const config =
                      sourceConfig[source as keyof typeof sourceConfig];

                    return (
                      <motion.div
                        key={source}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                      >
                        <NewsSection
                          title={config.label}
                          news={articles.map((article, idx) => ({
                            id: idx,
                            title: article.title,
                            url: article.url,
                            description: article.description,
                            category: article.category_id || 'Uncategorized',
                            subcategory: article.subcategory_id || 'General',
                          }))}
                          onRemove={(id) => {
                            const article = articles[id];
                            if (article && article.url) {
                              handleRemoveArticle(article.url);
                            }
                          }}
                          icon={config.icon}
                        />
                      </motion.div>
                    );
                  },
                )}
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
