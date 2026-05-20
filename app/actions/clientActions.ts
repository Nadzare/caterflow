'use server'

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getClients() {
  try {
    const clients = await prisma.client.findMany({
      orderBy: {
        companyName: 'asc',
      },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });
    return clients;
  } catch (error) {
    console.error('Failed to fetch clients:', error);
    return [];
  }
}

export async function createClient(data: {
  companyName: string;
  picName: string;
  email?: string;
  phone?: string;
  logisticAddress: string;
  dietaryAlerts?: {
    halal?: boolean;
    kosher?: boolean;
    allergies: string[];
  };
}) {
  try {
    const client = await prisma.client.create({
      data: {
        companyName: data.companyName,
        picName: data.picName,
        email: data.email || null,
        phone: data.phone || null,
        logisticAddress: data.logisticAddress,
        dietaryAlerts: data.dietaryAlerts || { halal: false, kosher: false, allergies: [] },
      },
    });
    revalidatePath('/clients');
    return { success: true, client };
  } catch (error) {
    console.error('Failed to create client:', error);
    return { success: false, error: 'Failed to create client' };
  }
}

export async function updateClient(
  id: string,
  data: {
    companyName: string;
    picName: string;
    email?: string;
    phone?: string;
    logisticAddress: string;
    dietaryAlerts?: {
      halal?: boolean;
      kosher?: boolean;
      allergies: string[];
    };
  }
) {
  try {
    const client = await prisma.client.update({
      where: { id },
      data: {
        companyName: data.companyName,
        picName: data.picName,
        email: data.email || null,
        phone: data.phone || null,
        logisticAddress: data.logisticAddress,
        dietaryAlerts: data.dietaryAlerts || { halal: false, kosher: false, allergies: [] },
      },
    });
    revalidatePath('/clients');
    revalidatePath('/orders');
    return { success: true, client };
  } catch (error) {
    console.error('Failed to update client:', error);
    return { success: false, error: 'Failed to update client' };
  }
}

export async function deleteClient(id: string) {
  try {
    // Delete any dependent orders and order items first to avoid integrity issues,
    // or rely on cascaded operations if setup. Let's delete order items and orders manually
    // since prisma schema doesn't have onDelete: Cascade explicitly in client relation.
    const orders = await prisma.order.findMany({
      where: { clientId: id },
      select: { id: true },
    });
    const orderIds = orders.map((o) => o.id);

    await prisma.delivery.deleteMany({
      where: { orderId: { in: orderIds } },
    });

    await prisma.orderItem.deleteMany({
      where: { orderId: { in: orderIds } },
    });

    await prisma.order.deleteMany({
      where: { clientId: id },
    });

    const client = await prisma.client.delete({
      where: { id },
    });

    revalidatePath('/clients');
    revalidatePath('/orders');
    revalidatePath('/dashboard');
    revalidatePath('/deliveries');
    return { success: true, client };
  } catch (error) {
    console.error('Failed to delete client:', error);
    return { success: false, error: 'Failed to delete client' };
  }
}

