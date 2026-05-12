'use client';

import DeliveryCalendar from './DeliveryCalendar';

interface DeliveryCalendarWrapperProps {
  events: any[];
}

export function DeliveryCalendarWrapper({ events }: DeliveryCalendarWrapperProps) {
  return <DeliveryCalendar events={events} />;
}
