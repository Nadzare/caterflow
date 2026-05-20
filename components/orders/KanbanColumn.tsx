'use client'

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  id: string;
  title: string;
  orders: any[];
  onEditOrder: (order: any) => void;
  onDeleteOrder: (order: any) => void;
}

export function KanbanColumn({ id, title, orders, onEditOrder, onDeleteOrder }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <div className="flex flex-col gap-4 w-[280px] min-w-[280px] bg-slate-50/50 dark:bg-stone-900/10 p-3.5 rounded-2xl border border-[var(--border)]/60">
      {/* Column Title & Badge */}
      <div className="flex items-center justify-between px-1">
        <h3 className="font-bold text-xs text-slate-600 dark:text-stone-300 uppercase tracking-wider flex items-center gap-2">
          {title}
        </h3>
        <span className="text-[10px] bg-white dark:bg-stone-800 text-[var(--primary)] border border-orange-100/35 dark:border-stone-800 px-2 py-0.5 font-extrabold rounded-full shadow-sm">
          {orders.length}
        </span>
      </div>

      {/* Drop Zone Area */}
      <div
        ref={setNodeRef}
        className="flex-1 flex flex-col gap-3 min-h-[450px] transition-colors duration-200"
      >
        <SortableContext
          items={orders.map((o) => o.id)}
          strategy={verticalListSortingStrategy}
        >
          {orders.map((order) => (
            <KanbanCard 
              key={order.id} 
              order={order} 
              onEditOrder={onEditOrder} 
              onDeleteOrder={onDeleteOrder}
            />
          ))}
        </SortableContext>
        
        {/* Empty state visual when no items */}
        {orders.length === 0 && (
          <div className="border border-dashed border-[var(--border)] rounded-xl h-24 flex items-center justify-center text-xs text-slate-400 dark:text-stone-500 font-medium">
            No orders in {title.toLowerCase()}
          </div>
        )}

      </div>
    </div>
  );
}

