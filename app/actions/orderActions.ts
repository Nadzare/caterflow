'use server'

import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function getOrdersByStatus(tenantId?: string) {
  const orders = await prisma.order.findMany({
    where: tenantId ? { tenantId } : {},
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
        delivery: true,
      },
    });
    return order;
  } catch (error) {
    console.error('Failed to fetch order details:', error);
    return null;
  }
}

export async function getMenus(tenantId?: string) {
  try {
    const menus = await prisma.menu.findMany({
      where: tenantId ? { tenantId } : {},
      orderBy: {
        name: 'asc',
      },
    });
    return menus;
  } catch (error) {
    console.error('Failed to fetch menus:', error);
    return [];
  }
}

export async function createOrder(data: {
  clientId: string;
  status: OrderStatus;
  orderDate: string | Date;
  totalAmount: number;
  items: Array<{ menuId: string; quantity: number; subtotal: number }>;
  deliveryDate?: string | Date;
  deliveryTime?: string;
}, tenantId?: string) {
  try {
    const order = await prisma.order.create({
      data: {
        clientId: data.clientId,
        status: data.status,
        totalAmount: data.totalAmount,
        orderDate: new Date(data.orderDate),
        tenantId: tenantId || null,
        orderItems: {
          create: data.items.map((i) => ({
            menuId: i.menuId,
            quantity: i.quantity,
            subtotal: i.subtotal,
          })),
        },
      },
    });

    if (['DELIVERING', 'COMPLETED'].includes(data.status) || data.deliveryDate) {
      const dDate = data.deliveryDate ? new Date(data.deliveryDate) : new Date(new Date(data.orderDate).getTime() + 2 * 24 * 60 * 60 * 1000);
      const dTime = data.deliveryTime || '11:00';
      const dStatus = data.status === 'COMPLETED' ? 'DELIVERED' : 'SCHEDULED';

      await prisma.delivery.create({
        data: {
          orderId: order.id,
          deliveryDate: dDate,
          deliveryTime: dTime,
          status: dStatus,
        },
      });
    }

    revalidatePath('/orders');
    revalidatePath('/dashboard');
    revalidatePath('/deliveries');
    return { success: true, order };
  } catch (error) {
    console.error('Failed to create order:', error);
    return { success: false, error: 'Failed to create order' };
  }
}

export async function updateOrder(
  orderId: string,
  data: {
    clientId: string;
    status: OrderStatus;
    orderDate: string | Date;
    totalAmount: number;
    items: Array<{ menuId: string; quantity: number; subtotal: number }>;
    deliveryDate?: string | Date;
    deliveryTime?: string;
  }
) {
  try {
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Delete existing items
      await tx.orderItem.deleteMany({
        where: { orderId },
      });

      // Update order and create new items
      const order = await tx.order.update({
        where: { id: orderId },
        data: {
          clientId: data.clientId,
          status: data.status,
          totalAmount: data.totalAmount,
          orderDate: new Date(data.orderDate),
          orderItems: {
            create: data.items.map((i) => ({
              menuId: i.menuId,
              quantity: i.quantity,
              subtotal: i.subtotal,
            })),
          },
        },
      });

      // Update or create delivery
      if (['DELIVERING', 'COMPLETED'].includes(data.status) || data.deliveryDate) {
        const dDate = data.deliveryDate ? new Date(data.deliveryDate) : new Date(new Date(data.orderDate).getTime() + 2 * 24 * 60 * 60 * 1000);
        const dTime = data.deliveryTime || '11:00';
        const dStatus = data.status === 'COMPLETED' ? 'DELIVERED' : 'SCHEDULED';

        await tx.delivery.upsert({
          where: { orderId },
          update: {
            deliveryDate: dDate,
            deliveryTime: dTime,
            status: dStatus,
          },
          create: {
            orderId,
            deliveryDate: dDate,
            deliveryTime: dTime,
            status: dStatus,
          },
        });
      } else {
        // If status changed back and no delivery info was provided, delete the delivery
        await tx.delivery.deleteMany({
          where: { orderId },
        });
      }

      return order;
    });

    revalidatePath('/orders');
    revalidatePath('/dashboard');
    revalidatePath('/deliveries');
    return { success: true, order: updatedOrder };
  } catch (error) {
    console.error('Failed to update order:', error);
    return { success: false, error: 'Failed to update order' };
  }
}

export async function deleteOrder(orderId: string) {
  try {
    await prisma.$transaction([
      prisma.delivery.deleteMany({ where: { orderId } }),
      prisma.orderItem.deleteMany({ where: { orderId } }),
      prisma.order.delete({ where: { id: orderId } }),
    ]);

    revalidatePath('/orders');
    revalidatePath('/dashboard');
    revalidatePath('/deliveries');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete order:', error);
    return { success: false, error: 'Failed to delete order' };
  }
}


