'use server'

import { prisma } from '@/lib/prisma';

export async function getTenants() {
  try {
    return await prisma.tenant.findMany({
      include: {
        _count: {
          select: { users: true, clients: true, orders: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch (error) {
    console.error('Failed to fetch tenants:', error);
    return [];
  }
}

export async function deleteTenant(id: string) {
  try {
    return await prisma.tenant.delete({
      where: { id },
    });
  } catch (error) {
    console.error('Failed to delete tenant:', error);
    throw new Error('Gagal menghapus tenant katering.');
  }
}

export async function getPlatformStats() {
  try {
    const [totalTenants, totalUsers, pendingRequests] = await Promise.all([
      prisma.tenant.count(),
      prisma.user.count(),
      prisma.registrationRequest.count({ where: { status: 'PENDING' } }),
    ]);

    return {
      totalTenants,
      totalUsers,
      pendingRequests,
    };
  } catch (error) {
    console.error('Failed to get platform stats:', error);
    return {
      totalTenants: 0,
      totalUsers: 0,
      pendingRequests: 0,
    };
  }
}
