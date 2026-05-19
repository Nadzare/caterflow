import { getOrdersByStatus } from '@/app/actions/orderActions';
import { KanbanBoard } from '@/components/orders/KanbanBoard';
import { Plus } from 'lucide-react';

export default async function OrdersPage() {
  const orders = await getOrdersByStatus();

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-stone-100">Orders</h1>
          <p className="text-sm text-slate-500 dark:text-stone-400 font-medium">Track, manage and process catering orders in real-time.</p>
        </div>
        <button className="flat-button">
          <Plus className="w-4 h-4" /> New Order
        </button>
      </div>

      <KanbanBoard initialData={orders} />
    </div>
  );
}

