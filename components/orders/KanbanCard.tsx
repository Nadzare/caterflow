'use client'

import { useState, useEffect, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { generateInvoicePDF } from '@/lib/invoiceGenerator';

const sanitizePhoneNumber = (phone: string | null) => {
  if (!phone) return '';
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  }
  return cleaned;
};

interface KanbanCardProps {
  order: any;
  onEditOrder?: (order: any) => void;
  onDeleteOrder?: (order: any) => void;
}

export function KanbanCard({ order, onEditOrder, onDeleteOrder }: KanbanCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: order.id,
    data: {
      type: 'Order',
      order,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDownloadInvoice = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    generateInvoicePDF(order);
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="flat-card p-4 opacity-25 border-2 border-dashed border-[var(--primary)] h-[135px]"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flat-card p-4 bg-white dark:bg-[#1A1715] hover:border-[var(--primary)] hover:border-opacity-30 cursor-grab active:cursor-grabbing transition-all duration-200"
    >
      {/* Top Card Bar */}
      <div className="flex justify-between items-center mb-2.5">
        <span className="text-[10px] font-bold text-slate-400 dark:text-stone-500 bg-slate-50 dark:bg-stone-800/80 px-2 py-0.5 rounded-full uppercase tracking-wider">
          #{order.id.slice(0, 8).toUpperCase()}
        </span>
        
        {/* Dropdown Menu Container */}
        <div ref={menuRef} className="relative">
          <button 
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="p-1 hover:bg-slate-50 dark:hover:bg-stone-850 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <i className="fa-solid fa-ellipsis w-3.5 h-3.5 flex items-center justify-center text-xs" />
          </button>
          
          {menuOpen && (
            <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-[#1A1715] border border-[var(--border)] rounded-xl shadow-lg z-30 py-1 overflow-hidden animate-fade-in-up text-left">
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onEditOrder?.(order);
                }}
                className="w-full px-4 py-2 text-xs font-semibold text-slate-700 dark:text-stone-300 hover:bg-slate-50 dark:hover:bg-[#24201D] flex items-center gap-2 cursor-pointer"
              >
                <i className="fa-solid fa-pen-to-square w-3.5 h-3.5 flex items-center justify-center text-[11px] text-slate-400" /> Edit Order
              </button>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  handleDownloadInvoice(e);
                }}
                className="w-full px-4 py-2 text-xs font-semibold text-slate-700 dark:text-stone-300 hover:bg-slate-50 dark:hover:bg-[#24201D] flex items-center gap-2 cursor-pointer"
              >
                <i className="fa-solid fa-file-invoice w-3.5 h-3.5 flex items-center justify-center text-[11px] text-slate-400" /> Invoice PDF
              </button>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onDeleteOrder?.(order);
                }}
                className="w-full px-4 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/15 flex items-center gap-2 cursor-pointer"
              >
                <i className="fa-solid fa-trash-can w-3.5 h-3.5 flex items-center justify-center text-[11px] text-red-400" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Company Name */}
      <div className="font-bold text-slate-800 dark:text-stone-200 text-sm mb-2">{order.client.companyName}</div>
      
      {/* Meta Specs */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-stone-400">
          <i className="fa-solid fa-rupiah-sign w-3.5 h-3.5 flex items-center justify-center text-[11px] text-slate-400" />
          <span className="font-semibold text-slate-800 dark:text-stone-200">
            Rp {order.totalAmount.toLocaleString()}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-stone-500">
          <i className="fa-regular fa-calendar w-3.5 h-3.5 flex items-center justify-center text-[11px]" />
          <span>{new Date(order.orderDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</span>
        </div>
      </div>

      {/* Item Badges Stack */}
      <div className="mt-3.5 flex items-center justify-between">
        <div className="flex -space-x-1.5 overflow-hidden">
          {order.orderItems.slice(0, 3).map((item: any, i: number) => (
            <div 
              key={i} 
              className="inline-block h-6.5 w-6.5 rounded-full ring-2 ring-white dark:ring-[#1A1715] bg-orange-50 dark:bg-orange-950/30 text-[var(--primary)] border border-orange-100/35 flex items-center justify-center text-[10px] font-extrabold"
              title={item.menu.name}
            >
              {item.menu.name[0]}
            </div>
          ))}
          {order.orderItems.length > 3 && (
            <div className="inline-block h-6.5 w-6.5 rounded-full ring-2 ring-white dark:ring-[#1A1715] bg-slate-50 dark:bg-stone-800 text-slate-500 dark:text-stone-400 border border-slate-100/35 flex items-center justify-center text-[10px] font-extrabold">
              +{order.orderItems.length - 3}
            </div>
          )}
        </div>
        <span className="text-[10px] font-bold text-slate-400 dark:text-stone-500">
          {order.orderItems.length} items
        </span>
      </div>

      {['QUOTATION', 'DP_PAID', 'IN_PRODUCTION', 'DELIVERING', 'COMPLETED'].includes(order.status) && (
        <div className="mt-4 flex gap-2 w-full">
          <button
            onClick={handleDownloadInvoice}
            className="flex-1 py-2 px-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-stone-800 dark:hover:bg-stone-750 text-slate-700 dark:text-stone-300 font-bold text-[10px] rounded-xl border border-slate-100/50 dark:border-stone-700/30 flex items-center justify-center gap-1 transition-all duration-200 cursor-pointer"
            title="Download Invoice PDF"
          >
            <i className="fa-solid fa-file-invoice text-xs text-slate-400" />
            Download
          </button>
          
          {order.client.phone && (
            <a
              href={(() => {
                let statusText = 'Lunas / Selesai ✅';
                let extraInfo = '';
                
                if (order.status === 'QUOTATION') {
                  statusText = 'Quotation / Belum Dibayar 📄';
                  extraInfo = `• *Total Tagihan:* Rp ${order.totalAmount.toLocaleString('id-ID')}
• *Sisa Tagihan:* Rp ${order.totalAmount.toLocaleString('id-ID')}`;
                } else if (['DP_PAID', 'IN_PRODUCTION', 'DELIVERING'].includes(order.status)) {
                  statusText = 'Uang Muka Lunas (DP Paid) 💳';
                  const half = order.totalAmount * 0.5;
                  extraInfo = `• *Total Tagihan:* Rp ${order.totalAmount.toLocaleString('id-ID')}
• *Telah Dibayar (DP 50%):* Rp ${half.toLocaleString('id-ID')}
• *Sisa Tagihan (50%):* Rp ${half.toLocaleString('id-ID')}`;
                } else {
                  extraInfo = `• *Total Tagihan:* Rp ${order.totalAmount.toLocaleString('id-ID')}
• *Telah Dibayar (Lunas):* Rp ${order.totalAmount.toLocaleString('id-ID')}`;
                }

                const message = `Halo *${order.client.picName}* dari *${order.client.companyName}*,

Berikut rincian tagihan (invoice) untuk pesanan *#${order.id.slice(0, 8).toUpperCase()}*:

• *Status:* ${statusText}
${extraInfo}

Lihat detail & unduh Invoice Digital Anda di sini:
${origin ? `${origin}/invoices/${order.id}` : ''}

Terima kasih atas kerja samanya! 😊`;

                return `https://wa.me/${sanitizePhoneNumber(order.client.phone)}?text=${encodeURIComponent(message)}`;
              })()}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 py-2 px-2.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] rounded-xl border border-emerald-100/50 dark:border-emerald-900/20 flex items-center justify-center gap-1 transition-all duration-200 cursor-pointer text-center"
              title="Kirim Invoice via WhatsApp"
            >
              <i className="fa-brands fa-whatsapp text-xs" />
              Kirim WA
            </a>
          )}
        </div>
      )}
    </div>
  );
}


