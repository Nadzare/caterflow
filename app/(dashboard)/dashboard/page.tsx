import { getDashboardStats } from '@/app/actions/dashboardActions';
import { OrderChart } from '@/components/dashboard/OrderChart';


export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-stone-100">Dashboard</h1>
        <p className="text-sm text-slate-500 dark:text-stone-400 font-medium">Hello Orlando, welcome back to your catering dashboard.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Revenue */}
        <div className="flat-card flex items-start gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-2xl text-amber-500">
            <i className="fa-solid fa-rupiah-sign text-2xl flex items-center justify-center w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold text-slate-400 dark:text-stone-500 uppercase tracking-wider">Total Revenue</span>
            <div className="text-2xl font-bold text-slate-800 dark:text-stone-100 mt-1">
              Rp {stats.totalRevenue.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1 mt-1.5">
              <i className="fa-solid fa-chart-line text-[11px] mr-1" /> +12.4% vs last month
            </div>
          </div>
        </div>

        {/* Card 2: Active Orders */}
        <div className="flat-card flex items-start gap-4">
          <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-2xl text-[var(--primary)]">
            <i className="fa-solid fa-box text-2xl flex items-center justify-center w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold text-slate-400 dark:text-stone-500 uppercase tracking-wider">Active Orders</span>
            <div className="text-2xl font-bold text-slate-800 dark:text-stone-100 mt-1">
              {stats.activeOrdersCount}
            </div>
            <div className="text-[11px] text-slate-400 dark:text-stone-500 mt-2 flex items-center gap-1">
              <i className="fa-regular fa-clock text-xs mr-1" /> In production & delivery
            </div>
          </div>
        </div>

        {/* Card 3: Completion Rate */}
        <div className="flat-card flex items-start gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl text-emerald-500">
            <i className="fa-solid fa-award text-2xl flex items-center justify-center w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold text-slate-400 dark:text-stone-500 uppercase tracking-wider">Completion Rate</span>
            <div className="text-2xl font-bold text-slate-800 dark:text-stone-100 mt-1">
              94.2%
            </div>
            <div className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1 mt-1.5">
              <i className="fa-solid fa-chart-line text-[11px] mr-1" /> +0.8% on-time deliveries
            </div>
          </div>
        </div>

        {/* Card 4: Top Menu */}
        <div className="flat-card flex items-start gap-4">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/20 rounded-2xl text-rose-500">
            <i className="fa-solid fa-utensils text-2xl flex items-center justify-center w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold text-slate-400 dark:text-stone-500 uppercase tracking-wider">Top Menu</span>
            <div className="text-lg font-bold text-slate-800 dark:text-stone-100 mt-1 truncate" title={stats.topMenus[0]?.name || 'N/A'}>
              {stats.topMenus[0]?.name || 'N/A'}
            </div>
            <div className="text-[11px] text-slate-400 dark:text-stone-500 mt-2">
              Most popular this week
            </div>
          </div>
        </div>
      </div>

      {/* Chart and Top Menus */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="flat-card lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-stone-100">Order Trends</h2>
              <p className="text-xs text-slate-400 dark:text-stone-500">Daily analytics representation of incoming catering orders</p>
            </div>
            <span className="text-xs font-bold text-[var(--primary)] bg-[var(--primary-light)] px-3 py-1 rounded-full">
              This Week
            </span>
          </div>
          <OrderChart data={stats.chartData} />
        </div>

        {/* Top Menus Section */}
        <div className="flat-card">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-stone-100">Top Categories & Menus</h2>
            <p className="text-xs text-slate-400 dark:text-stone-500">Most preferred dishes by client volume</p>
          </div>
          <div className="space-y-4">
            {stats.topMenus.map((menu, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-[#221F1C] transition-colors duration-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/10 text-[var(--primary)] flex items-center justify-center text-xs font-extrabold">
                    {i + 1}
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-stone-200">{menu.name}</span>
                </div>
                <span className="text-xs font-bold text-slate-500 dark:text-stone-400 bg-slate-100 dark:bg-stone-800/80 px-2.5 py-1 rounded-lg">
                  {menu.count} orders
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

