'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';

import { useToast } from './Toast';
import { useAuth } from '@/lib/AuthContext';
import { updateUserProfile } from '@/app/actions/userActions';
import { AuthModal } from './AuthModal';

interface ModalsContextType {
  openSettings: () => void;
  openUpgrade: () => void;
  openLogout: () => void;
  openAuth: (mode?: 'login' | 'activate') => void;
  closeAuth: () => void;
}

const ModalsContext = createContext<ModalsContextType | undefined>(undefined);

export function useModals() {
  const context = useContext(ModalsContext);
  if (!context) throw new Error('useModals must be used within ModalsProvider');
  return context;
}

export function ModalsProvider({ children }: { children: React.ReactNode }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'activate'>('login');
  
  const { toast } = useToast();
  const { profile, signOut, refreshProfile } = useAuth();

  // Settings State
  const [profileName, setProfileName] = useState('Orlando Laurentius');
  const [profileEmail, setProfileEmail] = useState('orlando@caterflow.com');
  const [profilePhone, setProfilePhone] = useState('0851 9085 9889');
  const [notifPref, setNotifPref] = useState(true);

  // Sync state with database user profile when loaded
  useEffect(() => {
    if (profile) {
      setProfileName(profile.name);
      setProfileEmail(profile.email);
      setProfilePhone(profile.phone || '');
    }
  }, [profile]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    try {
      await updateUserProfile(profile.id, profileName, profilePhone);
      await refreshProfile();
      toast('Pengaturan berhasil disimpan!', 'success');
      setSettingsOpen(false);
    } catch (err: any) {
      toast(err.message || 'Gagal menyimpan pengaturan.', 'error');
    }
  };

  const handleLogout = async () => {
    toast('Sedang keluar...', 'info');
    setLogoutOpen(false);
    try {
      await signOut();
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (err) {
      console.error(err);
      window.location.href = '/';
    }
  };

  return (
    <ModalsContext.Provider
      value={{
        openSettings: () => setSettingsOpen(true),
        openUpgrade: () => setUpgradeOpen(true),
        openLogout: () => setLogoutOpen(true),
        openAuth: (mode = 'login') => {
          setAuthMode(mode);
          setAuthOpen(true);
        },
        closeAuth: () => setAuthOpen(false),
      }}
    >
      {children}

      {/* Upgrade Modal */}
      {upgradeOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1715] rounded-3xl border border-[var(--border)] max-w-md w-full p-6 shadow-2xl relative overflow-hidden animate-fade-in-up">
            <div className="absolute -right-16 -top-16 w-36 h-36 bg-[var(--primary-light)] opacity-40 rounded-full blur-2xl" />
            <div className="flex items-center gap-2.5 text-[var(--primary)] font-bold text-xs uppercase tracking-wider mb-4">
              <i className="fa-solid fa-wand-magic-sparkles text-lg animate-pulse" />
              CaterFlow Plus
            </div>
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-stone-100 mb-2">Upgrade to Plus Plan</h3>
            <p className="text-xs text-slate-500 dark:text-stone-400 mb-5 leading-relaxed font-medium">
              Unlock powerful analytics, automated invoicing, AI menu builder, and live delivery updates.
            </p>
            <div className="bg-orange-50/50 dark:bg-orange-950/10 border border-orange-100/50 dark:border-orange-950/20 rounded-2xl p-4 mb-6">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <span className="text-2xl font-black text-slate-800 dark:text-stone-100">Rp 499.000</span>
                  <span className="text-xs text-slate-400 font-bold"> / month</span>
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/20 text-[10px] font-bold rounded-full">
                  14-DAY TRIAL
                </span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-stone-300 font-semibold">
                <li className="flex items-center gap-2"><i className="fa-solid fa-check text-emerald-500 text-sm" /> Unlimited B2B CRM Clients</li>
                <li className="flex items-center gap-2"><i className="fa-solid fa-check text-emerald-500 text-sm" /> Premium PDF Invoice Customization</li>
                <li className="flex items-center gap-2"><i className="fa-solid fa-check text-emerald-500 text-sm" /> Real-time Logistics & GPS Tracking</li>
                <li className="flex items-center gap-2"><i className="fa-solid fa-check text-emerald-500 text-sm" /> WhatsApp Automated Notifications</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setUpgradeOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-white dark:bg-[#1A1715] hover:bg-slate-50 dark:hover:bg-[#24201D] text-slate-700 dark:text-stone-200 text-xs font-bold transition-all duration-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  toast('Welcome to CaterFlow Plus!', 'success');
                  setUpgradeOpen(false);
                }}
                className="flex-1 flat-button text-xs justify-center py-2.5 rounded-xl"
              >
                Start Free Trial
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveSettings}
            className="bg-white dark:bg-[#1A1715] rounded-3xl border border-[var(--border)] max-w-lg w-full p-6 shadow-2xl animate-fade-in-up"
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-5">
              <h3 className="text-lg font-bold text-slate-800 dark:text-stone-100 flex items-center gap-2">
                <i className="fa-solid fa-gear text-slate-400" /> System Settings
              </h3>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-stone-200 text-sm font-bold cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Admin Name</label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="flat-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="flat-input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  className="flat-input w-full"
                />
              </div>

              <div className="p-4 bg-slate-50 dark:bg-stone-900/40 rounded-2xl border border-[var(--border)] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-stone-200">Email Notifications</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Send alerts for new B2B order quotations</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifPref}
                  onChange={(e) => setNotifPref(e.target.checked)}
                  className="w-4 h-4 accent-[var(--primary)] cursor-pointer"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-[var(--border)] bg-white dark:bg-[#1A1715] hover:bg-slate-50 dark:hover:bg-[#24201D] text-slate-700 dark:text-stone-200 text-xs font-bold transition-all duration-200 cursor-pointer"
              >
                Cancel
              </button>
              <button type="submit" className="flat-button text-xs py-2.5 rounded-xl px-5">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Logout Modal */}
      {logoutOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1715] rounded-3xl border border-[var(--border)] max-w-sm w-full p-6 shadow-2xl text-center animate-fade-in-up">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100/50 dark:border-red-900/20">
              <i className="fa-solid fa-circle-exclamation text-xl" />
            </div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-stone-100 mb-1.5">Confirm Logout</h3>
            <p className="text-xs text-slate-400 font-medium mb-6 leading-relaxed">
              Are you sure you want to end your current active admin session?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setLogoutOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-white dark:bg-[#1A1715] hover:bg-slate-50 dark:hover:bg-[#24201D] text-slate-700 dark:text-stone-200 text-xs font-bold transition-all duration-200 cursor-pointer"
              >
                No, Keep Session
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:shadow duration-200"
              >
                <i className="fa-solid fa-right-from-bracket text-xs mr-1" /> Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        initialMode={authMode}
        onSuccess={() => {
          window.location.href = '/dashboard';
        }}
      />
    </ModalsContext.Provider>
  );
}
