'use client';

import React, { useState, useEffect } from 'react';
import { getOrdersByStatus, getMenus } from '@/app/actions/orderActions';
import { getClients } from '@/app/actions/clientActions';
import { KanbanBoard } from '@/components/orders/KanbanBoard';
import { useAuth } from '@/lib/AuthContext';

export default function OrdersPage() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<any>({
    QUOTATION: [],
    DP_PAID: [],
    IN_PRODUCTION: [],
    DELIVERING: [],
    COMPLETED: [],
  });
  const [clients, setClients] = useState<any[]>([]);
  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrdersData() {
      if (profile) {
        setLoading(true);
        try {
          const tenantId = profile.tenantId || undefined;
          const [ordersData, clientsData, menusData] = await Promise.all([
            getOrdersByStatus(tenantId),
            getClients(tenantId),
            getMenus(tenantId),
          ]);
          setOrders(ordersData);
          setClients(clientsData);
          setMenus(menusData);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    }
    loadOrdersData();
  }, [profile]);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {loading ? (
        <div className="flex items-center justify-center p-8 min-h-[40vh]">
          <i className="fa-solid fa-circle-notch animate-spin text-[var(--primary)] text-xl" />
        </div>
      ) : (
        <KanbanBoard initialData={orders} clients={clients} menus={menus} />
      )}
    </div>
  );
}
