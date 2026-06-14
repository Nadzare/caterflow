'use client';

import React, { useState, useEffect } from 'react';
import { getTenants, deleteTenant, getPlatformStats } from '@/app/actions/tenantActions';
import { getRegistrationRequests } from '@/app/actions/registrationActions';
import { RequestList } from '../team/RequestList';
import { useToast } from '../Toast';

export function SuperAdminDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'tenants' | 'requests'>('tenants');
  const [stats, setStats] = useState({ totalTenants: 0, totalUsers: 0, pendingRequests: 0 });
  const [tenants, setTenants] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [platformStats, tenantsData, requestsData] = await Promise.all([
        getPlatformStats(),
        getTenants(),
        getRegistrationRequests(),
      ]);
      setStats(platformStats);
      setTenants(tenantsData);
      setRequests(requestsData);
    } catch (error) {
      console.error('Failed to load super admin data:', error);
      toast('Gagal memuat data super admin.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteTenant = async (id: string, name: string) => {
    if (!confirm(`APAKAH ANDA YAKIN? Menghapus katering "${name}" akan menghapus seluruh data pengguna, klien, order, dan pengiriman katering tersebut secara permanen!`)) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteTenant(id);
      toast(`Katering "${name}" berhasil dihapus.`, 'success');
      // reload data
      loadData();
    } catch (err: any) {
      toast(err.message || 'Gagal menghapus katering.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <i className="fa-solid fa-circle-notch animate-spin text-[var(--primary)] text-2xl" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Memuat Dashboard Super Admin...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-stone-100">Super Admin Console</h1>
        <p className="text-sm text-slate-500 dark:text-stone-400 font-medium">Selamat datang, Pengelola Platform CaterFlow. Kelola pengguna katering Anda di sini.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Tenants */}
        <div className="flat-card flex items-start gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-2xl text-amber-500">
            <i className="fa-solid fa-store text-2xl flex items-center justify-center w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold text-slate-400 dark:text-stone-500 uppercase tracking-wider">Total Mitra Katering</span>
            <div className="text-2xl font-bold text-slate-800 dark:text-stone-100 mt-1">
              {stats.totalTenants}
            </div>
            <p className="text-[10px] text-slate-400 dark:text-stone-500 mt-2 font-medium">Bisnis katering terdaftar</p>
          </div>
        </div>

        {/* Card 2: Total Users */}
        <div className="flat-card flex items-start gap-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-2xl text-blue-500">
            <i className="fa-solid fa-users text-2xl flex items-center justify-center w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold text-slate-400 dark:text-stone-500 uppercase tracking-wider">Total Pengguna</span>
            <div className="text-2xl font-bold text-slate-800 dark:text-stone-100 mt-1">
              {stats.totalUsers}
            </div>
            <p className="text-[10px] text-slate-400 dark:text-stone-500 mt-2 font-medium">Pemilik & staf terdaftar</p>
          </div>
        </div>

        {/* Card 3: Pending Requests */}
        <div 
          onClick={() => setActiveTab('requests')}
          className="flat-card flex items-start gap-4 cursor-pointer hover:border-[var(--primary)]/50 transition-colors"
        >
          <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-2xl text-[var(--primary)]">
            <i className="fa-solid fa-file-signature text-2xl flex items-center justify-center w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold text-slate-400 dark:text-stone-500 uppercase tracking-wider">Permohonan Menunggu</span>
            <div className="text-2xl font-bold text-slate-800 dark:text-stone-100 mt-1 flex items-center gap-2">
              {stats.pendingRequests}
              {stats.pendingRequests > 0 && (
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
              )}
            </div>
            <p className="text-[10px] text-[var(--primary)] font-bold mt-2 hover:underline">Klik untuk tinjau permohonan &rarr;</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border)] gap-2">
        <button
          onClick={() => setActiveTab('tenants')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'tenants'
              ? 'border-[var(--primary)] text-[var(--primary)]'
              : 'border-transparent text-slate-400 dark:text-stone-500 hover:text-slate-600 dark:hover:text-stone-400'
          }`}
        >
          <i className="fa-solid fa-store mr-1.5" />
          Mitra Catering ({tenants.length})
        </button>

        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'requests'
              ? 'border-[var(--primary)] text-[var(--primary)]'
              : 'border-transparent text-slate-400 dark:text-stone-500 hover:text-slate-600 dark:hover:text-stone-400'
          }`}
        >
          <i className="fa-solid fa-file-signature" />
          Permohonan Pendaftaran
          {stats.pendingRequests > 0 && (
            <span className="bg-orange-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none">
              {stats.pendingRequests}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'tenants' ? (
          <div className="flat-card p-0 overflow-hidden border border-[var(--border)] bg-white dark:bg-[#1A1715]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-orange-50/20 dark:bg-orange-950/5 border-b border-[var(--border)]">
                    <th className="py-4 px-6 text-[11px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider">Nama Katering</th>
                    <th className="py-4 px-6 text-[11px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider">Tanggal Bergabung</th>
                    <th className="py-4 px-6 text-[11px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider text-center">Total Staf</th>
                    <th className="py-4 px-6 text-[11px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider text-center">Total Klien</th>
                    <th className="py-4 px-6 text-[11px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider text-center">Total Order</th>
                    <th className="py-4 px-6 w-24 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {tenants.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/40 dark:hover:bg-stone-900/10 transition-colors duration-150">
                      <td className="py-4 px-6 font-bold text-slate-800 dark:text-stone-100 text-sm">
                        {t.name}
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500 dark:text-stone-400">
                        {new Date(t.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-4 px-6 text-xs font-bold text-slate-600 dark:text-stone-300 text-center">
                        {t._count.users} Staf
                      </td>
                      <td className="py-4 px-6 text-xs font-bold text-slate-600 dark:text-stone-300 text-center">
                        {t._count.clients} Klien
                      </td>
                      <td className="py-4 px-6 text-xs font-bold text-slate-600 dark:text-stone-300 text-center">
                        {t._count.orders} Order
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          disabled={deletingId !== null}
                          onClick={() => handleDeleteTenant(t.id, t.name)}
                          className="px-2.5 py-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/15 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors duration-150"
                        >
                          <i className="fa-solid fa-trash-can" /> Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                  {tenants.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs font-bold text-slate-400 dark:text-stone-500">
                        Belum ada katering mitra terdaftar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <RequestList initialRequests={requests} />
        )}
      </div>
    </div>
  );
}
