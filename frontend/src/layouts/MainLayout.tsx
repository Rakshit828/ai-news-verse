// src/layouts/MainLayout.tsx
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Menu, Newspaper } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";

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

        <button
          className="mobile-menu-btn"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* ── Sidebar ── */}
      <Sidebar
        collapsed={collapsed}
        isMobileOpen={mobileOpen}
        onToggle={() => setCollapsed((p) => !p)}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* ── Content ── */}
      <main
        className={`main-content ${
          collapsed ? "collapsed" : ""
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