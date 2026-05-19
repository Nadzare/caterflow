'use client'

import { Search, Bell, Settings, Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-20 border-b border-[var(--border)] bg-white dark:bg-[#1A1715] flex items-center justify-between px-8 sticky top-0 z-20 transition-colors duration-300">
      {/* Search Bar */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 dark:text-stone-500" />
        <input 
          type="text" 
          placeholder="Search anything..." 
          className="w-full bg-slate-50 dark:bg-[#24201D] border border-slate-100 dark:border-stone-800/80 pl-10 pr-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:bg-white dark:focus:bg-[#1A1715] transition-all duration-200"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#24201D] text-slate-500 dark:text-stone-400 relative transition-colors duration-200 cursor-pointer">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--primary)] rounded-full ring-2 ring-white dark:ring-[#1A1715]" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#24201D] text-slate-500 dark:text-stone-400 transition-all duration-200 cursor-pointer"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        {/* Quick Settings */}
        <button className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#24201D] text-slate-500 dark:text-stone-400 transition-colors duration-200 cursor-pointer">
          <Settings className="w-5 h-5" />
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200 dark:bg-stone-800 mx-2" />

        {/* Profile Card */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-sm font-semibold text-slate-800 dark:text-stone-200 leading-tight">Orlando Laurentius</span>
            <span className="text-[11px] text-slate-400 dark:text-stone-500 font-bold uppercase tracking-wider">Admin</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-950/45 text-[var(--primary)] flex items-center justify-center font-bold text-sm border border-orange-200/50 dark:border-orange-900/30">
            OL
          </div>
        </div>
      </div>
    </header>
  );
}

