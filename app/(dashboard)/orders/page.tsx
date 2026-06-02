import { getOrdersByStatus, getMenus } from '@/app/actions/orderActions';
import { getClients } from '@/app/actions/clientActions';
import { KanbanBoard } from '@/components/orders/KanbanBoard';

export default async function OrdersPage() {
  const orders = await getOrdersByStatus();
  const clients = await getClients();
  const menus = await getMenus();

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <KanbanBoard initialData={orders} clients={clients} menus={menus} />
    </div>
  );
}


