import React, { useState } from 'react';
import { Zap, Settings, LogOut, Sliders, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Button } from './ui/button';

export const FloatingNavBar: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleCustomizeCategories = () => {
    navigate('/categories');
    setIsOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleDashboard = () => {
    navigate('/dashboard');
    setIsMobileMenuOpen(false);
  };

  const handleCategories = () => {
    navigate('/categories');
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Floating Navbar */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-5xl">
        <div className="bg-slate-800/40 backdrop-blur-lg border border-slate-700/50 rounded-full shadow-2xl px-6 py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center space-x-2 group cursor-pointer" onClick={handleDashboard}>
              <div className="p-2 bg-blue-600/20 rounded-full group-hover:bg-blue-600/30 transition-colors">
                <Zap className="h-5 w-5 text-blue-400 group-hover:text-blue-300 transition-colors" />
              </div>
              <h1 className="text-lg font-bold tracking-tight bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent hidden sm:inline-block group-hover:from-blue-300 group-hover:to-cyan-300 transition-all">
                AiNewsVerse
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDashboard}
                className="text-slate-300 hover:text-blue-400 hover:bg-slate-700/50 transition-all"
              >
                Dashboard
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCategories}
                className="text-slate-300 hover:text-blue-400 hover:bg-slate-700/50 transition-all"
              >
                Categories
              </Button>
            </div>

            {/* Right Side: Settings & User Info */}
            <div className="flex items-center space-x-3">
              {/* User Info (Hidden on small screens) */}
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                <div className="text-right">
                  <p className="text-xs font-semibold text-slate-200">
                    {user?.first_name || 'User'}
                  </p>
                  {/* <p className="text-xs text-slate-400">Premium</p> */}
                </div>
                <div className="h-8 w-8 rounded-full bg-linear-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                  {user?.first_name?.charAt(0) || 'U'}
                </div>
              </div>

              {/* Settings Dropdown */}
              <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-slate-300 hover:text-blue-400 hover:bg-slate-700/50 rounded-full transition-all"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl"
                >
                  <DropdownMenuItem
                    onClick={handleCustomizeCategories}
                    className="cursor-pointer hover:bg-slate-700/50 focus:bg-slate-700/50 transition-colors px-4 py-2 rounded-lg"
                  >
                    <Sliders className="h-4 w-4 mr-2 text-blue-400" />
                    <span className="text-slate-200">Customize Categories</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-700/50 my-1" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer hover:bg-red-900/30 focus:bg-red-900/30 transition-colors px-4 py-2 rounded-lg"
                  >
                    <LogOut className="h-4 w-4 mr-2 text-red-400" />
                    <span className="text-red-300">Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu Button */}
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-slate-300 hover:text-blue-400 hover:bg-slate-700/50 rounded-full transition-all"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-slate-700/50 space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDashboard}
                className="w-full justify-start text-slate-300 hover:text-blue-400 hover:bg-slate-700/50 transition-all"
              >
                Dashboard
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCategories}
                className="w-full justify-start text-slate-300 hover:text-blue-400 hover:bg-slate-700/50 transition-all"
              >
                Categories
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Spacer to account for fixed navbar */}
      <div className="h-20" />
    </>
  );
};