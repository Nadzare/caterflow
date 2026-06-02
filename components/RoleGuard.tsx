'use client'

import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[60vh]">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-circle-notch animate-spin text-[var(--primary)] text-sm" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-stone-500">
            Memuat Hak Akses...
          </span>
        </div>
      </div>
    );
  }

  const hasAccess = profile && allowedRoles.includes(profile.role);

  if (!hasAccess) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[60vh] bg-[#FAF6F0] dark:bg-[#12100E] transition-colors duration-300">
        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-full flex items-center justify-center mb-6 border border-rose-100/50 dark:border-rose-900/20 shadow-md">
          <i className="fa-solid fa-shield-halved text-2xl" />
        </div>
        <h2 className="text-xl font-black text-slate-800 dark:text-stone-100 mb-2">Akses Terbatas</h2>
        <p className="text-xs text-slate-500 dark:text-stone-400 max-w-sm mb-6 leading-relaxed font-semibold">
          Halaman ini hanya dapat diakses oleh Owner atau Admin katering. Silakan hubungi pengelola sistem jika Anda memerlukan akses tambahan.
        </p>
        <Link href="/dashboard" className="flat-button text-xs py-2.5 px-6">
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
