'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, Truck, X } from 'lucide-react';
import { rescheduleDelivery, completeDelivery } from '@/app/actions/deliveryActions';
import { useToast } from '@/components/Toast';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  backgroundColor?: string;
  extendedProps?: {
    status: string;
    time: string;
    client: string;
  };
}

interface DeliveryCalendarProps {
  events: CalendarEvent[];
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function DeliveryCalendar({ events }: DeliveryCalendarProps) {
  const { toast } = useToast();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Reschedule Modal State
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [selectedEventToEdit, setSelectedEventToEdit] = useState<CalendarEvent | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  function prevMonth() {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
    setSelectedDay(null);
  }

  function nextMonth() {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
    setSelectedDay(null);
  }

  function getEventsForDay(day: number): CalendarEvent[] {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.start === dateStr);
  }

  const selectedEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  // Build grid cells: empty leading cells + day cells
  const totalCells = firstDay + daysInMonth;
  const rows = Math.ceil(totalCells / 7);

  const handleCompleteDelivery = async (id: string) => {
    toast('Completing delivery...', 'info');
    const res = await completeDelivery(id);
    if (res.success) {
      toast('Delivery marked as DELIVERED!', 'success');
      window.location.reload();
    } else {
      toast(res.error || 'Failed to complete delivery', 'error');
    }
  };

  const handleSaveReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventToEdit) return;

    toast('Rescheduling delivery...', 'info');
    const res = await rescheduleDelivery(selectedEventToEdit.id, rescheduleDate, rescheduleTime);
    if (res.success) {
      toast('Delivery rescheduled successfully!', 'success');
      setRescheduleOpen(false);
      window.location.reload();
    } else {
      toast(res.error || 'Failed to reschedule delivery', 'error');
    }
  };

  return (
    <div className="flat-card p-0 overflow-hidden relative">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-[var(--border)] bg-slate-50/20 dark:bg-stone-900/5">
        <h2 className="text-base font-extrabold text-slate-800 dark:text-stone-100 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[var(--primary)]" />
          {MONTHS[currentMonth]} {currentYear}
        </h2>
        <div className="flex items-center gap-1.5">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-stone-800 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setCurrentMonth(today.getMonth()); setCurrentYear(today.getFullYear()); setSelectedDay(null); }}
            className="px-3.5 py-1.5 text-xs font-bold rounded-lg hover:bg-slate-100 dark:hover:bg-stone-800 transition-colors border border-[var(--border)] text-slate-600 dark:text-stone-300 cursor-pointer bg-white dark:bg-stone-900"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-stone-800 text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-[var(--border)] bg-orange-50/5 dark:bg-orange-950/2">
        {DAYS.map(d => (
          <div key={d} className="py-2.5 text-center text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-stone-500">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {Array.from({ length: rows * 7 }).map((_, idx) => {
          const day = idx - firstDay + 1;
          const isValidDay = day >= 1 && day <= daysInMonth;
          const isToday =
            isValidDay &&
            day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear();
          const isSelected = isValidDay && day === selectedDay;
          const dayEvents = isValidDay ? getEventsForDay(day) : [];

          return (
            <div
              key={idx}
              onClick={() => isValidDay && setSelectedDay(day === selectedDay ? null : day)}
              className={[
                'min-h-[90px] p-2 border-b border-r border-[var(--border)] transition-colors',
                isValidDay ? 'cursor-pointer hover:bg-orange-50/20 dark:hover:bg-orange-950/5' : 'bg-slate-50/15 dark:bg-stone-900/10',
                isSelected ? 'bg-orange-50/30 dark:bg-orange-950/5' : '',
              ].join(' ')}
            >
              {isValidDay && (
                <>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className={[
                      'w-6 h-6 flex items-center justify-center text-xs font-bold rounded-full',
                      isToday ? 'bg-[var(--primary)] text-white shadow-sm shadow-orange-500/10' : 'text-slate-700 dark:text-stone-300',
                    ].join(' ')}>
                      {day}
                    </div>
                    {dayEvents.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    {dayEvents.slice(0, 2).map(ev => (
                      <div
                        key={ev.id}
                        className="text-[9px] font-extrabold truncate px-2 py-1 rounded text-white shadow-sm shadow-black/2"
                        style={{ backgroundColor: ev.backgroundColor || 'var(--primary)' }}
                      >
                        {ev.extendedProps?.client || ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[9px] text-slate-400 dark:text-stone-500 font-bold pl-1 mt-0.5">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected day events panel */}
      {selectedDay && (
        <div className="border-t border-[var(--border)] px-6 py-5 bg-slate-50/10 dark:bg-stone-900/5">
          <h3 className="text-sm font-bold text-slate-800 dark:text-stone-200 mb-4 flex items-center gap-2">
            <span>Schedule for {MONTHS[currentMonth]} {selectedDay}, {currentYear}</span>
            <span className="text-[11px] font-bold text-[var(--primary)] bg-[var(--primary-light)] px-2.5 py-0.5 rounded-full">
              {selectedEvents.length} delivery{selectedEvents.length !== 1 ? 's' : ''}
            </span>
          </h3>
          {selectedEvents.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-stone-500">No deliveries scheduled for this day.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedEvents.map(ev => (
                <div key={ev.id} className="flex items-center justify-between p-3.5 bg-white dark:bg-[#1A1715] border border-[var(--border)] rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 gap-4">
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <div
                      className="w-1.5 self-stretch rounded-full"
                      style={{ backgroundColor: ev.backgroundColor || 'var(--primary)' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-slate-800 dark:text-stone-200 truncate">
                        {ev.extendedProps?.client || ev.title}
                      </div>
                      <div className="text-xs text-slate-400 dark:text-stone-500 flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 font-semibold">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {ev.extendedProps?.time || '—'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Truck className="w-3.5 h-3.5 text-slate-400" />
                          <span className="uppercase text-[10px] tracking-wider font-bold" style={{ color: ev.backgroundColor || 'var(--primary)' }}>
                            {ev.extendedProps?.status || 'SCHEDULED'}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {ev.extendedProps?.status !== 'DELIVERED' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedEventToEdit(ev);
                          setRescheduleDate(ev.start);
                          setRescheduleTime(ev.extendedProps?.time || '11:00');
                          setRescheduleOpen(true);
                        }}
                        className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-stone-800 dark:hover:bg-stone-700 text-slate-600 dark:text-stone-300 text-[10px] font-bold rounded-lg border border-[var(--border)] transition-colors cursor-pointer"
                      >
                        Reschedule
                      </button>
                      <button
                        onClick={() => handleCompleteDelivery(ev.id)}
                        className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-lg border border-emerald-100/50 dark:border-emerald-900/20 transition-colors cursor-pointer"
                      >
                        Complete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reschedule Delivery Modal */}
      {rescheduleOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveReschedule}
            className="bg-white dark:bg-[#1A1715] rounded-3xl border border-[var(--border)] max-w-sm w-full p-6 shadow-2xl animate-fade-in-up"
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-stone-100">
                Reschedule Delivery
              </h3>
              <button
                type="button"
                onClick={() => setRescheduleOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-stone-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[11px] text-slate-400 font-semibold mb-4 leading-relaxed">
              Reschedule delivery logistics for <span className="font-bold text-slate-700 dark:text-stone-200">"{selectedEventToEdit?.extendedProps?.client}"</span>.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">New Delivery Date</label>
                <input
                  type="date"
                  required
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="flat-input w-full cursor-pointer"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">New Delivery Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="flat-input w-full pl-9"
                    placeholder="e.g. 11:00"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setRescheduleOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-[var(--border)] bg-white dark:bg-[#1A1715] hover:bg-slate-50 dark:hover:bg-[#24201D] text-slate-700 dark:text-stone-200 text-xs font-bold transition-all duration-200 cursor-pointer"
              >
                Cancel
              </button>
              <button type="submit" className="flex-1 flat-button text-xs py-2.5 rounded-xl">
                Save Schedule
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}


