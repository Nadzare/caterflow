'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getDeliveries() {
  try {
    const deliveries = await prisma.delivery.findMany({
      include: {
        order: {
          include: {
            client: true,
          },
        },
      },
      orderBy: {
        deliveryDate: 'asc',
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
      // Green for DELIVERED, blue for scheduled/pending
      backgroundColor: d.status === 'DELIVERED' ? '#10b981' : '#3b82f6',

      borderColor: 'transparent',
    }));
  } catch (error) {
    console.error('Failed to get deliveries:', error);
    return [];
  }
}

export async function rescheduleDelivery(id: string, dateStr: string, timeStr: string) {
  try {
    const delivery = await prisma.delivery.update({
      where: { id },
      data: {
        deliveryDate: new Date(dateStr),
        deliveryTime: timeStr,
      },
    });

    revalidatePath('/deliveries');
    revalidatePath('/orders');
    revalidatePath('/dashboard');

    return { success: true, delivery };
  } catch (error: any) {
    console.error('Failed to reschedule delivery:', error);
    return { success: false, error: error.message || 'Failed to reschedule delivery' };
  }
}

export async function completeDelivery(id: string) {
  try {
    // 1. Update delivery status
    const delivery = await prisma.delivery.update({
      where: { id },
      data: {
        status: 'DELIVERED',
      },
    });

    // 2. Update parent order status to COMPLETED
    await prisma.order.update({
      where: { id: delivery.orderId },
      data: {
        status: 'COMPLETED',
      },
    });

    revalidatePath('/deliveries');
    revalidatePath('/orders');
    revalidatePath('/dashboard');

    return { success: true, delivery };
  } catch (error: any) {
    console.error('Failed to complete delivery:', error);
    return { success: false, error: error.message || 'Failed to complete delivery' };
  }
}

