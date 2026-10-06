import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Maximize2,
  Minimize2,
  Menu,
  ChevronDown,
  LogOut,
  User,
  Sun,
  Moon,
  Settings,
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { ActivityLog } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  onOpenCommandPalette: () => void;
  onToggleSidebarMobile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCommandPalette,
  onToggleSidebarMobile,
}) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState<ActivityLog[]>([]);

  useEffect(() => {
    setNotifications(StorageService.getLogs().slice(0, 5));
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#070b18]/90 sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between transition-colors">
      {/* Left side: Hamburger menu + Search bar */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebarMobile}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/80"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200 transition-all w-64 md:w-80 text-xs"
        >
          <Search className="w-4 h-4 text-slate-500" />
          <span className="truncate font-medium">Search anything...</span>
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 rounded border border-slate-700 ml-auto">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right side: Network Status, Theme Toggle, Notification Badge, Fullscreen & Profile */}
      <div className="flex items-center space-x-3">
        {/* Network Status Pill */}
        <div className="hidden lg:flex items-center space-x-3 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 text-xs font-semibold">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Network Status</span>
            <span className="text-emerald-400 font-bold">Optimal</span>
          </div>
          <div className="flex items-end h-3 space-x-0.5">
            <div className="w-1 h-1.5 bg-emerald-400 rounded-sm" />
            <div className="w-1 h-3 bg-emerald-400 rounded-sm" />
            <div className="w-1 h-2 bg-emerald-400 rounded-sm" />
            <div className="w-1 h-3.5 bg-emerald-400 rounded-sm" />
          </div>
        </div>

        {/* Global Dark / Light Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 hover:text-amber-300 hover:bg-slate-800 transition-all flex items-center justify-center"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
        </button>

        {/* Notifications Icon with Red Badge */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center border-2 border-slate-900">
              5
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Network Activity
                </span>
                <span className="text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded-full border border-cyan-800">
                  Live
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-800/50">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 hover:bg-slate-800/50 transition-colors text-xs">
                    <div className="flex items-center justify-between text-slate-300 font-semibold mb-1">
                      <span className="truncate">{n.event}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{n.timestamp}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-tight line-clamp-2">
                      {n.details}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Profile Pill */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-3 p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800/80 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
              AD
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-xs font-bold text-slate-100 leading-tight">
                Administrator
              </span>
              <span className="text-[10px] text-slate-400">Super Admin</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1.5 z-50">
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/settings');
                }}
                className="w-full px-3 py-2 text-left text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-2"
              >
                <User className="w-3.5 h-3.5 text-slate-400" /> Profile Settings
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full px-3 py-2 text-left text-xs text-rose-400 hover:bg-rose-950/40 flex items-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
