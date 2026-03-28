// src/components/layout/LiveFeedDropdown.tsx
import { useState, useEffect, useRef } from "react";
import { Zap, Inbox } from "lucide-react";
import { useWebSocketContext } from "@/context/WebSocketContext";

export function LiveFeedDropdown() {
  const { status, liveArticles, unreadCount, markAllRead } = useWebSocketContext();
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isConnected = status === "open";
  const isConnecting = status === "connecting";

  let statusClass = "ws-dot--disconnected";
  let label = "Live feed disconnected";

  if (isConnected) {
    statusClass = "ws-dot--connected";
    label = "Live feed connected";
  } else if (isConnecting) {
    statusClass = "ws-dot--connecting";
    label = "Connecting to live feed...";
  } else if (status === "error") {
    label = "WebSocket connection error";
  }

  // Handle clicking outside to close
  useEffect(() => {
    if (!showDropdown) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [showDropdown]);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!showDropdown) markAllRead();
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="ws-indicator-container" ref={containerRef}>
      {/* Non-clickable connection status */}
      <div className="ws-status-indicator" title={label}>
        <div className="ws-indicator-wrapper">
          <span className={`ws-dot ${statusClass}`} />
          {isConnected && <span className="ws-dot-ping" />}
        </div>
      </div>

      {/* Clickable news badge */}
      <button
        type="button"
        className="ws-badge-trigger"
        onClick={toggleDropdown}
        title="View live updates"
        aria-label="View live updates"
      >
        <Zap size={16} className="ws-badge-icon" />
        {unreadCount > 0 && (
          <span className="ws-unread-count-badge animate-scale-in">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="ws-dropdown glass animate-slide-up">
          <header className="ws-dropdown-header">
            <div className="ws-dropdown-title-group">
              <Zap size={14} className="ws-dropdown-icon" />
              <h3>Live Updates</h3>
            </div>
            <span className="ws-dropdown-count">{liveArticles.length} recent</span>
          </header>

          <div className="ws-dropdown-content custom-scrollbar">
            {liveArticles.length === 0 ? (
              <div className="ws-dropdown-empty">
                <Inbox size={32} />
                <p>No live updates yet</p>
              </div>
            ) : (
              liveArticles.map((article, i) => (
                <a
                  key={`${article.url}-${i}`}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ws-dropdown-item"
                >
                  <span className="ws-item-source">{article.source}</span>
                  <span className="ws-item-title">{article.title}</span>
                </a>
              ))
            )}
          </div>
        </div>
      )}

      <style>{`
        .ws-indicator-container {
          position: relative;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        /* Pure status indicator */
        .ws-status-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
        }

        .ws-indicator-wrapper {
          position: relative;
          width: 12px;
          height: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ws-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          transition: all 0.3s ease;
          z-index: 2;
        }

        .ws-dot--connected {
          background: #22c55e;
          box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
        }

        .ws-dot--disconnected {
          background: #ef4444; 
          box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
        }

        .ws-dot--connecting {
          background: #f59e0b;
          box-shadow: 0 0 8px rgba(245, 158, 11, 0.5);
        }

        .ws-dot-ping {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: rgba(34, 197, 94, 0.4);
          animation: wsPing 2s cubic-bezier(0, 0, 0.2, 1) infinite;
          z-index: 1;
        }

        /* Clickable Badge Trigger */
        .ws-badge-trigger {
          position: relative;
          width: 38px;
          height: 38px;
          background: var(--color-bg-secondary);
          border: 1px solid var(--color-border-primary);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          color: var(--color-text-tertiary);
          box-shadow: var(--shadow-sm);
        }

        .ws-badge-trigger:hover {
          background: var(--color-bg-tertiary);
          color: #f59e0b;
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
          border-color: rgba(245, 158, 11, 0.3);
        }

        .ws-badge-trigger:active {
          transform: translateY(0);
        }

        .ws-badge-icon {
          transition: transform 0.3s ease;
        }

        .ws-badge-trigger:hover .ws-badge-icon {
          transform: scale(1.1);
        }

        /* The numeric badge on top of the trigger */
        .ws-unread-count-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          min-width: 20px;
          height: 20px;
          padding: 0 6px;
          border-radius: 10px;
          background: #ef4444;
          color: white;
          font-size: 11px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--color-bg-card);
          box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);
          z-index: 10;
        }

        @keyframes wsPing {
          0% { transform: scale(1); opacity: 0.7; }
          75%, 100% { transform: scale(3); opacity: 0; }
        }

        /* ===== WS DROPDOWN ===== */
        .ws-dropdown {
          position: absolute;
          top: calc(100% + 16px);
          right: -8px;
          width: 320px;
          background: var(--color-bg-card);
          border: 1px solid var(--color-border-primary);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-2xl);
          z-index: 1000;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transform-origin: top right;
        }

        .ws-dropdown::before {
          content: '';
          position: absolute;
          top: -6px;
          right: 14px;
          width: 12px;
          height: 12px;
          background: var(--color-bg-secondary);
          border-top: 1px solid var(--color-border-primary);
          border-left: 1px solid var(--color-border-primary);
          transform: rotate(45deg);
          z-index: 1;
        }

        .ws-dropdown-header {
          position: relative;
          z-index: 2;
          padding: 14px 16px;
          background: var(--color-bg-secondary);
          border-bottom: 1px solid var(--color-border-primary);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .ws-dropdown-title-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .ws-dropdown-title-group h3 {
          font-size: 14px;
          font-weight: 800;
          margin: 0;
          color: var(--color-text-primary);
          letter-spacing: -0.2px;
        }

        .ws-dropdown-icon {
          color: #f59e0b;
        }

        .ws-dropdown-count {
          font-size: 11px;
          font-weight: 700;
          color: var(--color-text-tertiary);
          background: var(--color-bg-tertiary);
          padding: 2px 8px;
          border-radius: var(--radius-full);
        }

        .ws-dropdown-content {
          max-height: 400px;
          overflow-y: auto;
        }

        .ws-dropdown-empty {
          padding: 48px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          color: var(--color-text-tertiary);
          text-align: center;
        }

        .ws-dropdown-empty p {
          font-size: 14px;
          font-weight: 500;
          margin: 0;
        }

        .ws-dropdown-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 16px;
          border-bottom: 1px solid var(--color-border-secondary);
          transition: all 0.2s ease;
          text-decoration: none;
        }

        .ws-dropdown-item:last-child {
          border-bottom: none;
        }

        .ws-dropdown-item:hover {
          background: var(--color-bg-hover);
          padding-left: 20px;
        }

        .ws-item-source {
          font-size: 10px;
          font-weight: 900;
          text-transform: uppercase;
          color: var(--color-accent);
          background: var(--color-accent-light);
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          width: fit-content;
          letter-spacing: 0.8px;
        }

        .ws-item-title {
          font-size: 13.5px;
          font-weight: 600;
          line-height: 1.5;
          color: var(--color-text-primary);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .animate-slide-up {
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @media (max-width: 480px) {
          .ws-dropdown {
            position: fixed;
            top: 72px;
            left: 16px;
            right: 16px;
            width: auto;
            max-height: calc(100vh - 100px);
          }
          .ws-dropdown::before { display: none; }
        }
      `}</style>
    </div>
  );
}
