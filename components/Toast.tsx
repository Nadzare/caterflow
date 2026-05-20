'use client'

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 3s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-[90%]">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 p-4 rounded-xl border shadow-lg transition-all duration-300 animate-fade-in-up ${
              t.type === 'success'
                ? 'bg-emerald-50 dark:bg-[#112419] border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-200'
                : t.type === 'error'
                ? 'bg-rose-50 dark:bg-[#2c1316] border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-200'
                : 'bg-blue-50 dark:bg-[#0f1d30] border-blue-200 dark:border-blue-900/40 text-blue-800 dark:text-blue-200'
            }`}
          >
            {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
            {t.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />}
            {t.type === 'info' && <Info className="w-5 h-5 text-blue-500 shrink-0" />}
            
            <p className="text-xs font-bold flex-1">{t.message}</p>
            
            <button
              onClick={() => removeToast(t.id)}
              className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
