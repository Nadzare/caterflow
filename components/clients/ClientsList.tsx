/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useMemo, useRef, useEffect } from 'react';

import { createClient, updateClient, deleteClient } from '@/app/actions/clientActions';
import { useToast } from '@/components/Toast';
import { useAuth } from '@/lib/AuthContext';

interface Client {
  id: string;
  companyName: string;
  picName: string;
  email: string | null;
  phone: string | null;
  logisticAddress: string;
  dietaryAlerts: any;
  operationalPreferences: any;
  _count: {
    orders: number;
  };
  orders?: Array<{
    orderDate: Date | string;
  }>;
}

interface ClientsListProps {
  initialClients: Client[];
}

const sanitizePhoneNumber = (phone: string | null) => {
  if (!phone) return '';
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  }
  return cleaned;
};

const COMMON_ALLERGIES = ['Peanut', 'Dairy', 'Gluten', 'Soy', 'Seafood', 'Nut'];

export function ClientsList({ initialClients }: ClientsListProps) {
  const { toast } = useToast();
  const { profile } = useAuth();
  const [clients, setClients] = useState<Client[]>(initialClients);



  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [halalOnly, setHalalOnly] = useState(false);
  const [kosherOnly, setKosherOnly] = useState(false);
  const [selectedExclusions, setSelectedExclusions] = useState<string[]>([]);

  // Action Menu State
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Delete State
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  // Form State
  const [companyName, setCompanyName] = useState('');
  const [picName, setPicName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [logisticAddress, setLogisticAddress] = useState('');
  const [halal, setHalal] = useState(false);
  const [kosher, setKosher] = useState(false);
  const [allergies, setAllergies] = useState<string[]>([]);

  // Filter Dropdown ref
  const filterRef = useRef<HTMLDivElement>(null);

  // Close menus on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Open modal for Create
  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedClient(null);
    setCompanyName('');
    setPicName('');
    setEmail('');
    setPhone('');
    setLogisticAddress('');
    setHalal(false);
    setKosher(false);
    setAllergies([]);
    setModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (client: Client) => {
    setModalMode('edit');
    setSelectedClient(client);
    setCompanyName(client.companyName);
    setPicName(client.picName);
    setEmail(client.email || '');
    setPhone(client.phone || '');
    setLogisticAddress(client.logisticAddress);
    
    const alerts = client.dietaryAlerts as any;
    setHalal(alerts?.halal || false);
    setKosher(alerts?.kosher || false);
    setAllergies(alerts?.allergies || []);
    
    setModalOpen(true);
    setActiveMenuId(null);
  };

  // Open Delete Confirmation
  const handleOpenDelete = (client: Client) => {
    setClientToDelete(client);
    setDeleteOpen(true);
    setActiveMenuId(null);
  };

  // Save Modal
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      companyName,
      picName,
      email: email || undefined,
      phone: phone || undefined,
      logisticAddress,
      dietaryAlerts: {
        halal,
        kosher,
        allergies,
      }
    };

    if (modalMode === 'create') {
      const res = await createClient(data, profile?.tenantId || undefined);
      if (res.success && res.client) {
        toast(`Client "${companyName}" created successfully!`, 'success');
        
        // Optimistic update client count structure
        const newClient: Client = {
          ...res.client,
          _count: { orders: 0 }
        } as any;
        setClients(prev => [...prev, newClient]);
        setModalOpen(false);
      } else {
        toast(res.error || 'Failed to create client', 'error');
      }
    } else if (modalMode === 'edit' && selectedClient) {
      const res = await updateClient(selectedClient.id, data);
      if (res.success && res.client) {
        toast(`Client "${companyName}" updated successfully!`, 'success');
        setClients(prev => prev.map(c => c.id === selectedClient.id ? { ...c, ...res.client } : c));
        setModalOpen(false);
      } else {
        toast(res.error || 'Failed to update client', 'error');
      }
    }
  };

  // Delete Client Action
  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;
    
    const res = await deleteClient(clientToDelete.id);
    if (res.success) {
      toast(`Client "${clientToDelete.companyName}" deleted successfully!`, 'success');
      setClients(prev => prev.filter(c => c.id !== clientToDelete.id));
      setDeleteOpen(false);
      setClientToDelete(null);
    } else {
      toast(res.error || 'Failed to delete client', 'error');
    }
  };

  // Toggle Allergy badge in form
  const toggleFormAllergy = (allergy: string) => {
    setAllergies(prev => 
      prev.includes(allergy) 
        ? prev.filter(a => a !== allergy) 
        : [...prev, allergy]
    );
  };

  // Toggle Exclusion filter
  const toggleExclusion = (allergy: string) => {
    setSelectedExclusions(prev => 
      prev.includes(allergy)
        ? prev.filter(a => a !== allergy)
        : [...prev, allergy]
    );
  };

  // Filter clients client-side
  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      // 1. Search Query
      const q = searchQuery.toLowerCase();
      const nameMatch = c.companyName.toLowerCase().includes(q);
      const picMatch = c.picName.toLowerCase().includes(q);
      const emailMatch = c.email?.toLowerCase().includes(q) || false;
      const matchSearch = nameMatch || picMatch || emailMatch;

      if (!matchSearch) return false;

      // 2. Dietary filters
      const alerts = c.dietaryAlerts as any;
      if (halalOnly && !alerts?.halal) return false;
      if (kosherOnly && !alerts?.kosher) return false;

      // 3. Exclusions (e.g. if Peanut Free, client must NOT have peanut allergy alert)
      for (const exclusion of selectedExclusions) {
        if (alerts?.allergies?.includes(exclusion)) {
          return false;
        }
      }

      return true;
    });
  }, [clients, searchQuery, halalOnly, kosherOnly, selectedExclusions]);

  return (
    <div className="space-y-8">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-stone-100">Clients</h1>
          <p className="text-sm text-slate-500 dark:text-stone-400 font-medium">Manage and monitor your B2B catering partners.</p>
        </div>
        <button onClick={handleOpenCreate} className="flat-button">
          <i className="fa-solid fa-user-plus mr-1.5" /> Add New Client
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4 relative">
        <div className="relative flex-1">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-stone-500" />
          <input 
            type="text" 
            placeholder="Search clients by name, PIC or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flat-input w-full pl-11 py-2.5 focus:shadow-sm"
          />
        </div>
        
        {/* Filter Toggle Button */}
        <div ref={filterRef} className="relative">
          <button 
            onClick={() => setFilterOpen(!filterOpen)}
            className={`px-4 py-2.5 rounded-xl border ${filterOpen || halalOnly || kosherOnly || selectedExclusions.length > 0 ? 'border-[var(--primary)] bg-orange-50/50 dark:bg-orange-950/10 text-[var(--primary)]' : 'border-[var(--border)] bg-white dark:bg-[#1A1715] text-slate-700 dark:text-stone-200'} text-sm font-semibold flex items-center gap-2 transition-colors duration-200 cursor-pointer`}
          >
            <i className="fa-solid fa-filter text-slate-400 mr-1.5" /> Filter
            {(halalOnly || kosherOnly || selectedExclusions.length > 0) && (
              <span className="w-2 h-2 rounded-full bg-[var(--primary)]" />
            )}
          </button>

          {/* Filter Dropdown Panel */}
          {filterOpen && (
            <div className="absolute right-0 mt-2 bg-white dark:bg-[#1A1715] border border-[var(--border)] rounded-2xl shadow-xl w-64 z-40 p-4.5 animate-fade-in-up">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Dietary Certifications</h4>
              <div className="space-y-2.5 mb-4">
                <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-stone-300 font-semibold cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={halalOnly} 
                    onChange={(e) => setHalalOnly(e.target.checked)}
                    className="w-4 h-4 accent-[var(--primary)] cursor-pointer"
                  />
                  Halal Only
                </label>
                <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-stone-300 font-semibold cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={kosherOnly} 
                    onChange={(e) => setKosherOnly(e.target.checked)}
                    className="w-4 h-4 accent-[var(--primary)] cursor-pointer"
                  />
                  Kosher Only
                </label>
              </div>

              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Allergen Safety Filters</h4>
              <div className="space-y-2.5">
                {COMMON_ALLERGIES.map((allergy) => (
                  <label key={allergy} className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-stone-300 font-semibold cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={selectedExclusions.includes(allergy)} 
                      onChange={() => toggleExclusion(allergy)}
                      className="w-4 h-4 accent-[var(--primary)] cursor-pointer"
                    />
                    {allergy}-Free
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Clients Table Container */}
      <div className="flat-card p-0 overflow-hidden border border-[var(--border)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-orange-50/20 dark:bg-orange-950/5 border-b border-[var(--border)]">
                <th className="py-4 px-6 text-[11px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider">Company</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider">PIC Name</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider">Contact Info</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider">Dietary Alerts</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider text-right">Orders</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider text-right">Last Order</th>
                <th className="py-4 px-6 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredClients.map((client) => {
                const alerts = client.dietaryAlerts as any;
                const hasAlerts = alerts?.allergies?.length > 0 || alerts?.halal || alerts?.kosher;

                return (
                  <tr key={client.id} className="hover:bg-slate-50/40 dark:hover:bg-stone-900/10 transition-colors duration-150">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-800 dark:text-stone-100 text-sm">{client.companyName}</div>
                      <div className="text-xs text-slate-400 dark:text-stone-500 truncate max-w-[240px] mt-0.5">{client.logisticAddress}</div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-stone-300 text-sm font-medium">
                      {client.picName}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-stone-400">
                          <i className="fa-regular fa-envelope w-3.5 h-3.5 flex items-center justify-center text-slate-400" /> {client.email || '—'}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-stone-400">
                          <i className="fa-solid fa-phone w-3.5 h-3.5 flex items-center justify-center text-slate-400" />
                          {client.phone ? (
                            <span className="flex items-center gap-1">
                              {client.phone}
                              <a
                                href={`https://wa.me/${sanitizePhoneNumber(client.phone)}?text=${encodeURIComponent(`Halo ${client.picName} dari ${client.companyName}, ada yang bisa kami bantu mengenai layanan katering kami?`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-500 hover:text-emerald-600 transition-colors duration-150 cursor-pointer inline-flex items-center"
                                title="Chat via WhatsApp"
                              >
                                <i className="fa-brands fa-whatsapp text-sm ml-0.5" />
                              </a>
                            </span>
                          ) : (
                            '—'
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {hasAlerts ? (
                        <div className="flex flex-wrap gap-1.5">
                          {alerts?.halal && (
                            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/20 text-[10px] font-bold rounded-full">
                              HALAL
                            </span>
                          )}
                          {alerts?.kosher && (
                            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/20 text-[10px] font-bold rounded-full">
                              KOSHER
                            </span>
                          )}
                          {alerts?.allergies?.map((a: string) => (
                            <span key={a} className="px-2.5 py-0.5 bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-100/50 dark:border-rose-900/20 text-[10px] font-bold rounded-full flex items-center gap-1">
                              <i className="fa-solid fa-triangle-exclamation text-[10px] text-rose-500 mr-1" /> {a.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-stone-500 font-medium">None</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-right font-semibold text-slate-700 dark:text-stone-200">
                      {client._count.orders}
                    </td>
                    <td className="py-4 px-6 text-sm text-right">
                      {(() => {
                        const lastOrder = client.orders?.[0];
                        if (!lastOrder) {
                          const waMessage = `Halo ${client.picName} dari ${client.companyName}, kami dari CaterFlow catering ingin menyapa kembali. Apakah ada kebutuhan catering yang bisa kami bantu dalam waktu dekat? 😊`;
                          return (
                            <div className="flex flex-col items-end gap-1">
                              <span className="text-slate-400 dark:text-stone-500 font-medium">Never</span>
                              {client.phone && (
                                <a
                                  href={`https://wa.me/${sanitizePhoneNumber(client.phone)}?text=${encodeURIComponent(waMessage)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-600 dark:bg-amber-950/20 dark:hover:bg-amber-950/30 border border-amber-100/30 dark:border-amber-900/20 text-[10px] font-bold rounded-lg cursor-pointer transition-colors duration-150"
                                >
                                  <i className="fa-brands fa-whatsapp text-xs" /> Follow Up
                                </a>
                              )}
                            </div>
                          );
                        }

                        const lastDate = new Date(lastOrder.orderDate);
                        const lastOrderDateStr = lastDate.toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        });
                        const diffTime = Math.abs(new Date().getTime() - lastDate.getTime());
                        const daysSince = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        const isInactive = daysSince > 14;

                        if (isInactive) {
                          const waMessage = `Halo ${client.picName} dari ${client.companyName}, kami dari CaterFlow catering ingin menyapa kembali. Apakah ada kebutuhan catering yang bisa kami bantu dalam waktu dekat? 😊`;
                          return (
                            <div className="flex flex-col items-end gap-1">
                              <span className="font-semibold text-rose-500 dark:text-rose-400">{lastOrderDateStr}</span>
                              <span className="text-[10px] text-rose-400 dark:text-stone-500 font-bold uppercase tracking-wider">Idle {daysSince} hari</span>
                              {client.phone && (
                                <a
                                  href={`https://wa.me/${sanitizePhoneNumber(client.phone)}?text=${encodeURIComponent(waMessage)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-950/30 border border-rose-100/30 dark:border-rose-900/20 text-[10px] font-bold rounded-lg cursor-pointer transition-colors duration-150"
                                >
                                  <i className="fa-brands fa-whatsapp text-xs" /> Follow Up
                                </a>
                              )}
                            </div>
                          );
                        }

                        return (
                          <div className="flex flex-col items-end">
                            <span className="font-semibold text-slate-700 dark:text-stone-300">{lastOrderDateStr}</span>
                            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Active</span>
                          </div>
                        );
                      })()}
                    </td>
                    <td className="py-4 px-6 text-right relative">
                      <button 
                        onClick={() => setActiveMenuId(activeMenuId === client.id ? null : client.id)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-stone-800 text-slate-400 hover:text-slate-600 dark:hover:text-stone-200 transition-colors duration-150 cursor-pointer"
                      >
                        <i className="fa-solid fa-ellipsis w-4 h-4 flex items-center justify-center" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === client.id && (
                        <div ref={menuRef} className="absolute right-6 mt-1 w-32 bg-white dark:bg-[#1A1715] border border-[var(--border)] rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-fade-in-up text-left">
                          <button
                            onClick={() => handleOpenEdit(client)}
                            className="w-full px-4 py-2 text-xs font-semibold text-slate-700 dark:text-stone-300 hover:bg-slate-50 dark:hover:bg-[#24201D] flex items-center gap-2 cursor-pointer"
                          >
                            <i className="fa-solid fa-pen-to-square w-3.5 h-3.5 flex items-center justify-center text-slate-400 text-xs" /> Edit Client
                          </button>
                          <button
                            onClick={() => handleOpenDelete(client)}
                            className="w-full px-4 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/15 flex items-center gap-2 cursor-pointer"
                          >
                            <i className="fa-solid fa-trash-can w-3.5 h-3.5 flex items-center justify-center text-red-400 text-xs" /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs font-bold text-slate-400 dark:text-stone-500">
                    No clients match the search and filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Client Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form 
            onSubmit={handleSubmit}
            className="bg-white dark:bg-[#1A1715] rounded-3xl border border-[var(--border)] max-w-lg w-full p-6 shadow-2xl animate-fade-in-up flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h3 className="text-lg font-bold text-slate-800 dark:text-stone-100">
                {modalMode === 'create' ? 'Add New B2B Client' : 'Edit B2B Client'}
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
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Company Name</label>
                  <input 
                    type="text" 
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="flat-input w-full"
                    placeholder="PT Bintang Terang"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">PIC Full Name</label>
                  <input 
                    type="text" 
                    required
                    value={picName}
                    onChange={(e) => setPicName(e.target.value)}
                    className="flat-input w-full"
                    placeholder="Agus Setiawan"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flat-input w-full"
                    placeholder="pic@bintang.id"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                  <input 
                    type="text" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flat-input w-full"
                    placeholder="081111117"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Logistic & Shipping Address</label>
                <textarea 
                  required
                  rows={2}
                  value={logisticAddress}
                  onChange={(e) => setLogisticAddress(e.target.value)}
                  className="flat-input w-full resize-none"
                  placeholder="Jl. Merdeka Barat No. 7, Jakarta"
                />
              </div>

              {/* Dietary Setup */}
              <div className="border-t border-[var(--border)] pt-3">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Dietary & Health Compliance</span>
                
                {/* Certifications checkboxes */}
                <div className="flex gap-4 mb-3">
                  <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-stone-300 font-semibold cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={halal} 
                      onChange={(e) => setHalal(e.target.checked)}
                      className="w-4 h-4 accent-[var(--primary)] cursor-pointer"
                    />
                    Halal Certified
                  </label>
                  <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-stone-300 font-semibold cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={kosher} 
                      onChange={(e) => setKosher(e.target.checked)}
                      className="w-4 h-4 accent-[var(--primary)] cursor-pointer"
                    />
                    Kosher Certified
                  </label>
                </div>

                {/* Common Allergies Exclusions */}
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Active Client Allergens</span>
                <div className="flex flex-wrap gap-2">
                  {COMMON_ALLERGIES.map((allergy) => {
                    const active = allergies.includes(allergy);
                    return (
                      <button
                        type="button"
                        key={allergy}
                        onClick={() => toggleFormAllergy(allergy)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all duration-150 cursor-pointer ${active ? 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400' : 'bg-slate-50 dark:bg-stone-900 border-[var(--border)] text-slate-600 dark:text-stone-400'}`}
                      >
                        {allergy}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end border-t border-[var(--border)] pt-4 mt-2">
              <button 
                type="button" 
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-[var(--border)] bg-white dark:bg-[#1A1715] hover:bg-slate-50 dark:hover:bg-[#24201D] text-slate-700 dark:text-stone-200 text-xs font-bold transition-all duration-200 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="flat-button text-xs py-2.5 px-5"
              >
                {modalMode === 'create' ? 'Add Client' : 'Save Changes'}
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
            <h3 className="text-base font-extrabold text-slate-800 dark:text-stone-100 mb-1.5">Delete Client</h3>
            <p className="text-xs text-slate-400 font-medium mb-6 leading-relaxed">
              Are you sure you want to delete client <span className="font-bold text-slate-700 dark:text-stone-200">&quot;{clientToDelete?.companyName}&quot;</span>? This will also remove all associated B2B orders and logistics deliveries.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setDeleteOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-white dark:bg-[#1A1715] hover:bg-slate-50 dark:hover:bg-[#24201D] text-slate-700 dark:text-stone-200 text-xs font-bold transition-all duration-200 cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:shadow duration-200"
              >
                <i className="fa-solid fa-trash-can text-xs mr-1.5" /> Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
