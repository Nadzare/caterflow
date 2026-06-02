'use client'

import { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { 
  updateOrderStatus, 
  createOrder, 
  updateOrder, 
  deleteOrder, 
  getOrderDetails 
} from '@/app/actions/orderActions';
import { OrderStatus } from '@prisma/client';

import { useToast } from '@/components/Toast';

interface KanbanBoardProps {
  initialData: Record<OrderStatus, any[]>;
  clients: any[];
  menus: any[];
}

const COLUMNS: { id: OrderStatus; title: string }[] = [
  { id: 'QUOTATION', title: 'Quotation' },
  { id: 'DP_PAID', title: 'DP Paid' },
  { id: 'IN_PRODUCTION', title: 'In Production' },
  { id: 'DELIVERING', title: 'Delivering' },
  { id: 'COMPLETED', title: 'Completed' },
];

export function KanbanBoard({ initialData, clients, menus }: KanbanBoardProps) {
  const { toast } = useToast();
  const [data, setData] = useState(initialData);
  const [activeOrder, setActiveOrder] = useState<any | null>(null);

  // Sync props data with local state
  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Delete State
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<any | null>(null);

  // Form State
  const [clientId, setClientId] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [status, setStatus] = useState<OrderStatus>('QUOTATION');
  const [items, setItems] = useState<Array<{ menuId: string; quantity: number; subtotal: number }>>([]);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('11:00');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  // Calculate total amount of items
  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

  // Fetch full details for editing an order
  const handleOpenEdit = async (order: any) => {
    toast('Loading order details...', 'info');
    const details = await getOrderDetails(order.id);
    if (!details) {
      toast('Failed to load order details', 'error');
      return;
    }

    setModalMode('edit');
    setSelectedOrderId(order.id);
    setClientId(details.clientId);
    setOrderDate(new Date(details.orderDate).toISOString().split('T')[0]);
    setStatus(details.status);
    setItems(
      details.orderItems.map((item: any) => ({
        menuId: item.menuId,
        quantity: item.quantity,
        subtotal: item.subtotal,
      }))
    );

    if (details.delivery) {
      setDeliveryDate(new Date(details.delivery.deliveryDate).toISOString().split('T')[0]);
      setDeliveryTime(details.delivery.deliveryTime);
    } else {
      setDeliveryDate('');
      setDeliveryTime('11:00');
    }

    setModalOpen(true);
  };

  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedOrderId(null);
    setClientId(clients[0]?.id || '');
    setOrderDate(new Date().toISOString().split('T')[0]);
    setStatus('QUOTATION');
    setItems([]);
    setDeliveryDate('');
    setDeliveryTime('11:00');
    setModalOpen(true);
  };

  const handleOpenDelete = (order: any) => {
    setOrderToDelete(order);
    setDeleteOpen(true);
  };

  const handleAddItem = () => {
    if (menus.length === 0) return;
    const defaultMenu = menus[0];
    setItems((prev) => [
      ...prev,
      {
        menuId: defaultMenu.id,
        quantity: 10, // default portion size
        subtotal: defaultMenu.basePrice * 10,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'menuId' | 'quantity', value: string | number) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        const updated = { ...item };
        if (field === 'menuId') {
          updated.menuId = value as string;
          const menu = menus.find((m) => m.id === value);
          if (menu) {
            updated.subtotal = menu.basePrice * updated.quantity;
          }
        } else if (field === 'quantity') {
          const qty = Math.max(1, Number(value));
          updated.quantity = qty;
          const menu = menus.find((m) => m.id === item.menuId);
          if (menu) {
            updated.subtotal = menu.basePrice * qty;
          }
        }
        return updated;
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientId) {
      toast('Please select a client', 'error');
      return;
    }

    if (items.length === 0) {
      toast('Please add at least one menu item', 'error');
      return;
    }

    const payload = {
      clientId,
      status,
      orderDate,
      totalAmount,
      items,
      deliveryDate: deliveryDate || undefined,
      deliveryTime: deliveryTime || undefined,
    };

    if (modalMode === 'create') {
      const res = await createOrder(payload);
      if (res.success && res.order) {
        toast(`Order created successfully!`, 'success');
        
        // Quick UI Refresh: reload orders list from server
        window.location.reload();
      } else {
        toast(res.error || 'Failed to create order', 'error');
      }
    } else if (modalMode === 'edit' && selectedOrderId) {
      const res = await updateOrder(selectedOrderId, payload);
      if (res.success && res.order) {
        toast(`Order updated successfully!`, 'success');
        window.location.reload();
      } else {
        toast(res.error || 'Failed to update order', 'error');
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (!orderToDelete) return;
    const res = await deleteOrder(orderToDelete.id);
    if (res.success) {
      toast(`Order deleted successfully!`, 'success');
      window.location.reload();
    } else {
      toast(res.error || 'Failed to delete order', 'error');
    }
  };

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    const order = active.data.current?.order;
    setActiveOrder(order);
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    
    if (!over) {
      setActiveOrder(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = findColumn(activeId);
    const overColumn = overId in data ? (overId as OrderStatus) : findColumn(overId);

    if (!activeColumn || !overColumn) {
      setActiveOrder(null);
      return;
    }

    if (activeColumn !== overColumn) {
      const result = await updateOrderStatus(activeId, overColumn);
      
      if (result.success) {
        toast(`Order moved to ${overColumn.replace('_', ' ')}`, 'success');
      } else {
        toast(result.error || 'Failed to update order status', 'error');
      }
    }

    setActiveOrder(null);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeColumn = findColumn(activeId);
    const overColumn = overId in data ? (overId as OrderStatus) : findColumn(overId);

    if (!activeColumn || !overColumn || activeColumn === overColumn) return;

    setData((prev) => {
      const activeItems = prev[activeColumn];
      const overItems = prev[overColumn];

      const activeIndex = activeItems.findIndex((i) => i.id === activeId);
      const overIndex = overItems.findIndex((i) => i.id === overId);

      let newOverIndex: number;
      if (overId in prev) {
        newOverIndex = overItems.length;
      } else {
        newOverIndex = overIndex >= 0 ? overIndex : overItems.length;
      }

      return {
        ...prev,
        [activeColumn]: activeItems.filter((i) => i.id !== activeId),
        [overColumn]: [
          ...overItems.slice(0, newOverIndex),
          activeItems[activeIndex],
          ...overItems.slice(newOverIndex),
        ],
      };
    });
  }

  function findColumn(id: string): OrderStatus | null {
    if (id in data) return id as OrderStatus;
    
    for (const key in data) {
      const status = key as OrderStatus;
      if (data[status].find((item) => item.id === id)) {
        return status;
      }
    }
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-stone-100">Orders</h1>
          <p className="text-sm text-slate-500 dark:text-stone-400 font-medium">Track, manage and process catering orders in real-time.</p>
        </div>
        <button onClick={handleOpenCreate} className="flat-button">
          <i className="fa-solid fa-plus mr-1.5" /> New Order
        </button>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 overflow-x-auto pb-8 pt-2 px-1 min-h-[calc(100vh-250px)]">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              orders={data[col.id] || []}
              onEditOrder={handleOpenEdit}
              onDeleteOrder={handleOpenDelete}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.5',
              },
            },
          }),
        }}>
          {activeOrder ? <KanbanCard order={activeOrder} /> : null}
        </DragOverlay>
      </DndContext>

      {/* Add / Edit Order Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmit}
            className="bg-white dark:bg-[#1A1715] rounded-3xl border border-[var(--border)] max-w-2xl w-full p-6 shadow-2xl animate-fade-in-up flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <h3 className="text-lg font-bold text-slate-800 dark:text-stone-100">
                {modalMode === 'create' ? 'Create New Order' : 'Edit Order Details'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-stone-200 cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-lg" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">B2B Partner Client</label>
                  <select
                    required
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="flat-input w-full cursor-pointer"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Order Date</label>
                  <input
                    type="date"
                    required
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    className="flat-input w-full cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Kanban Status</label>
                  <select
                    required
                    value={status}
                    onChange={(e) => setStatus(e.target.value as OrderStatus)}
                    className="flat-input w-full cursor-pointer"
                  >
                    {COLUMNS.map((col) => (
                      <option key={col.id} value={col.id}>
                        {col.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Items Builder */}
              <div>
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 mb-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order Dishes & Portion Quantities</span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <i className="fa-solid fa-plus text-xs mr-1" /> Add Menu Item
                  </button>
                </div>

                {items.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 font-medium bg-slate-50 dark:bg-stone-900/30 border border-dashed border-[var(--border)] rounded-2xl">
                    No items added yet. Click "Add Menu Item" to configure dishes.
                  </div>
                ) : (
                  <div className="space-y-3.5 max-h-56 overflow-y-auto pr-1">
                    {items.map((item, index) => {
                      const selectedMenu = menus.find((m) => m.id === item.menuId);
                      return (
                        <div key={index} className="flex items-center gap-3 bg-slate-50/50 dark:bg-stone-900/10 p-3 rounded-2xl border border-[var(--border)]">
                          <div className="flex-1">
                            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Dish Name</label>
                            <select
                              value={item.menuId}
                              onChange={(e) => handleItemChange(index, 'menuId', e.target.value)}
                              className="flat-input w-full py-1.5 text-xs cursor-pointer bg-white dark:bg-[#1A1715]"
                            >
                              {menus.map((m) => (
                                <option key={m.id} value={m.id}>
                                  {m.name} (Rp {m.basePrice.toLocaleString()})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="w-24">
                            <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Portions</label>
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                              className="flat-input w-full py-1.5 text-xs bg-white dark:bg-[#1A1715]"
                            />
                          </div>
                          <div className="w-32 text-right">
                            <span className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Subtotal</span>
                            <span className="text-xs font-bold text-slate-800 dark:text-stone-200">
                              Rp {item.subtotal.toLocaleString()}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl mt-4 cursor-pointer"
                          >
                            <i className="fa-solid fa-trash-can" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Delivery Scheduler (Only shown for Delivering, Completed, or manual config) */}
              {(['DELIVERING', 'COMPLETED'].includes(status) || deliveryDate) && (
                <div className="border-t border-[var(--border)] pt-3.5">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Logistics & Delivery Schedule</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Delivery Date</label>
                      <input
                        type="date"
                        required
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        className="flat-input w-full cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Preferred Delivery Time</label>
                      <div className="relative">
                        <i className="fa-regular fa-clock absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={deliveryTime}
                          onChange={(e) => setDeliveryTime(e.target.value)}
                          className="flat-input w-full pl-9"
                          placeholder="e.g. 11:00"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-[var(--border)] pt-4 mt-2">
              <div className="flex items-center gap-1 text-slate-500 dark:text-stone-400">
                <i className="fa-solid fa-rupiah-sign text-sm text-slate-400" />
                <span className="text-xs font-bold uppercase tracking-wider">Total Amount:</span>
                <span className="text-sm font-extrabold text-slate-800 dark:text-stone-100 pl-1">
                  Rp {totalAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[var(--border)] bg-white dark:bg-[#1A1715] hover:bg-slate-50 dark:hover:bg-[#24201D] text-slate-700 dark:text-stone-200 text-xs font-bold transition-all duration-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button type="submit" className="flat-button text-xs py-2.5 px-5">
                  {modalMode === 'create' ? 'Create Order' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Delete Order Dialog */}
      {deleteOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1715] rounded-3xl border border-[var(--border)] max-w-sm w-full p-6 shadow-2xl text-center animate-fade-in-up">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100/50 dark:border-red-900/20">
              <i className="fa-solid fa-trash-can text-xl" />
            </div>
            <h3 className="text-base font-extrabold text-slate-800 dark:text-stone-100 mb-1.5">Delete Order</h3>
            <p className="text-xs text-slate-400 font-medium mb-6 leading-relaxed">
              Are you sure you want to delete order <span className="font-bold text-slate-700 dark:text-stone-200">"#{orderToDelete?.id?.slice(0, 8).toUpperCase()}"</span>? This will also unschedule any corresponding logistics delivery schedules.
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
