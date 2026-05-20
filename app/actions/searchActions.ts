'use server'

import { prisma } from '@/lib/prisma';

export async function searchEntities(query: string) {
  if (!query || query.trim() === '') {
    return { clients: [], orders: [] };
  }

  const cleanQuery = query.trim();

  try {
    const clients = await prisma.client.findMany({
      where: {
        OR: [
          { companyName: { contains: cleanQuery, mode: 'insensitive' } },
          { picName: { contains: cleanQuery, mode: 'insensitive' } },
          { email: { contains: cleanQuery, mode: 'insensitive' } },
        ],
      },
      take: 5,
    });

    const orders = await prisma.order.findMany({
      where: {
        OR: [
          { id: { contains: cleanQuery, mode: 'insensitive' } },
          {
            client: {
              companyName: { contains: cleanQuery, mode: 'insensitive' },
            },
          },
        ],
      },
      include: {
        client: true,
      },
      take: 5,
    });

    return { clients, orders };
  } catch (error) {
    console.error('Failed to search entities:', error);
    return { clients: [], orders: [] };
  }
}
