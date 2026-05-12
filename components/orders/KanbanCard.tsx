'use client'

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreHorizontal, Clock, DollarSign } from 'lucide-react';

interface KanbanCardProps {
  order: any;
}

export function KanbanCard({ order }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: order.id,
    data: {
      type: 'Order',
      order,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flat-card p-4 opacity-30 border-2 border-dashed border-[var(--primary)] h-[120px]"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flat-card p-4 bg-[var(--card)] hover:border-slate-400 dark:hover:border-slate-500 cursor-grab active:cursor-grabbing transition-colors"
    >
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">#{order.id.slice(0, 8)}</span>
        <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800">
          <MoreHorizontal className="w-3 h-3 text-slate-400" />
        </button>
      </div>
      
      <div className="font-bold text-sm mb-2">{order.client.companyName}</div>
      
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <DollarSign className="w-3 h-3" />
          Rp {order.totalAmount.toLocaleString()}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Clock className="w-3 h-3" />
          {new Date(order.orderDate).toLocaleDateString('en-GB')}
        </div>
      </div>

      <div className="mt-3 flex -space-x-1 overflow-hidden">
        {order.orderItems.slice(0, 3).map((item: any, i: number) => (
          <div 
            key={i} 
            className="inline-block h-6 w-6 rounded-full ring-2 ring-[var(--card)] bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold"
            title={item.menu.name}
          >
            {item.menu.name[0]}
          </div>
        ))}
        {order.orderItems.length > 3 && (
          <div className="inline-block h-6 w-6 rounded-full ring-2 ring-[var(--card)] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold">
            +{order.orderItems.length - 3}
          </div>
        )}
      </div>
    </div>
  );
}
