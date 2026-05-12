'use server'

import { prisma } from '@/lib/prisma';

export async function getDashboardStats() {
  const totalRevenue = await prisma.order.aggregate({
    _sum: {
      totalAmount: true,
    },
    where: {
      status: 'COMPLETED',
    },
  });

  const activeOrdersCount = await prisma.order.count({
    where: {
      status: {
        in: ['DP_PAID', 'IN_PRODUCTION', 'DELIVERING'],
      },
    },
  });

  const topMenus = await prisma.orderItem.groupBy({
    by: ['menuId'],
    _count: {
      menuId: true,
    },
    orderBy: {
      _count: {
        menuId: 'desc',
      },
    },
    take: 5,
  });

  const topMenusWithDetails = await Promise.all(
    topMenus.map(async (item) => {
      const menu = await prisma.menu.findUnique({
        where: { id: item.menuId },
      });
      return {
        name: menu?.name || 'Unknown',
        count: item._count.menuId,
      };
    })
  );

  // For chart data: Orders per day for the last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const orderTrends = await prisma.order.groupBy({
    by: ['orderDate'],
    _count: {
      id: true,
    },
    where: {
      orderDate: {
        gte: sevenDaysAgo,
      },
    },
    orderBy: {
      orderDate: 'asc',
    },
  });

  const chartData = orderTrends.map((d) => ({
    date: d.orderDate.toLocaleDateString('en-US', { weekday: 'short' }),
    orders: d._count.id,
  }));

  return {
    totalRevenue: totalRevenue._sum.totalAmount || 0,
    activeOrdersCount,
    topMenus: topMenusWithDetails,
    chartData,
  };
}
