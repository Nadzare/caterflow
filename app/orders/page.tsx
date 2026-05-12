import { getOrdersByStatus } from '@/app/actions/orderActions';
import { KanbanBoard } from '@/components/orders/KanbanBoard';
import { Plus } from 'lucide-react';

export default async function OrdersPage() {
  const orders = await getOrdersByStatus();

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-slate-500 dark:text-slate-400">Track and manage catering orders in real-time.</p>
        </div>
        <button className="flat-button flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Order
        </button>
      </div>

      <KanbanBoard initialData={orders} />
    </div>
  );
}
