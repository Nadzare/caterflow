import { getDeliveries } from '@/app/actions/deliveryActions';
import { DeliveryCalendarWrapper } from '@/components/deliveries/DeliveryCalendarWrapper';

export default async function DeliveriesPage() {
  const deliveries = await getDeliveries();


  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Deliveries</h1>
        <p className="text-slate-500 dark:text-slate-400">View and manage logistic schedules.</p>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500" />
          <span className="text-xs font-medium">Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500" />
          <span className="text-xs font-medium">Delivered</span>
        </div>
      </div>

      <DeliveryCalendarWrapper events={deliveries} />
    </div>
  );
}
