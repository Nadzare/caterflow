'use client'

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  id: string;
  title: string;
  orders: any[];
}

export function KanbanColumn({ id, title, orders }: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <div className="flex flex-col gap-4 w-[300px] min-w-[300px]">
      <div className="flex items-center justify-between px-2">
        <h3 className="font-bold text-sm tracking-tight flex items-center gap-2">
          {title}
          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 font-bold text-slate-500">
            {orders.length}
          </span>
        </h3>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 flex flex-col gap-3 min-h-[500px]"
      >
        <SortableContext
          items={orders.map((o) => o.id)}
          strategy={verticalListSortingStrategy}
        >
          {orders.map((order) => (
            <KanbanCard key={order.id} order={order} />
          ))}
        </SortableContext>
        
        {/* Empty state visual when no items */}
        {orders.length === 0 && (
          <div className="border border-dashed border-[var(--border)] h-24 flex items-center justify-center text-xs text-slate-400">
            No orders
          </div>
        )}
      </div>
    </div>
  );
}
