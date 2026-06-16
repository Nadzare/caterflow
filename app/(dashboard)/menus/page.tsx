/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { getMenus } from '@/app/actions/menuActions';
import { MenusList } from '@/components/menus/MenusList';
import { RoleGuard } from '@/components/RoleGuard';
import { useAuth } from '@/lib/AuthContext';

export default function MenusPage() {
  const { profile } = useAuth();
  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMenus() {
      if (profile) {
        setLoading(true);
        try {
          const data = await getMenus(profile.tenantId || undefined);
          setMenus(data);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    }
    loadMenus();
  }, [profile]);

  const menusKey = menus.map((m) => m.id).join(',');

  return (
    <RoleGuard allowedRoles={['OWNER', 'ADMIN']}>
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8 min-h-[40vh]">
            <i className="fa-solid fa-circle-notch animate-spin text-[var(--primary)] text-xl" />
          </div>
        ) : (
          <MenusList key={menusKey} initialMenus={menus} />
        )}
      </div>
    </RoleGuard>
  );
}
