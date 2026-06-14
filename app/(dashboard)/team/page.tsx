'use client';

import React, { useState, useEffect } from 'react';
import { getTeamMembers } from '@/app/actions/userActions';
import { TeamList } from '@/components/team/TeamList';
import { RoleGuard } from '@/components/RoleGuard';
import { useAuth } from '@/lib/AuthContext';

export default function TeamPage() {
  const { profile } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTeamData() {
      if (profile) {
        setLoading(true);
        try {
          const data = await getTeamMembers(profile.tenantId || undefined);
          setMembers(data);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    }
    loadTeamData();
  }, [profile]);

  return (
    <RoleGuard allowedRoles={['OWNER', 'ADMIN']}>
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-1 mb-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-stone-100">Manajemen Tim</h1>
          <p className="text-sm text-slate-500 dark:text-stone-400 font-medium font-semibold">Kelola akses, hak istimewa, dan staf katering internal Anda.</p>
        </div>
        {loading ? (
          <div className="flex items-center justify-center p-8 min-h-[40vh]">
            <i className="fa-solid fa-circle-notch animate-spin text-[var(--primary)] text-xl" />
          </div>
        ) : (
          <TeamList initialMembers={members} />
        )}
      </div>
    </RoleGuard>
  );
}
