const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const emailTarget = 'segara@gmail.com';
  console.log(`Starting passive/inactive client simulation seed for: ${emailTarget}`);

  // Find the target user and tenant
  const user = await prisma.user.findUnique({
    where: { email: emailTarget },
    include: { tenant: true }
  });

  if (!user || !user.tenantId) {
    console.error(`Error: User or tenant not found for ${emailTarget}`);
    return;
  }

  const tenantId = user.tenantId;
  console.log(`Found tenant ID: ${tenantId}`);

  // Get a menu item to associate with the orders
  const menu = await prisma.menu.findFirst({
    where: { tenantId: tenantId }
  });

  if (!menu) {
    console.error('Error: Please run seed-segara.js first to seed menus for this tenant.');
    return;
  }

  // 1. Client A: Inaktif Jaya (Last order was 30 days ago -> Idle/Inactive)
  const clientAData = {
    companyName: 'PT Inaktif Jaya',
    picName: 'Bambang Kurnia',
    email: 'bambang@inaktifjaya.com',
    phone: '081234560001',
    logisticAddress: 'Kawasan Industri Pulogadung Blok C, Jakarta Timur',
    dietaryAlerts: { allergies: ['Peanut'], halal: true },
    tenantId: tenantId
  };

  let clientA = await prisma.client.findFirst({
    where: { companyName: clientAData.companyName, tenantId: tenantId }
  });

  if (!clientA) {
    clientA = await prisma.client.create({ data: clientAData });
    console.log(`- Created client: ${clientA.companyName}`);
  }

  // Create order 30 days ago for Client A
  const date30DaysAgo = new Date();
  date30DaysAgo.setDate(date30DaysAgo.getDate() - 30);

  const orderA = await prisma.order.create({
    data: {
      clientId: clientA.id,
      status: 'COMPLETED',
      totalAmount: menu.basePrice * 20,
      orderDate: date30DaysAgo,
      tenantId: tenantId,
      orderItems: {
        create: {
          menuId: menu.id,
          quantity: 20,
          subtotal: menu.basePrice * 20
        }
      }
    }
  });
  console.log(`- Created order from 30 days ago for ${clientA.companyName}`);


  // 2. Client B: Katering Baru Sejahtera (Never ordered -> Never)
  const clientBData = {
    companyName: 'Katering Baru Sejahtera',
    picName: 'Siti Rahma',
    email: 'siti@barusejahtera.com',
    phone: '089876540002',
    logisticAddress: 'Rukan Grand Galaxy City Blok R, Bekasi',
    dietaryAlerts: { allergies: [], halal: true },
    tenantId: tenantId
  };

  let clientB = await prisma.client.findFirst({
    where: { companyName: clientBData.companyName, tenantId: tenantId }
  });

  if (!clientB) {
    clientB = await prisma.client.create({ data: clientBData });
    console.log(`- Created client (no orders): ${clientB.companyName}`);
  }


  // 3. Client C: PT Aktif Selalu (Last order was 3 days ago -> Active)
  const clientCData = {
    companyName: 'PT Aktif Selalu',
    picName: 'Denny Siregar',
    email: 'denny@aktifselalu.com',
    phone: '087711220003',
    logisticAddress: 'Menara Sudirman Lt. 12, Jakarta Pusat',
    dietaryAlerts: { allergies: ['Dairy'], halal: true },
    tenantId: tenantId
  };

  let clientC = await prisma.client.findFirst({
    where: { companyName: clientCData.companyName, tenantId: tenantId }
  });

  if (!clientC) {
    clientC = await prisma.client.create({ data: clientCData });
    console.log(`- Created client: ${clientC.companyName}`);
  }

  // Create order 3 days ago for Client C
  const date3DaysAgo = new Date();
  date3DaysAgo.setDate(date3DaysAgo.getDate() - 3);

  const orderC = await prisma.order.create({
    data: {
      clientId: clientC.id,
      status: 'COMPLETED',
      totalAmount: menu.basePrice * 50,
      orderDate: date3DaysAgo,
      tenantId: tenantId,
      orderItems: {
        create: {
          menuId: menu.id,
          quantity: 50,
          subtotal: menu.basePrice * 50
        }
      }
    }
  });
  console.log(`- Created order from 3 days ago for ${clientC.companyName}`);

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
