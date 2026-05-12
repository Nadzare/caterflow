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
  LogOut
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
    <aside className="w-64 border-r border-[var(--border)] bg-[var(--background)] flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-[var(--border)] flex items-center gap-3">
        <div className="w-8 h-8 bg-[var(--primary)] flex items-center justify-center">
          <ChefHat className="text-[var(--primary-foreground)] w-5 h-5" />
        </div>
        <span className="text-xl font-bold tracking-tight">CaterFlow</span>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-75",
                isActive 
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]" 
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[var(--border)] space-y-1">
        <button className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 w-full transition-all duration-75">
          <Settings className="w-5 h-5" />
          Settings
        </button>
        <button className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 w-full transition-all duration-75">
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
