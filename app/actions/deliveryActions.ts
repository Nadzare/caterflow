'use server'

import { prisma } from '@/lib/prisma';

export async function getDeliveries() {
  const deliveries = await prisma.delivery.findMany({
    include: {
      order: {
        include: {
          client: true,
        },
      },
    },
  });

  return deliveries.map((d) => ({
    id: d.id,
    title: `${d.order.client.companyName} - ${d.deliveryTime}`,
    start: d.deliveryDate.toISOString().split('T')[0],
    extendedProps: {
      status: d.status,
      time: d.deliveryTime,
      client: d.order.client.companyName,
    },
    // Adding color coding based on status
    backgroundColor: d.status === 'DELIVERED' ? '#10b981' : '#3b82f6', // emerald-500 or blue-500
    borderColor: 'transparent',
  }));
}
