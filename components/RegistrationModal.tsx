'use client'

import React, { useState } from 'react';
import Image from 'next/image';
import { useToast } from './Toast';
import { submitRegistrationRequest } from '@/app/actions/registrationActions';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RegistrationModal({ isOpen, onClose }: RegistrationModalProps) {
  const [companyName, setCompanyName] = useState('');
  const [picName, setPicName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await submitRegistrationRequest({
        companyName,
        picName,
        email,
        phone,
      });
      setSuccess(true);
      toast('Permohonan pendaftaran berhasil dikirim!', 'success');
    } catch (err: any) {
      console.error('Registration error:', err);
      toast(err.message || 'Gagal mengirimkan permohonan, silakan coba lagi.', 'error');
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
              Uji Coba Sistem
            </span>
            <h2 className="text-4xl font-black leading-tight drop-shadow-md">
              Daftarkan Bisnis Katering Anda untuk Demo Gratis
            </h2>
            <p className="text-xs text-white/90 leading-relaxed font-semibold">
              Kirimkan data permohonan Anda. Tim admin kami akan segera meninjau dan mengirimkan kredensial akses workspace khusus katering Anda.
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
          {success ? (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto border border-emerald-100 dark:border-emerald-900/20 shadow-md">
                <i className="fa-solid fa-circle-check text-3xl animate-bounce" />
              </div>
              <h3 className="text-3xl font-black text-slate-800 dark:text-stone-100 tracking-tight">Permohonan Terkirim!</h3>
              <p className="text-xs text-slate-500 dark:text-stone-400 font-semibold leading-relaxed max-w-sm mx-auto">
                Terima kasih telah tertarik menggunakan CaterFlow. Permohonan Anda untuk katering <strong>{companyName}</strong> telah kami terima dan akan segera ditinjau oleh Admin kami. Kami akan menghubungi Anda melalui email atau WhatsApp segera!
              </p>
              <button
                onClick={() => {
                  setSuccess(false);
                  setCompanyName('');
                  setPicName('');
                  setEmail('');
                  setPhone('');
                  onClose();
                }}
                className="mt-4 w-full bg-gradient-to-r from-[var(--primary)] to-amber-500 hover:opacity-90 text-white font-black text-xs py-3.5 rounded-2xl cursor-pointer shadow-lg shadow-orange-500/10"
              >
                Tutup Halaman
              </button>
            </div>
          ) : (
            <>
              {/* Form Title & Description */}
              <div>
                <h3 className="text-3xl font-black text-slate-800 dark:text-stone-100 tracking-tight">
                  Coba CaterFlow Gratis
                </h3>
                <p className="text-xs text-slate-500 dark:text-stone-400 font-semibold leading-relaxed mt-2">
                  Daftarkan katering B2B Anda untuk mendapatkan akses demo uji coba sistem CaterFlow.
                </p>
              </div>

              {/* Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 dark:text-stone-500 uppercase tracking-wider mb-2">Nama Katering / Perusahaan</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Berkah Catering B2B"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="flat-input w-full py-3.5 px-4 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 dark:text-stone-500 uppercase tracking-wider mb-2">Nama Penanggung Jawab (PIC)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Budi Santoso"
                    value={picName}
                    onChange={(e) => setPicName(e.target.value)}
                    className="flat-input w-full py-3.5 px-4 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 dark:text-stone-500 uppercase tracking-wider mb-2">Email Bisnis</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. budi@berkahcatering.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flat-input w-full py-3.5 px-4 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 dark:text-stone-500 uppercase tracking-wider mb-2">Nomor WhatsApp / HP</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 081234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flat-input w-full py-3.5 px-4 text-sm"
                  />
                </div>

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
                        Mengirim...
                      </>
                    ) : (
                      'Kirim Permohonan'
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
