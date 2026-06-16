import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { DownloadInvoiceButton } from '@/components/orders/DownloadInvoiceButton';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoiceDetailPage({ params }: PageProps) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      client: true,
      orderItems: {
        include: {
          menu: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const orderDate = new Date(order.orderDate);
  const formattedDate = orderDate.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Calculate totals
  let totalPaid = order.totalAmount;
  let balanceDue = 0;
  let paidLabel = 'Total Paid:';
  let balanceLabel = 'Balance Due:';
  let statusText = 'PAID / COMPLETED';
  let statusBg = 'bg-emerald-50 text-emerald-600 border-emerald-100/50 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/20';

  if (order.status === 'QUOTATION') {
    totalPaid = 0;
    balanceDue = order.totalAmount;
    paidLabel = 'Total Paid (0%):';
    statusText = 'UNPAID / QUOTATION';
    statusBg = 'bg-rose-50 text-rose-600 border-rose-100/50 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/20';
  } else if (['DP_PAID', 'IN_PRODUCTION', 'DELIVERING'].includes(order.status)) {
    totalPaid = order.totalAmount * 0.5;
    balanceDue = order.totalAmount * 0.5;
    paidLabel = 'Total Paid (50% DP):';
    balanceLabel = 'Balance Due (50%):';
    statusText = 'DP PAID';
    statusBg = 'bg-blue-50 text-blue-600 border-blue-100/50 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/20';
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] dark:bg-[#12100E] p-4 sm:p-8 flex flex-col items-center">
      {/* Top action bar */}
      <div className="max-w-3xl w-full flex justify-between items-center mb-6 print:hidden">
        <span className="text-xs font-bold text-slate-400 dark:text-stone-500 uppercase tracking-widest flex items-center gap-1.5">
          <i className="fa-solid fa-file-invoice text-sm" />
          Digital Invoice View
        </span>
        <DownloadInvoiceButton order={order} />
      </div>

      {/* Invoice Sheet */}
      <div className="max-w-3xl w-full bg-white dark:bg-[#1A1715] border border-[var(--border)] rounded-3xl p-6 sm:p-12 shadow-xl relative overflow-hidden flex flex-col gap-8">
        <div className="absolute -right-24 -top-24 w-48 h-48 bg-orange-100/30 dark:bg-orange-950/5 rounded-full blur-3xl pointer-events-none" />

        {/* 1. Header (Brand Name & Business Info) */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-[var(--border)] pb-8">
          <div>
            <h1 className="text-3xl font-black text-[#FF6B35] tracking-tight">CaterFlow</h1>
            <p className="text-xs text-slate-400 dark:text-stone-500 mt-1 font-semibold uppercase tracking-wider">Premium B2B Catering Solutions</p>
            <div className="text-xs text-slate-500 dark:text-stone-400 mt-3.5 space-y-1 font-medium">
              <div>WhatsApp: 0851 9085 9889</div>
              <div>Email: info@caterflow.com</div>
            </div>
          </div>
          <div className="text-left sm:text-right flex flex-col sm:items-end gap-3.5">
            <span className="text-2xl font-black text-slate-800 dark:text-stone-100 tracking-tight">INVOICE</span>
            <span className={`px-4 py-1.5 border font-bold text-xs rounded-full uppercase tracking-wider ${statusBg}`}>
              {statusText}
            </span>
          </div>
        </div>

        {/* 2. Grid Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Bill To */}
          <div>
            <span className="block text-[10px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider mb-2">Bill To:</span>
            <div className="font-extrabold text-slate-800 dark:text-stone-100 text-base mb-1.5">{order.client.companyName}</div>
            <div className="text-xs text-slate-500 dark:text-stone-400 space-y-1 font-semibold">
              <div>Attn: {order.client.picName}</div>
              {order.client.phone && <div>Telp: {order.client.phone}</div>}
              {order.client.email && <div>Email: {order.client.email}</div>}
              <div className="pt-2 text-slate-400 dark:text-stone-500 font-medium leading-relaxed max-w-[280px]">{order.client.logisticAddress}</div>
            </div>
          </div>

          {/* Invoice Info */}
          <div className="md:text-right md:flex md:flex-col md:items-end">
            <div>
              <span className="block text-[10px] font-bold text-slate-400 dark:text-stone-500 uppercase tracking-wider mb-2">Invoice Details:</span>
              <div className="text-xs text-slate-500 dark:text-stone-400 space-y-1.5 font-semibold">
                <div><span className="text-slate-400 dark:text-stone-500">Invoice No:</span> <span className="font-extrabold text-slate-700 dark:text-stone-300">INV-{order.id.slice(0, 8).toUpperCase()}</span></div>
                <div><span className="text-slate-400 dark:text-stone-500">Order ID:</span> {order.id}</div>
                <div><span className="text-slate-400 dark:text-stone-500">Date:</span> {formattedDate}</div>
                <div><span className="text-slate-400 dark:text-stone-500">Payment Mode:</span> Supabase Billing System</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Items Table */}
        <div className="border border-[var(--border)] rounded-2xl overflow-hidden mt-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-stone-900/40 border-b border-[var(--border)]">
                <th className="py-3.5 px-4 text-xs font-extrabold text-slate-500 dark:text-stone-400 uppercase tracking-wider w-12 text-center">No.</th>
                <th className="py-3.5 px-4 text-xs font-extrabold text-slate-500 dark:text-stone-400 uppercase tracking-wider">Menu Name</th>
                <th className="py-3.5 px-4 text-xs font-extrabold text-slate-500 dark:text-stone-400 uppercase tracking-wider text-right">Base Price</th>
                <th className="py-3.5 px-4 text-xs font-extrabold text-slate-500 dark:text-stone-400 uppercase tracking-wider text-center w-20">Qty</th>
                <th className="py-3.5 px-4 text-xs font-extrabold text-slate-500 dark:text-stone-400 uppercase tracking-wider text-right w-32">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-xs text-slate-700 dark:text-stone-300 font-semibold">
              {order.orderItems.map((item, index) => (
                <tr key={item.id} className="hover:bg-slate-50/20 dark:hover:bg-stone-900/5 transition-colors duration-150">
                  <td className="py-3.5 px-4 text-center text-slate-400">{index + 1}</td>
                  <td className="py-3.5 px-4 text-slate-800 dark:text-stone-200">{item.menu.name}</td>
                  <td className="py-3.5 px-4 text-right">Rp {item.menu.basePrice.toLocaleString('id-ID')}</td>
                  <td className="py-3.5 px-4 text-center">{item.quantity}</td>
                  <td className="py-3.5 px-4 text-right text-slate-800 dark:text-stone-200">Rp {item.subtotal.toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 4. Totals Block */}
        <div className="flex justify-end mt-4">
          <div className="w-full sm:w-80 space-y-3 font-semibold text-xs text-slate-600 dark:text-stone-300">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="text-slate-800 dark:text-stone-200">Rp {order.totalAmount.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between border-b border-[var(--border)] pb-2.5">
              <span>Tax (0%):</span>
              <span className="text-slate-800 dark:text-stone-200">Rp 0</span>
            </div>
            <div className="flex justify-between text-slate-800 dark:text-stone-200">
              <span className="font-extrabold">{paidLabel}</span>
              <span className="font-extrabold">Rp {totalPaid.toLocaleString('id-ID')}</span>
            </div>
            <div className={`flex justify-between pt-1 ${balanceDue > 0 ? 'text-rose-500' : 'text-slate-755 dark:text-stone-300'}`}>
              <span className="font-extrabold">{balanceLabel}</span>
              <span className="font-extrabold">Rp {balanceDue.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        {/* 5. Footer */}
        <div className="border-t border-[var(--border)] pt-6 text-[10px] text-slate-400 dark:text-stone-500 font-medium leading-relaxed mt-4">
          <div className="font-bold uppercase tracking-wider text-slate-500 dark:text-stone-400 mb-1">Terms & Conditions:</div>
          <div>Thank you for partnering with CaterFlow. All orders are subject to our standard B2B catering service agreements.</div>
        </div>
      </div>
    </div>
  );
}
