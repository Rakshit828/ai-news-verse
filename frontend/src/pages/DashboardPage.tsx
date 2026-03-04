// src/pages/DashboardPage.tsx
import { useTodayNews, useCategories, useUserCategories } from "@/hooks/useNews";
import type { Article, NewsSource } from "@/types/news.types";
import { Newspaper, ExternalLink, Inbox, Tag } from "lucide-react";
import { useState, useMemo } from "react";

const SOURCE_CONFIG: Record<
  NewsSource,
  { label: string; color: string; bg: string }
> = {
  GOOGLE: { label: "Google", color: "#4285F4", bg: "rgba(66,133,244,0.1)" },
  ANTHROPIC: { label: "Anthropic", color: "#D4A574", bg: "rgba(212,165,116,0.1)" },
  OPENAI: { label: "OpenAI", color: "#10A37F", bg: "rgba(16,163,127,0.1)" },
  HACKERNOON: { label: "HackerNoon", color: "#00FF00", bg: "rgba(0,255,0,0.08)" },
};

function ArticleCard({
  article,
  categoryTitle,
  subcategoryTitle
}: {
  article: Article;
  categoryTitle?: string;
  subcategoryTitle?: string;
}) {
  const cfg = SOURCE_CONFIG[article.source] ?? {
    label: article.source,
    color: "var(--color-text-secondary)",
    bg: "var(--color-bg-tertiary)",
  };

  // Google News requirement: "simply write: No Description"
  // We'll show "No Description" for Google News sources specifically.
  const displayDescription = article.source === 'GOOGLE' ? "No Description" : article.description;

  return (
    <div className="article-card">
      <div className="article-card-header">
        <div className="article-meta-group">
          <span
            className="article-source-badge"
            style={{ color: cfg.color, background: cfg.bg }}
          >
            {cfg.label}
          </span>
          {(categoryTitle || subcategoryTitle) && (
            <div className="article-category-info">
              <Tag size={10} />
              <span>{categoryTitle}{subcategoryTitle ? ` › ${subcategoryTitle}` : ''}</span>
            </div>
          )}
        </div>
        {article.url && (
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="article-link"
            aria-label={`Read "${article.title}" on ${cfg.label}`}
          >
            <ExternalLink size={14} />
          </a>
        )}
      </div>
      <h3 className="article-title">{article.title}</h3>
      {displayDescription && (
        <p className="article-desc">{displayDescription}</p>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="article-card skeleton">
      <div className="skeleton-line skeleton-badge" />
      <div className="skeleton-line skeleton-title" />
      <div className="skeleton-line skeleton-desc" />
      <div className="skeleton-line skeleton-desc short" />
    </div>
  );
}

export default function DashboardPage() {
  const { data, isLoading, isError } = useTodayNews();
  const { data: categoriesData } = useCategories();
  const { data: userCategoriesData } = useUserCategories();

  const [filterSource, setFilterSource] = useState<NewsSource | "ALL">("ALL");

  // Mapping for ID to Title
  const { categoryMap, subcategoryMap } = useMemo(() => {
    const cMap: Record<string, string> = {};
    const sMap: Record<string, string> = {};

    const allCats = [
      ...(categoriesData?.categories_data || []),
      ...(userCategoriesData?.categories_data || [])
    ];

    allCats.forEach(cat => {
      cMap[cat.category_id] = cat.title;
      cat.subcategories?.forEach(sub => {
        sMap[sub.subcategory_id] = sub.title;
      });
    });

    return { categoryMap: cMap, subcategoryMap: sMap };
  }, [categoriesData, userCategoriesData]);

  // Flatten all sources into one list
  const allArticles: Article[] = data
    ? [
      ...(data.google ?? []),
      ...(data.anthropic ?? []),
      ...(data.openai ?? []),
      ...(data.hackernoon ?? []),
    ]
    : [];

  // Filter based on selected source
  const filteredArticles = useMemo(() => {
    if (filterSource === "ALL") return allArticles;
    return allArticles.filter(a => a.source === filterSource);
  }, [allArticles, filterSource]);

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div className="page-title-group">
          <Newspaper size={28} className="page-icon" />
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Your personalized AI news feed</p>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <button
          className={`filter-btn ${filterSource === "ALL" ? "active" : ""}`}
          onClick={() => setFilterSource("ALL")}
        >
          All Sources
        </button>
        {Object.entries(SOURCE_CONFIG).map(([key, cfg]) => (
          <button
            key={key}
            className={`filter-btn ${filterSource === key ? "active" : ""}`}
            style={{
              "--active-color": cfg.color,
              "--active-bg": cfg.bg
            } as React.CSSProperties}
            onClick={() => setFilterSource(key as NewsSource)}
          >
            {cfg.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="articles-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {isError && (
        <div className="empty-state">
          <p className="empty-state-text">
            Failed to load news. Please try again later.
          </p>
        </div>
      )}

      {!isLoading && !isError && filteredArticles.length === 0 && (
        <div className="empty-state">
          <Inbox size={48} className="empty-state-icon" />
          <p className="empty-state-text">
            {filterSource === "ALL"
              ? "No news yet. Configure your categories in the Personalization page to start receiving news."
              : `No news found from ${SOURCE_CONFIG[filterSource as NewsSource].label} yet.`}
          </p>
          {filterSource === "ALL" && (
            <a href="/personalization" className="empty-state-link">
              Go to Personalization
            </a>
          )}
        </div>
      )}

      {!isLoading && filteredArticles.length > 0 && (
        <div className="articles-grid">
          {filteredArticles.map((article, i) => (
            <ArticleCard
              key={`${article.url}-${i}`}
              article={article}
              categoryTitle={article.category_id ? categoryMap[article.category_id] : undefined}
              subcategoryTitle={article.subcategory_id ? subcategoryMap[article.subcategory_id] : undefined}
            />
          ))}
        </div>
      )}

      <style>{`
        .dashboard-page {
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        .filter-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 32px;
          padding-bottom: 4px;
          overflow-x: auto;
          scrollbar-width: hide;
          -ms-overflow-style: none;
        }

        .filter-bar::-webkit-scrollbar {
          display: none;
        }

        .filter-btn {
          padding: 8px 18px;
          border-radius: var(--radius-full);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
          border: 1px solid var(--color-border-primary);
          background: var(--color-bg-secondary);
          color: var(--color-text-secondary);
          white-space: nowrap;
        }

        .filter-btn:hover {
          border-color: var(--color-accent);
          color: var(--color-text-primary);
          background: var(--color-bg-hover);
        }

        .filter-btn.active {
          background: var(--active-bg, var(--color-accent));
          color: var(--active-color, white);
          border-color: var(--active-color, var(--color-accent));
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .page-title-group {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .page-icon {
          color: var(--color-accent);
        }

        .page-title {
          font-size: 28px;
          font-weight: 800;
          color: var(--color-text-primary);
          line-height: 1.2;
        }

        .page-subtitle {
          font-size: 14px;
          color: var(--color-text-secondary);
          margin-top: 2px;
        }

        .articles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
        }

        .article-card {
          background: var(--gradient-card);
          border: 1px solid var(--color-border-primary);
          border-radius: var(--radius-lg);
          padding: 20px;
          box-shadow: var(--shadow-card);
          transition: all var(--transition-normal);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .article-card:hover {
          box-shadow: var(--shadow-card-hover);
          transform: translateY(-2px);
          border-color: var(--color-accent-glow);
        }

        .article-card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .article-meta-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .article-source-badge {
          align-self: flex-start;
          font-size: 10px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: var(--radius-full);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .article-category-info {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--color-text-tertiary);
          font-weight: 500;
        }

        .article-category-info span {
           display: inline-block;
           max-width: 200px;
           overflow: hidden;
           text-overflow: ellipsis;
           white-space: nowrap;
        }

        .article-link {
          width: 30px;
          height: 30px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-tertiary);
          transition: all var(--transition-fast);
        }

        .article-link:hover {
          background: var(--color-bg-hover);
          color: var(--color-accent);
        }

        .article-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--color-text-primary);
          line-height: 1.4;
        }

        .article-desc {
          font-size: 13px;
          color: var(--color-text-secondary);
          line-height: 1.6;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Skeleton loading */
        .article-card.skeleton {
          pointer-events: none;
        }

        .skeleton-line {
          border-radius: var(--radius-sm);
          background: var(--color-bg-hover);
          animation: shimmer 1.5s infinite ease-in-out;
        }

        .skeleton-badge {
          width: 80px;
          height: 24px;
        }

        .skeleton-title {
          width: 90%;
          height: 20px;
        }

        .skeleton-desc {
          width: 100%;
          height: 14px;
        }

        .skeleton-desc.short {
          width: 60%;
        }

        @keyframes shimmer {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }

        /* Empty state */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 24px;
          text-align: center;
        }

        .empty-state-icon {
          color: var(--color-text-tertiary);
          margin-bottom: 16px;
        }

        .empty-state-text {
          font-size: 15px;
          color: var(--color-text-secondary);
          max-width: 400px;
          line-height: 1.6;
        }

        .empty-state-link {
          color: var(--color-accent);
          text-decoration: none;
          font-weight: 600;
        }

        .empty-state-link:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .page-title {
            font-size: 22px;
          }
          .articles-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </d