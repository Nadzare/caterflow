const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log('Updating order dates in Supabase...');
  try {
    const orders = await prisma.order.findMany({
      orderBy: { orderDate: 'asc' }
    });

    console.log(`Found ${orders.length} orders. Shifting dates...`);

    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const newDate = new Date();
      // Distribute dates over the last 12 days
      const daysAgo = Math.floor((i / orders.length) * 12); 
      newDate.setDate(newDate.getDate() - daysAgo);
      // Random hour
      newDate.setHours(9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0);

      await prisma.order.update({
        where: { id: order.id },
        data: { orderDate: newDate }
      });
      
      // Update delivery date if it exists
      const delivery = await prisma.delivery.findFirst({
        where: { orderId: order.id }
      });
      if (delivery) {
        const delDate = new Date(newDate);
        delDate.setDate(delDate.getDate() + 1); // Deliver 1 day after order
        await prisma.delivery.update({
          where: { id: delivery.id },
          data: { deliveryDate: delDate }
        });
      }
    }

    console.log('Successfully updated all order and delivery dates in database!');
  } catch (err) {
    console.error('Error shifting dates:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
