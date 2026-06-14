'use client';

import React, { useState } from 'react';
import { TeamList } from './TeamList';
import { RequestList } from './RequestList';

interface TeamMember {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: 'OWNER' | 'ADMIN' | 'KITCHEN' | 'LOGISTIC';
  activated: boolean;
  createdAt: Date;
}

interface RegistrationRequest {
  id: string;
  companyName: string;
  picName: string;
  email: string;
  phone: string;
  status: string;
  createdAt: Date;
}

interface TeamManagementWrapperProps {
  initialMembers: TeamMember[];
  initialRequests: RegistrationRequest[];
}

export function TeamManagementWrapper({ initialMembers, initialRequests }: TeamManagementWrapperProps) {
  const [activeTab, setActiveTab] = useState<'members' | 'requests'>('members');

  // Count pending registration requests
  const pendingCount = initialRequests.filter(r => r.status === 'PENDING').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-stone-100">
          Tim & Kemitraan
        </h1>
        <p className="text-sm text-slate-500 dark:text-stone-400 font-medium">
          Kelola tim internal katering Anda dan tinjau pendaftaran dari katering mitra baru.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-[var(--border)] gap-2">
        <button
          onClick={() => setActiveTab('members')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'members'
              ? 'border-[var(--primary)] text-[var(--primary)]'
              : 'border-transparent text-slate-400 dark:text-stone-500 hover:text-slate-600 dark:hover:text-stone-400'
          }`}
        >
          <i className="fa-solid fa-users mr-1.5" />
          Anggota Tim
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
          Permohonan Mitra
          {pendingCount > 0 && (
            <span className="bg-orange-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none animate-pulse">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* Content Rendering */}
      <div>
        {activeTab === 'members' ? (
          <TeamList initialMembers={initialMembers} />
        ) : (
          <RequestList initialRequests={initialRequests} />
        )}
      </div>
    </div>
  );
}
