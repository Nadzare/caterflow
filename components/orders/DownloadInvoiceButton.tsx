'use client'

import { generateInvoicePDF } from '@/lib/invoiceGenerator';

interface DownloadInvoiceButtonProps {
  order: {
    id: string;
    orderDate: Date | string;
    totalAmount: number;
    status: string;
    client: {
      companyName: string;
      picName: string;
      email: string | null;
      phone: string | null;
      logisticAddress: string;
    };
    orderItems: Array<{
      id: string;
      menu: {
        name: string;
        basePrice: number;
      };
      quantity: number;
      subtotal: number;
    }>;
  };
}

export function DownloadInvoiceButton({ order }: DownloadInvoiceButtonProps) {
  return (
    <button
      onClick={() => generateInvoicePDF(order)}
      className="px-5 py-2.5 bg-[#FF6B35] hover:bg-orange-650 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow flex items-center gap-2 transition-all duration-200 cursor-pointer"
      title="Download PDF version of this invoice"
    >
      <i className="fa-solid fa-file-invoice text-sm" />
      Download PDF Invoice
    </button>
  );
}
