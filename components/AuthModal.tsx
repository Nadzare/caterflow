'use client'

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from './Toast';
import { checkInvitation, syncUserInDb } from '@/app/actions/userActions';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'activate';
  onSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, initialMode = 'login', onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'activate'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { toast } = useToast();

  // Reset fields when mode changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Sync details to DB just in case they aren't synced yet (safeguard)
        if (data.user) {
          await syncUserInDb(
            data.user.id,
            email,
            data.user.user_metadata?.name || 'CaterFlow Admin',
            data.user.user_metadata?.phone || ''
          );
        }

        toast('Selamat datang kembali di CaterFlow!', 'success');
        onSuccess();
        onClose();
      } else {
        // Activation Mode
        if (password !== confirmPassword) {
          throw new Error('Konfirmasi kata sandi tidak cocok.');
        }

        if (password.length < 6) {
          throw new Error('Kata sandi harus minimal 6 karakter.');
        }

        // 1. Check if email is pre-registered in Prisma User table
        const check = await checkInvitation(email);
        if (!check.allowed) {
          if (check.reason === 'not_invited') {
            throw new Error('Email Anda belum terdaftar di sistem. Silakan hubungi Owner/Admin katering Anda untuk didaftarkan.');
          } else if (check.reason === 'already_activated') {
            throw new Error('Akun dengan email ini sudah aktif. Silakan kembali ke menu Masuk.');
          } else {
            throw new Error('Terjadi kesalahan verifikasi undangan. Silakan coba lagi.');
          }
        }

        // 2. Sign up user in Supabase
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        // 3. Sync with database
        if (data.user) {
          await syncUserInDb(data.user.id, email, '', '');
        }

        if (data.session) {
          toast('Aktivasi berhasil! Anda telah masuk ke dashboard.', 'success');
          onSuccess();
        } else {
          toast('Aktivasi berhasil! Silakan masuk menggunakan email dan kata sandi Anda.', 'success');
          setMode('login');
          setPassword('');
          setConfirmPassword('');
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      toast(err.message || 'Terjadi kesalahan sistem, silakan coba lagi.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1A1715] rounded-3xl border border-[var(--border)] max-w-md w-full p-7 shadow-2xl relative overflow-hidden animate-fade-in-up">
        {/* Decorative Blur Circle */}
        <div className="absolute -right-16 -top-16 w-36 h-36 bg-[var(--primary-light)] opacity-40 rounded-full blur-2xl pointer-events-none" />
        
        {/* Form Title & Description */}
        <div className="mb-6 relative z-10">
          <h3 className="text-2xl font-black text-slate-800 dark:text-stone-100 tracking-tight">
            {mode === 'login' ? 'Masuk ke CaterFlow' : 'Aktivasi Akun Staf'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-stone-400 font-medium leading-relaxed mt-1">
            {mode === 'login' 
              ? 'Akses portal manajemen operasional katering internal.' 
              : 'Aktifkan akun Anda yang sudah didaftarkan oleh Owner/Admin.'
            }
          </p>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider mb-1.5">Email Katering</label>
            <input
              type="email"
              required
              placeholder="nama@perusahaan.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flat-input w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider mb-1.5">Kata Sandi</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flat-input w-full"
            />
          </div>

          {mode === 'activate' && (
            <div>
              <label className="block text-xs font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider mb-1.5">Konfirmasi Kata Sandi</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="flat-input w-full"
              />
            </div>
          )}

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-2xl border border-[var(--border)] bg-white dark:bg-[#1A1715] hover:bg-slate-50 dark:hover:bg-[#24201D] text-slate-700 dark:text-stone-200 text-xs font-bold transition-all duration-200 cursor-pointer text-center"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-gradient-to-r from-[var(--primary)] to-amber-500 hover:opacity-90 text-white font-black text-xs py-3 rounded-2xl flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-orange-500/10 disabled:opacity-55"
            >
              {submitting ? (
                <>
                  <i className="fa-solid fa-circle-notch animate-spin mr-1" />
                  Memproses...
                </>
              ) : mode === 'login' ? (
                'Masuk Sekarang'
              ) : (
                'Aktifkan Akun'
              )}
            </button>
          </div>
        </form>

        {/* Footer Switching Link */}
        <div className="mt-6 pt-4 border-t border-[var(--border)] text-center relative z-10">
          {mode === 'login' ? (
            <p className="text-xs text-slate-400 dark:text-stone-500 font-medium">
              Staf katering baru?{' '}
              <button
                type="button"
                onClick={() => setMode('activate')}
                className="text-[var(--primary)] font-bold hover:underline cursor-pointer"
              >
                Aktivasi Akun di sini
              </button>
            </p>
          ) : (
            <p className="text-xs text-slate-400 dark:text-stone-500 font-medium">
              Sudah mengaktifkan akun?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-[var(--primary)] font-bold hover:underline cursor-pointer"
              >
                Masuk ke sistem
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
