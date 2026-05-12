import { getDashboardStats } from '@/app/actions/dashboardActions';
import { OrderChart } from '@/components/dashboard/OrderChart';
import { 
  DollarSign, 
  Package, 
  TrendingUp, 
  Award 
} from 'lucide-react';

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400">Welcome back to CaterFlow overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="flat-card flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold">Rp {stats.totalRevenue.toLocaleString()}</div>
          <div className="text-xs text-emerald-500 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +12% from last month
          </div>
        </div>

        <div className="flat-card flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Active Orders</span>
            <Package className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold">{stats.activeOrdersCount}</div>
          <div className="text-xs text-slate-500">Orders currently in progress</div>
        </div>

        <div className="flat-card flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Completion Rate</span>
            <Award className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold">94.2%</div>
          <div className="text-xs text-emerald-500">On-time deliveries</div>
        </div>

        <div className="flat-card flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">Top Menu</span>
            <Award className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-lg font-bold truncate">{stats.topMenus[0]?.name || 'N/A'}</div>
          <div className="text-xs text-slate-500">Most ordered this week</div>
        </div>
      </div>

      {/* Chart and Top Menus */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="flat-card lg:col-span-2">
          <h2 className="text-lg font-bold mb-6">Order Trends</h2>
          <OrderChart data={stats.chartData} />
        </div>

        <div className="flat-card">
          <h2 className="text-lg font-bold mb-6">Top Menus</h2>
          <div className="space-y-4">
            {stats.topMenus.map((menu, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </div>
                  <span className="text-sm font-medium">{menu.name}</span>
                </div>
                <span className="text-sm text-slate-500">{menu.count} orders</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
