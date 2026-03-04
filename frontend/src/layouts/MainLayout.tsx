// src/layouts/MainLayout.tsx
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";

export default function MainLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) setCollapsed(false);
        };
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    const sidebarWidth = isMobile
        ? 0
        : collapsed
            ? "var(--sidebar-collapsed)"
            : "var(--sidebar-width)";

    return (
        <div className="main-layout">
            {/* ── Mobile hamburger ── */}
            {isMobile && (
                <button
                    className="mobile-menu-btn"
                    onClick={() => setMobileOpen((p) => !p)}
                    aria-label="Open menu"
                >
                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            )}

            {/* ── Overlay ── */}
            {isMobile && mobileOpen && (
                <div
                    className="mobile-overlay"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* ── Sidebar ── */}
            <div
                className={`sidebar-container ${isMobile ? (mobileOpen ? "mobile-open" : "mobile-closed") : ""}`}
            >
                <Sidebar
                    collapsed={isMobile ? false : collapsed}
                    onToggle={() => setCollapsed((p) => !p)}
                    onMobileClose={() => setMobileOpen(false)}
                />
            </div>

            {/* ── Content ── */}
            <main
                className="main-content"
                style={{ marginLeft: sidebarWidth }}
            >
                <Outlet />
            </main>

            <style>{`
        .main-layout {
          min-height: 100vh;
        }

        .main-content {
          min-height: 100vh;
          transition: margin-left var(--transition-normal);
          padding: 28px 32px;
        }

        .mobile-menu-btn {
          position: fixed;
          top: 16px;
          left: 16px;
          z-index: 50;
          width: 42px;
          height: 42px;
          border-radius: var(--radius-md);
          border: 1px solid var(--color-border-primary);
          background: var(--color-bg-secondary);
          color: var(--color-text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: var(--shadow-md);
          transition: all var(--transition-fast);
        }

        .mobile-menu-btn:hover {
          background: var(--color-bg-hover);
        }

        .mobile-overlay {
          position: fixed;
          inset: 0;
          background: var(--color-bg-overlay);
          z-index: 35;
          animation: fadeIn var(--transition-fast) ease-out;
        }

        .sidebar-container.mobile-closed {
          transform: translateX(-100%);
          position: fixed;
          z-index: 40;
        }

        .sidebar-container.mobile-open {
          position: fixed;
          z-index: 40;
          transform: translateX(0);
          transition: transform var(--transition-normal);
        }

        .sidebar-container.mobile-closed {
          transition: transform var(--transition-normal);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @media (max-width: 768px) {
          .main-content {
            margin-left: 0 !important;
            padding: 72px 16px 24px;
          }
        }
      `}</style>
        </div>
    );
}
