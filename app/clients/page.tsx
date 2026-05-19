import { getClients } from '@/app/actions/clientActions';
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Mail, 
  Phone,
  AlertTriangle,
  UserPlus
} from 'lucide-react';

export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-stone-100">Clients</h1>
          <p className="text-sm text-slate-500 dark:text-stone-400 font-medium">Manage and monitor your B2B catering partners.</p>
        </div>
        <button className="flat-button">
          <UserPlus className="w-4 h-4" /> Add New Client
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 dark:text-stone-500" />
          <input 
            type="text" 
            placeholder="Search clients by name, PIC or email..." 
            className="flat-input w-full pl-11 py-2.5 focus:shadow-sm"
          />
        </div>
        <button className="px-4 py-2.5 rounded-xl border border-[var(--border)] bg-white dark:bg-[#1A1715] hover:bg-slate-50 dark:hover:bg-[#24201D] text-slate-700 dark:text-stone-200 text-sm font-semibold flex items-center gap-2 transition-colors duration-200 cursor-pointer">
          <Filter className="w-4 h-4 text-slate-400" /> Filter
        </button>
      </div>

      {/* Clients Table Container */}
      <div className="flat-card p-0 overflow-hidden border border-[var(--border)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-orange-50/20 dark:bg-orange-950/5 border-b border-[var(--border)]">
                <th className="py-4 px-6 text-[11px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider">Company</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider">PIC Name</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider">Contact Info</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider">Dietary Alerts</th>
                <th className="py-4 px-6 text-[11px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider text-right">Orders</th>
                <th className="py-4 px-6 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {clients.map((client) => {
                const alerts = client.dietaryAlerts as any;
                const hasAlerts = alerts?.allergies?.length > 0 || alerts?.halal || alerts?.kosher;

                return (
                  <tr key={client.id} className="hover:bg-slate-50/40 dark:hover:bg-stone-900/10 transition-colors duration-150">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-800 dark:text-stone-100 text-sm">{client.companyName}</div>
                      <div className="text-xs text-slate-400 dark:text-stone-500 truncate max-w-[240px] mt-0.5">{client.logisticAddress}</div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 dark:text-stone-300 text-sm font-medium">
                      {client.picName}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-stone-400">
                          <Mail className="w-3.5 h-3.5 text-slate-400" /> {client.email}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-stone-400">
                          <Phone className="w-3.5 h-3.5 text-slate-400" /> {client.phone}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {hasAlerts ? (
                        <div className="flex flex-wrap gap-1.5">
                          {alerts?.halal && (
                            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/20 text-[10px] font-bold rounded-full">
                              HALAL
                            </span>
                          )}
                          {alerts?.allergies?.map((a: string) => (
                            <span key={a} className="px-2.5 py-0.5 bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-100/50 dark:border-rose-900/20 text-[10px] font-bold rounded-full flex items-center gap-1">
                              <AlertTriangle className="w-2.5 h-2.5 text-rose-500" /> {a.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 dark:text-stone-500 font-medium">None</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-right font-semibold text-slate-700 dark:text-stone-200">
                      {client._count.orders}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-stone-850 text-slate-400 hover:text-slate-600 transition-colors duration-150 cursor-pointer">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

