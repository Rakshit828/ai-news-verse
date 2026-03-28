// src/layouts/MainLayout.tsx
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Menu, Newspaper } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import { useWebSocketContext } from "@/context/WebSocketContext";

/** Small coloured dot that shows the WebSocket connection state */
function ConnectionIndicator() {
  const { status } = useWebSocketContext();

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

  return (
    <div className="ws-indicator-wrapper" title={label} aria-label={label}>
      <span className={`ws-dot ${statusClass}`} />
      {/* Animated ping ring when connected */}
      {isConnected && <span className="ws-dot-ping" />}
    </div>
  );
}

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Prevent background scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [mobileOpen]);

  return (
    <div className="main-layout">
      {/* ── Mobile Header ── */}
      <header className="mobile-header">
        <div className="mobile-logo-group">
          <Newspaper size={20} className="mobile-logo-icon" />
          <span className="mobile-logo-text">AI News Verse</span>
        </div>

        <div className="mobile-header-actions">
          <ConnectionIndicator />
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* ── Desktop top-right indicator ── */}
      <div className="desktop-ws-indicator">
        <ConnectionIndicator />
      </div>

      {/* ── Sidebar ── */}
      <Sidebar
        collapsed={collapsed}
        isMobileOpen={mobileOpen}
        onToggle={() => setCollapsed((p) => !p)}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* ── Content ── */}
      <main
        className={`main-content ${collapsed ? "collapsed" : ""
          }`}
      >
        <div className="content-inner">
          <Outlet />
        </div>
      </main>

      <style>{`
        .main-layout {
          min-height: 100vh;
          background: var(--color-bg-primary);
        }

        /* ===== MOBILE HEADER ===== */
        .mobile-header {
          display: none;
        }

        .mobile-header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        @media (max-width: 768px) {
          .mobile-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: 64px;
            padding: 0 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: var(--color-bg-sidebar);
            border-bottom: 1px solid var(--color-border-secondary);
            z-index: 300;
          }
        }

        .mobile-logo-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .mobile-logo-text {
          font-weight: 800;
          font-size: 16px;
          background: var(--gradient-accent);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .mobile-menu-btn {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          border: 1px solid var(--color-border-primary);
          background: var(--color-bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        /* ===== DESKTOP WS INDICATOR ===== */
        .desktop-ws-indicator {
          position: fixed;
          top: 20px;
          right: 28px;
          z-index: 250;
        }

        @media (max-width: 768px) {
          .desktop-ws-indicator {
            display: none;
          }
        }

        /* ===== CONNECTION INDICATOR ===== */
        .ws-indicator-wrapper {
          position: relative;
          width: 14px;
          height: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: default;
        }

        .ws-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          transition: background-color 0.3s ease, box-shadow 0.3s ease;
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

        @keyframes wsPing {
          0% {
            transform: scale(1);
            opacity: 0.7;
          }
          75%, 100% {
            transform: scale(2.4);
            opacity: 0;
          }
        }

        /* ===== MAIN CONTENT ===== */
        .main-content {
          min-height: 100vh;
          margin-left: var(--sidebar-width);
          padding: 32px 40px;
          transition: margin-left 0.25s ease;
        }

        .main-content.collapsed {
          margin-left: var(--sidebar-collapsed);
        }

        .content-inner {
          max-width: 1600px;
          margin: 0 auto;
        }

        /* ===== MOBILE CONTENT ===== */
        @media (max-width: 768px) {
          .main-content {
            margin-left: 0 !important;
            padding: 84px 16px 40px;
          }
        }
      `}</style>
    </div>
  );
}