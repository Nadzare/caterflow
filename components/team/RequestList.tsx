'use client';

import React, { useState, useMemo } from 'react';
import { useToast } from '@/components/Toast';
import { approveRegistrationRequest, rejectRegistrationRequest } from '@/app/actions/registrationActions';

interface RegistrationRequest {
  id: string;
  companyName: string;
  picName: string;
  email: string;
  phone: string;
  status: string; // PENDING, APPROVED, REJECTED
  createdAt: Date;
}

interface RequestListProps {
  initialRequests: RegistrationRequest[];
}

export function RequestList({ initialRequests }: RequestListProps) {
  const { toast } = useToast();
  const [requests, setRequests] = useState<RegistrationRequest[]>(initialRequests);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('PENDING'); // Default to PENDING to review incoming requests
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const handleApprove = async (id: string, name: string) => {
    setSubmittingId(id);
    try {
      await approveRegistrationRequest(id);
      toast(`Permohonan katering "${name}" berhasil disetujui!`, 'success');
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'APPROVED' } : r))
      );
    } catch (err: any) {
      toast(err.message || 'Gagal menyetujui permohonan.', 'error');
    } finally {
      setSubmittingId(null);
    }
  };

  const handleReject = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menolak permohonan dari "${name}"?`)) return;
    
    setSubmittingId(id);
    try {
      await rejectRegistrationRequest(id);
      toast(`Permohonan katering "${name}" telah ditolak.`, 'info');
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'REJECTED' } : r))
      );
    } catch (err: any) {
      toast(err.message || 'Gagal menolak permohonan.', 'error');
    } finally {
      setSubmittingId(null);
    }
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        r.companyName.toLowerCase().includes(q) ||
        r.picName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.phone.includes(q);

      if (!matchSearch) return false;
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      return true;
    });
  }, [requests, searchQuery, statusFilter]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/20">
            Disetujui
          </span>
        );
      case 'REJECTED':
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 border border-red-100/50 dark:border-red-900/20">
            Ditolak
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-100/50 dark:border-amber-900/20">
            Menunggu
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        <div className="relative flex-1">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-stone-500" />
          <input 
            type="text" 
            placeholder="Cari berdasarkan nama katering, PIC, email, atau telepon..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flat-input w-full pl-11 py-2.5 focus:shadow-sm"
          />
        </div>

        <div className="flex gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flat-input py-2.5 text-xs font-bold"
          >
            <option value="ALL">Semua Status</option>
            <option value="PENDING">Menunggu Persetujuan</option>
            <option value="APPROVED">Disetujui</option>
            <option value="REJECTED">Ditolak</option>
          </select>
        </div>
      </div>

      {/* Requests Table Container */}
      <div className="flat-card p-0 overflow-hidden border border-[var(--border)] bg-white dark:bg-[#1A1715] transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-orange-50/20 dark:bg-orange-950/5 border-b border-[var(--border)]">
                <th className="py-4 px-6 text-[11px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider">Catering / Perusahaan</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider">PIC & Kontak</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider">Tanggal Request</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 w-44 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/40 dark:hover:bg-stone-900/10 transition-colors duration-150">
                  <td className="py-4 px-6">
                    <div className="font-bold text-slate-800 dark:text-stone-100 text-sm">
                      {req.companyName}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-1">
                      <div className="font-semibold text-slate-700 dark:text-stone-300 text-xs">
                        {req.picName}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-stone-400">
                        <i className="fa-regular fa-envelope w-3.5 h-3.5 flex items-center justify-center text-slate-400" /> {req.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-stone-400">
                        <i className="fa-solid fa-phone w-3.5 h-3.5 flex items-center justify-center text-slate-400" /> {req.phone}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-500 dark:text-stone-400 font-medium">
                    {new Date(req.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-4 px-6">
                    {getStatusBadge(req.status)}
                  </td>
                  <td className="py-4 px-6 text-right">
                    {req.status === 'PENDING' ? (
                      <div className="flex gap-2 justify-end">
                        <button
                          disabled={submittingId !== null}
                          onClick={() => handleReject(req.id, req.companyName)}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/20 text-xs font-bold rounded-xl cursor-pointer transition-all"
                        >
                          Tolak
                        </button>
                        <button
                          disabled={submittingId !== null}
                          onClick={() => handleApprove(req.id, req.companyName)}
                          className="px-3 py-1.5 bg-gradient-to-r from-[var(--primary)] to-amber-500 hover:opacity-90 text-white text-xs font-bold rounded-xl cursor-pointer transition-all shadow-sm shadow-orange-500/10"
                        >
                          Setujui
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 dark:text-stone-500 font-bold">
                        Sudah Diproses
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredRequests.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs font-bold text-slate-400 dark:text-stone-500">
                    Tidak ada permohonan pendaftaran yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
