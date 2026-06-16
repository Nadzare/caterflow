import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Clean up incorrect data from the other tenant
  console.log('Cleaning up old incorrect dummy data...');
  try {
    await prisma.orderItem.deleteMany({
      where: {
        orderId: {
          in: ['aa8f66eb-c9a7-42f9-a510-ae7c42f5a1a7', 'fa3f534c-b34f-4216-b1eb-8955d504e720']
        }
      }
    });
    await prisma.order.deleteMany({
      where: {
        id: {
          in: ['aa8f66eb-c9a7-42f9-a510-ae7c42f5a1a7', 'fa3f534c-b34f-4216-b1eb-8955d504e720']
        }
      }
    });
    await prisma.client.deleteMany({
      where: {
        id: {
          in: [
            '0743a284-c930-406a-8876-fe74c20da518',
            '38d2841d-7555-4995-a20c-7a79d08ca473',
            '1bb78ed2-be35-4a78-9626-6f8b052bfc15'
          ]
        }
      }
    });
    console.log('Cleaned up successfully.');
  } catch (err) {
    console.log('Clean up warning (some items might not exist):', err);
  }

  // 2. Find the "Segara" tenant
  console.log('Finding tenant "Segara"...');
  const segaraTenant = await prisma.tenant.findUnique({
    where: { name: 'Segara' }
  });

  if (!segaraTenant) {
    throw new Error('Tenant "Segara" not found in the database!');
  }

  const tenantId = segaraTenant.id;
  console.log(`Found tenant "Segara" with ID: ${tenantId}`);

  // Get menus belonging to the "Segara" tenant or global menus (where tenantId is null)
  const menus = await prisma.menu.findMany({
    where: {
      OR: [
        { tenantId: tenantId },
        { tenantId: null }
      ]
    }
  });

  if (menus.length === 0) {
    throw new Error("No menus found for Segara tenant!");
  }
  const randomMenu = menus[0];
  console.log(`Using menu: ${randomMenu.name} (ID: ${randomMenu.id})`);

  console.log('Creating follow up dummy clients under "Segara"...');

  // 1. Client with NEVER ordered
  const clientNever = await prisma.client.create({
    data: {
      companyName: 'PT Baru Mulai (Simulasi)',
      picName: 'Rian Hidayat',
      email: 'rian@barumulai.com',
      phone: '085211223344',
      logisticAddress: 'Jl. Pemuda No. 12, Bandung',
      tenantId: tenantId,
      dietaryAlerts: { allergies: [], halal: true }
    }
  });
  console.log(`Created Client 'PT Baru Mulai (Simulasi)': ID ${clientNever.id}`);

  // 2. Client with last order 20 days ago (Idle 20 days)
  const clientIdle20 = await prisma.client.create({
    data: {
      companyName: 'PT Medika Perkasa (Idle 20 Hari)',
      picName: 'dr. Sarah Amelia',
      email: 'sarah@medikaperkasa.co.id',
      phone: '081399887766',
      logisticAddress: 'Kawasan Industri Jababeka Blok C-15, Cikarang',
      tenantId: tenantId,
      dietaryAlerts: { allergies: ['Dairy'], halal: true }
    }
  });
  console.log(`Created Client 'PT Medika Perkasa (Idle 20 Hari)': ID ${clientIdle20.id}`);

  const orderDate20 = new Date();
  orderDate20.setDate(orderDate20.getDate() - 20); // 20 days ago

  const order20 = await prisma.order.create({
    data: {
      clientId: clientIdle20.id,
      status: 'COMPLETED',
      totalAmount: randomMenu.basePrice * 15,
      orderDate: orderDate20,
      tenantId: tenantId,
      orderItems: {
        create: [
          {
            menuId: randomMenu.id,
            quantity: 15,
            subtotal: randomMenu.basePrice * 15
          }
        ]
      }
    }
  });
  console.log(`Created order from 20 days ago: ID ${order20.id}`);

  // 3. Client with last order 45 days ago (Idle 45 days)
  const clientIdle45 = await prisma.client.create({
    data: {
      companyName: 'PT Selat Sunda Logistics (Idle 45 Hari)',
      picName: 'Bambang Sudjatmiko',
      email: 'bambang@selatsunda.com',
      phone: '089876543210',
      logisticAddress: 'Pelabuhan Merak No. 101, Cilegon',
      tenantId: tenantId,
      dietaryAlerts: { allergies: ['Seafood'], halal: true }
    }
  });
  console.log(`Created Client 'PT Selat Sunda Logistics (Idle 45 Hari)': ID ${clientIdle45.id}`);

  const orderDate45 = new Date();
  orderDate45.setDate(orderDate45.getDate() - 45); // 45 days ago

  const order45 = await prisma.order.create({
    data: {
      clientId: clientIdle45.id,
      status: 'COMPLETED',
      totalAmount: randomMenu.basePrice * 30,
      orderDate: orderDate45,
      tenantId: tenantId,
      orderItems: {
        create: [
          {
            menuId: randomMenu.id,
            quantity: 30,
            subtotal: randomMenu.basePrice * 30
          }
        ]
      }
    }
  });
  console.log(`Created order from 45 days ago: ID ${order45.id}`);

  console.log('✅ Follow up dummy data added successfully under "Segara"!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
