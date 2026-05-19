'use server'

import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function getOrdersByStatus() {
  const orders = await prisma.order.findMany({
    include: {
      client: true,
      orderItems: {
        include: {
          menu: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  const categorized = {
    QUOTATION: orders.filter((o) => o.status === 'QUOTATION'),
    DP_PAID: orders.filter((o) => o.status === 'DP_PAID'),
    IN_PRODUCTION: orders.filter((o) => o.status === 'IN_PRODUCTION'),
    DELIVERING: orders.filter((o) => o.status === 'DELIVERING'),
    COMPLETED: orders.filter((o) => o.status === 'COMPLETED'),
  };

  return categorized;
}

export async function updateOrderStatus(orderId: string, newStatus: OrderStatus) {
  try {
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });
    
    revalidatePath('/orders');
    revalidatePath('/dashboard');
    
    return { success: true, order: updatedOrder };
  } catch (error) {
    console.error('Failed to update order status:', error);
    return { success: false, error: 'Failed to update order status' };
  }
}

export async function getOrderDetails(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        client: true,
        orderItems: {
          include: {
            menu: true,
          },
        },
      },
    });
    return order;
  } catch (error) {
    console.error('Failed to fetch order details:', error);
    return null;
  }
}

