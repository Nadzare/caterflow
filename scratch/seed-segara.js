const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const emailTarget = 'segara@gmail.com';
  console.log(`Starting seed for owner: ${emailTarget}`);

  // Find the target user
  const user = await prisma.user.findUnique({
    where: { email: emailTarget },
    include: { tenant: true }
  });

  if (!user) {
    console.error(`Error: User with email ${emailTarget} not found in database.`);
    return;
  }

  const tenantId = user.tenantId;
  if (!tenantId) {
    console.error(`Error: User ${emailTarget} does not have a tenantId associated.`);
    return;
  }

  console.log(`Found tenant: "${user.tenant?.name}" (ID: ${tenantId})`);

  // 1. Seed Staff / Users
  console.log('Seeding staff...');
  const staffs = [
    {
      email: 'admin.segara@gmail.com',
      name: 'Budi Santoso',
      role: 'ADMIN',
      phone: '081234567890',
      activated: true,
      tenantId: tenantId
    },
    {
      email: 'kitchen.segara@gmail.com',
      name: 'Chef Joko',
      role: 'KITCHEN',
      phone: '081234567891',
      activated: true,
      tenantId: tenantId
    },
    {
      email: 'logistic.segara@gmail.com',
      name: 'Driver Roni',
      role: 'LOGISTIC',
      phone: '081234567892',
      activated: true,
      tenantId: tenantId
    }
  ];

  for (const staff of staffs) {
    const existing = await prisma.user.findUnique({ where: { email: staff.email } });
    if (!existing) {
      await prisma.user.create({ data: staff });
      console.log(`- Created staff: ${staff.name} (${staff.role})`);
    } else {
      await prisma.user.update({
        where: { email: staff.email },
        data: { tenantId: tenantId, role: staff.role, activated: true }
      });
      console.log(`- Updated existing staff: ${staff.name} (${staff.role})`);
    }
  }

  // 2. Seed Clients
  console.log('Seeding clients...');
  const clientsData = [
    {
      companyName: 'PT Sukses Mandiri',
      picName: 'Ibu Rina',
      email: 'rina@suksesmandiri.com',
      phone: '0811223344',
      logisticAddress: 'Jl. Jend. Sudirman No. 21, Kav 5-6, Jakarta Selatan',
      dietaryAlerts: JSON.stringify(['No Beef', 'Peanut Allergy']),
      operationalPreferences: JSON.stringify({ delivery_instructions: 'Antar lewat pintu belakang dok logistik, laporkan ke sekuriti' }),
      tenantId: tenantId
    },
    {
      companyName: 'Universitas Nusantara',
      picName: 'Pak Budi',
      email: 'budi@univ-nusantara.edu',
      phone: '0855667788',
      logisticAddress: 'Gedung Rektorat Lt. 2, Kampus UI Depok',
      dietaryAlerts: JSON.stringify(['Vegetarian']),
      operationalPreferences: JSON.stringify({ delivery_instructions: 'Hubungi PIC 30 menit sebelum sampai' }),
      tenantId: tenantId
    },
    {
      companyName: 'Wedding Organizer Lestari',
      picName: 'Mbak Lestari',
      email: 'lestari@wo.com',
      phone: '0899887766',
      logisticAddress: 'Balai Sudirman, Tebet, Jakarta Selatan',
      dietaryAlerts: JSON.stringify([]),
      operationalPreferences: JSON.stringify({ setup_required: true, contact_alternative: '08122334455' }),
      tenantId: tenantId
    }
  ];

  const clients = [];
  for (const client of clientsData) {
    // Find if client company name already exists under this tenant
    const existing = await prisma.client.findFirst({
      where: { companyName: client.companyName, tenantId: tenantId }
    });
    if (!existing) {
      const created = await prisma.client.create({ data: client });
      clients.push(created);
      console.log(`- Created client: ${client.companyName}`);
    } else {
      clients.push(existing);
      console.log(`- Client already exists: ${client.companyName}`);
    }
  }

  // 3. Seed Menus
  console.log('Seeding menu items...');
  const menusData = [
    {
      name: 'Nasi Rames Ayam Bakar',
      category: 'Nasi Box',
      basePrice: 35000,
      allergenLabels: JSON.stringify(['gluten', 'poultry']),
      tenantId: tenantId
    },
    {
      name: 'Nasi Kuning Tumpeng Mini',
      category: 'Tumpeng',
      basePrice: 50000,
      allergenLabels: JSON.stringify(['coconut']),
      tenantId: tenantId
    },
    {
      name: 'Sate Ayam Madura',
      category: 'Sampingan',
      basePrice: 30000,
      allergenLabels: JSON.stringify(['peanuts']),
      tenantId: tenantId
    },
    {
      name: 'Es Doger Premium',
      category: 'Pencuci Mulut',
      basePrice: 15000,
      allergenLabels: JSON.stringify(['dairy']),
      tenantId: tenantId
    },
    {
      name: 'Bubur Sumsum Pandan',
      category: 'Pencuci Mulut',
      basePrice: 12000,
      allergenLabels: JSON.stringify(['coconut', 'gluten']),
      tenantId: tenantId
    }
  ];

  const menus = {};
  for (const menu of menusData) {
    const existing = await prisma.menu.findFirst({
      where: { name: menu.name, tenantId: tenantId }
    });
    if (!existing) {
      const created = await prisma.menu.create({ data: menu });
      menus[menu.name] = created;
      console.log(`- Created menu: ${menu.name}`);
    } else {
      menus[menu.name] = existing;
      console.log(`- Menu already exists: ${menu.name}`);
    }
  }

  // 4. Seed Orders & OrderItems & Deliveries
  console.log('Seeding orders, items, and deliveries...');
  
  // We need to clean up old orders for this tenant if we want a clean presentation, 
  // or we can just append new ones if they don't exist.
  // Let's check if there are already orders.
  const existingOrdersCount = await prisma.order.count({
    where: { tenantId: tenantId }
  });

  if (existingOrdersCount > 0) {
    console.log(`Tenant already has ${existingOrdersCount} orders. Skipping order seeding to avoid duplicates.`);
    return;
  }

  // Setup Order 1: PT Sukses Mandiri (COMPLETED)
  const client1 = clients.find(c => c.companyName === 'PT Sukses Mandiri');
  if (client1 && menus['Nasi Rames Ayam Bakar']) {
    const qty = 50;
    const price = menus['Nasi Rames Ayam Bakar'].basePrice;
    const total = qty * price;
    
    const order = await prisma.order.create({
      data: {
        clientId: client1.id,
        status: 'COMPLETED',
        totalAmount: total,
        orderDate: new Date('2026-06-12T10:00:00.000Z'),
        tenantId: tenantId
      }
    });

    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        menuId: menus['Nasi Rames Ayam Bakar'].id,
        quantity: qty,
        subtotal: total
      }
    });

    await prisma.delivery.create({
      data: {
        orderId: order.id,
        deliveryDate: new Date('2026-06-12T10:00:00.000Z'),
        deliveryTime: '11:30',
        status: 'DELIVERED'
      }
    });
    console.log('- Created Order 1: Completed Nasi Rames Ayam Bakar');
  }

  // Setup Order 2: Universitas Nusantara (IN_PRODUCTION)
  const client2 = clients.find(c => c.companyName === 'Universitas Nusantara');
  if (client2 && menus['Nasi Kuning Tumpeng Mini']) {
    const qty = 50;
    const price = menus['Nasi Kuning Tumpeng Mini'].basePrice;
    const total = qty * price;

    const order = await prisma.order.create({
      data: {
        clientId: client2.id,
        status: 'IN_PRODUCTION',
        totalAmount: total,
        orderDate: new Date('2026-06-15T09:00:00.000Z'),
        tenantId: tenantId
      }
    });

    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        menuId: menus['Nasi Kuning Tumpeng Mini'].id,
        quantity: qty,
        subtotal: total
      }
    });

    await prisma.delivery.create({
      data: {
        orderId: order.id,
        deliveryDate: new Date('2026-06-15T09:00:00.000Z'),
        deliveryTime: '10:30',
        status: 'PREPARING'
      }
    });
    console.log('- Created Order 2: In-Production Nasi Kuning Tumpeng Mini');
  }

  // Setup Order 3: Wedding Organizer Lestari (DP_PAID)
  const client3 = clients.find(c => c.companyName === 'Wedding Organizer Lestari');
  if (client3 && menus['Sate Ayam Madura']) {
    const qty = 150;
    const price = menus['Sate Ayam Madura'].basePrice;
    const total = qty * price;

    const order = await prisma.order.create({
      data: {
        clientId: client3.id,
        status: 'DP_PAID',
        totalAmount: total,
        orderDate: new Date('2026-06-18T12:00:00.000Z'),
        tenantId: tenantId
      }
    });

    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        menuId: menus['Sate Ayam Madura'].id,
        quantity: qty,
        subtotal: total
      }
    });

    await prisma.delivery.create({
      data: {
        orderId: order.id,
        deliveryDate: new Date('2026-06-18T12:00:00.000Z'),
        deliveryTime: '13:00',
        status: 'PENDING'
      }
    });
    console.log('- Created Order 3: DP Paid Sate Ayam Madura');
  }

  // Setup Order 4: PT Sukses Mandiri (QUOTATION)
  if (client1 && menus['Nasi Rames Ayam Bakar'] && menus['Bubur Sumsum Pandan']) {
    const qty1 = 20;
    const price1 = menus['Nasi Rames Ayam Bakar'].basePrice;
    const subtotal1 = qty1 * price1;

    const qty2 = 20;
    const price2 = menus['Bubur Sumsum Pandan'].basePrice;
    const subtotal2 = qty2 * price2;

    const total = subtotal1 + subtotal2;

    const order = await prisma.order.create({
      data: {
        clientId: client1.id,
        status: 'QUOTATION',
        totalAmount: total,
        orderDate: new Date('2026-06-20T08:00:00.000Z'),
        tenantId: tenantId
      }
    });

    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        menuId: menus['Nasi Rames Ayam Bakar'].id,
        quantity: qty1,
        subtotal: subtotal1
      }
    });

    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        menuId: menus['Bubur Sumsum Pandan'].id,
        quantity: qty2,
        subtotal: subtotal2
      }
    });

    await prisma.delivery.create({
      data: {
        orderId: order.id,
        deliveryDate: new Date('2026-06-20T08:00:00.000Z'),
        deliveryTime: '09:00',
        status: 'PENDING'
      }
    });
    console.log('- Created Order 4: Quotation Nasi Rames & Bubur Sumsum');
  }

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
