import { getDeliveries } from '@/app/actions/deliveryActions';
import { DeliveryCalendarWrapper } from '@/components/deliveries/DeliveryCalendarWrapper';

export default async function DeliveriesPage() {
  const deliveries = await getDeliveries();

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-stone-100">Deliveries</h1>
          <p className="text-sm text-slate-500 dark:text-stone-400 font-medium">View, monitor and dispatch catering logistics schedules.</p>
        </div>

        {/* Legend Badges */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-900/10 rounded-full">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Scheduled</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/10 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Delivered</span>
          </div>
        </div>
      </div>

      <DeliveryCalendarWrapper events={deliveries} />
    </div>
  );
}

