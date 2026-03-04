// src/components/layout/Sidebar.tsx
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Settings2,
  LogOut,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Newspaper,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { useLogoutMutation } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";


interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onMobileClose?: () => void;
}

const navItems = [
  {
    to: "/",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    to: "/personalization",
    label: "Personalization",
    icon: Settings2,
  },
];

export default function Sidebar({
  collapsed,
  onToggle,
  onMobileClose,
}: SidebarProps) {
  const { mode, toggleTheme } = useTheme();
  const logout = useLogoutMutation();
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  const handleNavClick = () => {
    onMobileClose?.();
  };

  return (
    <aside
      className="sidebar"
      style={{
        width: collapsed ? "var(--sidebar-collapsed)" : "var(--sidebar-width)",
      }}
    >
      {/* ── Logo ── */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">
            <Newspaper size={22} />
          </div>
          {!collapsed && (
            <span className="sidebar-logo-text">AI News Verse</span>
          )}
        </div>
        <button
          className="sidebar-toggle"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleNavClick}
              className={`sidebar-nav-item ${isActive ? "active" : ""}`}
            >
              <div className="sidebar-nav-icon">
                <item.icon size={20} />
              </div>
              {!collapsed && (
                <span className="sidebar-nav-label">{item.label}</span>
              )}
              {isActive && <div className="sidebar-nav-indicator" />}
            </NavLink>
          );
        })}
      </nav>

      {/* ── Footer ── */}
      <div className="sidebar-footer">
        <button
          className="sidebar-action-btn"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {mode === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          {!collapsed && (
            <span>{mode === "dark" ? "Light Mode" : "Dark Mode"}</span>
          )}
        </button>

        {user && !collapsed && (
          <div className="sidebar-user-info">
            <div className="sidebar-user-avatar">
              {user.first_name.charAt(0)}
              {user.last_name.charAt(0)}
            </div>
            <div className="sidebar-user-details">
              <span className="sidebar-user-name">
                {user.first_name} {user.last_name}
              </span>
              <span className="sidebar-user-email">{user.email}</span>
            </div>
          </div>
        )}

        <button
          className="sidebar-action-btn sidebar-logout"
          onClick={() => logout.mutate()}
          aria-label="Log out"
        >
          <LogOut size={18} />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>

      <style>{`
        .sidebar {
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          background: var(--gradient-sidebar);
          border-right: 1px solid var(--color-border-primary);
          display: flex;
          flex-direction: column;
          transition: width var(--transition-normal);
          z-index: 40;
          overflow: hidden;
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 16px;
          border-bottom: 1px solid var(--color-border-secondary);
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .sidebar-logo-icon {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-md);
          background: var(--gradient-accent);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .sidebar-logo-text {
          font-size: 17px;
          font-weight: 700;
          white-space: nowrap;
          background: var(--gradient-accent);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .sidebar-toggle {
          width: 28px;
          height: 28px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--color-border-primary);
          background: var(--color-bg-secondary);
          color: var(--color-text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
          flex-shrink: 0;
        }

        .sidebar-toggle:hover {
          background: var(--color-bg-hover);
          color: var(--color-text-primary);
        }

        .sidebar-nav {
          flex: 1;
          padding: 12px 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sidebar-nav-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: var(--radius-md);
          color: var(--color-text-secondary);
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: all var(--transition-fast);
          overflow: hidden;
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
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: var(--radius-sm);
        }

        .sidebar-nav-item.active .sidebar-nav-icon {
          background: var(--color-accent);
          color: white;
          box-shadow: 0 2px 8px var(--color-accent-glow);
        }

        .sidebar-nav-label {
          white-space: nowrap;
        }

        .sidebar-nav-indicator {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 20px;
          background: var(--color-accent);
          border-radius: 0 var(--radius-full) var(--radius-full) 0;
        }

        .sidebar-footer {
          padding: 12px 8px;
          border-top: 1px solid var(--color-border-secondary);
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .sidebar-action-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: var(--radius-md);
          border: none;
          background: transparent;
          color: var(--color-text-secondary);
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
          width: 100%;
          font-family: var(--font-sans);
        }

        .sidebar-action-btn:hover {
          background: var(--color-bg-hover);
          color: var(--color-text-primary);
        }

        .sidebar-logout:hover {
          background: var(--color-error-light);
          color: var(--color-error);
        }

        .sidebar-user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: var(--radius-md);
          background: var(--color-bg-tertiary);
          margin: 4px 0;
        }

        .sidebar-user-avatar {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-full);
          background: var(--gradient-accent);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .sidebar-user-details {
          display: flex;
          flex-direction: column;
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

        @media (max-width: 768px) {
          .sidebar-toggle {
            display: none;
          }
        }
      `}</style>
    </aside>
  );
}
