'use server'

import { prisma } from '@/lib/prisma';

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
