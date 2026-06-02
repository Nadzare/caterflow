'use client'

import { useState, useEffect, useRef } from 'react';

import { useTheme } from './ThemeProvider';
import { useModals } from './ModalsContext';
import { useAuth } from '@/lib/AuthContext';
import { searchEntities } from '@/app/actions/searchActions';
import Link from 'next/link';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { openSettings } = useModals();
  const { profile } = useAuth();

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ clients: any[]; orders: any[] }>({ clients: [], orders: [] });
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Notification State
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: '1', text: 'New order #OCC30224 created by Gajah Mada.', time: '10 mins ago', type: 'order', read: false },
    { id: '2', text: 'Delivery for Bintang Terang marked as DELIVERED.', time: '2 hours ago', type: 'delivery', read: false },
    { id: '3', text: 'New B2B Client Maju Jaya registered.', time: '1 day ago', type: 'client', read: true },
  ]);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Handle Search Input
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.trim() !== '') {
        setIsSearching(true);
        const results = await searchEntities(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults({ clients: [], orders: [] });
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Click Outside Handlers
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchQuery('');
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="h-20 border-b border-[var(--border)] bg-white dark:bg-[#1A1715] flex items-center justify-between px-8 sticky top-0 z-20 transition-colors duration-300">
      {/* Search Bar */}
      <div ref={searchRef} className="relative w-80">
        <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 dark:text-stone-500" />
        <input 
          type="text" 
          placeholder="Search anything..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-50 dark:bg-[#24201D] border border-slate-100 dark:border-stone-800/80 pl-10 pr-4 py-2 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:bg-white dark:focus:bg-[#1A1715] transition-all duration-200"
        />

        {/* Search Results Dropdown */}
        {(searchQuery.trim() !== '') && (
          <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-[#1A1715] border border-[var(--border)] rounded-2xl shadow-xl z-50 overflow-hidden max-h-96 overflow-y-auto animate-fade-in-up">
            {isSearching ? (
              <div className="p-4 text-xs font-bold text-center text-slate-400 dark:text-stone-500">Searching...</div>
            ) : searchResults.clients.length === 0 && searchResults.orders.length === 0 ? (
              <div className="p-4 text-xs font-bold text-center text-slate-400 dark:text-stone-500">No results found</div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {searchResults.clients.length > 0 && (
                  <div className="p-3">
                    <h4 className="text-[10px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider mb-2 px-2 flex items-center gap-1.5">
                      <i className="fa-solid fa-users text-[10px] mr-1" /> Clients
                    </h4>
                    <div className="space-y-1">
                      {searchResults.clients.map((c) => (
                        <Link 
                          key={c.id} 
                          href="/clients" 
                          onClick={() => setSearchQuery('')}
                          className="flex flex-col px-2 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#24201D] transition-colors"
                        >
                          <span className="text-xs font-bold text-slate-800 dark:text-stone-200">{c.companyName}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">{c.picName} • {c.logisticAddress}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                {searchResults.orders.length > 0 && (
                  <div className="p-3">
                    <h4 className="text-[10px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider mb-2 px-2 flex items-center gap-1.5">
                      <i className="fa-solid fa-clipboard-list text-[10px] mr-1" /> Orders
                    </h4>
                    <div className="space-y-1">
                      {searchResults.orders.map((o) => (
                        <Link 
                          key={o.id} 
                          href="/orders" 
                          onClick={() => setSearchQuery('')}
                          className="flex flex-col px-2 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#24201D] transition-colors"
                        >
                          <span className="text-xs font-bold text-slate-800 dark:text-stone-200">Order #{o.id.slice(0, 8).toUpperCase()}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">{o.client.companyName} • Rp {o.totalAmount.toLocaleString()}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button 
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#24201D] text-slate-500 dark:text-stone-400 relative transition-colors duration-200 cursor-pointer"
          >
            <i className="fa-regular fa-bell text-lg flex items-center justify-center w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[var(--primary)] rounded-full ring-2 ring-white dark:ring-[#1A1715]" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {notifOpen && (
            <div className="absolute right-0 mt-2 bg-white dark:bg-[#1A1715] border border-[var(--border)] rounded-2xl shadow-xl w-80 z-50 overflow-hidden animate-fade-in-up">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-slate-50/20 dark:bg-stone-900/5">
                <span className="text-xs font-bold text-slate-800 dark:text-stone-200">Notifications</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllRead}
                    className="text-[10px] font-bold text-[var(--primary)] hover:underline cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="divide-y divide-[var(--border)] max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <div 
                    key={n.id} 
                    className={`p-3.5 flex gap-2.5 hover:bg-slate-50/50 dark:hover:bg-stone-900/10 transition-colors ${!n.read ? 'bg-orange-50/10 dark:bg-orange-950/2' : ''}`}
                  >
                    {!n.read && <span className="w-2 h-2 rounded-full bg-[var(--primary)] mt-1.5 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-700 dark:text-stone-300 font-semibold leading-relaxed">{n.text}</p>
                      <span className="text-[10px] text-slate-400 font-bold block mt-1">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#24201D] text-slate-500 dark:text-stone-400 transition-all duration-200 cursor-pointer"
        >
          {theme === 'dark' ? (
            <i className="fa-regular fa-sun text-lg text-amber-400 flex items-center justify-center w-5 h-5" />
          ) : (
            <i className="fa-regular fa-moon text-lg flex items-center justify-center w-5 h-5" />
          )}
        </button>

        {/* Quick Settings */}
        <button 
          onClick={openSettings}
          className="p-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#24201D] text-slate-500 dark:text-stone-400 transition-colors duration-200 cursor-pointer"
        >
          <i className="fa-solid fa-gear text-lg flex items-center justify-center w-5 h-5" />
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200 dark:bg-stone-800 mx-2" />

        {/* Profile Card */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right hidden sm:flex">
            <span className="text-sm font-semibold text-slate-800 dark:text-stone-200 leading-tight">
              {profile?.name || 'CaterFlow Admin'}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-stone-500 font-bold uppercase tracking-wider">
              {profile?.role || 'Admin'}
            </span>
          </div>
          <button 
            onClick={openSettings}
            className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-950/45 text-[var(--primary)] flex items-center justify-center font-bold text-sm border border-orange-200/50 dark:border-orange-900/30 cursor-pointer"
          >
            {(profile?.name || 'Admin').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </button>
        </div>
      </div>
    </header>
  );
}


