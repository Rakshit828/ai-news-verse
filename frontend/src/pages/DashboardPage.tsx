// src/pages/DashboardPage.tsx
import { useInfiniteTodayNews } from "@/hooks/useNews";
import { useWebSocketContext } from "@/context/WebSocketContext";
import type { NewsResponse } from "@/types/news.types";
import { Newspaper, ExternalLink, Inbox, Tag, Zap, Clock, Share2, Loader2, Calendar } from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { formatCategoryName } from "@/utils/format";

const SOURCE_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  GOOGLE: { label: "Google", color: "#4285F4", bg: "rgba(66,133,244,0.1)" },
  ANTHROPIC: { label: "Anthropic", color: "#D4A574", bg: "rgba(212,165,116,0.1)" },
  OPENAI: { label: "OpenAI", color: "#10A37F", bg: "rgba(16,163,127,0.1)" },
  HACKERNOON: { label: "HackerNoon", color: "#00FF00", bg: "rgba(0,255,0,0.08)" },
};

function formatTimeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return date.toLocaleDateString();
}



function ArticleCard({
  article,
  isLive = false,
}: {
  article: NewsResponse;
  isLive?: boolean;
}) {
  const cfg = SOURCE_CONFIG[article.source?.toUpperCase() || ""] ?? {
    label: article.source || "Unknown",
    color: "var(--color-text-secondary)",
    bg: "var(--color-bg-tertiary)",
  };

  return (
    <div className={`article-card ${isLive ? "article-card--live" : ""}`}>
      {article.featured_image && (
        <div className="article-image-container">
          <img 
            src={article.featured_image} 
            alt={article.title} 
            className="article-image" 
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="article-image-overlay" />
        </div>
      )}
      
      <div className="article-card-content">
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
            <div className="article-secondary-meta">
              <div className="article-category-info">
                <Tag size={12} />
                <span>{formatCategoryName(article.subcategory?.name || "Uncategorized")}</span>
              </div>
              <div className="article-time">
                <Clock size={12} />
                <span>{formatTimeAgo(article.published_on)}</span>
              </div>
            </div>
          </div>
        </div>

        <h3 className="article-title">{article.title}</h3>
        
        {article.summary && (
          <p className="article-desc">{article.summary}</p>
        )}

        <div className="article-card-footer">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="article-action-btn primary"
          >
            Read Article
            <ExternalLink size={14} />
          </a>
          <button className="article-action-btn secondary" aria-label="Share">
            <Share2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="article-card skeleton">
      <div className="skeleton-image" />
      <div className="article-card-content">
        <div className="skeleton-line skeleton-badge" />
        <div className="skeleton-line skeleton-title" />
        <div className="skeleton-line skeleton-desc" />
        <div className="skeleton-line skeleton-desc short" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [filterSource, setFilterSource] = useState<string | "ALL">("ALL");
  const [cutoffHours, setCutoffHours] = useState(24);
  const [isCustomDate, setIsCustomDate] = useState(false);

  const handleDateChange = (dateStr: string) => {
    if (!dateStr) return;
    const selectedDate = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - selectedDate.getTime();
    const diffHours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
    setCutoffHours(diffHours);
  };

  const getDateFromHours = (hours: number) => {
    const d = new Date();
    d.setHours(d.getHours() - hours);
    return d.toISOString().split('T')[0];
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch
  } = useInfiniteTodayNews({
    cutoff: cutoffHours,
  });

  const { ref: loadMoreRef, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const { liveArticles } = useWebSocketContext();

  // Seen articles for animations
  const seenLiveRef = useRef<Set<string>>(new Set());
  const [newLiveUrls, setNewLiveUrls] = useState<Set<string>>(new Set());

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
      setTimeout(() => {
        setNewLiveUrls((prev) => {
          const next = new Set(prev);
          fresh.forEach((u) => next.delete(u));
          return next;
        });
      }, 800);
    }
  }, [liveArticles]);

  const restArticles = useMemo(() => {
    return data?.pages.flatMap((page) => page.news) || [];
  }, [data]);

  const liveUrlSet = useMemo(() => new Set(liveArticles.map((a) => a.url)), [liveArticles]);

  const allArticles = useMemo(() => {
    const articleMap = new Map<string, NewsResponse>();
    restArticles.forEach((a) => {
      if (a.url) articleMap.set(a.url, a);
    });
    liveArticles.forEach((a) => {
      if (a.url) articleMap.set(a.url, a);
    });
    return Array.from(articleMap.values()).sort((a, b) => 
      new Date(b.published_on).getTime() - new Date(a.published_on).getTime()
    );
  }, [liveArticles, restArticles]);

  const filteredArticles = useMemo(() => {
    if (filterSource === "ALL") return allArticles;
    return allArticles.filter(a => a.source?.toUpperCase() === filterSource.toUpperCase());
  }, [allArticles, filterSource]);

  return (
    <div className="dashboard-page animate-fade-in">
      <header className="page-header">
        <div className="page-title-group">
          <div className="page-icon-wrapper">
            <Newspaper size={24} className="page-icon" />
          </div>
          <div>
            <h1 className="page-title">Intelligence Feed</h1>
            <p className="page-subtitle">Real-time curated insights for your interests</p>
          </div>
        </div>
        
        <div className="header-actions">
          <div className="timeframe-filter-group">
            <div className="timeframe-presets">
               <select 
                 className="cutoff-select"
                 value={isCustomDate ? "custom" : cutoffHours}
                 onChange={(e) => {
                   const val = e.target.value;
                   if (val === "custom") {
                     setIsCustomDate(true);
                   } else {
                     setIsCustomDate(false);
                     setCutoffHours(Number(val));
                   }
                 }}
               >
                 <optgroup label="Recent">
                   <option value={6}>Last 6 Hours</option>
                   <option value={12}>Last 12 Hours</option>
                   <option value={24}>Last 24 Hours</option>
                   <option value={48}>Last 48 Hours</option>
                 </optgroup>
                 <optgroup label="History">
                   <option value={24 * 7}>Last 7 Days</option>
                   <option value={24 * 14}>Last 14 Days</option>
                   <option value={24 * 30}>Last 30 Days</option>
                 </optgroup>
                 <option value="custom">Custom Date...</option>
               </select>
            </div>

            {isCustomDate && (
              <div className="custom-date-picker animate-fade-in">
                <Calendar size={14} className="date-icon" />
                <input 
                  type="date" 
                  className="date-input"
                  max={new Date().toISOString().split('T')[0]}
                  value={getDateFromHours(cutoffHours)}
                  onChange={(e) => handleDateChange(e.target.value)}
                />
              </div>
            )}
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
              onClick={() => setFilterSource(key)}
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
            <button onClick={() => refetch()} className="retry-btn">Retry</button>
          </div>
        </div>
      )}

      {!isLoading && !isError && filteredArticles.length === 0 && (
        <div className="status-container animate-fade-in">
          <div className="empty-state-card glass">
            <div className="empty-state-icon-wrapper">
              <Inbox size={40} />
            </div>
            <h3 className="empty-state-title">Your feed is quiet</h3>
            <p className="empty-state-text">
              We couldn't find any {filterSource === "ALL" ? "" : formatCategoryName(filterSource)} news matches for your current timeframe.
            </p>
            <div className="empty-state-actions">
              <button 
                onClick={() => {
                  setFilterSource("ALL");
                  setCutoffHours(48);
                }}
                className="empty-action-btn secondary"
              >
                Reset Filters
              </button>
              <a href="/personalization" className="empty-action-btn primary">
                Refine My Interests
              </a>
            </div>
          </div>
        </div>
      )}

      {!isLoading && filteredArticles.length > 0 && (
        <>
          <div className="articles-grid">
            {filteredArticles.map((article, i) => {
              const isLive = liveUrlSet.has(article.url);
              const isNew = newLiveUrls.has(article.url);
              return (
                <div
                  key={article.url}
                  className={`article-wrapper ${isNew ? "article-wrapper--slide-in" : ""}`}
                  style={{ "--delay": `${Math.min(i * 0.05, 1)}s` } as React.CSSProperties}
                >
                  <ArticleCard
                    article={article}
                    isLive={isLive}
                  />
                </div>
              );
            })}
          </div>

          <div ref={loadMoreRef} className="load-more-trigger">
            {isFetchingNextPage ? (
              <div className="loading-spinner-container">
                <Loader2 className="spinner" />
                <span>Fetching more insights...</span>
              </div>
            ) : hasNextPage ? (
              <span className="load-more-text">Scrolling for more...</span>
            ) : (
              <div className="end-of-feed">
                <div className="divider" />
                <span>You've reached the end of today's feed</span>
                <div className="divider" />
              </div>
            )}
          </div>
        </>
      )}

      <style>{`
        .dashboard-page {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
          padding-top: 20px;
        }

        .page-title-group {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .page-icon-wrapper {
          width: 56px;
          height: 56px;
          border-radius: 18px;
          background: linear-gradient(135deg, var(--color-accent) 0%, #6366f1 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.4);
        }

        .page-title {
          font-size: 34px;
          font-weight: 850;
          color: var(--color-text-primary);
          line-height: 1.1;
          letter-spacing: -1px;
        }

        .page-subtitle {
          font-size: 15px;
          color: var(--color-text-secondary);
          margin-top: 6px;
          font-weight: 500;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .timeframe-filter-group {
          display: flex;
          align-items: center;
          gap: 12px;
          background: transparent;
          padding: 2px;
          border-radius: 16px;
          border: 1px solid var(--color-border-primary);
          transition: all 0.2s;
        }

        .timeframe-filter-group:focus-within {
          border-color: var(--color-accent);
          box-shadow: 0 0 0 3px var(--color-accent-glow);
        }

        .custom-date-picker {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          border-left: 1px solid var(--color-border-primary);
        }

        .date-icon {
          color: var(--color-accent);
        }

        .date-input {
          background: transparent;
          border: none;
          color: var(--color-text-primary);
          font-size: 13px;
          font-weight: 600;
          outline: none;
          cursor: pointer;
        }

        .cutoff-select {
          background: var(--color-bg-secondary);
          border: none;
          color: var(--color-text-primary);
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          outline: none;
          padding: 6px 12px;
          border-radius: 12px;
        }

        .cutoff-select option, 
        .cutoff-select optgroup {
          background: var(--color-bg-card);
          color: var(--color-text-primary);
          padding: 8px;
        }

        .cutoff-select:hover {
          background: var(--color-bg-hover);
        }

        .filter-bar-container {
          position: sticky;
          top: 0;
          z-index: 50;
          background: var(--color-bg-glass);
          backdrop-filter: blur(12px);
          margin: 0 -20px 32px;
          padding: 12px 20px;
          border-bottom: 1px solid var(--color-border-primary);
        }

        .filter-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .filter-bar::-webkit-scrollbar { display: none; }

        .filter-btn {
          padding: 10px 22px;
          border-radius: 100px;
          font-size: 14px;
          font-weight: 650;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid var(--color-border-primary);
          background: var(--color-bg-secondary);
          color: var(--color-text-secondary);
          white-space: nowrap;
        }

        .filter-btn:hover {
          background: var(--color-bg-hover);
          color: var(--color-text-primary);
          transform: translateY(-1px);
        }

        .filter-btn.active {
          background: var(--active-bg, var(--color-accent));
          color: var(--active-color, white);
          border-color: transparent;
          box-shadow: 0 4px 12px -2px rgba(var(--active-color-rgb, 99, 102, 241), 0.3);
        }

        .articles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(min(400px, 100%), 1fr));
          gap: 28px;
          align-items: start;
        }

        .article-card {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border-primary);
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .article-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          border-color: var(--color-accent);
        }

        .article-image-container {
          position: relative;
          width: 100%;
          padding-top: 56.25%; /* 16:9 Aspect Ratio */
          background: var(--color-bg-tertiary);
          overflow: hidden;
        }

        .article-image {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .article-card:hover .article-image {
          transform: scale(1.05);
        }

        .article-image-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 40%;
          background: linear-gradient(to top, rgba(0,0,0,0.4), transparent);
        }

        .article-card-content {
          padding: 24px;
          display: flex;
          flex-direction: column;
          flex-grow: 1;
        }

        .article-meta-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }

        .article-badges-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .article-source-badge {
          font-size: 11px;
          font-weight: 800;
          padding: 5px 14px;
          border-radius: 8px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .article-live-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          font-weight: 900;
          padding: 4px 10px;
          border-radius: 8px;
          background: #ef4444;
          color: white;
          animation: pulse 1.5s infinite;
        }

        .article-secondary-meta {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .article-category-info, .article-time {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--color-text-tertiary);
          font-weight: 600;
        }

        .article-title {
          font-size: 20px;
          font-weight: 750;
          color: var(--color-text-primary);
          line-height: 1.4;
          margin-bottom: 12px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          transition: color 0.2s;
        }

        .article-card:hover .article-title {
          color: var(--color-accent);
        }

        .article-desc {
          font-size: 15px;
          color: var(--color-text-secondary);
          line-height: 1.6;
          margin-bottom: 24px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .article-card-footer {
          margin-top: auto;
          display: flex;
          align-items: center;
          gap: 12px;
          padding-top: 20px;
          border-top: 1px solid var(--color-border-primary);
        }

        .article-action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 42px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          transition: all 0.2s;
          cursor: pointer;
          text-decoration: none;
        }

        .article-action-btn.primary {
          background: var(--color-accent);
          color: white;
          padding: 0 20px;
          flex-grow: 1;
        }

        .article-action-btn.primary:hover {
          background: #4f46e5;
          transform: translateY(-1px);
        }

        .article-action-btn.secondary {
          width: 42px;
          background: var(--color-bg-secondary);
          color: var(--color-text-secondary);
          border: 1px solid var(--color-border-primary);
        }

        .article-action-btn.secondary:hover {
          background: var(--color-bg-hover);
          color: var(--color-text-primary);
          border-color: var(--color-text-tertiary);
        }

        .empty-state-card {
          width: 100%;
          max-width: 500px;
          margin: 60px auto;
          padding: 48px 32px;
          border-radius: 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          border: 1px solid var(--color-border-primary);
        }

        .empty-state-icon-wrapper {
          width: 80px;
          height: 80px;
          border-radius: 24px;
          background: var(--color-bg-secondary);
          color: var(--color-text-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 24px;
          border: 1px solid var(--color-border-primary);
        }

        .empty-state-title {
          font-size: 24px;
          font-weight: 850;
          color: var(--color-text-primary);
          margin-bottom: 12px;
          letter-spacing: -0.5px;
        }

        .empty-state-text {
          font-size: 16px;
          color: var(--color-text-secondary);
          line-height: 1.6;
          max-width: 320px;
          margin-bottom: 32px;
        }

        .empty-state-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
        }

        .empty-action-btn {
          flex: 1;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 14px;
          font-size: 14px;
          font-weight: 750;
          transition: all 0.2s;
          cursor: pointer;
          text-decoration: none;
        }

        .empty-action-btn.primary {
          background: var(--color-accent);
          color: white;
          box-shadow: 0 4px 12px var(--color-accent-glow);
        }

        .empty-action-btn.primary:hover {
          background: var(--color-accent-hover);
          transform: translateY(-1px);
        }

        .empty-action-btn.secondary {
          background: var(--color-bg-secondary);
          color: var(--color-text-primary);
          border: 1px solid var(--color-border-primary);
        }

        .empty-action-btn.secondary:hover {
          background: var(--color-bg-hover);
          border-color: var(--color-text-tertiary);
        }

        .load-more-trigger {
          padding: 60px 0;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .loading-spinner-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          color: var(--color-text-secondary);
          font-weight: 600;
        }

        .spinner {
          width: 32px;
          height: 32px;
          color: var(--color-accent);
          animation: rotate 1s linear infinite;
        }

        .end-of-feed {
          display: flex;
          align-items: center;
          gap: 20px;
          width: 100%;
          max-width: 600px;
          color: var(--color-text-tertiary);
          font-weight: 600;
          font-size: 14px;
        }

        .end-of-feed .divider {
          flex-grow: 1;
          height: 1px;
          background: var(--color-border-primary);
        }

        .skeleton-image {
          width: 100%;
          padding-top: 56.25%;
          background: var(--color-bg-tertiary);
          animation: pulse 2s infinite;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 0.3; }
          100% { opacity: 0.6; }
        }

        @media (max-width: 768px) {
          .page-title { font-size: 26px; }
          .page-icon-wrapper { width: 46px; height: 46px; border-radius: 14px; }
          .articles-grid { grid-template-columns: 1fr; gap: 20px; }
          .article-card { border-radius: 20px; }
          .article-card-content { padding: 20px; }
          .filter-bar-container { margin: 0 -16px 24px; padding: 10px 16px; }
        }
      `}</style>
    </div>
  );
}
