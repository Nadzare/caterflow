'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

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

  return (
    <div className="flat-card p-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
        <h2 className="text-lg font-bold">
          {MONTHS[currentMonth]} {currentYear}
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setCurrentMonth(today.getMonth()); setCurrentYear(today.getFullYear()); setSelectedDay(null); }}
            className="px-3 py-1 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-[var(--border)]"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-[var(--border)]">
        {DAYS.map(d => (
          <div key={d} className="py-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
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
                'min-h-[80px] p-1.5 border-b border-r border-[var(--border)] transition-colors',
                isValidDay ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50' : 'bg-slate-50/30 dark:bg-slate-900/20',
                isSelected ? 'bg-slate-100 dark:bg-slate-800' : '',
              ].join(' ')}
            >
              {isValidDay && (
                <>
                  <div className={[
                    'w-6 h-6 flex items-center justify-center text-xs font-medium mb-1',
                    isToday ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : '',
                  ].join(' ')}>
                    {day}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {dayEvents.slice(0, 2).map(ev => (
                      <div
                        key={ev.id}
                        className="text-[9px] font-bold truncate px-1 py-0.5 text-white"
                        style={{ backgroundColor: ev.backgroundColor || '#3b82f6' }}
                      >
                        {ev.extendedProps?.client || ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[9px] text-slate-400 pl-1">
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
        <div className="border-t border-[var(--border)] px-6 py-4">
          <h3 className="text-sm font-bold mb-3">
            {MONTHS[currentMonth]} {selectedDay}, {currentYear}
            <span className="ml-2 text-xs font-normal text-slate-500">
              {selectedEvents.length} delivery schedule{selectedEvents.length !== 1 ? 's' : ''}
            </span>
          </h3>
          {selectedEvents.length === 0 ? (
            <p className="text-sm text-slate-400">No deliveries scheduled for this day.</p>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map(ev => (
                <div key={ev.id} className="flex items-center gap-3 p-3 border border-[var(--border)]">
                  <div
                    className="w-2 h-full self-stretch min-h-[2rem]"
                    style={{ backgroundColor: ev.backgroundColor || '#3b82f6' }}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-bold">{ev.extendedProps?.client || ev.title}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-3 mt-0.5">
                      <span>🕐 {ev.extendedProps?.time || '—'}</span>
                      <span
                        className="px-1.5 py-0.5 text-[10px] font-bold text-white"
                        style={{ backgroundColor: ev.backgroundColor || '#3b82f6' }}
                      >
                        {ev.extendedProps?.status || 'SCHEDULED'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
