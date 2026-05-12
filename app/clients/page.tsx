import { getClients } from '@/app/actions/clientActions';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Mail, 
  Phone,
  AlertTriangle 
} from 'lucide-react';

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your B2B catering partners.</p>
        </div>
        <button className="flat-button">Add New Client</button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search clients..." 
            className="flat-input w-full pl-10"
          />
        </div>
        <button className="flat-button bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Filter className="w-4 h-4" /> Filter
        </button>
      </div>

      <div className="flat-card p-0 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-[var(--border)]">
              <th className="p-4 text-sm font-bold">Company</th>
              <th className="p-4 text-sm font-bold">PIC</th>
              <th className="p-4 text-sm font-bold">Contact</th>
              <th className="p-4 text-sm font-bold">Dietary Alerts</th>
              <th className="p-4 text-sm font-bold text-right">Orders</th>
              <th className="p-4 text-sm font-bold w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {clients.map((client) => {
              const alerts = client.dietaryAlerts as any;
              const hasAlerts = alerts?.allergies?.length > 0 || alerts?.halal || alerts?.kosher;

              return (
                <tr key={client.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <div className="font-bold">{client.companyName}</div>
                    <div className="text-xs text-slate-500 truncate max-w-[200px]">{client.logisticAddress}</div>
                  </td>
                  <td className="p-4 text-sm">{client.picName}</td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Mail className="w-3 h-3" /> {client.email}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Phone className="w-3 h-3" /> {client.phone}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {hasAlerts ? (
                      <div className="flex flex-wrap gap-1">
                        {alerts?.halal && (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 text-[10px] font-bold">HALAL</span>
                        )}
                        {alerts?.allergies?.map((a: string) => (
                          <span key={a} className="px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400 text-[10px] font-bold flex items-center gap-1">
                            <AlertTriangle className="w-2 h-2" /> {a.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">None</span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-right font-medium">
                    {client._count.orders}
                  </td>
                  <td className="p-4 text-right">
                    <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <MoreHorizontal className="w-4 h-4 text-slate-500" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
