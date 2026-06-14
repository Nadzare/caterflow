'use client';

import React, { useState, useEffect } from 'react';
import { getClients } from '@/app/actions/clientActions';
import { ClientsList } from '@/components/clients/ClientsList';
import { RoleGuard } from '@/components/RoleGuard';
import { useAuth } from '@/lib/AuthContext';

export default function ClientsPage() {
  const { profile } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClients() {
      if (profile) {
        setLoading(true);
        try {
          const data = await getClients(profile.tenantId || undefined);
          setClients(data);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    }
    loadClients();
  }, [profile]);

  return (
    <RoleGuard allowedRoles={['OWNER', 'ADMIN']}>
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8 min-h-[40vh]">
            <i className="fa-solid fa-circle-notch animate-spin text-[var(--primary)] text-xl" />
          </div>
        ) : (
          <ClientsList initialClients={clients} />
        )}
      </div>
    </RoleGuard>
  );
}
