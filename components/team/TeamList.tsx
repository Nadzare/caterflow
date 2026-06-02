'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { addTeamMember, removeTeamMember, updateTeamMemberRole } from '@/app/actions/userActions';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/lib/AuthContext';

interface TeamMember {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: 'OWNER' | 'ADMIN' | 'KITCHEN' | 'LOGISTIC';
  activated: boolean;
  createdAt: Date;
}

interface TeamListProps {
  initialMembers: TeamMember[];
}

export function TeamList({ initialMembers }: TeamListProps) {
  const { toast } = useToast();
  const { profile } = useAuth();
  
  const [members, setMembers] = useState<TeamMember[]>(initialMembers);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  // Dropdown menus and modals
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'OWNER' | 'ADMIN' | 'KITCHEN' | 'LOGISTIC'>('ADMIN');
  const [submitting, setSubmitting] = useState(false);

  // Close menus on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Synchronize with server updates if any
  useEffect(() => {
    setMembers(initialMembers);
  }, [initialMembers]);

  const handleOpenCreate = () => {
    setName('');
    setEmail('');
    setPhone('');
    setRole('ADMIN');
    setModalOpen(true);
  };

  const handleOpenDelete = (member: TeamMember) => {
    // Business rule: Admin cannot delete Owner
    if (profile?.role === 'ADMIN' && member.role === 'OWNER') {
      toast('Admin tidak diizinkan menghapus Owner.', 'error');
      return;
    }
    // Business rule: User cannot delete themselves
    if (profile?.id === member.id) {
      toast('Anda tidak dapat menghapus akun Anda sendiri.', 'error');
      return;
    }
    setMemberToDelete(member);
    setDeleteOpen(true);
    setActiveMenuId(null);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const newMember = await addTeamMember(email, name, role, phone || undefined);
      toast(`Anggota tim "${name}" berhasil ditambahkan!`, 'success');
      setMembers((prev) => [...prev, newMember as any]);
      setModalOpen(false);
    } catch (err: any) {
      toast(err.message || 'Gagal menambahkan anggota tim.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!memberToDelete) return;
    try {
      await removeTeamMember(memberToDelete.id);
      toast(`Anggota tim "${memberToDelete.name}" berhasil dihapus.`, 'success');
      setMembers((prev) => prev.filter((m) => m.id !== memberToDelete.id));
      setDeleteOpen(false);
      setMemberToDelete(null);
    } catch (err: any) {
      toast(err.message || 'Gagal menghapus anggota tim.', 'error');
    }
  };

  const handleRoleChange = async (memberId: string, newRole: 'OWNER' | 'ADMIN' | 'KITCHEN' | 'LOGISTIC') => {
    setActiveMenuId(null);
    const targetMember = members.find((m) => m.id === memberId);
    if (!targetMember) return;

    // Check permissions
    if (profile?.role === 'ADMIN' && (targetMember.role === 'OWNER' || newRole === 'OWNER')) {
      toast('Hanya Owner yang dapat menetapkan atau mengubah peran Owner.', 'error');
      return;
    }
    if (profile?.id === memberId) {
      toast('Anda tidak dapat mengubah peran Anda sendiri.', 'error');
      return;
    }

    try {
      await updateTeamMemberRole(memberId, newRole);
      toast(`Peran "${targetMember.name}" berhasil diubah menjadi ${newRole}.`, 'success');
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
      );
    } catch (err: any) {
      toast(err.message || 'Gagal memperbarui peran.', 'error');
    }
  };

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        m.name.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        (m.phone && m.phone.toLowerCase().includes(q));

      if (!matchSearch) return false;
      if (roleFilter !== 'ALL' && m.role !== roleFilter) return false;
      if (statusFilter !== 'ALL') {
        const isActivated = statusFilter === 'ACTIVE';
        if (m.activated !== isActivated) return false;
      }
      return true;
    });
  }, [members, searchQuery, roleFilter, statusFilter]);

  const getRoleBadgeClass = (r: string) => {
    switch (r) {
      case 'OWNER':
        return 'bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400 border border-purple-100/50 dark:border-purple-900/20';
      case 'ADMIN':
        return 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-100/50 dark:border-amber-900/20';
      case 'KITCHEN':
        return 'bg-orange-50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400 border border-orange-100/50 dark:border-orange-900/20';
      case 'LOGISTIC':
        return 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/20';
      default:
        return 'bg-slate-50 text-slate-600 dark:bg-stone-900 dark:text-stone-400 border border-[var(--border)]';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-stone-100">Manajemen Tim</h1>
          <p className="text-sm text-slate-500 dark:text-stone-400 font-medium">Kelola akses, hak istimewa, dan staf katering internal Anda.</p>
        </div>
        <button onClick={handleOpenCreate} className="flat-button">
          <i className="fa-solid fa-user-plus mr-1.5" /> Tambah Staf Baru
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        <div className="relative flex-1">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-stone-500" />
          <input 
            type="text" 
            placeholder="Cari anggota tim berdasarkan nama, email, atau telepon..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flat-input w-full pl-11 py-2.5 focus:shadow-sm"
          />
        </div>

        <div className="flex gap-3">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="flat-input py-2.5 text-xs font-bold"
          >
            <option value="ALL">Semua Peran</option>
            <option value="OWNER">Owner</option>
            <option value="ADMIN">Admin</option>
            <option value="KITCHEN">Kitchen</option>
            <option value="LOGISTIC">Logistic</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flat-input py-2.5 text-xs font-bold"
          >
            <option value="ALL">Semua Status</option>
            <option value="ACTIVE">Aktif</option>
            <option value="PENDING">Menunggu Aktivasi</option>
          </select>
        </div>
      </div>

      {/* Team Table Container */}
      <div className="flat-card p-0 overflow-hidden border border-[var(--border)] bg-white dark:bg-[#1A1715] transition-colors duration-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-orange-50/20 dark:bg-orange-950/5 border-b border-[var(--border)]">
                <th className="py-4 px-6 text-[11px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider">Nama Staf</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider">Kontak</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider">Peran</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider">Status Aktivasi</th>
                <th className="py-4 px-6 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredMembers.map((member) => {
                const isSelf = profile?.id === member.id;
                const isAdminAndOwner = profile?.role === 'ADMIN' && member.role === 'OWNER';

                return (
                  <tr key={member.id} className="hover:bg-slate-50/40 dark:hover:bg-stone-900/10 transition-colors duration-150">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-amber-500 flex items-center justify-center text-white font-black text-xs uppercase shadow-sm">
                          {member.name.substring(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 dark:text-stone-100 text-sm flex items-center gap-1.5">
                            {member.name}
                            {isSelf && (
                              <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-stone-800 text-slate-400 dark:text-stone-500 text-[9px] font-black rounded-md tracking-wider">
                                SAYA
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-stone-400">
                          <i className="fa-regular fa-envelope w-3.5 h-3.5 flex items-center justify-center text-slate-400" /> {member.email}
                        </div>
                        {member.phone && (
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-stone-400">
                            <i className="fa-solid fa-phone w-3.5 h-3.5 flex items-center justify-center text-slate-400" /> {member.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${getRoleBadgeClass(member.role)}`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {member.activated ? (
                        <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Aktif
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs text-amber-500 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Menunggu Aktivasi
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right relative">
                      {/* Actions ellipsis */}
                      {!isSelf && !isAdminAndOwner && (
                        <>
                          <button 
                            onClick={() => setActiveMenuId(activeMenuId === member.id ? null : member.id)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-stone-800 text-slate-400 hover:text-slate-600 dark:hover:text-stone-200 transition-colors duration-150 cursor-pointer"
                          >
                            <i className="fa-solid fa-ellipsis w-4 h-4 flex items-center justify-center" />
                          </button>

                          {/* Dropdown Menu */}
                          {activeMenuId === member.id && (
                            <div ref={menuRef} className="absolute right-6 mt-1 w-44 bg-white dark:bg-[#1A1715] border border-[var(--border)] rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-fade-in-up text-left">
                              <span className="block px-3 py-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b border-[var(--border)] mb-1">
                                Ubah Peran Ke:
                              </span>
                              {['OWNER', 'ADMIN', 'KITCHEN', 'LOGISTIC'].map((r) => {
                                const active = member.role === r;
                                return (
                                  <button
                                    key={r}
                                    onClick={() => handleRoleChange(member.id, r as any)}
                                    className={`w-full px-4 py-1.5 text-xs font-semibold flex items-center justify-between cursor-pointer ${
                                      active 
                                        ? 'text-[var(--primary)] bg-orange-50/40 dark:bg-orange-950/10' 
                                        : 'text-slate-700 dark:text-stone-300 hover:bg-slate-50 dark:hover:bg-[#24201D]'
                                    }`}
                                  >
                                    {r}
                                    {active && <i className="fa-solid fa-check text-[10px]" />}
                                  </button>
                                );
                              })}
                              
                              <div className="border-t border-[var(--border)] mt-1 pt-1">
                                <button
                                  onClick={() => handleOpenDelete(member)}
                                  className="w-full px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/15 flex items-center gap-2 cursor-pointer"
                                >
                                  <i className="fa-solid fa-trash-can w-3.5 h-3.5 flex items-center justify-center text-red-400 text-xs" />
                                  Hapus Anggota
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs font-bold text-slate-400 dark:text-stone-500">
                    Tidak ada anggota tim yang cocok dengan filter atau pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Team Member Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleAddMember}
            className="bg-white dark:bg-[#1A1715] rounded-3xl border border-[var(--border)] max-w-md w-full p-6 shadow-2xl animate-fade-in-up flex flex-col gap-4 relative"
          >
            {/* Decorative circle */}
            <div className="absolute -right-16 -top-16 w-36 h-36 bg-[var(--primary-light)] opacity-40 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 relative z-10">
              <h3 className="text-lg font-bold text-slate-800 dark:text-stone-100">
                Tambah Anggota Tim Baru
              </h3>
              <button 
                type="button" 
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-stone-200 cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-lg" />
              </button>
            </div>

            {/* Fields */}
            <div className="space-y-4 relative z-10">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nama Lengkap</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flat-input w-full"
                  placeholder="Nama Lengkap Staf"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Katering</label>
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flat-input w-full"
                  placeholder="email@perusahaan.com"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Nomor Telepon (Opsional)</label>
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flat-input w-full"
                  placeholder="Contoh: 081234567890"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Peran / Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="flat-input w-full"
                >
                  {profile?.role === 'OWNER' && <option value="OWNER">Owner</option>}
                  <option value="ADMIN">Admin</option>
                  <option value="KITCHEN">Kitchen Staff</option>
                  <option value="LOGISTIC">Logistic Driver</option>
                </select>
                <p className="text-[10px] text-slate-400 dark:text-stone-500 font-semibold mt-1.5 leading-relaxed">
                  Staf akan didaftarkan di sistem database internal. Pengguna dapat mengaktifkan akun di halaman depan dengan memasukkan email ini.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end border-t border-[var(--border)] pt-4 mt-2 relative z-10">
              <button 
                type="button" 
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-[var(--border)] bg-white dark:bg-[#1A1715] hover:bg-slate-50 dark:hover:bg-[#24201D] text-slate-700 dark:text-stone-200 text-xs font-bold transition-all duration-200 cursor-pointer"
              >
                Batal
              </button>
              <button 
                type="submit" 
                disabled={submitting}
                className="flat-button text-xs py-2.5 px-5 disabled:opacity-55"
              >
                {submitting ? 'Memproses...' : 'Tambah Staf'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1715] rounded-3xl border border-[var(--border)] max-w-sm w-full p-6 shadow-2xl text-center animate-fade-in-up">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100/50 dark:border-red-900/20">
              <i className="fa-solid fa-triangle-exclamation text-xl" />
            </div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-stone-100 mb-1.5">Hapus Anggota Tim</h3>
            <p className="text-xs text-slate-400 font-medium mb-6 leading-relaxed">
              Apakah Anda yakin ingin menghapus staf <span className="font-bold text-slate-700 dark:text-stone-200">"{memberToDelete?.name}"</span>? Akun mereka tidak akan dapat mengakses sistem internal katering ini lagi.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-white dark:bg-[#1A1715] hover:bg-slate-50 dark:hover:bg-[#24201D] text-slate-700 dark:text-stone-200 text-xs font-bold transition-all duration-200 cursor-pointer"
              >
                Batal
              </button>
              <button 
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:shadow duration-200"
              >
                <i className="fa-solid fa-trash-can text-xs mr-1.5" /> Konfirmasi Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
