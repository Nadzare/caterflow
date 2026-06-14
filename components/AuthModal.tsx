'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
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
    <div className="fixed inset-0 bg-white dark:bg-[#12100E] z-50 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden animate-fade-in transition-colors duration-300">
      {/* Left Pane - Premium Image Overlay */}
      <div className="hidden md:block md:w-1/2 h-full relative">
        <Image
          src="/catering_buffet.png"
          alt="Premium Catering Buffet"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6B35] via-[#FF6B35]/85 to-transparent flex flex-col justify-between p-12 text-white z-10">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-md">
              <Image src="/caterflowlogo.png" alt="CaterFlow" fill className="object-contain p-1.5" />
            </div>
            <span className="text-xl font-black tracking-tight">CaterFlow</span>
          </div>

          {/* Core Message */}
          <div className="space-y-4 max-w-md">
            <span className="inline-block text-[10px] font-extrabold bg-white/20 border border-white/30 rounded-full px-3 py-1.5 uppercase tracking-widest">
              Sistem Internal Katering
            </span>
            <h2 className="text-4xl font-black leading-tight drop-shadow-md">
              Kelola Operasional Dapur & Logistik Tanpa Ribet
            </h2>
            <p className="text-xs text-white/90 leading-relaxed font-semibold">
              Satu dashboard terpadu untuk menyelaraskan tim dapur, logistik armada, dan kepatuhan alergen klien Anda secara real-time.
            </p>
          </div>

          {/* Footer Copy */}
          <p className="text-[10px] text-white/65 font-bold uppercase tracking-wider">
            © 2026 CaterFlow. B2B Catering Solutions.
          </p>
        </div>
        <div className="absolute inset-0 bg-black/10 z-0" />
      </div>

      {/* Right Pane - Form Controls */}
      <div className="w-full md:w-1/2 h-full flex flex-col justify-center p-8 sm:p-12 md:p-20 relative bg-white dark:bg-[#1A1715]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-stone-200 text-2xl cursor-pointer transition-colors"
          style={{ outline: 'none' }}
        >
          <i className="fa-solid fa-xmark" />
        </button>

        <div className="max-w-md w-full mx-auto space-y-8">
          {/* Form Title & Description */}
          <div>
            <h3 className="text-3xl font-black text-slate-800 dark:text-stone-100 tracking-tight">
              {mode === 'login' ? 'Masuk ke CaterFlow' : 'Aktivasi Akun Staf'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-stone-400 font-semibold leading-relaxed mt-2">
              {mode === 'login' 
                ? 'Akses portal manajemen operasional katering internal.' 
                : 'Aktifkan akun Anda yang sudah didaftarkan oleh Owner/Admin.'
              }
            </p>
          </div>

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 dark:text-stone-500 uppercase tracking-wider mb-2">Email Katering</label>
              <input
                type="email"
                required
                placeholder="nama@perusahaan.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flat-input w-full py-3.5 px-4 text-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold text-slate-400 dark:text-stone-500 uppercase tracking-wider mb-2">Kata Sandi</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flat-input w-full py-3.5 px-4 text-sm"
              />
            </div>

            {mode === 'activate' && (
              <div>
                <label className="block text-[10px] font-extrabold text-slate-400 dark:text-stone-500 uppercase tracking-wider mb-2">Konfirmasi Kata Sandi</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="flat-input w-full py-3.5 px-4 text-sm"
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
          <div className="pt-5 border-t border-[var(--border)] text-center">
            {mode === 'login' ? (
              <p className="text-xs text-slate-400 dark:text-stone-500 font-semibold">
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
              <p className="text-xs text-slate-400 dark:text-stone-500 font-semibold">
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
    </div>
  );
}
