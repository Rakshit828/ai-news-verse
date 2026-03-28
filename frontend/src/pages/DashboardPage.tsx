// src/pages/DashboardPage.tsx
import { useTodayNews, useCategories, useUserCategories } from "@/hooks/useNews";
import { useWebSocketContext } from "@/context/WebSocketContext";
import type { Article, NewsSource } from "@/types/news.types";
import { Newspaper, ExternalLink, Inbox, Tag, Zap } from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";


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
  subcategoryTitle,
  isLive = false,
}: {
  article: Article;
  categoryTitle?: string;
  subcategoryTitle?: string;
  isLive?: boolean;
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
    <div className={`article-card ${isLive ? "article-card--live" : ""}`}>
      <div className="article-card-header">
        <div className="article-meta-group">
          <div className="article-badges-row">
            <span
              className="article-source-badge"
              style={{ color: cfg.color, background: cfg.bg }}
            >
              {cfg.label}
            </span>
            {isLive && (
              <span className="article-live-badge">
                <Zap size={10} />
                LIVE
              </span>
            )}
          </div>
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
  const { liveArticles } = useWebSocketContext();

  const [filterSource, setFilterSource] = useState<NewsSource | "ALL">("ALL");

  // Track which live article GUIDs (urls) have been "seen" for animation
  const seenLiveRef = useRef<Set<string>>(new Set());
  const [newLiveUrls, setNewLiveUrls] = useState<Set<string>>(new Set());

  // When new live articles arrive, flag them as "new" for the slide-in animation
  useEffect(() => {
    const fresh = new Set<string>();
    liveArticles.forEach((a) => {
      if (!seenLiveRef.current.has(a.url)) {
        fresh.add(a.url);
        seenLiveRef.current.add(a.url);
      }
    });
    if (fresh.size > 0) {
      setNewLiveUrls((prev) => new Set([...prev, ...fresh]));
      // After animation remove the "new" flag
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setTimeout(() => {
        setNewLiveUrls((prev) => {
          const next = new Set(prev);
          fresh.forEach((u) => next.delete(u));
          return next;
        });
      }, 800);
    }
  }, [liveArticles]);


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

  // Flatten all REST-fetched sources into one list
  const restArticles: Article[] = useMemo(() => {
    if (!data) return [];

    // Support both direct data and nested data.data structure just in case
    const articlesSource = (data && "data" in data ? (data as Record<string, unknown>).data : data) as typeof data;

    return [
      ...(Array.isArray(articlesSource.google) ? articlesSource.google : []),
      ...(Array.isArray(articlesSource.anthropic) ? articlesSource.anthropic : []),
      ...(Array.isArray(articlesSource.openai) ? articlesSource.openai : []),
      ...(Array.isArray(articlesSource.hackernoon) ? articlesSource.hackernoon : []),
    ];
  }, [data]);

  // Build a set of live-article URLs for dedup
  const liveUrlSet = useMemo(() => new Set(liveArticles.map((a) => a.url)), [liveArticles]);

  // Combine: live articles first, then REST articles (deduplicated)
  const allArticles = useMemo(() => {
    const deduped = restArticles.filter((a) => !liveUrlSet.has(a.url));
    return [...liveArticles, ...deduped];
  }, [liveArticles, restArticles, liveUrlSet]);

  // Filter based on selected source
  const filteredArticles = useMemo(() => {
    if (filterSource === "ALL") return allArticles;
    return allArticles.filter(a => a.source === filterSource);
  }, [allArticles, filterSource]);
  return (
    <div className="dashboard-page animate-fade-in">
      <header className="page-header">
        <div className="page-title-group">
          <div className="page-icon-wrapper">
            <Newspaper size={24} className="page-icon" />
          </div>
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Your personalized intelligence feed</p>
          </div>
        </div>
      </header>

      <nav className="filter-bar-container">
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
      </nav>

      {isLoading && (
        <div className="articles-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {isError && (
        <div className="status-container animate-slide-up">
          <div className="error-card glass">
            <p>Failed to load news. Please check your connection and try again.</p>
            <button onClick={() => window.location.reload()} className="retry-btn">Retry</button>
          </div>
        </div>
      )}

      {!isLoading && !isError && allArticles.length > 0 && filteredArticles.length === 0 && (
        <div className="status-container animate-slide-up">
          <div className="empty-state glass">
            <Inbox size={40} className="empty-icon" />
            <h3>No matching articles</h3>
            <p>
              No news found from {SOURCE_CONFIG[filterSource as NewsSource].label} for your selected categories.
            </p>
            <button onClick={() => setFilterSource("ALL")} className="setup-link" style={{ border: 'none', cursor: 'pointer' }}>
              Show all sources
            </button>
          </div>
        </div>
      )}

      {!isLoading && !isError && allArticles.length === 0 && (
        <div className="status-container animate-slide-up">
          <div className="empty-state glass">
            <Inbox size={40} className="empty-icon" />
            <h3>Your feed is quiet</h3>
            <p>
              Configure your categories in the Personalization page to start receiving news.
            </p>
            <a href="/personalization" className="setup-link">
              Configure Categories
            </a>
          </div>
        </div>
      )}

      {!isLoading && filteredArticles.length > 0 && (
        <div className="articles-grid">
          {filteredArticles.map((article, i) => {
            const isLive = liveUrlSet.has(article.url);
            const isNew = newLiveUrls.has(article.url);
            return (
              <div
                key={`${article.url}-${i}`}
                className={`article-wrapper ${isNew ? "article-wrapper--slide-in" : ""}`}
                style={{ "--delay": `${Math.min(i * 0.05, 1)}s` } as React.CSSProperties}
              >
                <ArticleCard
                  article={article}
                  isLive={isLive}
                  categoryTitle={article.category_id ? categoryMap[article.category_id] : undefined}
                  subcategoryTitle={article.subcategory_id ? subcategoryMap[article.subcategory_id] : undefined}
                />
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .dashboard-page {
          max-width: 1400px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
        }

        .page-title-group {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .page-icon-wrapper {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-md);
          background: var(--color-accent-light);
          color: var(--color-accent);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-sm);
        }

        .page-title {
          font-size: 32px;
          font-weight: 850;
          color: var(--color-text-primary);
          line-height: 1.1;
          letter-spacing: -1px;
        }

        .page-subtitle {
          font-size: 15px;
          color: var(--color-text-secondary);
          margin-top: 4px;
          font-weight: 500;
        }


        .filter-bar-container {
          position: sticky;
          top: 0;
          z-index: 20;
          background: var(--color-bg-primary);
          margin: 0 -40px 32px;
          padding: 8px 40px;
        }

        .filter-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-top: 4px;
          padding-bottom: 4px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .filter-bar::-webkit-scrollbar {
          display: none;
        }

        .filter-btn {
          padding: 10px 20px;
          border-radius: var(--radius-full);
          font-size: 14px;
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
          transform: translateY(-1px);
        }

        .filter-btn.active {
          background: var(--active-bg, var(--color-accent));
          color: var(--active-color, white);
          border-color: transparent;
          box-shadow: var(--shadow-md);
        }

        .articles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(380px, 100%), 1fr));
          gap: 24px;
          align-items: start;
        }

        .article-wrapper {
          opacity: 1;
          will-change: transform, opacity;
        }

        /* ── Slide-in animation for new live articles ── */
        .article-wrapper--slide-in {
          animation: liveSlideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes liveSlideIn {
          0% {
            opacity: 0;
            transform: translateY(-20px) scale(0.97);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .article-card {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border-primary);
          border-radius: var(--radius-lg);
          padding: 24px;
          box-shadow: var(--shadow-card);
          transition: all var(--transition-normal);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .article-card:hover {
          box-shadow: var(--shadow-card-hover);
          transform: translateY(-4px);
          border-color: var(--color-accent-glow);
        }

        /* ── Live article card glow ── */
        .article-card--live {
          border-color: rgba(34, 197, 94, 0.3);
          box-shadow: var(--shadow-card), 0 0 20px rgba(34, 197, 94, 0.08);
        }

        .article-card--live:hover {
          border-color: rgba(34, 197, 94, 0.5);
          box-shadow: var(--shadow-card-hover), 0 0 32px rgba(34, 197, 94, 0.15);
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
          gap: 8px;
        }

        .article-badges-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .article-source-badge {
          align-self: flex-start;
          font-size: 11px;
          font-weight: 800;
          padding: 4px 12px;
          border-radius: var(--radius-sm);
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        /* ── LIVE badge ── */
        .article-live-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 800;
          padding: 3px 10px;
          border-radius: var(--radius-sm);
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #22c55e;
          background: rgba(34, 197, 94, 0.12);
          border: 1px solid rgba(34, 197, 94, 0.25);
          animation: livePulse 2s ease-in-out infinite;
        }

        @keyframes livePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.65; }
        }

        .article-category-info {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--color-text-tertiary);
          font-weight: 600;
        }

        .article-category-info span {
           display: inline-block;
           max-width: 240px;
           overflow: hidden;
           text-overflow: ellipsis;
           white-space: nowrap;
        }

        .article-link {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-text-tertiary);
          background: var(--color-bg-tertiary);
          transition: all var(--transition-fast);
        }

        .article-link:hover {
          background: var(--color-accent);
          color: white;
          transform: rotate(45deg);
        }

        .article-title {
          font-size: 17px;
          font-weight: 700;
          color: var(--color-text-primary);
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          word-break: break-word;
        }

        .article-desc {
          font-size: 14px;
          color: var(--color-text-secondary);
          line-height: 1.6;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          word-break: break-word;
        }

        /* Status States */
        .status-container {
          display: flex;
          justify-content: center;
          padding: 80px 20px;
        }

        .error-card, .empty-state {
          max-width: 480px;
          width: 100%;
          padding: 40px;
          border-radius: var(--radius-xl);
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .empty-icon {
          color: var(--color-accent);
          opacity: 0.5;
        }

        .empty-state h3 {
          font-size: 20px;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .empty-state p {
          font-size: 15px;
          color: var(--color-text-secondary);
          line-height: 1.6;
        }

        .setup-link {
          margin-top: 8px;
          color: var(--color-accent);
          font-weight: 700;
          text-decoration: none;
          padding: 8px 24px;
          border-radius: var(--radius-full);
          background: var(--color-accent-light);
          transition: all var(--transition-fast);
        }

        .setup-link:hover {
          background: var(--color-accent);
          color: white;
        }

        /* Skeleton loading */
        .skeleton-line {
          border-radius: var(--radius-sm);
          background: var(--color-bg-active);
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .skeleton-badge { width: 100px; height: 24px; }
        .skeleton-title { width: 90%; height: 28px; margin-top: 8px; }
        .skeleton-desc { width: 100%; height: 16px; }
        .skeleton-desc.short { width: 60%; }

        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }

        @media (max-width: 768px) {
          .page-header { margin-bottom: 20px; }
          .page-title { font-size: 24px; }
          .page-subtitle { font-size: 13px; }
          .page-icon-wrapper { width: 42px; height: 42px; }
          .page-icon-wrapper .page-icon { width: 20px; height: 20px; }
          .page-title-group { gap: 12px; }
          .filter-bar-container { margin: 0 -16px 20px; padding: 6px 16px; }
          .filter-btn { padding: 8px 14px; font-size: 13px; }
          .articles-grid { grid-template-columns: 1fr; gap: 16px; }
          .article-card { padding: 18px; gap: 12px; }
          .article-card:hover { transform: none; }
          .article-title { font-size: 16px; }
          .article-desc { font-size: 13px; -webkit-line-clamp: 2; }
          .status-container { padding: 40px 16px; }
          .error-card, .empty-state { padding: 28px 20px; }
          .live-counter { font-size: 12px; padding: 6px 12px; }
        }

        @media (max-width: 480px) {
          .page-header { flex-direction: column; align-items: flex-start; gap: 8px; }
          .filter-btn { padding: 6px 12px; font-size: 12px; }
          .article-card { padding: 14px; }
          .article-title { font-size: 15px; }
          .article-source-badge { font-size: 10px; padding: 3px 8px; }
        }
      `}</style>
    </div>
  );
}
