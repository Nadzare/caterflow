'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  ClipboardList, 
  Calendar, 
  ChefHat,
  Settings,
  LogOut,
  Sparkles
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Clients', href: '/clients', icon: Users },
  { name: 'Orders', href: '/orders', icon: ClipboardList },
  { name: 'Deliveries', href: '/deliveries', icon: Calendar },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-[var(--border)] bg-white dark:bg-[#1A1715] flex flex-col h-screen sticky top-0 z-30 transition-colors duration-200">
      {/* Brand Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-9 h-9 bg-[var(--primary)] rounded-xl flex items-center justify-center shadow-md shadow-orange-500/10">
          <ChefHat className="text-white w-5 h-5" />
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-stone-100">CaterFlow</span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-2 space-y-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-[var(--primary-light)] text-[var(--primary)] shadow-[0_2px_8px_-3px_rgba(255,107,53,0.08)]" 
                  : "text-slate-500 dark:text-stone-400 hover:bg-slate-50 dark:hover:bg-[#24201D] hover:text-slate-800 dark:hover:text-stone-100"
              )}
            >
              <item.icon className={cn("w-5 h-5 transition-transform duration-200 group-hover:scale-110", isActive ? "text-[var(--primary)]" : "text-slate-400 dark:text-stone-500")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Promo Banner Card */}
      <div className="px-4 mb-4">
        <div className="p-4 bg-orange-50/50 dark:bg-orange-950/10 border border-orange-100/50 dark:border-orange-950/20 rounded-2xl flex flex-col gap-3 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-[var(--primary-light)] opacity-40 rounded-full blur-xl" />
          <div className="flex items-center gap-2 text-[var(--primary)] font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            CaterFlow Plus
          </div>
          <p className="text-xs text-slate-600 dark:text-stone-300 leading-relaxed font-medium">
            Streamline catering operations with real-time analytics.
          </p>
          <button className="flat-button py-2 px-3 text-xs w-full justify-center rounded-lg shadow-sm hover:shadow">
            Upgrade Now
          </button>
        </div>
      </div>

      {/* Footer Nav */}
      <div className="p-4 border-t border-[var(--border)] space-y-1">
        <button className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-slate-500 dark:text-stone-400 hover:bg-slate-50 dark:hover:bg-[#24201D] hover:text-slate-800 dark:hover:text-stone-100 w-full rounded-xl transition-all duration-200">
          <Settings className="w-5 h-5 text-slate-400 dark:text-stone-500" />
          Settings
        </button>
        <button className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10 w-full rounded-xl transition-all duration-200">
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}

