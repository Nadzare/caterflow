'use server'

import { prisma } from '@/lib/prisma';

export async function getDashboardStats() {
  try {
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

    // For chart data: Orders per day for the last 7 days (grouped in JS to avoid timezone/time grouping issues)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentOrders = await prisma.order.findMany({
      where: {
        orderDate: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        orderDate: true,
      },
    });

    const dailyCounts: Record<string, number> = {};
    const chartData = [];

    // Initialize the last 7 days (from 6 days ago up to today) with 0
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      dailyCounts[dayLabel] = 0;
    }

    // Aggregate order counts by day label
    recentOrders.forEach((order) => {
      const dayLabel = order.orderDate.toLocaleDateString('en-US', { weekday: 'short' });
      if (dayLabel in dailyCounts) {
        dailyCounts[dayLabel]++;
      }
    });

    // Convert map to Recharts format
    for (const [date, count] of Object.entries(dailyCounts)) {
      chartData.push({
        date,
        orders: count,
      });
    }

    return {
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      activeOrdersCount,
      topMenus: topMenusWithDetails,
      chartData,
    };
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    
    // Return empty fallback data if database is paused/unavailable
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      chartData.push({
        date: d.toLocaleDateString('en-US', { weekday: 'short' }),
        orders: 0,
      });
    }

    return {
      totalRevenue: 0,
      activeOrdersCount: 0,
      topMenus: [],
      chartData,
    };
  }
}
