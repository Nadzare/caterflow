import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 1. Fetch all orders with date and amount
    const orders = await prisma.order.findMany({
      select: {
        orderDate: true,
        totalAmount: true,
        status: true,
      },
      orderBy: {
        orderDate: 'asc',
      },
    });

    if (orders.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No orders found to generate dataset.",
        data: [],
      });
    }

    // 2. Parse and group orders by YYYY-MM-DD date string
    const dailyDataMap: Record<string, { totalOrders: number; totalRevenue: number; completedOrders: number; pendingOrders: number }> = {};

    orders.forEach((order) => {
      const dateStr = order.orderDate.toISOString().split('T')[0];
      if (!dailyDataMap[dateStr]) {
        dailyDataMap[dateStr] = {
          totalOrders: 0,
          totalRevenue: 0,
          completedOrders: 0,
          pendingOrders: 0,
        };
      }

      dailyDataMap[dateStr].totalOrders += 1;
      dailyDataMap[dateStr].totalRevenue += order.totalAmount;
      if (order.status === 'COMPLETED') {
        dailyDataMap[dateStr].completedOrders += 1;
      } else {
        dailyDataMap[dateStr].pendingOrders += 1;
      }
    });

    // 3. Generate a continuous timeline from minDate to maxDate (filling in gaps with 0)
    const dataset: any[] = [];
    const minDate = new Date(orders[0].orderDate);
    const maxDate = new Date(orders[orders.length - 1].orderDate);

    // Set time to midnight for comparison and iteration
    minDate.setHours(0, 0, 0, 0);
    maxDate.setHours(0, 0, 0, 0);

    const currentDate = new Date(minDate);
    
    while (currentDate <= maxDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayData = dailyDataMap[dateStr] || {
        totalOrders: 0,
        totalRevenue: 0,
        completedOrders: 0,
        pendingOrders: 0,
      };

      const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6 ? 1 : 0;

      dataset.push({
        date: dateStr,
        totalOrders: dayData.totalOrders,
        totalRevenue: dayData.totalRevenue,
        completedOrders: dayData.completedOrders,
        pendingOrders: dayData.pendingOrders,
        dayOfWeek,
        isWeekend,
      });

      // Advance by 1 day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return NextResponse.json({
      success: true,
      meta: {
        totalDays: dataset.length,
        startDate: dataset[0]?.date || null,
        endDate: dataset[dataset.length - 1]?.date || null,
        description: "Continuous daily time-series dataset of catering orders for LSTM model forecasting.",
        features: ["date", "totalOrders", "totalRevenue", "completedOrders", "pendingOrders", "dayOfWeek", "isWeekend"]
      },
      data: dataset,
    });
  } catch (error: any) {
    console.error('Failed to generate ML dataset:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}
