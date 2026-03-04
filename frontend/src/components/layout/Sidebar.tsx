// src/components/layout/Sidebar.tsx
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Settings2,
  LogOut,
  Sun,
  Moon,
  ChevronLeft,
  Newspaper,
  X,
} from "lucide-react";
import { useEffect } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useLogoutMutation } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";

interface SidebarProps {
  collapsed: boolean;
  isMobileOpen: boolean;
  onToggle: () => void;
  onMobileClose: () => void;
}

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/personalization", label: "Personalization", icon: Settings2 },
];

export default function Sidebar({
  collapsed,
  isMobileOpen,
  onToggle,
  onMobileClose,
}: SidebarProps) {
  const { mode, toggleTheme } = useTheme();
  const logout = useLogoutMutation();
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  // On mobile, always show labels even if desktop state is collapsed
  const showLabels = isMobileOpen ? true : !collapsed;

  const isActiveRoute = (to: string) =>
    location.pathname === to ||
    (to === "/" && location.pathname === "/dashboard");

  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onMobileClose();
    };
    if (isMobileOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isMobileOpen, onMobileClose]);

  // Close on route change (mobile)
  useEffect(() => {
    onMobileClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <>
      {/* Backdrop */}
      {isMobileOpen && (
        <div className="sidebar-backdrop" onClick={onMobileClose} />
      )}

      <aside
        className={[
          "sidebar",
          collapsed ? "collapsed" : "",
          isMobileOpen ? "mobile-open" : "",
        ].filter(Boolean).join(" ")}
      >
        {/* HEADER */}
        <div className="sidebar-header">
          <div
            className="sidebar-logo"
            onClick={collapsed ? onToggle : undefined}
            style={{ cursor: collapsed ? "pointer" : "default" }}
            title={collapsed ? "Expand sidebar" : undefined}
          >
            <div className="sidebar-logo-icon">
              <Newspaper size={20} />
            </div>
            {showLabels && (
              <span className="sidebar-logo-text">AI News Verse</span>
            )}
          </div>

          {/* Desktop: collapse toggle (only when expanded) */}
          {showLabels && (
            <button
              className="sidebar-toggle desktop-only"
              onClick={onToggle}
              aria-label="Collapse sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          )}

          {/* Mobile: close button (always visible on mobile) */}
          <button
            className="sidebar-close-btn mobile-only"
            onClick={onMobileClose}
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActiveRoute(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={`sidebar-nav-item ${active ? "active" : ""}`}
              >
                <div className="sidebar-nav-icon">
                  <Icon size={20} />
                </div>
                {showLabels && (
                  <span className="sidebar-nav-label">{item.label}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* FOOTER */}
        <div className="sidebar-footer">
          <button className="sidebar-action-btn" onClick={toggleTheme}>
            <div className="sidebar-nav-icon">
              {mode === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </div>
            {showLabels && (
              <span>{mode === "dark" ? "Light Mode" : "Dark Mode"}</span>
            )}
          </button>

          {user && (
            <div className="sidebar-user">
              <div className="sidebar-avatar">
                {user.first_name[0]}
                {user.last_name[0]}
              </div>
              {showLabels && (
                <div className="sidebar-user-info">
                  <span className="sidebar-user-name">
                    {user.first_name} {user.last_name}
                  </span>
                  <span className="sidebar-user-email">{user.email}</span>
                </div>
              )}
            </div>
          )}

          <button
            className="sidebar-action-btn sidebar-logout"
            onClick={() => logout.mutate()}
          >
            <div className="sidebar-nav-icon">
              <LogOut size={18} />
            </div>
            {showLabels && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      <style>{`
        /* ============================
           SIDEBAR — DESKTOP
           ============================ */
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          width: var(--sidebar-width);
          background: var(--color-bg-sidebar);
          border-right: 1px solid var(--color-border-primary);
          display: flex;
          flex-direction: column;
          transition: width 0.25s ease;
          z-index: 200;
          overflow: hidden;
        }

        .sidebar.collapsed {
          width: var(--sidebar-collapsed);
        }

        /* ── Header ── */
        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          min-height: 64px;
          border-bottom: 1px solid var(--color-border-secondary);
          flex-shrink: 0;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .sidebar-logo-icon {
          width: 36px;
          height: 36px;
          min-width: 36px;
          border-radius: 10px;
          background: var(--gradient-accent);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .sidebar-logo-text {
          font-size: 16px;
          font-weight: 800;
          white-space: nowrap;
          background: var(--gradient-accent);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.5px;
        }

        /* ── Toggle & Close buttons ── */
        .sidebar-toggle,
        .sidebar-close-btn {
          width: 32px;
          height: 32px;
          min-width: 32px;
          border-radius: 8px;
          border: 1px solid var(--color-border-primary);
          background: var(--color-bg-secondary);
          color: var(--color-text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: 0.15s ease;
          flex-shrink: 0;
        }

        .sidebar-toggle:hover,
        .sidebar-close-btn:hover {
          background: var(--color-bg-hover);
          color: var(--color-text-primary);
        }

        /* ── Nav ── */
        .sidebar-nav {
          flex: 1;
          padding: 16px 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          overflow-y: auto;
        }

        .sidebar-nav-item {
          display: flex;
          align-items: center;
          padding: 10px 6px;
          border-radius: 10px;
          color: var(--color-text-secondary);
          text-decoration: none;
          transition: 0.15s ease;
          overflow: hidden;
          white-space: nowrap;
        }

        .sidebar-nav-item:hover {
          background: var(--color-bg-hover);
          color: var(--color-text-primary);
        }

        .sidebar-nav-item.active {
          background: var(--color-accent-light);
          color: var(--color-accent);
        }

        .sidebar-nav-icon {
          width: 40px;
          min-width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .sidebar-nav-label {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-left: 4px;
          font-size: 14px;
          font-weight: 600;
        }

        /* ── Footer ── */
        .sidebar-footer {
          padding: 14px 10px;
          border-top: 1px solid var(--color-border-secondary);
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex-shrink: 0;
        }

        .sidebar-action-btn {
          display: flex;
          align-items: center;
          padding: 10px 6px;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: var(--color-text-secondary);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          overflow: hidden;
          white-space: nowrap;
          transition: 0.15s ease;
        }

        .sidebar-action-btn span {
          margin-left: 4px;
        }

        .sidebar-action-btn:hover {
          background: var(--color-bg-hover);
          color: var(--color-text-primary);
        }

        .sidebar-logout:hover {
          background: var(--color-error-light);
          color: var(--color-error);
        }

        .sidebar-user {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px;
          border-radius: 12px;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border-secondary);
          overflow: hidden;
        }

        .sidebar-avatar {
          width: 36px;
          height: 36px;
          min-width: 36px;
          border-radius: 50%;
          background: var(--gradient-accent);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 13px;
          flex-shrink: 0;
        }

        .sidebar-user-info {
          display: flex;
          flex-direction: column;
          overflow: hidden;
          min-width: 0;
        }

        .sidebar-user-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sidebar-user-email {
          font-size: 11px;
          color: var(--color-text-tertiary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* ============================
           DESKTOP-ONLY / MOBILE-ONLY
           ============================ */
        .mobile-only {
          display: none !important;
        }

        .desktop-only {
          display: flex;
        }

        /* ============================
           SIDEBAR — MOBILE (≤768px)
           ============================ */
        @media (max-width: 768px) {
          .desktop-only {
            display: none !important;
          }

          .mobile-only {
            display: flex !important;
          }

          .sidebar {
            width: min(280px, 85vw);
            transform: translateX(-100%);
            transition: transform 0.3s ease;
            z-index: 400;
            border-right: none;
            box-shadow: none;
          }

          .sidebar.collapsed {
            width: min(280px, 85vw);
          }

          .sidebar.mobile-open {
            transform: translateX(0);
            box-shadow: 8px 0 32px rgba(0, 0, 0, 0.2);
          }

          /* On mobile, always show labels */
          .sidebar-nav-label {
            display: inline;
          }

          .sidebar-action-btn span {
            display: inline;
          }
        }

        /* ── Backdrop ── */
        .sidebar-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          z-index: 350;
          animation: sidebarFadeIn 0.2s ease-out;
        }

        @keyframes sidebarFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}