'use client'

import { useState } from 'react';
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
import { updateOrderStatus } from '@/app/actions/orderActions';
import { OrderStatus } from '@prisma/client';

interface KanbanBoardProps {
  initialData: Record<OrderStatus, any[]>;
}

const COLUMNS: { id: OrderStatus; title: string }[] = [
  { id: 'QUOTATION', title: 'Quotation' },
  { id: 'DP_PAID', title: 'DP Paid' },
  { id: 'IN_PRODUCTION', title: 'In Production' },
  { id: 'DELIVERING', title: 'Delivering' },
  { id: 'COMPLETED', title: 'Completed' },
];

export function KanbanBoard({ initialData }: KanbanBoardProps) {
  const [data, setData] = useState(initialData);
  const [activeOrder, setActiveOrder] = useState<any | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

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

    // Find columns
    const activeColumn = findColumn(activeId);
    const overColumn = overId in data ? (overId as OrderStatus) : findColumn(overId);

    if (!activeColumn || !overColumn) {
      setActiveOrder(null);
      return;
    }

    if (activeColumn !== overColumn) {
      // Update DB
      const result = await updateOrderStatus(activeId, overColumn);
      
      if (!result.success) {
        // Rollback or notify
        console.error(result.error);
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
  );
}
